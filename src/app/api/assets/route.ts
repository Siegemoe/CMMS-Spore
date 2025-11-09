import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activityHelpers } from "@/lib/robust-activity-logger"
import { checkRateLimit, RateLimitType } from "@/lib/rate-limit"
import { validateRequest, createAssetSchema, AssetFilterParams } from "@/lib/validation"
import { createSecurityResponse } from "@/lib/security-headers"

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await checkRateLimit(request, 'read')
  if (!rateLimitResult.success) {
    return createSecurityResponse(
      request,
      { error: "Too many requests" },
      429
    )
  }

  try {
    const assets = await prisma.asset.findMany({
      take: 100, // Limit to 100 most recent assets for performance
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return createSecurityResponse(
      request,
      assets,
      200,
      {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
      }
    )
  } catch (error) {
    console.error("Error fetching assets:", error)
    return createSecurityResponse(
      request,
      { error: "Internal server error" },
      500
    )
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting for write operations
  const rateLimitResult = await checkRateLimit(request, 'write')
  if (!rateLimitResult.success) {
    return createSecurityResponse(
      request,
      { error: "Too many requests" },
      429
    )
  }

  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      return createSecurityResponse(
        request,
        { error: "Unauthorized" },
        401
      )
    }

    // Input validation
    const body = await request.json()
    const validation = validateRequest(createAssetSchema, body)
    if (!validation.success) {
      return createSecurityResponse(
        request,
        { error: "Validation failed", details: validation.errors },
        400
      )
    }

    const validatedData = validation.data!

    const asset = await prisma.asset.create({
      data: {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        warrantyEnd: validatedData.warrantyEnd ? new Date(validatedData.warrantyEnd) : null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the activity
    const activityResult = await activityHelpers.assetCreated(
      asset.name,
      asset.assetTag || null,
      session.user.id,
      session.user.name || session.user.email || 'Unknown User'
    )

    // Log any activity failures to console but don't fail the request
    if (!activityResult.success) {
      console.error('Failed to log asset creation activity:', activityResult.error)
    }

    return createSecurityResponse(
      request,
      asset,
      201,
      {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
      }
    )
  } catch (error) {
    console.error("Error creating asset:", error)
    return createSecurityResponse(
      request,
      { error: "Internal server error" },
      500
    )
  }
}