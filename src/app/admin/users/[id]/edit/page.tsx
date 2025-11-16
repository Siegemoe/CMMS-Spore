"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading, Card, CardHeader, CardContent, Button } from "@/components/shared"
import { useAuthRedirect, useAuthorization } from "@/hooks"
import { PERMISSIONS } from "@/lib/authorization"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  updatedAt: string
  _count: {
    assets: number
    assignedWorkOrders: number
    managedSites: number
  }
}

interface FormData {
  name: string
  email: string
  role: "ADMIN" | "USER" | "TECHNICIAN"
}

export default function EditUser() {
  const { session, isLoading: authLoading, isAuthenticated } = useAuthRedirect()
  const { can } = useAuthorization()
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "USER"
  })

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchUser()
    }
  }, [isAuthenticated, params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setFormData({
          name: data.name || "",
          email: data.email,
          role: data.role
        })
      } else if (response.status === 404) {
        setError("User not found")
      } else {
        setError("Failed to fetch user details")
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!formData.name || !formData.email) {
      setError("Name and email are required")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/users")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated || !can(PERMISSIONS.USERS_WRITE)) {
    return (
      <div className="min-h-screen gradient-bg-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to edit users.</p>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen gradient-bg-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwnAccount = session?.user?.email === user?.email

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Users
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Update user information and role assignments
              {isOwnAccount && (
                <span className="ml-2 text-blue-600 font-medium">(This is your account)</span>
              )}
            </p>
          </div>

          {/* User Info Card */}
          {user && (
            <Card variant="elevated" className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Current User Statistics</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user._count.assets}</div>
                    <div className="text-sm text-gray-500">Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{user._count.assignedWorkOrders}</div>
                    <div className="text-sm text-gray-500">Work Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user._count.managedSites}</div>
                    <div className="text-sm text-gray-500">Managed Sites</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Account created: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card variant="elevated" className="max-w-2xl">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">User Information</h3>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter user's full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isOwnAccount && session?.user?.role !== 'ADMIN'}
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="USER">User - Basic access to view data</option>
                    <option value="TECHNICIAN">Technician - Can manage assets and work orders</option>
                    {can(PERMISSIONS.SYSTEM_ADMIN) && (
                      <option value="ADMIN">Admin - Full system access</option>
                    )}
                  </select>
                  {isOwnAccount && (
                    <p className="mt-1 text-xs text-blue-600">
                      You cannot change your own role for security reasons.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href="/admin/users"
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
                    {submitting ? "Saving..." : "Save Changes"}
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