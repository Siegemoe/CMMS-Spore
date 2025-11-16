import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
})

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/notifications/[id] - Fetch a specific notification
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        entityId: true,
        entityType: true,
        actionUrl: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Failed to fetch notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/[id] - Update a notification (mark as read/unread)
export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateNotificationSchema.parse(body)

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        entityId: true,
        entityType: true,
        actionUrl: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Failed to update notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Failed to delete notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}