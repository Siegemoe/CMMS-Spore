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
    name: string | null
    email: string
  } | null
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
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export default function WorkOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
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
    if (id) {
      fetchWorkOrder()
    }
  }, [id])

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
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchWorkOrder()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update status")
      }
    } catch (error) {
      alert("Something went wrong")
    }
  }

  const handleDeleteWorkOrder = async () => {
    if (!confirm("Are you sure you want to delete this work order? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/work-orders")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete work order")
      }
    } catch (error) {
      alert("Something went wrong")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "LOW": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "ON_HOLD": return "bg-gray-100 text-gray-800"
      case "ARCHIVED": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case "corrective": return "bg-red-100 text-red-800"
      case "preventive": return "bg-green-100 text-green-800"
      case "inspection": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  if (error) {
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/work-orders" className="text-blue-600 hover:text-blue-800 mb-2 inline-flex">
                  ← Back to Work Orders
                </Link>
                <div className="flex items-center space-x-4">
                  <h1 className="text-3xl font-bold text-gray-900">#{workOrder.workOrderNumber}</h1>
                  <h2 className="text-2xl font-medium text-gray-700">{workOrder.title}</h2>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/work-orders/${workOrder.id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Edit Work Order
                </Link>
                <button
                  onClick={handleDeleteWorkOrder}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <span className={`px-3 inline-flex text-sm leading-5 font-semibold rounded-full ${getWorkTypeColor(workOrder.workType)}`}>
                {workOrder.workType}
              </span>
              <span className={`px-3 inline-flex text-sm leading-5 font-semibold rounded-full ${getPriorityColor(workOrder.priority)}`}>
                {workOrder.priority}
              </span>
              <span className={`px-3 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(workOrder.status)}`}>
                {workOrder.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {workOrder.description || "No description provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Asset</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {workOrder.asset.name} {workOrder.asset.assetTag && `(${workOrder.asset.assetTag})`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created by</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {workOrder.createdBy.name || workOrder.createdBy.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assigned to</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {workOrder.assignedTo ? (workOrder.assignedTo.name || workOrder.assignedTo.email) : "Unassigned"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Work Details */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Work Details</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-1">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Scope of Work</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {workOrder.scopeOfWork || "No scope defined"}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Parts Required</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {workOrder.partsRequired || "None specified"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tools Required</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {workOrder.toolsRequired || "None specified"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Other Resources</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {workOrder.otherResources || "None specified"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Safety Information */}
              {workOrder.safetyNotes && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Safety Information</h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <p className="text-sm text-gray-900">{workOrder.safetyNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Management */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Status Management</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-3">
                  {workOrder.status !== "COMPLETED" && workOrder.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleStatusUpdate("IN_PROGRESS")}
                      disabled={workOrder.status === "IN_PROGRESS"}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {workOrder.status !== "COMPLETED" && workOrder.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleStatusUpdate("COMPLETED")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Mark Completed
                    </button>
                  )}
                  {workOrder.status !== "CANCELLED" && workOrder.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleStatusUpdate("CANCELLED")}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel Work Order
                    </button>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Location Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="space-y-3">
                    {workOrder.assetLocation && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Asset Location</dt>
                        <dd className="mt-1 text-sm text-gray-900">{workOrder.assetLocation}</dd>
                      </div>
                    )}
                    {workOrder.roomLocation && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Room Location</dt>
                        <dd className="mt-1 text-sm text-gray-900">{workOrder.roomLocation}</dd>
                      </div>
                    )}
                    {workOrder.siteLocation && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Site Location</dt>
                        <dd className="mt-1 text-sm text-gray-900">{workOrder.siteLocation}</dd>
                      </div>
                    )}
                    {workOrder.ticketType && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ticket Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{workOrder.ticketType}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Timestamps</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(workOrder.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(workOrder.updatedAt).toLocaleString()}
                      </dd>
                    </div>
                    {workOrder.estimatedStart && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estimated Start</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(workOrder.estimatedStart).toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {workOrder.estimatedCompletion && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estimated Completion</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(workOrder.estimatedCompletion).toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {workOrder.completedAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Completed</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(workOrder.completedAt).toLocaleString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}