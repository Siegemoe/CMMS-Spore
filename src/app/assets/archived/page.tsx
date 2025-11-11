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
  _count: {
    workOrders: number
  }
}

export default function ArchivedAssets() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetchArchivedAssets()
  }, [])

  const fetchArchivedAssets = async () => {
    try {
      const response = await fetch("/api/assets?status=ARCHIVED")
      if (response.ok) {
        const data = await response.json()
        // Filter only archived assets (in case the API doesn't support status filter yet)
        const archivedAssets = data.filter((asset: Asset) => asset.status === "ARCHIVED")
        setAssets(archivedAssets)
      }
    } catch (error) {
      console.error("Failed to fetch archived assets:", error)
    } finally {
      setLoading(false)
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
        body: JSON.stringify({ status: "ACTIVE" }),
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
    if (!confirm("Are you sure you want to permanently delete this asset? This action cannot be undone.")) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link href="/assets" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Assets
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Archived Assets</h1>
                <p className="mt-2 text-gray-600">View and manage archived assets</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {assets.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No archived assets</h3>
                <p className="text-gray-500">Assets that you archive will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {assets.map((asset) => (
                  <li key={asset.id} className="hover:bg-gray-50">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
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
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <span>Work Orders: {asset._count.workOrders}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0 flex items-center space-x-2">
                          <button
                            onClick={() => handleUnarchive(asset.id)}
                            disabled={actionLoading === asset.id}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded text-sm"
                          >
                            {actionLoading === asset.id ? "Restoring..." : "Unarchive"}
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            disabled={actionLoading === asset.id || asset._count.workOrders > 0}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded text-sm"
                            title={asset._count.workOrders > 0 ? "Cannot delete asset with associated work orders" : "Delete asset"}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}