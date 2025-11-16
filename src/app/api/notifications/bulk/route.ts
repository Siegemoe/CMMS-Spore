import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkActionSchema = z.object({
  action: z.enum(["markAllAsRead", "markMultipleAsRead", "deleteMultiple"]),
  notificationIds: z.array(z.string()).optional(),
})

// POST /api/notifications/bulk - Perform bulk actions on notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bulkActionSchema.parse(body)

    const userId = session.user.id

    switch (validatedData.action) {
      case "markAllAsRead":
        await prisma.notification.updateMany({
          where: {
            userId,
            isRead: false,
          },
          data: {
            isRead: true,
          },
        })

        return NextResponse.json({
          message: "All notifications marked as read"
        })

      case "markMultipleAsRead":
        if (!validatedData.notificationIds?.length) {
          return NextResponse.json(
            { error: "Notification IDs are required for this action" },
            { status: 400 }
          )
        }

        await prisma.notification.updateMany({
          where: {
            id: {
              in: validatedData.notificationIds,
            },
            userId,
          },
          data: {
            isRead: true,
          },
        })

        return NextResponse.json({
          message: "Selected notifications marked as read"
        })

      case "deleteMultiple":
        if (!validatedData.notificationIds?.length) {
          return NextResponse.json(
            { error: "Notification IDs are required for this action" },
            { status: 400 }
          )
        }

        await prisma.notification.deleteMany({
          where: {
            id: {
              in: validatedData.notificationIds,
            },
            userId,
          },
        })

        return NextResponse.json({
          message: "Selected notifications deleted"
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Failed to perform bulk action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}