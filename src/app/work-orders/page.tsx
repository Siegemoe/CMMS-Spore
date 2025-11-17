"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import EnhancedWorkOrderForm from "@/components/work-orders/EnhancedWorkOrderForm"
import { useAuthRedirect, useStatusColors, usePriorityColors, useWorkTypeColors, useApiEndpoints } from "@/hooks"
import { WorkOrder, WorkOrderLocationInfo, WorkOrderBuilding } from "@/types/work-order"
import { Asset } from "@/types/asset"


export default function WorkOrders() {
  const { isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const { getPriorityColor } = usePriorityColors()
  const { getWorkTypeColor } = useWorkTypeColors()
  const { useWorkOrders, useAssets, useUpdateWorkOrder, useDeleteWorkOrder } = useApiEndpoints

  const { data: workOrdersData, loading: workOrdersLoading, fetchData: fetchWorkOrders } = useWorkOrders()
  const { data: assetsData, loading: assetsLoading, fetchData: fetchAssets } = useAssets()

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [showForm, setShowForm] = useState(false)

  const { execute: updateWorkOrder } = useUpdateWorkOrder('')
  const { execute: deleteWorkOrder } = useDeleteWorkOrder('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkOrders()
      fetchAssets()
    }
  }, [isAuthenticated, fetchWorkOrders, fetchAssets])

  useEffect(() => {
    if (workOrdersData) {
      // Filter out archived work orders from main view
      const activeWorkOrders = workOrdersData.filter((workOrder: WorkOrder) => workOrder.status !== "ARCHIVED")
      setWorkOrders(activeWorkOrders)
    }
  }, [workOrdersData])

  useEffect(() => {
    if (assetsData) {
      setAssets(assetsData)
    }
  }, [assetsData])

  const getWorkOrderLocation = (workOrder: WorkOrder): WorkOrderLocationInfo => {
    // Get location from the work order's asset

    if (workOrder.asset.site) {
      return {
        type: 'site',
        name: workOrder.asset.site.name,
        data: workOrder.asset.site
      }
    }

    if (workOrder.asset.building) {
      return {
        type: 'building',
        name: workOrder.asset.building.name,
        data: workOrder.asset.building
      }
    }

    if (workOrder.asset.room) {
      const roomNumber = workOrder.asset.room?.number || 'Unknown'
      // Use type assertion to bypass type narrowing issues
      const buildingNumber = (workOrder.asset.building as WorkOrderBuilding | null)?.number || 'Unknown'
      return {
        type: 'room',
        name: `${buildingNumber}-${roomNumber}`,
        data: workOrder.asset.room
      }
    }

    return {
      type: 'location',
      name: workOrder.assetLocation || workOrder.roomLocation || workOrder.siteLocation || 'Unknown Location',
      data: null
    }
  }

  // Color functions moved to shared hooks - using useStatusColors, usePriorityColors, and useWorkTypeColors instead

  const handleDeleteWorkOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work order?")) {
      return
    }

    try {
      await deleteWorkOrder(`/api/work-orders/${id}`)
      await fetchWorkOrders()
    } catch (error) {
      console.error("Failed to delete work order:", error)
    }
  }

  const handleArchiveWorkOrder = async (id: string) => {
    try {
      await updateWorkOrder(`/api/work-orders/${id}`, { status: "ARCHIVED" })
      await fetchWorkOrders()
    } catch (error) {
      console.error("Failed to archive work order:", error)
    }
  }

  // Group work orders by location
  const groupedWorkOrders = workOrders.reduce((acc, workOrder) => {
    const location = getWorkOrderLocation(workOrder)
    const key = location.name

    if (!acc[key]) {
      acc[key] = {
        type: location.type,
        name: location.name,
        data: location.data,
        workOrders: []
      }
    }

    acc[key].workOrders.push(workOrder)
    return acc
  }, {} as Record<string, { type: string; name: string; data: any; workOrders: WorkOrder[] }>)

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="mt-2 text-gray-600">Manage and track maintenance work orders</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Work Orders</p>
              <p className="text-2xl font-bold text-gray-900">{workOrders.length}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow"
          >
            Create Work Order
          </button>
        </div>

        {showForm && <EnhancedWorkOrderForm onWorkOrderCreated={() => { fetchWorkOrders(); setShowForm(false); }} assets={assets} onCancel={() => setShowForm(false)} />}

        {workOrdersLoading || assetsLoading ? (
          <Loading />
        ) : workOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first work order</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow"
            >
              Create Work Order
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedWorkOrders).map(([locationName, locationData]) => (
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
                      {locationData.workOrders.length} work order{locationData.workOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Work Orders List */}
                <div className="divide-y divide-gray-200">
                  {locationData.workOrders.map((workOrder) => (
                    <div key={workOrder.id} className="hover:bg-gray-50 transition-colors">
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
                              <Link
                                href={`/work-orders/${workOrder.id}/edit`}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 touch-manipulation transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleArchiveWorkOrder(workOrder.id)}
                                disabled={workOrder.status === "ARCHIVED"}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
                              >
                                Archive
                              </button>
                              <button
                                onClick={() => handleDeleteWorkOrder(workOrder.id)}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 touch-manipulation transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-bold text-gray-900">
                                  #{workOrder.workOrderNumber}
                                </span>
                                <Link
                                  href={`/work-orders/${workOrder.id}`}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {workOrder.title}
                                </Link>
                              </div>
                              <div className="mt-1 flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                  📍 {getWorkOrderLocation(workOrder).name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  🔧 {workOrder.asset.name} {workOrder.asset.assetTag && `(${workOrder.asset.assetTag})`}
                                </span>
                                {workOrder.assignedTo && (
                                  <span className="text-sm text-gray-600">
                                    👷 {workOrder.assignedTo.name || workOrder.assignedTo.email}
                                  </span>
                                )}
                                <span className="text-sm text-gray-600">
                                  📅 {new Date(workOrder.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {workOrder.description && (
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{workOrder.description}</p>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
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

                            <div className="flex items-center space-x-2 ml-4">
                              <Link
                                href={`/work-orders/${workOrder.id}/edit`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleArchiveWorkOrder(workOrder.id)}
                                disabled={workOrder.status === "ARCHIVED"}
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Archive
                              </button>
                              <button
                                onClick={() => handleDeleteWorkOrder(workOrder.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
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
    </>
  )
}