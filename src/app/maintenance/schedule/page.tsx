"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading, Card, CardHeader, CardContent, Button } from "@/components/shared"
import { useAuthRedirect } from "@/hooks"
import { useAuthorization } from "@/hooks/useAuthorization"
import { PERMISSIONS } from "@/lib/authorization"

interface Asset {
  id: string
  name: string
  assetTag: string | null
  category: string
  location: string
  status: string
}

interface MaintenanceData {
  assetId: string
  title: string
  description: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  scheduledDate: string
  estimatedDuration: string
  assignedTo: string
  notes: string
}

export default function ScheduleMaintenance() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { can } = useAuthorization()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData>({
    assetId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    scheduledDate: "",
    estimatedDuration: "",
    assignedTo: "",
    notes: ""
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssets()
    }
  }, [isAuthenticated])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    // Basic validation
    if (!maintenanceData.assetId || !maintenanceData.title || !maintenanceData.scheduledDate) {
      setError("Asset, title, and scheduled date are required")
      setSubmitting(false)
      return
    }

    try {
      // Create a work order for scheduled maintenance
      const workOrderData = {
        assetId: maintenanceData.assetId,
        title: maintenanceData.title,
        description: `${maintenanceData.description}\n\nScheduled Maintenance:\nPriority: ${maintenanceData.priority}\nEstimated Duration: ${maintenanceData.estimatedDuration}\nAssigned To: ${maintenanceData.assignedTo}\nAdditional Notes: ${maintenanceData.notes}`,
        priority: maintenanceData.priority,
        status: "SCHEDULED",
        assignedTo: maintenanceData.assignedTo || null,
        scheduledDate: maintenanceData.scheduledDate,
        workOrderType: "PREVENTIVE_MAINTENANCE"
      }

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workOrderData),
      })

      if (response.ok) {
        setSuccess("Maintenance scheduled successfully!")
        setMaintenanceData({
          assetId: "",
          title: "",
          description: "",
          priority: "MEDIUM",
          scheduledDate: "",
          estimatedDuration: "",
          assignedTo: "",
          notes: ""
        })

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/work-orders")
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to schedule maintenance")
      }
    } catch (error) {
      console.error("Failed to schedule maintenance:", error)
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setMaintenanceData({ ...maintenanceData, [e.target.name]: e.target.value })
  }

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated || !can(PERMISSIONS.WORK_ORDERS_WRITE)) {
    return (
      <div className="min-h-screen gradient-bg-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to schedule maintenance.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
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
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Schedule Maintenance</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Schedule preventive maintenance for your assets and equipment
            </p>
          </div>

          {/* Form */}
          <Card variant="elevated" className="max-w-2xl">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Maintenance Details</h3>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">
                      Asset *
                    </label>
                    <select
                      id="assetId"
                      name="assetId"
                      required
                      value={maintenanceData.assetId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select an asset</option>
                      {assets.filter(asset => asset.status === "ACTIVE").map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.assetTag || asset.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={maintenanceData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Maintenance Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={maintenanceData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Quarterly HVAC Inspection"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={maintenanceData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the maintenance tasks to be performed..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      id="scheduledDate"
                      name="scheduledDate"
                      required
                      value={maintenanceData.scheduledDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      id="estimatedDuration"
                      name="estimatedDuration"
                      value={maintenanceData.estimatedDuration}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., 2 hours, 1 day"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    value={maintenanceData.assignedTo}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Technician name or team"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={maintenanceData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any additional notes or requirements..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
                  >
                    Cancel
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? "Scheduling..." : "Schedule Maintenance"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}