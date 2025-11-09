import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activityHelpers } from "@/lib/robust-activity-logger"

// GET single work order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Try to find by ID first, then by work order number
    let workOrder = await prisma.workOrder.findUnique({
      where: { id },
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

    // If not found by ID, try by work order number
    if (!workOrder) {
      workOrder = await prisma.workOrder.findFirst({
        where: { workOrderNumber: id },
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
    }

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(workOrder)
  } catch (error) {
    console.error("Error fetching work order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// UPDATE work order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    const { id } = await params

    // Get the current work order for activity logging (try ID first, then work order number)
    let currentWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
      select: { id: true, status: true, workOrderNumber: true, title: true }
    })

    if (!currentWorkOrder) {
      currentWorkOrder = await prisma.workOrder.findFirst({
        where: { workOrderNumber: id },
        select: { id: true, status: true, workOrderNumber: true, title: true }
      })
    }

    if (!currentWorkOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    const workOrder = await prisma.workOrder.update({
      where: { id: currentWorkOrder.id }, // Use the actual database ID
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
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
    if (currentWorkOrder.status !== status) {
      await activityHelpers.workOrderStatusChanged(
        workOrder.workOrderNumber,
        workOrder.title,
        currentWorkOrder.status,
        status,
        session.user.id,
        session.user.name || session.user.email || 'Unknown User',
        workOrder.id // Pass the actual database ID for proper relationships
      )
    }

    return NextResponse.json(workOrder)
  } catch (error) {
    console.error("Error updating work order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT for full work order update
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Extract all possible work order fields
    const {
      title,
      description,
      priority,
      status,
      assetId,
      assignedToId,
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

    const { id } = await params

    // Get the current work order for activity logging (try ID first, then work order number)
    let currentWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
      select: { id: true, workOrderNumber: true, title: true, status: true }
    })

    if (!currentWorkOrder) {
      currentWorkOrder = await prisma.workOrder.findFirst({
        where: { workOrderNumber: id },
        select: { id: true, workOrderNumber: true, title: true, status: true }
      })
    }

    if (!currentWorkOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    const workOrder = await prisma.workOrder.update({
      where: { id: currentWorkOrder.id }, // Use the actual database ID
      data: {
        title,
        description,
        priority,
        status,
        assetId,
        assignedToId: assignedToId || null,
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
        completedAt: status === "COMPLETED" ? new Date() : null,
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

      // Log the activity for work order update
    const updateResult = await activityHelpers.workOrderUpdated(
      currentWorkOrder.workOrderNumber,
      currentWorkOrder.title,
      {
        fields: ['title', 'description', 'priority', 'status', 'assignedTo', 'workType'],
        updatedBy: session.user.name || session.user.email || 'Unknown User'
      },
      session.user.id,
      session.user.name || session.user.email || 'Unknown User',
      workOrder.id // Pass the actual database ID for proper relationships
    )

    // Log status change separately if status changed
    if (currentWorkOrder.status !== status) {
      const statusResult = await activityHelpers.workOrderStatusChanged(
        workOrder.workOrderNumber,
        workOrder.title,
        currentWorkOrder.status,
        status,
        session.user.id,
        session.user.name || session.user.email || 'Unknown User',
        workOrder.id // Pass the actual database ID for proper relationships
      )

      if (!statusResult.success) {
        console.error('Failed to log work order status change activity:', statusResult.error)
      }
    }

    if (!updateResult.success) {
      console.error('Failed to log work order update activity:', updateResult.error)
    }

    return NextResponse.json(workOrder)
  } catch (error) {
    console.error("Error updating work order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE work order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if work order exists and get details for logging (try ID first, then work order number)
    let existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
      select: { id: true, workOrderNumber: true, title: true }
    })

    if (!existingWorkOrder) {
      existingWorkOrder = await prisma.workOrder.findFirst({
        where: { workOrderNumber: id },
        select: { id: true, workOrderNumber: true, title: true }
      })
    }

    if (!existingWorkOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      )
    }

    await prisma.workOrder.delete({
      where: { id: existingWorkOrder.id }, // Use the actual database ID
    })

    // Log the activity
    const deleteResult = await activityHelpers.workOrderDeleted(
      existingWorkOrder.workOrderNumber,
      existingWorkOrder.title,
      session.user.id,
      session.user.name || session.user.email || 'Unknown User',
      existingWorkOrder.id // Pass the actual database ID for proper relationships
    )

    if (!deleteResult.success) {
      console.error('Failed to log work order deletion activity:', deleteResult.error)
    }

    return NextResponse.json({ message: "Work order deleted successfully" })
  } catch (error) {
    console.error("Error deleting work order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}