"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Building {
  id: string
  name: string
  number: string
  description: string | null
  floors: number | null
  status: string
  createdAt: string
  updatedAt: string
  siteId: string
  facilityTechnicianId: string | null
  site: {
    id: string
    name: string
  }
  facilityTechnician: {
    id: string
    name: string | null
    email: string
  } | null
  _count: {
    rooms: number
    assets: number
  }
}

export default function Buildings() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterSite, setFilterSite] = useState("")
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (isAuthenticated) {
      fetchBuildings()
      fetchSites()
    }
  }, [isAuthenticated, searchTerm, filterStatus, filterSite])

  const fetchBuildings = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)
      if (filterSite) params.append('siteId', filterSite)

      const response = await fetch(`/api/buildings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBuildings(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch buildings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites')
      if (response.ok) {
        const data = await response.json()
        setSites(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Active"
      case "INACTIVE": return "Inactive"
      case "MAINTENANCE": return "Maintenance"
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buildings</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your facility buildings and structures</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-2 px-4 rounded text-base sm:text-base touch-manipulation transition-colors"
              >
                Add Building
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search buildings</label>
              <input
                id="search"
                type="text"
                placeholder="Search buildings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="filterSite" className="sr-only">Filter by site</label>
              <select
                id="filterSite"
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="sr-only">Filter by status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          {showForm && <BuildingForm onBuildingCreated={fetchBuildings} onCancel={() => setShowForm(false)} sites={sites} />}

          {/* Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium mb-2">No buildings found</h3>
                  <p>Create your first building to get started with facilities management.</p>
                </div>
              </div>
            ) : (
              buildings.map((building) => (
                <div key={building.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{building.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Building {building.number}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(building.status)}`}>
                          {getStatusText(building.status)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📍</span>
                        <span>{building.site.name}</span>
                      </div>
                      {building.floors && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Floors:</span>
                          <span className="font-medium">{building.floors}</span>
                        </div>
                      )}
                    </div>

                    {building.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{building.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rooms:</span>
                        <span className="font-medium">{building._count.rooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Assets:</span>
                        <span className="font-medium">{building._count.assets}</span>
                      </div>
                    </div>

                    {building.facilityTechnician && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-500 mb-1">Facility Technician</p>
                        <p className="text-sm font-medium text-gray-900">
                          {building.facilityTechnician.name || building.facilityTechnician.email}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/buildings/${building.id}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors touch-manipulation"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/buildings/${building.id}/edit`}
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

// Building Form Component
interface BuildingFormProps {
  onBuildingCreated: () => void
  onCancel: () => void
  sites: Array<{ id: string; name: string }>
}

function BuildingForm({ onBuildingCreated, onCancel, sites }: BuildingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    description: "",
    floors: "",
    status: "ACTIVE",
    siteId: "",
    facilityTechnicianId: "",
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
        { id: "2", name: "Facility Manager", email: "facility@example.com" },
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
      const submitData = {
        ...formData,
        floors: formData.floors ? parseInt(formData.floors) : null,
        facilityTechnicianId: formData.facilityTechnicianId || null,
      }

      const response = await fetch("/api/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onBuildingCreated()
        setFormData({
          name: "",
          number: "",
          description: "",
          floors: "",
          status: "ACTIVE",
          siteId: "",
          facilityTechnicianId: "",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create building")
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
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Building</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Building Name *</label>
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
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">Building Number *</label>
              <input
                type="text"
                id="number"
                name="number"
                required
                value={formData.number}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="floors" className="block text-sm font-medium text-gray-700">Number of Floors</label>
              <input
                type="number"
                id="floors"
                name="floors"
                min="1"
                max="200"
                value={formData.floors}
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
              </select>
            </div>
            <div>
              <label htmlFor="siteId" className="block text-sm font-medium text-gray-700">Site *</label>
              <select
                id="siteId"
                name="siteId"
                required
                value={formData.siteId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
              >
                <option value="">Select a site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="facilityTechnicianId" className="block text-sm font-medium text-gray-700">Facility Technician</label>
            <select
              id="facilityTechnicianId"
              name="facilityTechnicianId"
              value={formData.facilityTechnicianId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
            >
              <option value="">Select a technician</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
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
              {loading ? "Creating..." : "Create Building"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}