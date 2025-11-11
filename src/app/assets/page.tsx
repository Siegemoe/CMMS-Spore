"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"

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

export default function Assets() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets")
      if (response.ok) {
        const data = await response.json()
        // Filter out archived assets from main view
        const activeAssets = data.filter((asset: Asset) => asset.status !== "ARCHIVED")
        setAssets(activeAssets)
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ARCHIVED" }),
      })

      if (response.ok) {
        await fetchAssets()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to archive asset")
      }
    } catch (error) {
      console.error("Failed to archive asset:", error)
      alert("Failed to archive asset")
    } finally {
      setActionLoading(null)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "equipment":
        return "bg-blue-100 text-blue-800"
      case "vehicle":
        return "bg-green-100 text-green-800"
      case "building":
        return "bg-yellow-100 text-yellow-800"
      case "tool":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-gray-100 text-gray-800"
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800"
      case "RETIRED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
              <p className="mt-2 text-gray-600">Manage your equipment and facilities</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/assets/archived"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                View Archived
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Asset
              </button>
            </div>
          </div>

          {showForm && <AssetForm onAssetCreated={fetchAssets} onCancel={() => setShowForm(false)} />}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assets.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500">
                  No assets found. Create your first asset to get started.
                </li>
              ) : (
                assets.map((asset) => (
                  <li key={asset.id} className="hover:bg-gray-50">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {asset.name}
                            </p>
                            {asset.assetTag && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {asset.assetTag}
                              </span>
                            )}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(asset.category)}`}>
                              {asset.category}
                            </span>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                              {asset.status}
                            </span>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Location: {asset.location}
                              </p>
                              {asset.description && (
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  {asset.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0 flex items-center space-x-2">
                          <Link
                            href={`/assets/${asset.id}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleArchive(asset.id)}
                            disabled={actionLoading === asset.id}
                            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded text-sm"
                          >
                            {actionLoading === asset.id ? "Archiving..." : "Archive"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AssetFormProps {
  onAssetCreated: () => void
  onCancel: () => void
}

function AssetForm({ onAssetCreated, onCancel }: AssetFormProps) {
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
    <div className="bg-white shadow sm:rounded-lg mb-8">
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
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
              {loading ? "Creating..." : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}