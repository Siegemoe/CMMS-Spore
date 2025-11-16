"use client"

import { useState, useEffect } from "react"

interface Site {
  id: string
  name: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface Building {
  id?: string
  name: string
  number: string
  description: string | null
  floors: number | null
  status: string
  siteId: string
  facilityTechnicianId: string | null
}

interface BuildingFormProps {
  building?: Building
  onBuildingSaved: () => void
  onCancel: () => void
}

export default function BuildingForm({ building, onBuildingSaved, onCancel }: BuildingFormProps) {
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
  const [sites, setSites] = useState<Site[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchSites()
    fetchUsers()

    if (building) {
      setFormData({
        name: building.name,
        number: building.number,
        description: building.description || "",
        floors: building.floors?.toString() || "",
        status: building.status,
        siteId: building.siteId,
        facilityTechnicianId: building.facilityTechnicianId || "",
      })
    }
  }, [building])

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
      const mockUsers: User[] = [
        { id: "1", name: "Admin User", email: "admin@example.com" },
        { id: "2", name: "Facility Manager", email: "facility@example.com" },
        { id: "3", name: "Maintenance Lead", email: "maintenance@example.com" }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate required fields before submission
      if (!formData.name.trim()) {
        setError("Building name is required")
        setLoading(false)
        return
      }
      if (!formData.number.trim()) {
        setError("Building number is required")
        setLoading(false)
        return
      }
      if (!formData.siteId) {
        setError("Site is required")
        setLoading(false)
        return
      }

      const submitData = {
        ...formData,
        floors: formData.floors ? parseInt(formData.floors) : null,
        facilityTechnicianId: formData.facilityTechnicianId || null,
      }

      const url = building?.id ? `/api/buildings/${building.id}` : "/api/buildings"
      const method = building?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onBuildingSaved()
        if (!building) {
          // Reset form only for new buildings
          setFormData({
            name: "",
            number: "",
            description: "",
            floors: "",
            status: "ACTIVE",
            siteId: "",
            facilityTechnicianId: "",
          })
        }
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${building?.id ? 'update' : 'create'} building`)
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
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {building?.id ? "Edit Building" : "Add New Building"}
        </h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Building Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
                placeholder="Enter building name"
              />
            </div>
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                Building Number *
              </label>
              <input
                type="text"
                id="number"
                name="number"
                required
                value={formData.number}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 sm:py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm touch-manipulation"
                placeholder="e.g., 101A"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
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
              <label htmlFor="floors" className="block text-sm font-medium text-gray-700">
                Number of Floors
              </label>
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
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
              <label htmlFor="siteId" className="block text-sm font-medium text-gray-700">
                Site *
              </label>
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
            <label htmlFor="facilityTechnicianId" className="block text-sm font-medium text-gray-700">
              Facility Technician
            </label>
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
            <p className="mt-2 text-sm text-gray-500">
              The person responsible for maintaining this building
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
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
              {loading ? "Saving..." : (building?.id ? "Save Changes" : "Create Building")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}