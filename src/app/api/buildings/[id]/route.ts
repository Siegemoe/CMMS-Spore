import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { updateBuildingSchema, validateRequest } from '@/lib/validation'
import { z } from 'zod'
import { ActivityLogger } from '@/lib/robust-activity-logger'

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

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
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
      }
    })

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    }

    return NextResponse.json(building)
  } catch (error) {
    console.error('Failed to fetch building:', error)
    return NextResponse.json(
      { error: 'Failed to fetch building' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = validateRequest(updateBuildingSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if building exists
    const existingBuilding = await prisma.building.findUnique({
      where: { id },
      include: {
        site: {
          select: { name: true }
        }
      }
    })

    if (!existingBuilding) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    }

    const building = await prisma.building.update({
      where: { id },
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
      action: 'UPDATE',
      entityType: 'BUILDING',
      entityId: building.id,
      entityName: building.name,
      description: `Updated building: ${building.name}`,
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Unknown",
      details: {
        buildingId: building.id,
        buildingName: building.name,
        changes: validation.data,
        siteId: building.siteId
      }
    })

    return NextResponse.json(building)
  } catch (error) {
    console.error('Failed to update building:', error)

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
        { error: 'Invalid site or facility technician ID' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update building' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if building exists
    const existingBuilding = await prisma.building.findUnique({
      where: { id },
      include: {
        site: {
          select: { name: true }
        },
        _count: {
          select: {
            rooms: true,
            assets: true
          }
        }
      }
    })

    if (!existingBuilding) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    }

    // Check if building has rooms or assets
    if (existingBuilding._count.rooms > 0 || existingBuilding._count.assets > 0) {
      return NextResponse.json(
        { error: 'Cannot delete building with existing rooms or assets. Archive it instead.' },
        { status: 400 }
      )
    }

    await prisma.building.delete({
      where: { id }
    })

    // Log activity
    await ActivityLogger.log({
      action: 'DELETE',
      entityType: 'BUILDING',
      entityId: existingBuilding.id,
      entityName: existingBuilding.name,
      description: `Deleted building: ${existingBuilding.name}`,
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Unknown",
      details: { buildingId: existingBuilding.id, buildingName: existingBuilding.name }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete building:', error)
    return NextResponse.json(
      { error: 'Failed to delete building' },
      { status: 500 }
    )
  }
}