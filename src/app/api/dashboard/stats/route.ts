import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [totalAssets, activeWorkOrders, completedWorkOrders, totalUsers] = await Promise.all([
      prisma.asset.count(),
      prisma.workOrder.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"]
          }
        }
      }),
      prisma.workOrder.count({
        where: {
          status: "COMPLETED"
        }
      }),
      prisma.user.count(),
    ])

    return NextResponse.json({
      totalAssets,
      activeWorkOrders,
      completedWorkOrders,
      totalUsers,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}