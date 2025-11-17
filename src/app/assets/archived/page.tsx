"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors, useCategoryColors } from "@/hooks"
import { Asset, AssetLocationInfo } from "@/types/asset"

export default function ArchivedAssets() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const { getCategoryColor } = useCategoryColors()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchArchivedAssets()
    }
  }, [isAuthenticated])

  const fetchArchivedAssets = async () => {
    try {
      const response = await fetch("/api/assets")
      if (response.ok) {
        const data: Asset[] = await response.json()
        // Filter to only show archived assets
        const archivedAssets = data.filter((asset: Asset) => asset.status === "ARCHIVED")
        setAssets(archivedAssets)
      }
    } catch (error) {
      console.error("Failed to fetch archived assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAssetLocation = (asset: Asset): AssetLocationInfo => {
    // Check in priority order: site > building > room > location
    if (asset.site) {
      return {
        type: 'site',
        name: asset.site.name,
        data: asset.site
      }
    }
    
    if (asset.building && !asset.room) {
      return {
        type: 'building',
        name: asset.building.name,
        data: asset.building
      }
    }
    
    if (asset.room) {
      // Extract values before the conditional to avoid type narrowing issues
      const roomData = asset.room
      const buildingData = asset.building
      const roomNumber = roomData?.number || 'Unknown'
      const buildingNumber = buildingData?.number || 'Unknown'
      return {
        type: 'room',
        name: `${buildingNumber}-${roomNumber}`,
        data: roomData
      }
    }
    
    return {
      type: 'location',
      name: asset.location || 'Unknown Location',
      data: null
    }
  }

  const handleUnarchive = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ACTIVE" }), // Unarchive by setting status to ACTIVE
      })

      if (response.ok) {
        await fetchArchivedAssets()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to unarchive asset")
      }
    } catch (error) {
      console.error("Failed to unarchive asset:", error)
      alert("Failed to unarchive asset")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this archived asset? This action cannot be undone.")) {
      return
    }

    setActionLoading(id)
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchArchivedAssets()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete asset")
      }
    } catch (error) {
      console.error("Failed to delete asset:", error)
      alert("Failed to delete asset")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Archived Assets</h1>
          <p className="mt-2 text-gray-600">
            View and manage archived assets. You can unarchive or permanently delete assets from here.
          </p>
        </div>

        <div className="mb-6">
          <Link
            href="/assets"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Back to Assets
          </Link>
        </div>

        {assets.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center">No archived assets found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assets.map((asset) => {
                const location = getAssetLocation(asset)
                return (
                  <li key={asset.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">{asset.name}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                                {asset.status}
                              </span>
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(asset.category)}`}>
                                {asset.category}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {asset.assetTag || 'No tag'}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {location.name}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {asset.category} • {asset.status}
                            </p>
                          </div>
                        </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUnarchive(asset.id)}
                              disabled={actionLoading === asset.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {actionLoading === asset.id ? "Processing..." : "Unarchive"}
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              disabled={actionLoading === asset.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              {actionLoading === asset.id ? "Processing..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}