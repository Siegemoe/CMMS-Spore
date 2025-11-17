"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors, usePriorityColors, useWorkTypeColors } from "@/hooks"
import { WorkOrder, WorkOrderLocationInfo, WorkOrderRoom, WorkOrderBuilding } from "@/types/work-order"
import { Asset } from "@/types/asset"


export default function WorkOrders() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const { getPriorityColor } = usePriorityColors()
  const { getWorkTypeColor } = useWorkTypeColors()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkOrders()
      fetchAssets()
    }
  }, [isAuthenticated])

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch("/api/work-orders")
      if (response.ok) {
        const data = await response.json()
        // Filter out archived work orders from main view
        const activeWorkOrders = data.filter((workOrder: WorkOrder) => workOrder.status !== "ARCHIVED")
        setWorkOrders(activeWorkOrders)
      }
    } catch (error) {
      console.error("Failed to fetch work orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets")
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    }
  }

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
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchWorkOrders()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete work order")
      }
    } catch (error) {
      alert("Something went wrong")
    }
  }

  const handleArchiveWorkOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ARCHIVED" }),
      })

      if (response.ok) {
        fetchWorkOrders()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to archive work order")
      }
    } catch (error) {
      alert("Something went wrong")
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Work Orders</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Manage maintenance tasks and repairs</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Link
                  href="/work-orders/archived"
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
                >
                  View Archived
                </Link>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
                >
                  Create Work Order
                </button>
              </div>
            </div>
          </div>

          {showForm && <EnhancedWorkOrderForm onWorkOrderCreated={() => { fetchWorkOrders(); setShowForm(false); }} assets={assets} onCancel={() => setShowForm(false)} />}

          {/* Work Orders Grouped by Location */}
          {workOrders.length === 0 ? (
            <div className="bg-white shadow rounded-lg text-center py-12">
              <div className="text-gray-500">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-lg font-medium mb-2">No work orders found</h3>
                <p>Create your first work order to get started with maintenance management.</p>
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
                              <Link
                                href={`/work-orders/${workOrder.id}/edit`}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleArchiveWorkOrder(workOrder.id)}
                                disabled={workOrder.status === "ARCHIVED"}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
                              >
                                Archive
                              </button>
                              <button
                                onClick={() => handleDeleteWorkOrder(workOrder.id)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 touch-manipulation transition-colors"
                              >
                                Delete
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


interface EnhancedWorkOrderFormProps {
  onWorkOrderCreated: () => void
  onCancel: () => void
  assets: Asset[]
}

function EnhancedWorkOrderForm({ onWorkOrderCreated, onCancel, assets }: EnhancedWorkOrderFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    workType: "",
    assetId: "",
    scopeOfWork: "",
    partsRequired: "",
    toolsRequired: "",
    otherResources: "",
    safetyNotes: "",
    estimatedStart: "",
    estimatedCompletion: "",
    ticketType: "",
    siteLocation: "",
    roomLocation: "",
    assetLocation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [assetsWithLocations, setAssetsWithLocations] = useState<Asset[]>([])

  // Fetch assets with location data when component mounts
  useEffect(() => {
    const fetchAssetsWithLocations = async () => {
      try {
        const response = await fetch("/api/assets")
        if (response.ok) {
          const data = await response.json()
          setAssetsWithLocations(data)
        }
      } catch (error) {
        console.error("Failed to fetch assets with locations:", error)
      }
    }
    fetchAssetsWithLocations()
  }, [])

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assetId = e.target.value
    setFormData({ ...formData, assetId })

    // Find the selected asset and populate location fields
    const selectedAsset = assetsWithLocations.find(asset => asset.id === assetId)
    if (selectedAsset) {
      let locationString = ""

      // Build location string from asset's location data
      if (selectedAsset.room && selectedAsset.building) {
        locationString = `${selectedAsset.building.number}-${selectedAsset.room.number}`
        if (selectedAsset.room.floor) {
          locationString += ` (Floor ${selectedAsset.room.floor})`
        }
      } else if (selectedAsset.building) {
        locationString = selectedAsset.building.name
      } else if (selectedAsset.site) {
        locationString = selectedAsset.site.name
      }

      // Update form with location data
      setFormData(prev => ({
        ...prev,
        assetId,
        siteLocation: selectedAsset.site?.name || "",
        roomLocation: selectedAsset.room ?
          `${selectedAsset.building?.number || ''}-${selectedAsset.room.number}` :
          selectedAsset.building?.name || "",
        assetLocation: locationString
      }))
    } else {
      // Clear location fields if no asset selected
      setFormData(prev => ({
        ...prev,
        assetId,
        siteLocation: "",
        roomLocation: "",
        assetLocation: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onWorkOrderCreated()
        setFormData({
          title: "",
          description: "",
          priority: "MEDIUM",
          workType: "",
          assetId: "",
          scopeOfWork: "",
          partsRequired: "",
          toolsRequired: "",
          otherResources: "",
          safetyNotes: "",
          estimatedStart: "",
          estimatedCompletion: "",
          ticketType: "",
          siteLocation: "",
          roomLocation: "",
          assetLocation: "",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create work order")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="bg-white shadow sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Work Order</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">Asset *</label>
                <select
                  id="assetId"
                  name="assetId"
                  required
                  value={formData.assetId}
                  onChange={handleAssetChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select an asset</option>
                  {assetsWithLocations.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} {asset.assetTag && `(${asset.assetTag})`}
                      {asset.site && ` - ${asset.site.name}`}
                      {asset.building && !asset.room && ` - ${asset.building.name}`}
                      {asset.room && asset.building && ` - ${asset.building.number}-${(asset.room as any).number}`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Location will be automatically populated based on asset selection</p>
              </div>
              <div>
                <label htmlFor="workType" className="block text-sm font-medium text-gray-700">Work Type *</label>
                <select
                  id="workType"
                  name="workType"
                  required
                  value={formData.workType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select work type</option>
                  <option value="corrective">Corrective</option>
                  <option value="preventive">Preventive</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the problem and scope of work required"
              />
            </div>
          </div>

          {/* Work Details */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Work Details</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Scope of Work</label>
                <textarea
                  name="scopeOfWork"
                  rows={2}
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detailed outline of the work required"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parts Required</label>
                  <textarea
                    name="partsRequired"
                    rows={2}
                    value={formData.partsRequired}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="List necessary parts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tools Required</label>
                  <textarea
                    name="toolsRequired"
                    rows={2}
                    value={formData.toolsRequired}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="List necessary tools"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Other Resources</label>
                  <textarea
                    name="otherResources"
                    rows={2}
                    value={formData.otherResources}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Other resources needed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Safety and Scheduling */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Safety and Scheduling</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Safety Notes</label>
                <textarea
                  name="safetyNotes"
                  rows={2}
                  value={formData.safetyNotes}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Specific safety requirements or notes"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="estimatedStart" className="block text-sm font-medium text-gray-700">Estimated Start</label>
                  <input
                    id="estimatedStart"
                    type="datetime-local"
                    name="estimatedStart"
                    value={formData.estimatedStart}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="estimatedCompletion" className="block text-sm font-medium text-gray-700">Estimated Completion</label>
                  <input
                    id="estimatedCompletion"
                    type="datetime-local"
                    name="estimatedCompletion"
                    value={formData.estimatedCompletion}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Location Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Location</label>
                <input
                  type="text"
                  name="assetLocation"
                  value={formData.assetLocation}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 sm:text-sm"
                  placeholder="Auto-populated from asset selection"
                />
                <p className="mt-1 text-xs text-gray-500">Automatically populated from asset location</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Location</label>
                <input
                  type="text"
                  name="roomLocation"
                  value={formData.roomLocation}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 sm:text-sm"
                  placeholder="Auto-populated from asset selection"
                />
                <p className="mt-1 text-xs text-gray-500">Automatically populated from asset location</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Site Location</label>
                <input
                  type="text"
                  name="siteLocation"
                  value={formData.siteLocation}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 sm:text-sm"
                  placeholder="Auto-populated from asset selection"
                />
                <p className="mt-1 text-xs text-gray-500">Automatically populated from asset location</p>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="ticketType" className="block text-sm font-medium text-gray-700">Ticket Type</label>
              <input
                id="ticketType"
                type="text"
                name="ticketType"
                value={formData.ticketType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type of ticket (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Work Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}