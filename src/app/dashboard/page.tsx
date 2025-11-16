"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import RecentActivity from "@/components/activity/RecentActivity"
import { Loading, Card, CardHeader, CardContent } from "@/components/shared"
import { useAuthRedirect } from "@/hooks"

interface DashboardStats {
  totalAssets: number
  activeWorkOrders: number
  completedWorkOrders: number
  totalUsers: number
}

export default function Dashboard() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    activeWorkOrders: 0,
    completedWorkOrders: 0,
    totalUsers: 0,
  })

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch dashboard stats
      const fetchStats = async () => {
        try {
          const response = await fetch("/api/dashboard/stats")
          if (response.ok) {
            const data = await response.json()
            setStats(data)
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error)
        }
      }

      fetchStats()
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Welcome back, {session?.user?.name || session?.user?.email}!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card variant="default" hover={true}>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-base sm:text-sm">A</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Total Assets
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold text-gray-900">
                        {stats.totalAssets}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" hover={true}>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-base sm:text-sm">W</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Active Work Orders
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold text-gray-900">
                        {stats.activeWorkOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" hover={true}>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-base sm:text-sm">C</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Completed Work Orders
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold text-gray-900">
                        {stats.completedWorkOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" hover={true}>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-base sm:text-sm">U</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 text-xs sm:text-sm max-h-80 sm:max-h-96 overflow-y-auto">
                  <RecentActivity />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <Link
                    href="/work-orders"
                    className="block w-full text-left px-4 py-3 sm:py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-modern text-sm sm:text-base touch-manipulation font-medium"
                  >
                    Create New Work Order
                  </Link>
                  <Link
                    href="/assets"
                    className="block w-full text-left px-4 py-3 sm:py-2.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-xl hover:from-green-100 hover:to-green-200 transition-modern text-sm sm:text-base touch-manipulation font-medium"
                  >
                    Add New Asset
                  </Link>
                  <Link
                    href="/maintenance/schedule"
                    className="block w-full text-left px-4 py-3 sm:py-2.5 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-modern text-sm sm:text-base touch-manipulation font-medium"
                  >
                    Schedule Maintenance
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
