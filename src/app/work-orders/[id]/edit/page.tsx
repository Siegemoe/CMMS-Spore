"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"

interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description: string | null
  priority: string
  status: string
  assetId: string
  asset: {
    name: string
    assetTag: string | null
  }
  assignedTo: {
    id: string
    name: string | null
    email: string
  } | null
  assignedToId: string | null
  createdBy: {
    name: string | null
    email: string
  }
  workType: string
  scopeOfWork: string | null
  partsRequired: string | null
  toolsRequired: string | null
  otherResources: string | null
  safetyNotes: string | null
  estimatedStart: string | null
  estimatedCompletion: string | null
  ticketType: string | null
  siteLocation: string | null
  roomLocation: string | null
  assetLocation: string | null
}

interface Asset {
  id: string
  name: string
  assetTag: string | null
}

interface User {
  id: string
  name: string | null
  email: string
}

export default function EditWorkOrder({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [id, setId] = useState<string>("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (status === "authenticated" && id) {
      Promise.all([
        fetchWorkOrder(),
        fetchAssets(),
        fetchUsers()
      ]).finally(() => setLoading(false))
    }
  }, [id, status])

  const fetchWorkOrder = async () => {
    try {
      const response = await fetch(`/api/work-orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkOrder(data)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to fetch work order")
      }
    } catch (error) {
      setError("Something went wrong")
    }
  }

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets")
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    if (!workOrder) return

    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workOrder),
      })

      if (response.ok) {
        router.push(`/work-orders/${id}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update work order")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!workOrder) return

    const { name, value } = e.target
    if (name === "assignedToId") {
      // Handle the assignedToId separately
      setWorkOrder({
        ...workOrder,
        assignedToId: value || null
      })
    } else {
      setWorkOrder({ ...workOrder, [name]: value })
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  if (error && !workOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
              <Link href="/work-orders" className="mt-2 inline-flex text-blue-600 hover:text-blue-800">
                ← Back to Work Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-gray-500">Work order not found</div>
            <Link href="/work-orders" className="mt-2 inline-flex text-blue-600 hover:text-blue-800">
              ← Back to Work Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link href={`/work-orders/${id}`} className="text-blue-600 hover:text-blue-800 mb-2 inline-flex">
              ← Back to Work Order
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Work Order #{workOrder.workOrderNumber}</h1>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                      <input
                        id="title"
                        type="text"
                        name="title"
                        required
                        value={workOrder.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">Asset *</label>
                      <select
                        id="assetId"
                        name="assetId"
                        required
                        value={workOrder.assetId}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {assets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} {asset.assetTag && `(${asset.assetTag})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="workType" className="block text-sm font-medium text-gray-700">Work Type *</label>
                      <select
                        id="workType"
                        name="workType"
                        required
                        value={workOrder.workType}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select work type</option>
                        <option value="corrective">Corrective</option>
                        <option value="preventive">Preventive</option>
                        <option value="inspection">Inspection</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        id="priority"
                        name="priority"
                        value={workOrder.priority}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={workOrder.status}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">Assigned To</label>
                      <select
                        id="assignedToId"
                        name="assignedToId"
                        value={workOrder.assignedTo?.id || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={workOrder.description || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Describe the problem and scope of work required"
                    />
                  </div>
                </div>

                {/* Work Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Work Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Scope of Work</label>
                      <textarea
                        name="scopeOfWork"
                        rows={2}
                        value={workOrder.scopeOfWork || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Detailed outline of the work required"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Parts Required</label>
                        <textarea
                          name="partsRequired"
                          rows={2}
                          value={workOrder.partsRequired || ""}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="List necessary parts"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tools Required</label>
                        <textarea
                          name="toolsRequired"
                          rows={2}
                          value={workOrder.toolsRequired || ""}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="List necessary tools"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Other Resources</label>
                        <textarea
                          name="otherResources"
                          rows={2}
                          value={workOrder.otherResources || ""}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Other resources needed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety and Scheduling */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Safety and Scheduling</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Safety Notes</label>
                      <textarea
                        name="safetyNotes"
                        rows={2}
                        value={workOrder.safetyNotes || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Specific safety requirements or notes"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="estimatedStart" className="block text-sm font-medium text-gray-700">Estimated Start</label>
                        <input
                          id="estimatedStart"
                          type="datetime-local"
                          name="estimatedStart"
                          value={workOrder.estimatedStart ? new Date(workOrder.estimatedStart).toISOString().slice(0, 16) : ""}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="estimatedCompletion" className="block text-sm font-medium text-gray-700">Estimated Completion</label>
                        <input
                          id="estimatedCompletion"
                          type="datetime-local"
                          name="estimatedCompletion"
                          value={workOrder.estimatedCompletion ? new Date(workOrder.estimatedCompletion).toISOString().slice(0, 16) : ""}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Location Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Asset Location</label>
                      <input
                        type="text"
                        name="assetLocation"
                        value={workOrder.assetLocation || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Exact location of the asset"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room Location</label>
                      <input
                        type="text"
                        name="roomLocation"
                        value={workOrder.roomLocation || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Room number or area"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Site Location</label>
                      <input
                        type="text"
                        name="siteLocation"
                        value={workOrder.siteLocation || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Site or building"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Ticket Type</label>
                    <input
                      type="text"
                      name="ticketType"
                      value={workOrder.ticketType || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Type of ticket"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link
                    href={`/work-orders/${id}`}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Update Work Order"}
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