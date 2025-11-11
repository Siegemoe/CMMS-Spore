"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Site {
  id: string
  name: string
  address: string | null
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  siteManagerId: string | null
  siteManager: {
    id: string
    name: string | null
    email: string
  } | null
  _count: {
    buildings: number
    assets: number
  }
}

export default function Sites() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      fetchSites()
    }
  }, [isAuthenticated, searchTerm, filterStatus])

  const fetchSites = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)

      const response = await fetch(`/api/sites?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSites(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Active"
      case "INACTIVE": return "Inactive"
      case "ARCHIVED": return "Archived"
      default: return status
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
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sites</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your facilities and locations</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
              >
                Add Site
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {showForm && <SiteForm onSiteCreated={fetchSites} onCancel={() => setShowForm(false)} />}

          {/* Sites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium mb-2">No sites found</h3>
                  <p>Create your first site to get started with facilities management.</p>
                </div>
              </div>
            ) : (
              sites.map((site) => (
                <div key={site.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{site.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                          {getStatusText(site.status)}
                        </span>
                      </div>
                    </div>

                    {site.address && (
                      <p className="text-sm text-gray-600 mb-3">
                        📍 {site.address}
                      </p>
                    )}

                    {site.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{site.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Buildings:</span>
                        <span className="font-medium">{site._count.buildings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Assets:</span>
                        <span className="font-medium">{site._count.assets}</span>
                      </div>
                    </div>

                    {site.siteManager && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-500 mb-1">Site Manager</p>
                        <p className="text-sm font-medium text-gray-900">{site.siteManager.name || site.siteManager.email}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/sites/${site.id}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/sites/${site.id}/edit`}
                        className="flex-1 text-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Site Form Component
interface SiteFormProps {
  onSiteCreated: () => void
  onCancel: () => void
}

function SiteForm({ onSiteCreated, onCancel }: SiteFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    status: "ACTIVE",
    siteManagerId: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string }>>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // For now, use a simple approach - we can implement users API later
      const users = [
        { id: "1", name: "Admin User", email: "admin@example.com" },
        { id: "2", name: "Site Manager", email: "manager@example.com" },
        { id: "3", name: "Maintenance Lead", email: "maintenance@example.com" }
      ]
      setUsers(users)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSiteCreated()
        setFormData({
          name: "",
          address: "",
          description: "",
          status: "ACTIVE",
          siteManagerId: "",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create site")
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
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Site</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Site Name *</label>
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
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
            />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </select>
            </div>
            <div>
              <label htmlFor="siteManagerId" className="block text-sm font-medium text-gray-700">Site Manager</label>
              <select
                id="siteManagerId"
                name="siteManagerId"
                value={formData.siteManagerId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              >
                <option value="">Select a manager</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
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
              {loading ? "Creating..." : "Create Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}