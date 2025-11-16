import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get('buildingId')
    const siteId = searchParams.get('siteId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build the where clause for filtering
    const where: any = {}

    if (buildingId) {
      where.buildingId = buildingId
    }

    if (siteId) {
      where.building = {
        siteId: siteId
      }
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            number: true,
          }
        },
        tenant: {
          select: {
            id: true,
            names: true,
            phoneNumbers: true,
            email: true,
            status: true,
          }
        },
        _count: {
          select: {
            assets: true
          }
        }
      },
      orderBy: [
        { building: { number: 'asc' } },
        { number: 'asc' }
      ],
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.room.count({ where })

    return NextResponse.json({
      data: rooms,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}