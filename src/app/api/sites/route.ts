import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSiteSchema, validateRequest } from '@/lib/validation'
import { z } from 'zod'
import { logActivity } from '@/lib/robust-activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawPage = parseInt(searchParams.get('page') ?? '', 10)
    const rawLimit = parseInt(searchParams.get('limit') ?? '', 10)
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100)
    const search = (searchParams.get('search') || '').trim()
    const statusParam = (searchParams.get('status') || '').trim().toUpperCase()
    const allowedStatuses = new Set(['ACTIVE', 'INACTIVE'])
    const status = allowedStatuses.has(statusParam) ? statusParam : undefined

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ]
      }),
      ...(status ? { status } : {}),
      NOT: { status: 'ARCHIVED' }
    }

    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where,
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
              rooms: {
                include: {
                  tenant: {
                    select: {
                      id: true,
                      names: true,
                      status: true,
                    }
                  },
                  _count: {
                    select: {
                      assets: true
                    }
                  }
                },
                orderBy: { number: 'asc' }
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.site.count({ where })
    ])

    return NextResponse.json({
      data: sites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch sites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateRequest(createSiteSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const { siteManagerId, ...siteData } = validation.data!
    const cleanedSiteData = {
      ...siteData,
      ...(siteManagerId && siteManagerId.trim() !== '' ? { siteManagerId: siteManagerId.trim() } : {}),
    }

    const site = await prisma.site.create({
      data: cleanedSiteData,
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
    //   action: 'created',
    //   entityType: 'asset', // Using 'asset' as fallback since 'site' isn't in the interface
    //   entityId: site.id,
    //   entityName: site.name,
    //   description: `Created new site: ${site.name}`,
    //   userId: (session.user as any)?.id || session.user?.email || "unknown",
    //   userName: (session.user as any)?.name || session.user?.email || "Unknown",
    //   details: { siteId: site.id, siteName: site.name }
    // })
    console.log('Site created successfully (activity logging disabled):', site.name)

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Failed to create site:', error)

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
      { error: 'Failed to create site' },
      { status: 500 }
    )
  }
}