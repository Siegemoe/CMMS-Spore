"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"
import AssetForm from "@/components/forms/AssetForm"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors, useCategoryColors } from "@/hooks"

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
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const { getCategoryColor } = useCategoryColors()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssets()
    }
  }, [isAuthenticated])

  // No need for duplicate useEffect - handled by the auth check above

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

  // Color functions moved to shared hooks - using useStatusColors and useCategoryColors instead

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assets</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your equipment and facilities</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Link
                  href="/assets/archived"
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
                >
                  View Archived
                </Link>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>

          {showForm && <AssetForm onAssetCreated={fetchAssets} onCancel={() => setShowForm(false)} />}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assets.length === 0 ? (
                <li className="px-4 sm:px-6 py-8 text-center text-gray-500">
                  No assets found. Create your first asset to get started.
                </li>
              ) : (
                assets.map((asset) => (
                  <li key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <div className="px-4 sm:px-6 py-4">
                      {/* Mobile Card Layout */}
                      <div className="sm:hidden">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-base font-medium text-blue-600 flex-1 pr-2">
                              {asset.name}
                            </h3>
                            <div className="flex flex-col space-y-2 flex-shrink-0">
                              <Link
                                href={`/assets/${asset.id}/edit`}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded text-sm touch-manipulation transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleArchive(asset.id)}
                                disabled={actionLoading === asset.id}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 px-3 rounded text-sm touch-manipulation transition-colors"
                              >
                                {actionLoading === asset.id ? "Archiving..." : "Archive"}
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {asset.assetTag && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {asset.assetTag}
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(asset.category)}`}>
                              {asset.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                              {asset.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📍 {asset.location}</p>
                            {asset.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{asset.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Row Layout */}
                      <div className="hidden sm:flex items-center justify-between">
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm touch-manipulation transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleArchive(asset.id)}
                            disabled={actionLoading === asset.id}
                            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded text-sm touch-manipulation transition-colors"
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

// AssetForm component extracted to /components/forms/AssetForm.tsx