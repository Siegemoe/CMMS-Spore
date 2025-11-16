"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors, usePriorityColors, useWorkTypeColors } from "@/hooks"

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description: string | null
  priority: string
  status: string
  assetId: string
  asset: {
    name: string
    assetTag: string | null
    site: {
      id: string
      name: string
      address: string | null
    } | null
    building: {
      id: string
      name: string
      number: string
    } | null
    room: {
      id: string
      number: string
      floor: number | null
    } | null
  }
  assignedTo: {
    name: string | null
    email: string
  } | null
  createdBy: {
    name: string | null
    email: string
  }
  workType: string
  scopeOfWork: string | null
  partsRequired: string | null
  toolsRequired: string | null
  otherResources: string | null
  safetyNotes: string | null
  estimatedStart: string | null
  estimatedCompletion: string | null
  ticketType: string | null
  siteLocation: string | null
  roomLocation: string | null
  assetLocation: string | null
  createdAt: string
  updatedAt: string
}

export default function ArchivedWorkOrders() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const { getPriorityColor } = usePriorityColors()
  const { getWorkTypeColor } = useWorkTypeColors()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchArchivedWorkOrders()
    }
  }, [isAuthenticated])

  const fetchArchivedWorkOrders = async () => {
    try {
      const response = await fetch("/api/work-orders")
      if (response.ok) {
        const data = await response.json()
        // Filter to only show archived work orders
        const archivedWorkOrders = data.filter((workOrder: WorkOrder) => workOrder.status === "ARCHIVED")
        setWorkOrders(archivedWorkOrders)
      }
    } catch (error) {
      console.error("Failed to fetch archived work orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWorkOrderLocation = (workOrder: WorkOrder) => {
    // Get location from the work order's asset
    if (workOrder.asset.site) {
      return {
        type: 'site',
        name: workOrder.asset.site.name,
        data: workOrder.asset.site
      }
    } else if (workOrder.asset.building) {
      return {
        type: 'building',
        name: workOrder.asset.building.name,
        data: workOrder.asset.building
      }
    } else if (workOrder.asset.room) {
      return {
        type: 'room',
        name: `${workOrder.asset.building?.number || 'Unknown'}-${workOrder.asset.room.number}`,
        data: workOrder.asset.room
      }
    } else {
      return {
        type: 'location',
        name: workOrder.assetLocation || workOrder.roomLocation || workOrder.siteLocation || 'Unknown Location',
        data: null
      }
    }
  }

  const handleUnarchiveWorkOrder = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "OPEN" }), // Unarchive by setting status to OPEN
      })

      if (response.ok) {
        await fetchArchivedWorkOrders()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to unarchive work order")
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteWorkOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this archived work order? This action cannot be undone.")) {
      return
    }

    setActionLoading(id)
    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchArchivedWorkOrders()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete work order")
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Archived Work Orders</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">View and restore archived maintenance tasks</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Link
                  href="/work-orders"
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
                >
                  Back to Active
                </Link>
              </div>
            </div>
          </div>

          {/* Archived Work Orders Grouped by Location */}
          {workOrders.length === 0 ? (
            <div className="bg-white shadow rounded-lg text-center py-12">
              <div className="text-gray-500">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium mb-2">No archived work orders found</h3>
                <p>Archived work orders will appear here for reference and restoration.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                workOrders.reduce((groups, workOrder) => {
                  const location = getWorkOrderLocation(workOrder)
                  if (!groups[location.name]) {
                    groups[location.name] = {
                      type: location.type,
                      name: location.name,
                      data: location.data,
                      workOrders: []
                    }
                  }
                  groups[location.name].workOrders.push(workOrder)
                  return groups
                }, {} as Record<string, { type: string; name: string; data: any; workOrders: WorkOrder[] }>)
              ).map(([locationName, locationData]) => (
                <div key={locationName} className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Location Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {locationData.type === 'site' && '🏢'}
                          {locationData.type === 'building' && '🏗️'}
                          {locationData.type === 'room' && '🚪'}
                          {locationData.type === 'location' && '📍'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{locationName}</h3>
                          <p className="text-sm text-gray-500">
                            {locationData.type === 'site' && 'Site'}
                            {locationData.type === 'building' && 'Building'}
                            {locationData.type === 'room' && 'Room'}
                            {locationData.type === 'location' && 'Location'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-300">
                        {locationData.workOrders.length} archived work order{locationData.workOrders.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Work Orders List */}
                  <div className="divide-y divide-gray-200">
                    {locationData.workOrders.map((workOrder) => (
                      <div key={workOrder.id} className="hover:bg-gray-50 transition-colors opacity-75">
                        <div className="px-6 py-4">
                          {/* Mobile Card Layout */}
                          <div className="sm:hidden">
                            <div className="flex flex-col space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 pr-2">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-base font-bold text-gray-900">
                                      #{workOrder.workOrderNumber}
                                    </span>
                                  </div>
                                  <Link
                                    href={`/work-orders/${workOrder.id}`}
                                    className="text-base font-medium text-blue-600 hover:text-blue-800 line-clamp-2"
                                  >
                                    {workOrder.title}
                                  </Link>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWorkTypeColor(workOrder.workType)}`}>
                                  {workOrder.workType}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workOrder.priority)}`}>
                                  {workOrder.priority}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workOrder.status)}`}>
                                  {workOrder.status}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <p>🔧 {workOrder.asset.name} {workOrder.asset.assetTag && `(${workOrder.asset.assetTag})`}</p>
                                {workOrder.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">{workOrder.description}</p>
                                )}
                              </div>

                              <div className="text-xs text-gray-500 space-y-1">
                                <p>👤 Created: {workOrder.createdBy.name || workOrder.createdBy.email}</p>
                                <p>📅 {new Date(workOrder.createdAt).toLocaleDateString()}</p>
                                {workOrder.assignedTo && (
                                  <p>👷 Assigned: {workOrder.assignedTo.name || workOrder.assignedTo.email}</p>
                                )}
                              </div>

                              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                                <button
                                  onClick={() => handleUnarchiveWorkOrder(workOrder.id)}
                                  disabled={actionLoading === workOrder.id}
                                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
                                >
                                  {actionLoading === workOrder.id ? "Restoring..." : "Restore"}
                                </button>
                                <button
                                  onClick={() => handleDeleteWorkOrder(workOrder.id)}
                                  disabled={actionLoading === workOrder.id}
                                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
                                >
                                  {actionLoading === workOrder.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Row Layout */}
                          <div className="hidden sm:block">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg font-bold text-gray-900">
                                        #{workOrder.workOrderNumber}
                                      </span>
                                      <Link
                                        href={`/work-orders/${workOrder.id}`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                                      >
                                        {workOrder.title}
                                      </Link>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(workOrder.workType)}`}>
                                      {workOrder.workType}
                                    </span>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(workOrder.priority)}`}>
                                      {workOrder.priority}
                                    </span>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(workOrder.status)}`}>
                                      {workOrder.status}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  Asset: {workOrder.asset.name} {workOrder.asset.assetTag && `(${workOrder.asset.assetTag})`}
                                </p>
                                {workOrder.description && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {workOrder.description}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                  <span>Created by {workOrder.createdBy.name || workOrder.createdBy.email}</span>
                                  <span className="mx-2">•</span>
                                  <span>{new Date(workOrder.createdAt).toLocaleDateString()}</span>
                                  {workOrder.assignedTo && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span>Assigned to {workOrder.assignedTo.name || workOrder.assignedTo.email}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end space-x-2">
                              <button
                                onClick={() => handleUnarchiveWorkOrder(workOrder.id)}
                                disabled={actionLoading === workOrder.id}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
                              >
                                {actionLoading === workOrder.id ? "Restoring..." : "Restore"}
                              </button>
                              <button
                                onClick={() => handleDeleteWorkOrder(workOrder.id)}
                                disabled={actionLoading === workOrder.id}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
                              >
                                {actionLoading === workOrder.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}