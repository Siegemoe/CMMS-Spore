import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        building: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
                address: true,
              }
            }
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
        assets: {
          include: {
            _count: {
              select: {
                workOrders: {
                  where: {
                    status: {
                      not: 'COMPLETED'
                    }
                  }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            assets: true
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Get work orders for assets in this room
    const workOrders = await prisma.workOrder.findMany({
      where: {
        asset: {
          roomId: id
        }
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      ...room,
      workOrders
    })
  } catch (error) {
    console.error('Failed to fetch room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}