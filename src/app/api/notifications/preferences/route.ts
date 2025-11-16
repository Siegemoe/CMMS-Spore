import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePreferenceSchema = z.object({
  notificationType: z.enum(["WORK_ORDER", "MAINTENANCE", "SYSTEM", "ASSET"]),
  emailEnabled: z.boolean().default(true),
  inAppEnabled: z.boolean().default(true),
  frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).optional(),
  customSettings: z.any().optional(),
})

// GET /api/notifications/preferences - Fetch user notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await prisma.userNotificationPreference.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        notificationType: true,
        emailEnabled: true,
        inAppEnabled: true,
        frequency: true,
        customSettings: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        notificationType: "asc",
      },
    })

    // Define default notification types
    const defaultTypes = ["WORK_ORDER", "MAINTENANCE", "SYSTEM", "ASSET"]
    const existingTypes = preferences.map(p => p.notificationType)
    const missingTypes = defaultTypes.filter(type => !existingTypes.includes(type))

    // Create default preferences for missing types
    if (missingTypes.length > 0) {
      const newPreferences = await Promise.all(
        missingTypes.map(type =>
          prisma.userNotificationPreference.create({
            data: {
              userId: session.user.id,
              notificationType: type,
              emailEnabled: true,
              inAppEnabled: true,
              frequency: "IMMEDIATE",
            },
          })
        )
      )

      preferences.push(...newPreferences)
    }

    return NextResponse.json({
      data: preferences.sort((a, b) => a.notificationType.localeCompare(b.notificationType))
    })
  } catch (error) {
    console.error("Failed to fetch notification preferences:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/notifications/preferences - Create or update notification preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Handle single preference update or multiple preferences
    if (Array.isArray(body)) {
      const validatedData = z.array(updatePreferenceSchema).parse(body)

      const preferences = await Promise.all(
        validatedData.map(async (pref) => {
          return await prisma.userNotificationPreference.upsert({
            where: {
              userId_notificationType: {
                userId: session.user.id,
                notificationType: pref.notificationType,
              },
            },
            update: {
              emailEnabled: pref.emailEnabled,
              inAppEnabled: pref.inAppEnabled,
              frequency: pref.frequency,
              customSettings: pref.customSettings,
            },
            create: {
              userId: session.user.id,
              notificationType: pref.notificationType,
              emailEnabled: pref.emailEnabled,
              inAppEnabled: pref.inAppEnabled,
              frequency: pref.frequency,
              customSettings: pref.customSettings,
            },
            select: {
              id: true,
              notificationType: true,
              emailEnabled: true,
              inAppEnabled: true,
              frequency: true,
              customSettings: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        })
      )

      return NextResponse.json({ data: preferences })
    } else {
      // Handle single preference
      const validatedData = updatePreferenceSchema.parse(body)

      const preference = await prisma.userNotificationPreference.upsert({
        where: {
          userId_notificationType: {
            userId: session.user.id,
            notificationType: validatedData.notificationType,
          },
        },
        update: {
          emailEnabled: validatedData.emailEnabled,
          inAppEnabled: validatedData.inAppEnabled,
          frequency: validatedData.frequency,
          customSettings: validatedData.customSettings,
        },
        create: {
          userId: session.user.id,
          notificationType: validatedData.notificationType,
          emailEnabled: validatedData.emailEnabled,
          inAppEnabled: validatedData.inAppEnabled,
          frequency: validatedData.frequency,
          customSettings: validatedData.customSettings,
        },
        select: {
          id: true,
          notificationType: true,
          emailEnabled: true,
          inAppEnabled: true,
          frequency: true,
          customSettings: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json(preference)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Failed to update notification preferences:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}