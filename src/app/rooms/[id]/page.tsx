"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Asset {
  id: string
  name: string
  assetTag: string | null
  category: string
  status: string
  location: string
  description: string | null
  _count: {
    workOrders: number
  }
}

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description: string | null
  priority: string
  status: string
  createdAt: string
  asset: {
    id: string
    name: string
    assetTag: string | null
  }
  assignedTo: {
    id: string
    name: string | null
    email: string
  } | null
  createdBy: {
    id: string
    name: string | null
    email: string
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
  createdAt: string
  updatedAt: string
  building: {
    id: string
    name: string
    number: string
    site: {
      id: string
      name: string
      address: string | null
    }
  }
  tenant: {
    id: string
    names: string
    phoneNumbers: string
    email: string | null
    status: string
  } | null
  assets: Asset[]
  workOrders: WorkOrder[]
  _count: {
    assets: number
  }
}

export default function RoomDetails() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchRoom()
    }
  }, [isAuthenticated, params.id])

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      } else if (response.status === 404) {
        setError("Room not found")
      } else {
        setError("Failed to fetch room details")
      }
    } catch (error) {
      console.error("Failed to fetch room:", error)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "Available"
      case "OCCUPIED": return "Occupied"
      case "CLEANING": return "Cleaning"
      case "MAINTENANCE": return "Maintenance"
      case "OUT_OF_SERVICE": return "Out of Service"
      default: return status
    }
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800"
      case "OCCUPIED": return "bg-blue-100 text-blue-800"
      case "CLEANING": return "bg-yellow-100 text-yellow-800"
      case "MAINTENANCE": return "bg-orange-100 text-orange-800"
      case "OUT_OF_SERVICE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !room) {
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
                    href="/sites"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Sites
                  </Link>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {room.building.number}-{room.number}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                </div>
                <p className="text-lg text-gray-600">
                  {room.building.name} • {room.building.site.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation">
                  Edit Room
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Information */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Room Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{room.building.number}-{room.number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                          {getStatusText(room.status)}
                        </span>
                      </dd>
                    </div>
                    {room.floor && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Floor</dt>
                        <dd className="mt-1 text-sm text-gray-900">{room.floor}</dd>
                      </div>
                    )}
                    {room.squareFootage && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Square Footage</dt>
                        <dd className="mt-1 text-sm text-gray-900">{room.squareFootage} sq ft</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Assets</dt>
                      <dd className="mt-1 text-sm text-gray-900">{room._count.assets}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Active Work Orders</dt>
                      <dd className="mt-1 text-sm text-gray-900">{room.workOrders.length}</dd>
                    </div>
                  </div>
                  {room.description && (
                    <div className="mt-6">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{room.description}</dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Assets in Room */}
              {room.assets.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Assets in Room ({room.assets.length})</h3>
                      <Link
                        href={`/assets?roomId=${room.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all assets
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {room.assets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                              {asset.assetTag && (
                                <span className="text-xs text-gray-500">({asset.assetTag})</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{asset.category} • {asset.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                              {asset.status}
                            </span>
                            {asset._count.workOrders > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {asset._count.workOrders} WO
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Work Orders */}
              {room.workOrders.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Work Orders ({room.workOrders.length})</h3>
                      <Link
                        href={`/work-orders?roomId=${room.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all work orders
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {room.workOrders.map((workOrder) => (
                        <div key={workOrder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/work-orders/${workOrder.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                              >
                                {workOrder.workOrderNumber}
                              </Link>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.priority)}`}>
                                {workOrder.priority}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                                {workOrder.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-900">{workOrder.title}</p>
                            <p className="text-xs text-gray-500">Asset: {workOrder.asset.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location Info */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Location</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Site</dt>
                      <dd className="mt-1 text-sm text-gray-900">{room.building.site.name}</dd>
                    </div>
                    {room.building.site.address && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">{room.building.site.address}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Building</dt>
                      <dd className="mt-1 text-sm text-gray-900">{room.building.name} ({room.building.number})</dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenant Information */}
              {room.tenant && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tenant Information</h3>
                    <div className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Names</dt>
                        <dd className="mt-1 text-sm text-gray-900">{room.tenant.names}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone Numbers</dt>
                        <dd className="mt-1 text-sm text-gray-900">{room.tenant.phoneNumbers}</dd>
                      </div>
                      {room.tenant.email && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="mt-1 text-sm text-gray-900">{room.tenant.email}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.tenant.status)}`}>
                            {room.tenant.status}
                          </span>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      href={`/assets/create?roomId=${room.id}`}
                      className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                    >
                      Add Asset to Room
                    </Link>
                    <Link
                      href={`/work-orders/create?roomId=${room.id}`}
                      className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                    >
                      Create Work Order
                    </Link>
                    <button className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation">
                      Edit Room Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}