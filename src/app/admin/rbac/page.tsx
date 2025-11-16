"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading, Card, CardHeader, CardContent, Button } from "@/components/shared"
import { useAuthRedirect } from "@/hooks"
import { useAuthorization } from "@/hooks/useAuthorization"
import { PERMISSIONS } from "@/lib/authorization"

interface Role {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    userRoles: number
    rolePermissions: number
  }
}

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  createdAt: string
}

interface RoleWithPermissions extends Role {
  rolePermissions: {
    permission: Permission
  }[]
}

export default function RBACManagement() {
  const { session, isLoading: authLoading, isAuthenticated } = useAuthRedirect()
  const { can } = useAuthorization()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null)
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')

  useEffect(() => {
    if (isAuthenticated && can(PERMISSIONS.SYSTEM_ADMIN)) {
      fetchRoles()
      fetchPermissions()
    }
  }, [isAuthenticated, can])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/rbac/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to fetch roles")
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      setError("Something went wrong")
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/rbac/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to fetch permissions")
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
      setError("Something went wrong")
    }
  }

  const fetchRoleWithPermissions = async (roleId: string) => {
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedRole(data)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to fetch role details")
      }
    } catch (error) {
      console.error("Failed to fetch role details:", error)
      setError("Something went wrong")
    }
  }

  const handleRoleClick = (role: Role) => {
    fetchRoleWithPermissions(role.id)
  }

  const closeRoleDetails = () => {
    setSelectedRole(null)
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated || !can(PERMISSIONS.SYSTEM_ADMIN)) {
    return (
      <div className="min-h-screen gradient-bg-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You need system administrator access to manage RBAC.</p>
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
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">RBAC Management</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage roles, permissions, and access control for your CMMS system
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Roles ({roles.length})
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permissions ({permissions.length})
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className={`lg:col-span-${selectedRole ? '2' : '3'}`}>
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">System Roles</h2>
                    <Link
                      href="/admin/users"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Manage User Assignments →
                    </Link>
                  </div>

                  {roles.length === 0 ? (
                    <Card variant="elevated">
                      <CardContent>
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-4">
                            <div className="text-4xl mb-2">🏷️</div>
                            <p>No roles found</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {roles.map((role) => (
                        <Card key={role.id} variant="elevated" className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent onClick={() => handleRoleClick(role)}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                                  {role.isDefault && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                      Default
                                    </span>
                                  )}
                                  {role.isActive ? (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                  <span>{role._count.userRoles} users</span>
                                  <span>{role._count.rolePermissions} permissions</span>
                                </div>
                              </div>
                              <div className="text-blue-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">System Permissions</h2>

                  {permissions.length === 0 ? (
                    <Card variant="elevated">
                      <CardContent>
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-4">
                            <div className="text-4xl mb-2">🔐</div>
                            <p>No permissions found</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="elevated">
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Permission
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Resource
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {permissions.map((permission) => (
                                <tr key={permission.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {permission.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                      {permission.resource}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {permission.action}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    {permission.description || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Role Details Sidebar */}
            {selectedRole && (
              <div className="lg:col-span-1">
                <Card variant="elevated" className="sticky top-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Role Details</h3>
                      <button
                        onClick={closeRoleDetails}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close role details"
                        title="Close role details"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedRole.name}</h4>
                        <p className="text-sm text-gray-600">{selectedRole.description}</p>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-medium text-gray-900 mb-3">Permissions ({selectedRole.rolePermissions.length})</h5>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {selectedRole.rolePermissions.map(({ permission }) => (
                            <div key={permission.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{permission.name}</span>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {permission.resource}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 text-xs text-gray-500">
                        Created: {new Date(selectedRole.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}