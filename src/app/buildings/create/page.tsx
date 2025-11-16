"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect } from "@/hooks"
import { useAuthorization } from "@/hooks/useAuthorization"
import { PERMISSIONS } from "@/lib/authorization"
import { Button } from "@/components/shared"
import BuildingForm from "@/components/forms/BuildingForm"

export default function CreateBuilding() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { can } = useAuthorization()
  const router = useRouter()

  const handleBuildingCreated = () => {
    // Navigate back to buildings list after successful creation
    router.push("/buildings")
  }

  const handleCancel = () => {
    router.push("/buildings")
  }

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated || !can(PERMISSIONS.BUILDINGS_WRITE)) {
    return (
      <div className="min-h-screen gradient-bg-subtle">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to create buildings.</p>
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
                href="/buildings"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Buildings
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Building</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Add a new building to your facility management system
            </p>
          </div>

          {/* Building Form */}
          <BuildingForm
            onBuildingSaved={handleBuildingCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}