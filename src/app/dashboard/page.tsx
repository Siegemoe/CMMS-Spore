"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import RecentActivity from "@/components/activity/RecentActivity"

interface DashboardStats {
  totalAssets: number
  activeWorkOrders: number
  completedWorkOrders: number
  totalUsers: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    activeWorkOrders: 0,
    completedWorkOrders: 0,
    totalUsers: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
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

    if (session) {
      fetchStats()
    }
  }, [session])

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Welcome back, {session.user?.name || session.user?.email}!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-8 sm:h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-sm">A</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Total Assets
                      </dt>
                      <dd className="text-lg sm:text-lg font-medium text-gray-900">
                        {stats.totalAssets}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-8 sm:h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-sm">W</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Active Work Orders
                      </dt>
                      <dd className="text-lg sm:text-lg font-medium text-gray-900">
                        {stats.activeWorkOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-8 sm:h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-sm">C</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Completed Work Orders
                      </dt>
                      <dd className="text-lg sm:text-lg font-medium text-gray-900">
                        {stats.completedWorkOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-8 sm:h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-sm">U</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg sm:text-lg font-medium text-gray-900">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white shadow rounded-lg p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Recent Activity</h2>
              <div className="text-gray-600 text-xs sm:text-sm">
                <RecentActivity />
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/work-orders"
                  className="block w-full text-left px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  Create New Work Order
                </Link>
                <Link
                  href="/assets"
                  className="block w-full text-left px-4 py-3 sm:py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  Add New Asset
                </Link>
                <button
                  disabled
                  className="w-full text-left px-4 py-3 sm:py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed text-sm sm:text-base touch-manipulation"
                  title="Coming soon"
                >
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
