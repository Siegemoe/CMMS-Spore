import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateSiteSchema, validateRequest } from '@/lib/validation'
import { z } from 'zod'

const archiveSiteSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
})

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        siteManager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        buildings: {
          include: {
            _count: {
              select: {
                rooms: true,
                assets: true
              }
            }
          },
          orderBy: { number: 'asc' }
        },
        _count: {
          select: {
            buildings: true,
            assets: true
          }
        }
      }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Failed to fetch site:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = validateRequest(updateSiteSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id }
    })

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const site = await prisma.site.update({
      where: { id },
      data: validation.data!,
      include: {
        siteManager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // TODO: Fix activity logging - temporarily disabled for debugging
    // await logActivity({
    //   action: 'updated',
    //   entityType: 'asset', // Using 'asset' as fallback since 'site' isn't in the interface
    //   entityId: site.id,
    //   entityName: site.name,
    //   description: `Updated site: ${site.name}`,
    //   userId: (session.user as any)?.id || session.user?.email || "unknown",
    //   userName: (session.user as any)?.name || session.user?.email || "Unknown",
    //   details: {
    //     siteId: site.id,
    //     siteName: site.name,
    //     changes: validation.data
    //   }
    // })
    console.log('Site updated successfully (activity logging disabled):', site.name)

    return NextResponse.json(site)
  } catch (error) {
    console.error('Failed to update site:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Site name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            buildings: true,
            assets: true
          }
        }
      }
    })

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Check if site has buildings or assets
    if (existingSite._count.buildings > 0 || existingSite._count.assets > 0) {
      return NextResponse.json(
        { error: 'Cannot delete site with existing buildings or assets. Archive it instead.' },
        { status: 400 }
      )
    }

    await prisma.site.delete({
      where: { id }
    })

    // TODO: Fix activity logging - temporarily disabled for debugging
    // await logActivity({
    //   action: 'deleted',
    //   entityType: 'asset', // Using 'asset' as fallback since 'site' isn't in the interface
    //   entityId: existingSite.id,
    //   entityName: existingSite.name,
    //   description: `Deleted site: ${existingSite.name}`,
    //   userId: (session.user as any)?.id || session.user?.email || "unknown",
    //   userName: (session.user as any)?.name || session.user?.email || "Unknown",
    //   details: { siteId: existingSite.id, siteName: existingSite.name }
    // })
    console.log('Site deleted successfully (activity logging disabled):', existingSite.name)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete site:', error)
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const validation = validateRequest(archiveSiteSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id }
    })

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const updatedSite = await prisma.site.update({
      where: { id },
      data: { status: validation.data!.status },
      include: {
        siteManager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    const action = validation.data!.status === 'ARCHIVED' ? 'archived' :
                   validation.data!.status === 'ACTIVE' ? 'unarchived' : 'updated'

    console.log(`Site ${action} successfully (activity logging disabled):`, updatedSite.name)

    return NextResponse.json(updatedSite)
  } catch (error) {
    console.error('Failed to update site status:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update site status' },
      { status: 500 }
    )
  }
}