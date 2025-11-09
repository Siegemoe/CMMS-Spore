import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activityHelpers } from "@/lib/robust-activity-logger"

export async function GET() {
  try {
    const workOrders = await prisma.workOrder.findMany({
      take: 100, // Limit to 100 most recent work orders for performance
      include: {
        asset: {
          select: {
            name: true,
            assetTag: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(workOrders)
  } catch (error) {
    console.error("Error fetching work orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      priority = "MEDIUM",
      status = "OPEN",
      assetId,
      assignedToId,

      // Enhanced fields
      workType,
      scopeOfWork,
      partsRequired,
      toolsRequired,
      otherResources,
      safetyNotes,
      estimatedStart,
      estimatedCompletion,
      ticketType,
      siteLocation,
      roomLocation,
      assetLocation,
    } = body

    if (!title || !assetId || !workType) {
      return NextResponse.json(
        { error: "Title, asset, and work type are required" },
        { status: 400 }
      )
    }

    // Verify asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      )
    }

    // Generate work order number
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let workOrderNumber = ''
    for (let i = 0; i < 8; i++) {
      workOrderNumber += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        title,
        description,
        priority,
        status,
        assetId,
        assignedToId,
        createdById: session.user.id,
        workOrderNumber,

        // Enhanced fields - only include fields that exist in current schema
        workType,
        scopeOfWork,
        partsRequired,
        toolsRequired,
        otherResources,
        safetyNotes,
        estimatedStart: estimatedStart ? new Date(estimatedStart) : null,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
        ticketType,
        siteLocation,
        roomLocation,
        assetLocation,
      },
      include: {
        asset: {
          select: {
            name: true,
            assetTag: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the activity
    const activityResult = await activityHelpers.workOrderCreated(
      workOrder.workOrderNumber,
      workOrder.title,
      session.user.id,
      session.user.name || session.user.email || 'Unknown User',
      workOrder.id // Pass the actual database ID for proper relationships
    )

    // Log any activity failures to console but don't fail the request
    if (!activityResult.success) {
      console.error('Failed to log work order creation activity:', activityResult.error)
    }

    return NextResponse.json(workOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating work order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
