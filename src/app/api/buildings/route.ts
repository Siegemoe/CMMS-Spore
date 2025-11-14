import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { createBuildingSchema, validateRequest } from '@/lib/validation'
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
    const siteId = searchParams.get('siteId') || ''

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { number: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ]
      }),
      ...(status && { status }),
      ...(siteId && { siteId }),
      NOT: { status: 'ARCHIVED' }
    }

    const [buildings, total] = await Promise.all([
      prisma.building.findMany({
        where,
        include: {
          site: {
            select: {
              id: true,
              name: true,
            }
          },
          facilityTechnician: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              rooms: true,
              assets: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.building.count({ where })
    ])

    return NextResponse.json({
      data: buildings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch buildings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buildings' },
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
    const validation = validateRequest(createBuildingSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const building = await prisma.building.create({
      data: validation.data!,
      include: {
        site: {
          select: {
            id: true,
            name: true,
          }
        },
        facilityTechnician: {
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
      entityType: 'BUILDING',
      entityId: building.id,
      entityName: building.name,
      description: `Created new building: ${building.name}`,
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Unknown",
      details: { buildingId: building.id, buildingName: building.name, siteId: building.siteId }
    })

    return NextResponse.json(building, { status: 201 })
  } catch (error) {
    console.error('Failed to create building:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Building number already exists for this site' },
        { status: 409 }
      )
    }

    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Invalid site ID' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create building' },
      { status: 500 }
    )
  }
}