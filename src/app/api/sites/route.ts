import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { createSiteSchema, validateRequest } from '@/lib/validation'
import { z } from 'zod'
import { ActivityLogger } from '@/lib/robust-activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ]
      }),
      ...(status && { status }),
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
    const session = await getServerSession()
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

    const site = await prisma.site.create({
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

    // Log activity
    await ActivityLogger.log({
      action: 'CREATE',
      entityType: 'SITE',
      entityId: site.id,
      entityName: site.name,
      description: `Created new site: ${site.name}`,
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Unknown",
      details: { siteId: site.id, siteName: site.name }
    })

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