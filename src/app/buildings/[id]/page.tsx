"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Building {
  id: string
  name: string
  number: string
  description: string | null
  floors: number | null
  status: string
  createdAt: string
  updatedAt: string
  siteId: string
  facilityTechnicianId: string | null
  site: {
    id: string
    name: string
    address: string | null
  }
  facilityTechnician: {
    id: string
    name: string | null
    email: string
  } | null
  _count: {
    rooms: number
    assets: number
  }
}

export default function BuildingDetails() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const params = useParams()
  const router = useRouter()
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchBuilding()
    }
  }, [isAuthenticated, params.id])

  const fetchBuilding = async () => {
    try {
      const response = await fetch(`/api/buildings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBuilding(data)
      } else if (response.status === 404) {
        setError("Building not found")
      } else {
        setError("Failed to fetch building details")
      }
    } catch (error) {
      console.error("Failed to fetch building:", error)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Active"
      case "INACTIVE": return "Inactive"
      case "MAINTENANCE": return "Maintenance"
      case "ARCHIVED": return "Archived"
      default: return status
    }
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !building) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Link
              href="/buildings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Buildings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href="/buildings"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Buildings
                  </Link>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{building.name}</h1>
                <p className="text-lg text-gray-600">Building {building.number}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(building.status)}`}>
                  {getStatusText(building.status)}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/buildings/${building.id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                >
                  Edit Building
                </Link>
              </div>
            </div>
          </div>

          {/* Building Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Information */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Building Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Building Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{building.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Building Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{building.number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(building.status)}`}>
                          {getStatusText(building.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Floors</dt>
                      <dd className="mt-1 text-sm text-gray-900">{building.floors || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(building.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(building.updatedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>

                  {building.description && (
                    <div className="mt-6">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{building.description}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Site Information */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Site Information</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Site Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{building.site.name}</dd>
                    </div>
                    {building.site.address && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">{building.site.address}</dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Facility Technician */}
              {building.facilityTechnician && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Facility Technician</h3>
                    <div className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {building.facilityTechnician.name || 'Not specified'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{building.facilityTechnician.email}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Rooms</dt>
                      <dd className="text-sm font-medium text-gray-900">{building._count.rooms}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Assets</dt>
                      <dd className="text-sm font-medium text-gray-900">{building._count.assets}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/rooms?buildingId=${building.id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                  >
                    View Rooms ({building._count.rooms})
                  </Link>
                  <Link
                    href={`/assets?buildingId=${building.id}`}
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                  >
                    View Assets ({building._count.assets})
                  </Link>
                  <Link
                    href={`/work-orders?buildingId=${building.id}`}
                    className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                  >
                    View Work Orders
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Management</h3>
                <div className="space-y-3">
                  <Link
                    href={`/buildings/${building.id}/edit`}
                    className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                  >
                    Edit Building Details
                  </Link>
                  <button className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation">
                    Archive Building
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}