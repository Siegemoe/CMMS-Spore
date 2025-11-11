"use client"

import { useState } from "react"

interface Asset {
  id: string
  name: string
  description: string | null
  assetTag: string | null
  category: string
  location: string
  status: string
  purchaseDate: string | null
  purchaseCost: number | null
  warrantyEnd: string | null
  createdAt: string
  updatedAt: string
}

interface AssetFormProps {
  onAssetCreated: () => void
  onCancel: () => void
}

export default function AssetForm({ onAssetCreated, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assetTag: "",
    category: "",
    location: "",
    status: "ACTIVE",
    purchaseDate: "",
    purchaseCost: "",
    warrantyEnd: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
        }),
      })

      if (response.ok) {
        onAssetCreated()
        setFormData({
          name: "",
          description: "",
          assetTag: "",
          category: "",
          location: "",
          status: "ACTIVE",
          purchaseDate: "",
          purchaseCost: "",
          warrantyEnd: "",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create asset")
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
    <div className="bg-white shadow sm:rounded-lg mb-6 sm:mb-8">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Asset</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              />
            </div>
            <div>
              <label htmlFor="assetTag" className="block text-sm font-medium text-gray-700">Asset Tag</label>
              <input
                type="text"
                id="assetTag"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              >
                <option value="">Select a category</option>
                <option value="equipment">Equipment</option>
                <option value="vehicle">Vehicle</option>
                <option value="building">Building</option>
                <option value="tool">Tool</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
            <div>
              <label htmlFor="purchaseCost" className="block text-sm font-medium text-gray-700">Purchase Cost</label>
              <input
                type="number"
                step="0.01"
                id="purchaseCost"
                name="purchaseCost"
                value={formData.purchaseCost}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              />
            </div>
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              />
            </div>
            <div>
              <label htmlFor="warrantyEnd" className="block text-sm font-medium text-gray-700">Warranty End</label>
              <input
                type="date"
                id="warrantyEnd"
                name="warrantyEnd"
                value={formData.warrantyEnd}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto bg-white py-3 sm:py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 touch-manipulation transition-colors"
            >
              {loading ? "Creating..." : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}