"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect } from "@/hooks"

interface Building {
  id: string
  name: string
  number: string
  description: string | null
  floors: number | null
  status: string
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
}

export default function EditBuilding() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const params = useParams()
  const router = useRouter()
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string }>>([])

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    description: "",
    floors: "",
    status: "ACTIVE",
    siteId: "",
    facilityTechnicianId: "",
  })

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchBuilding()
      fetchSites()
      fetchUsers()
    }
  }, [isAuthenticated, params.id])

  const fetchBuilding = async () => {
    try {
      const response = await fetch(`/api/buildings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBuilding(data)
        setFormData({
          name: data.name,
          number: data.number,
          description: data.description || "",
          floors: data.floors?.toString() || "",
          status: data.status,
          siteId: data.siteId,
          facilityTechnicianId: data.facilityTechnicianId || "",
        })
      } else if (response.status === 404) {
        setError("Building not found")
      } else {
        setError("Failed to fetch building details")
      }
    } catch (error) {
      console.error("Failed to fetch building:", error)
      setError("Something went wrong")
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
    setSubmitting(true)
    setError("")

    try {
      const submitData = {
        ...formData,
        floors: formData.floors ? parseInt(formData.floors) : null,
        facilityTechnicianId: formData.facilityTechnicianId || null,
      }

      const response = await fetch(`/api/buildings/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push(`/buildings/${params.id}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update building")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error && !building) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Link
              href="/buildings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Buildings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href={`/buildings/${params.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Building Details
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Building</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Update building information and details</p>
          </div>

          {/* Form */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
                    placeholder="Enter building description, special features, or notes..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                      placeholder="e.g., 3"
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
                      <option value="ARCHIVED">Archived</option>
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
                  <p className="mt-2 text-sm text-gray-500">The person responsible for maintaining this building</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href={`/buildings/${params.id}`}
                    className="w-full sm:w-auto bg-white py-3 sm:py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation transition-colors text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-blue-600 py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 touch-manipulation transition-colors"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}