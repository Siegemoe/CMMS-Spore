import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activityHelpers } from "@/lib/robust-activity-logger"
import { checkRateLimit, RateLimitType } from "@/lib/rate-limit"
import { validateRequest, updateAssetSchema, updateAssetStatusSchema } from "@/lib/validation"
import { createSecurityResponse } from "@/lib/security-headers"

// GET single asset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return createSecurityResponse(
        request,
        { error: "Unauthorized" },
        401
      )
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
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
    })

    if (!asset) {
      return createSecurityResponse(
        request,
        { error: "Asset not found" },
        404
      )
    }

    return createSecurityResponse(
      request,
      asset,
      200,
      {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
      }
    )
  } catch (error) {
    console.error("Error fetching asset:", error)
    return createSecurityResponse(
      request,
      { error: "Internal server error" },
      500
    )
  }
}

// UPDATE asset (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return createSecurityResponse(
        request,
        { error: "Unauthorized" },
        401
      )
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existingAsset) {
      return createSecurityResponse(
        request,
        { error: "Asset not found" },
        404
      )
    }

    // Input validation
    const body = await request.json()
    const validation = validateRequest(updateAssetSchema, body)
    if (!validation.success) {
      return createSecurityResponse(
        request,
        { error: "Validation failed", details: validation.errors },
        400
      )
    }

    const validatedData = validation.data!

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        ...validatedData,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
        warrantyEnd: validatedData.warrantyEnd ? new Date(validatedData.warrantyEnd) : undefined,
        purchaseCost: validatedData.purchaseCost !== undefined
          ? (typeof validatedData.purchaseCost === 'string'
              ? (parseFloat(validatedData.purchaseCost) || null)
              : validatedData.purchaseCost)
          : undefined,
      },
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
    })

    // Log the activity
    const activityResult = await activityHelpers.assetUpdated(
      updatedAsset.name,
      updatedAsset.assetTag || null,
      validatedData,
      session.user.id,
      session.user.name || session.user.email || 'Unknown User'
    )

    // Log any activity failures to console but don't fail the request
    if (!activityResult.success) {
      console.error('Failed to log asset update activity:', activityResult.error)
    }

    return createSecurityResponse(
      request,
      updatedAsset,
      200,
      {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
      }
    )
  } catch (error) {
    console.error("Error updating asset:", error)
    return createSecurityResponse(
      request,
      { error: "Internal server error" },
      500
    )
  }
}

// PATCH asset (status updates, archiving, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return createSecurityResponse(
        request,
        { error: "Unauthorized" },
        401
      )
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existingAsset) {
      return createSecurityResponse(
        request,
        { error: "Asset not found" },
        404
      )
    }

    // Input validation
    const body = await request.json()
    const validation = validateRequest(updateAssetStatusSchema, body)
    if (!validation.success) {
      return createSecurityResponse(
        request,
        { error: "Validation failed", details: validation.errors },
        400
      )
    }

    const { status } = validation.data!

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { status },
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
    })

    // Log the activity
    let activityResult
    if (status === 'ARCHIVED') {
      activityResult = await activityHelpers.assetArchived(
        updatedAsset.name,
        updatedAsset.assetTag || null,
        session.user.id,
        session.user.name || session.user.email || 'Unknown User'
      )
    } else if ((existingAsset.status as string) === 'ARCHIVED') {
      activityResult = await activityHelpers.assetUnarchived(
        updatedAsset.name,
        updatedAsset.assetTag || null,
        session.user.id,
        session.user.name || session.user.email || 'Unknown User'
      )
    } else {
      activityResult = await activityHelpers.assetStatusUpdated(
        updatedAsset.name,
        updatedAsset.assetTag || null,
        existingAsset.status,
        status,
        session.user.id,
        session.user.name || session.user.email || 'Unknown User'
      )
    }

    // Log any activity failures to console but don't fail the request
    if (!activityResult.success) {
      console.error('Failed to log asset status update activity:', activityResult.error)
    }

    return createSecurityResponse(
      request,
      updatedAsset,
      200,
      {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
      }
    )
  } catch (error) {
    console.error("Error updating asset status:", error)
    return createSecurityResponse(
      request,
      { error: "Internal server error" },
      500
    )
  }
}

// DELETE asset (hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return createSecurityResponse(
        request,
        { error: "Unauthorized" },
        401
      )
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existingAsset) {
      return createSecurityResponse(
        request,
        { error: "Asset not found" },
        404
      )
    }

    // Check if asset has associated work orders
    const workOrderCount = await prisma.workOrder.count({
      where: { assetId: id }
    })

    if (workOrderCount > 0) {
      return createSecurityResponse(
        request,
        {
          error: "Cannot delete asset with associated work orders",
          details: `This asset has ${workOrderCount} associated work order(s). Please archive the asset instead.`
        },
        400
      )
    }

    // Delete the asset
    await prisma.asset.delete({
      where: { id }
    })

    // Log the activity
    const activityResult = await activityHelpers.assetDeleted(
      existingAsset.name,
      existingAsset.assetTag || null,
      session.user.id,
      session.user.name || session.user.email || 'Unknown User'
    )

    // Log any activity failures to console but don't fail the request
    if (!activityResult.success) {
      console.error('Failed to log asset deletion activity:', activityResult.error)
    }

    return createSecurityResponse(
      request,
      { message: "Asset deleted successfully" },
      200,
      {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
      }
    )
  } catch (error) {
    console.error("Error deleting asset:", error)
    return createSecurityResponse(
      request,
      { error: "Internal server error" },
      500
    )
  }
}