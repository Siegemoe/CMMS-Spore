"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading, Card, CardHeader, CardContent, Button } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Building {
  id: string
  name: string
  number: string
  description: string | null
  floors: number | null
  status: string
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

interface Room {
  id: string
  number: string
  description: string | null
  floor: number | null
  squareFootage: number | null
  status: string
  thumbnailImage: string | null
  building: {
    id: string
    name: string
    number: string
  }
  tenant: {
    id: string
    names: string
    phoneNumbers: string
    email: string | null
    status: string
  } | null
  _count: {
    assets: number
  }
}

interface Site {
  id: string
  name: string
  address: string | null
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  siteManagerId: string | null
  siteManager: {
    id: string
    name: string | null
    email: string
  } | null
  buildings: Building[]
  _count: {
    buildings: number
    assets: number
  }
}

export default function SiteDetails() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const params = useParams()
  const router = useRouter()
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchSite()
    }
  }, [isAuthenticated, params.id])

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/sites/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSite(data)
      } else if (response.status === 404) {
        setError("Site not found")
      } else {
        setError("Failed to fetch site details")
      }
    } catch (error) {
      console.error("Failed to fetch site:", error)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Active"
      case "INACTIVE": return "Inactive"
      case "ARCHIVED": return "Archived"
      default: return status
    }
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800 hover:bg-green-200"
      case "OCCUPIED": return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "CLEANING": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "MAINTENANCE": return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "OUT_OF_SERVICE": return "bg-red-100 text-red-800 hover:bg-red-200"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getAllRoomsForSite = () => {
    if (!site) return []
    return site.buildings.flatMap(building =>
      Array.isArray(building.rooms) ? building.rooms : []
    )
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !site) {
    return (
      <div className="min-h-screen gradient-bg-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Link
              href="/sites"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Sites
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const allRooms = getAllRoomsForSite()

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href="/sites"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Sites
                  </Link>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{site.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                  {getStatusText(site.status)}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/sites/${site.id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
                >
                  Edit Site
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Site Information */}
              <Card variant="elevated">
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900">Site Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Site Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{site.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                          {getStatusText(site.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(site.updatedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>

                  {site.address && (
                    <div className="mt-6">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{site.address}</dd>
                    </div>
                  )}

                  {site.description && (
                    <div className="mt-6">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{site.description}</dd>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Buildings */}
              {site.buildings.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Buildings ({site.buildings.length})</h3>
                      <Link
                        href={`/buildings?siteId=${site.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all buildings
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {site.buildings.map((building) => (
                        <div key={building.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{building.name}</p>
                              <span className="text-xs text-gray-500">({building.number})</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {building.floors} floors • {building._count.rooms} rooms • {building._count.assets} assets
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(building.status)}`}>
                              {getStatusText(building.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Overview */}
              {allRooms.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Room Overview ({allRooms.length} rooms)</h3>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                          <span>Occupied</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                          <span>Cleaning</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                          <span>Maintenance</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allRooms.map((room) => (
                        <Link
                          key={room.id}
                          href={`/rooms/${room.id}`}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-modern touch-manipulation ${getRoomStatusColor(room.status)}`}
                          title={`${room.building.number}-${room.number} (${room.status.toLowerCase()})${room.tenant ? ` - ${room.tenant.names}` : ''}`}
                        >
                          {room.building.number}-{room.number}
                          {room._count.assets > 0 && (
                            <span className="ml-1 opacity-75">•{room._count.assets}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Click any room to view details, assets, and work orders
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Site Statistics */}
              <Card variant="elevated">
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Buildings</span>
                      <span className="font-medium">{site._count.buildings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Rooms</span>
                      <span className="font-medium">{allRooms.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Assets</span>
                      <span className="font-medium">{site._count.assets}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Site Manager */}
              {site.siteManager && (
                <Card variant="elevated">
                  <CardHeader>
                    <h3 className="text-lg font-medium text-gray-900">Site Manager</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{site.siteManager.name || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{site.siteManager.email}</dd>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card variant="elevated">
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link
                      href={`/sites/${site.id}/edit`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                    >
                      Edit Site Details
                    </Link>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.history.back()}
                    >
                      Back to Sites
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}