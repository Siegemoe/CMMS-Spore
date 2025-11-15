import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { logActivity } from '@/lib/robust-activity-logger'

const bulkCreateSchema = z.object({
  siteId: z.string().min(1, 'Site ID is required'),
  buildings: z.array(z.string()).min(1, 'At least one building is required'),
  floors: z.array(z.number().int().min(1)).min(1, 'At least one floor is required'),
  roomsPerFloor: z.number().int().min(1, 'Must have at least 1 room per floor'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = bulkCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { siteId, buildings, floors, roomsPerFloor } = validation.data

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, name: true }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Check if any buildings already exist for this site
    const existingBuildings = await prisma.building.findMany({
      where: {
        siteId,
        number: { in: buildings }
      },
      select: { number: true }
    })

    if (existingBuildings.length > 0) {
      const existingNumbers = existingBuildings.map(b => b.number)
      return NextResponse.json(
        { error: `Buildings ${existingNumbers.join(', ')} already exist for this site` },
        { status: 409 }
      )
    }

    // Create buildings and rooms in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdBuildings = []
      const createdRooms = []

      // Create buildings
      for (const buildingNumber of buildings) {
        const building = await tx.building.create({
          data: {
            name: `Building ${buildingNumber}`,
            number: buildingNumber,
            status: 'ACTIVE',
            siteId,
          },
          select: { id: true, name: true, number: true }
        })
        createdBuildings.push(building)

        // Create rooms for each floor of this building
        for (const floor of floors) {
          for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
            const roomNumber = `${roomNum.toString().padStart(2, '0')}`
            const room = await tx.room.create({
              data: {
                number: roomNumber,
                floor,
                status: 'AVAILABLE',
                buildingId: building.id,
              },
              select: { id: true, number: true, floor: true }
            })
            createdRooms.push({
              ...room,
              buildingNumber: building.number,
              fullRoomNumber: `${building.number}-${roomNumber}`
            })
          }
        }
      }

      return { createdBuildings, createdRooms }
    })

    // TODO: Fix activity logging - temporarily disabled for debugging
    // await logActivity({
    //   action: 'created',
    //   entityType: 'asset', // Using 'asset' as fallback
    //   entityId: siteId,
    //   entityName: site.name,
    //   description: `Bulk created ${result.createdBuildings.length} buildings and ${result.createdRooms.length} rooms for site: ${site.name}`,
    //   userId: (session.user as any)?.id || session.user?.email || "unknown",
    //   userName: (session.user as any)?.name || session.user?.email || "Unknown",
    //   details: {
    //     siteId,
    //     siteName: site.name,
    //     buildings: result.createdBuildings,
    //     totalRooms: result.createdRooms.length,
    //     buildingCount: result.createdBuildings.length,
    //     floors: floors,
    //     roomsPerFloor
    //   }
    // })
    console.log('Bulk creation completed successfully (activity logging disabled):', {
      site: site.name,
      buildings: result.createdBuildings.length,
      rooms: result.createdRooms.length
    })

    return NextResponse.json({
      message: `Successfully created ${result.createdBuildings.length} buildings and ${result.createdRooms.length} rooms`,
      buildings: result.createdBuildings,
      rooms: result.createdRooms,
      totalCreated: result.createdBuildings.length + result.createdRooms.length
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to bulk create buildings and rooms:', error)
    return NextResponse.json(
      { error: 'Failed to create buildings and rooms' },
      { status: 500 }
    )
  }
}