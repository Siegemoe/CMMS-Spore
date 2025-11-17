"use client"

import { useState, useEffect } from "react"
import { Asset } from "@/types/asset"

interface EnhancedWorkOrderFormProps {
  onWorkOrderCreated: () => void
  onCancel: () => void
  assets: Asset[]
}

function EnhancedWorkOrderForm({ onWorkOrderCreated, onCancel }: EnhancedWorkOrderFormProps) {
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create work order")
      }

      onWorkOrderCreated()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Work Order</h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information Section */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief description of work needed"
                  />
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
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detailed description of the issue or work required"
                />
              </div>
            </div>

            {/* Work Details Section */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Work Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="workType" className="block text-sm font-medium text-gray-700">Work Type</label>
                  <input
                    id="workType"
                    type="text"
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Electrical, Plumbing, HVAC"
                  />
                </div>
                <div>
                  <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">Asset</label>
                  <select
                    id="assetId"
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleAssetChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select an asset</option>
                    {assetsWithLocations.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} {asset.assetTag && `(${asset.assetTag})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="scopeOfWork" className="block text-sm font-medium text-gray-700">Scope of Work</label>
                <textarea
                  id="scopeOfWork"
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detailed scope of work to be performed"
                />
              </div>
            </div>

            {/* Resource Requirements Section */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Resource Requirements</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="partsRequired" className="block text-sm font-medium text-gray-700">Parts Required</label>
                  <textarea
                    id="partsRequired"
                    name="partsRequired"
                    value={formData.partsRequired}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="List any parts or materials needed"
                  />
                </div>
                <div>
                  <label htmlFor="toolsRequired" className="block text-sm font-medium text-gray-700">Tools Required</label>
                  <textarea
                    id="toolsRequired"
                    name="toolsRequired"
                    value={formData.toolsRequired}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="List any special tools or equipment needed"
                  />
                </div>
                <div>
                  <label htmlFor="otherResources" className="block text-sm font-medium text-gray-700">Other Resources</label>
                  <textarea
                    id="otherResources"
                    name="otherResources"
                    value={formData.otherResources}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Other resources or personnel needed"
                  />
                </div>
              </div>
            </div>

            {/* Safety and Schedule Section */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Safety and Schedule</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="safetyNotes" className="block text-sm font-medium text-gray-700">Safety Notes</label>
                  <textarea
                    id="safetyNotes"
                    name="safetyNotes"
                    value={formData.safetyNotes}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any safety precautions or requirements"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estimatedStart" className="block text-sm font-medium text-gray-700">Estimated Start Date</label>
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
                    <label htmlFor="estimatedCompletion" className="block text-sm font-medium text-gray-700">Estimated Completion Date</label>
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

            {/* Location Information Section */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Location Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700">Site Location</label>
                  <input
                    type="text"
                    name="siteLocation"
                    value={formData.siteLocation}
                    onChange={handleChange}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 sm:text-sm"
                    placeholder="Auto-populated from asset location"
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
    </div>
  )
}

export default EnhancedWorkOrderForm