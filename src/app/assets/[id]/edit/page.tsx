"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
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

export default function EditAsset({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [id, setId] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assetTag: "",
    category: "equipment",
    location: "",
    status: "ACTIVE",
    purchaseDate: "",
    purchaseCost: "",
    warrantyEnd: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetchAsset().finally(() => setLoading(false))
    }
  }, [id, status])

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        description: asset.description || "",
        assetTag: asset.assetTag || "",
        category: asset.category,
        location: asset.location,
        status: asset.status,
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
        purchaseCost: asset.purchaseCost?.toString() || "",
        warrantyEnd: asset.warrantyEnd ? new Date(asset.warrantyEnd).toISOString().split('T')[0] : ""
      })
    }
  }, [asset])

  const fetchAsset = async () => {
    try {
      const response = await fetch(`/api/assets/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAsset(data)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to fetch asset")
      }
    } catch (error) {
      console.error("Failed to fetch asset:", error)
      setError("Failed to fetch asset")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/assets`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update asset")
      }
    } catch (error) {
      console.error("Failed to update asset:", error)
      setError("Failed to update asset")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error && !asset) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <div className="mt-4">
              <Link href="/assets" className="text-blue-600 hover:text-blue-800">
                ← Back to Assets
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link href="/assets" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Assets
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Asset</h1>
            <p className="mt-2 text-gray-600">Update asset information</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="assetTag" className="block text-sm font-medium text-gray-700">
                    Asset Tag
                  </label>
                  <input
                    type="text"
                    id="assetTag"
                    name="assetTag"
                    value={formData.assetTag}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="equipment">Equipment</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="building">Building</option>
                    <option value="tool">Tool</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Purchase Information</h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="purchaseCost" className="block text-sm font-medium text-gray-700">
                    Purchase Cost
                  </label>
                  <input
                    type="number"
                    id="purchaseCost"
                    name="purchaseCost"
                    step="0.01"
                    min="0"
                    value={formData.purchaseCost}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="warrantyEnd" className="block text-sm font-medium text-gray-700">
                    Warranty End Date
                  </label>
                  <input
                    type="date"
                    id="warrantyEnd"
                    name="warrantyEnd"
                    value={formData.warrantyEnd}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/assets"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}