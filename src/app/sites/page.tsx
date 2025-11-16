"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading, Card, CardHeader, CardContent, CardFooter, Button } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Room {
  id: string
  number: string
  description: string | null
  floor: number | null
  status: string
  buildingId: string
  tenantId: string | null
  building: {
    id: string
    name: string
    number: string
  }
  tenant: {
    id: string
    names: string
    status: string
  } | null
  _count: {
    assets: number
  }
}

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
  buildings: Array<{
    id: string
    name: string
    number: string
    rooms: Room[]
  }>
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

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800 hover:bg-green-200"
      case "OCCUPIED": return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "CLEANING": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "MAINTENANCE": return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "OUT_OF_SERVICE": return "bg-red-100 text-red-800 hover:bg-red-200"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getAllRoomsForSite = (site: Site): Room[] => {
    return site.buildings.flatMap(building => building.rooms)
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sites & Rooms</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your facilities and room occupancy</p>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                Add Site
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search sites</label>
              <input
                id="search"
                type="text"
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-modern"
              />
            </div>
            <div>
              <label htmlFor="filterStatus" className="sr-only">Filter by status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-modern"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {showForm && <SiteForm onSiteCreated={fetchSites} onCancel={() => setShowForm(false)} />}

          {/* Sites & Rooms Grid */}
          <div className="space-y-6">
            {sites.length === 0 ? (
              <Card variant="elevated" className="text-center py-12">
                <div className="text-gray-500">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium mb-2">No sites found</h3>
                  <p>Create your first site to get started with facilities management.</p>
                </div>
              </Card>
            ) : (
              sites.map((site) => {
                const allRooms = getAllRoomsForSite(site)
                return (
                  <Card key={site.id} variant="elevated" hover={true}>
                    <CardContent>
                      {/* Site Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{site.name}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(site.status)}`}>
                            {getStatusText(site.status)}
                          </span>
                        </div>
                      </div>

                      {site.address && (
                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          📍 {site.address}
                        </p>
                      )}

                      {site.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{site.description}</p>
                      )}

                      {/* Site Statistics */}
                      <div className="flex flex-wrap gap-6 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">🏢</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Buildings</span>
                            <span className="font-bold text-gray-900">{site._count.buildings}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-xs">🚪</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Rooms</span>
                            <span className="font-bold text-gray-900">{allRooms.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-xs">📦</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Assets</span>
                            <span className="font-bold text-gray-900">{site._count.assets}</span>
                          </div>
                        </div>
                      </div>

                      {/* Room Badges */}
                      {allRooms.length > 0 ? (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Room Status Overview</h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {allRooms.map((room) => (
                              <Link
                                key={room.id}
                                href={`/rooms/${room.id}`}
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-modern touch-manipulation ${getRoomStatusColor(room.status)}`}
                                title={`${room.building.number}-${room.number} (${room.status.toLowerCase()})${room.tenant ? ` - ${room.tenant.names}` : ''}`}
                              >
                                {room.building.number}-{room.number}
                                {room._count.assets > 0 && (
                                  <span className="ml-1.5 opacity-75">•{room._count.assets}</span>
                                )}
                              </Link>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                              <span>Available</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                              <span>Occupied</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                              <span>Cleaning</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                              <span>Maintenance</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                              <span>Out of Service</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg">
                          No rooms configured for this site
                        </div>
                      )}

                      {/* Site Manager */}
                      {site.siteManager && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1 font-medium">Site Manager</p>
                          <p className="text-sm font-semibold text-gray-900">{site.siteManager.name || site.siteManager.email}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          href={`/sites/${site.id}`}
                          className="flex-1 text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-modern text-sm touch-manipulation"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/sites/${site.id}/edit`}
                          className="flex-1 text-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-modern text-sm touch-manipulation"
                        >
                          Edit Site
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Site Form Component
interface SiteFormProps {
  onSiteCreated: (newSite: any) => void
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
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string; role: string }>>([])

  const [includeBuildings, setIncludeBuildings] = useState(false)
  const [bulkData, setBulkData] = useState({
    buildings: "",
    floors: "",
    roomsPerFloor: "",
  })
  const [bulkCreating, setBulkCreating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/dropdown')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
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
        const newSite = await response.json()

        // If bulk creation is enabled, create buildings and rooms
        if (includeBuildings) {
          await createBulkRooms(newSite.id)
        }

        onSiteCreated(newSite)
        resetForm()
        onCancel() // Close the form after successful creation
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

  const createBulkRooms = async (siteId: string) => {
    setBulkCreating(true)
    try {
      // Parse the buildings and floors from input strings
      const buildings = bulkData.buildings.split(',').map(b => b.trim()).filter(b => b)
      const floors = bulkData.floors.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f))
      const roomsPerFloor = parseInt(bulkData.roomsPerFloor)

      if (buildings.length === 0 || floors.length === 0 || isNaN(roomsPerFloor) || roomsPerFloor < 1) {
        throw new Error('Invalid bulk creation data')
      }

      const response = await fetch('/api/sites/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          buildings,
          floors,
          roomsPerFloor,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create buildings and rooms')
      }

      return await response.json()
    } catch (error) {
      console.error('Bulk creation error:', error)
      throw error
    } finally {
      setBulkCreating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      status: "ACTIVE",
      siteManagerId: "",
    })
    setBulkData({
      buildings: "",
      floors: "",
      roomsPerFloor: "",
    })
    setIncludeBuildings(false)
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

          {/* Bulk Room Builder Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeBuildings}
                  onChange={(e) => setIncludeBuildings(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  Include Buildings and Rooms (Bulk Creation)
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Automatically create buildings and rooms for this site
              </p>
            </div>

            {includeBuildings && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bulk Room Builder</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="buildings" className="block text-sm font-medium text-gray-700 mb-1">
                      Buildings
                    </label>
                    <input
                      type="text"
                      id="buildings"
                      value={bulkData.buildings}
                      onChange={(e) => setBulkData({ ...bulkData, buildings: e.target.value })}
                      placeholder="A, B, C, D, E"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={bulkCreating}
                    />
                    <p className="mt-1 text-xs text-gray-500">Comma-separated building letters/numbers</p>
                  </div>

                  <div>
                    <label htmlFor="floors" className="block text-sm font-medium text-gray-700 mb-1">
                      Floors
                    </label>
                    <input
                      type="text"
                      id="floors"
                      value={bulkData.floors}
                      onChange={(e) => setBulkData({ ...bulkData, floors: e.target.value })}
                      placeholder="1, 2, 3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={bulkCreating}
                    />
                    <p className="mt-1 text-xs text-gray-500">Comma-separated floor numbers</p>
                  </div>

                  <div>
                    <label htmlFor="roomsPerFloor" className="block text-sm font-medium text-gray-700 mb-1">
                      Rooms per Floor
                    </label>
                    <input
                      type="number"
                      id="roomsPerFloor"
                      value={bulkData.roomsPerFloor}
                      onChange={(e) => setBulkData({ ...bulkData, roomsPerFloor: e.target.value })}
                      placeholder="4"
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={bulkCreating}
                    />
                    <p className="mt-1 text-xs text-gray-500">Number of rooms on each floor</p>
                  </div>
                </div>

                {bulkData.buildings && bulkData.floors && bulkData.roomsPerFloor && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-900">
                      <strong>Preview:</strong> This will create{' '}
                      {bulkData.buildings.split(',').filter(b => b.trim()).length} buildings with{' '}
                      {bulkData.floors.split(',').filter(f => f.trim()).length} floors each,{' '}
                      totaling {bulkData.buildings.split(',').filter(b => b.trim()).length *
                               bulkData.floors.split(',').filter(f => f.trim()).length *
                               (parseInt(bulkData.roomsPerFloor) || 0)} rooms
                    </p>
                  </div>
                )}
              </div>
            )}
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
              disabled={loading || bulkCreating}
              className="w-full sm:w-auto bg-blue-600 py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 touch-manipulation transition-colors"
            >
              {loading ? "Creating Site..." :
               bulkCreating ? "Creating Buildings & Rooms..." :
               includeBuildings ? "Create Site & Buildings" : "Create Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}