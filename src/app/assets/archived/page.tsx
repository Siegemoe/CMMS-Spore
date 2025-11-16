"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/ui/navbar"
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
  _count: {
    workOrders: number
  }
}

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
        const data = await response.json()
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

  const getAssetLocation = (asset: Asset) => {
    if (asset.site) {
      return {
        type: 'site',
        name: asset.site.name,
        data: asset.site
      }
    } else if (asset.building) {
      return {
        type: 'building',
        name: asset.building.name,
        data: asset.building
      }
    } else if (asset.room) {
      return {
        type: 'room',
        name: `${asset.building?.number || 'Unknown'}-${asset.room.number}`,
        data: asset.room
      }
    } else {
      return {
        type: 'location',
        name: asset.location || 'Unknown Location',
        data: null
      }
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Archived Assets</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">View and restore archived equipment and facilities</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Link
                  href="/assets"
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
                >
                  Back to Active
                </Link>
              </div>
            </div>
          </div>

          {/* Archived Assets Grouped by Location */}
          {assets.length === 0 ? (
            <div className="bg-white shadow rounded-lg text-center py-12">
              <div className="text-gray-500">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium mb-2">No archived assets found</h3>
                <p>Archived assets will appear here for reference and restoration.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                assets.reduce((groups, asset) => {
                  const location = getAssetLocation(asset)
                  if (!groups[location.name]) {
                    groups[location.name] = {
                      type: location.type,
                      name: location.name,
                      data: location.data,
                      assets: []
                    }
                  }
                  groups[location.name].assets.push(asset)
                  return groups
                }, {} as Record<string, { type: string; name: string; data: any; assets: Asset[] }>)
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
                        {locationData.assets.length} archived asset{locationData.assets.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Assets Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {locationData.assets.map((asset) => (
                        <div key={asset.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow opacity-75">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-medium text-gray-900 truncate">{asset.name}</h4>
                              {asset.assetTag && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 mt-1">
                                  {asset.assetTag}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 ml-2">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(asset.category)}`}>
                                {asset.category}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                                {asset.status}
                              </span>
                            </div>
                          </div>

                          {/* Location Details */}
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              {asset.room && asset.building && (
                                <>
                                  <span className="font-medium">{asset.building.number}-{asset.room.number}</span>
                                  {asset.room.floor && <span className="text-gray-400">Floor {asset.room.floor}</span>}
                                </>
                              )}
                              {asset.building && !asset.room && (
                                <span className="font-medium">{asset.building.name}</span>
                              )}
                              {asset.site && (
                                <span className="text-gray-400">• {asset.site.name}</span>
                              )}
                            </div>
                          </div>

                          {/* Asset Details */}
                          {asset.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset.description}</p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>Work Orders: {asset._count.workOrders}</span>
                            {asset.purchaseCost && (
                              <span>Cost: ${asset.purchaseCost.toLocaleString()}</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUnarchive(asset.id)}
                              disabled={actionLoading === asset.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-3 rounded text-sm touch-manipulation transition-colors"
                            >
                              {actionLoading === asset.id ? "Restoring..." : "Restore"}
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              disabled={actionLoading === asset.id}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 px-3 rounded text-sm touch-manipulation transition-colors"
                            >
                              {actionLoading === asset.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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