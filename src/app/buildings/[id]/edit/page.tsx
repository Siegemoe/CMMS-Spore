"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading } from "@/components/shared"
import { useAuthRedirect } from "@/hooks"
import { useAuthorization } from "@/hooks/useAuthorization"
import { PERMISSIONS } from "@/lib/authorization"
import BuildingForm from "@/components/forms/BuildingForm"

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
  const { can } = useAuthorization()
  const params = useParams()
  const router = useRouter()
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchBuilding()
    }
  }, [isAuthenticated, params.id])

  const fetchBuilding = async () => {
    try {
      const response = await fetch(`/api/buildings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBuilding(data)
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

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated || !can(PERMISSIONS.BUILDINGS_WRITE)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to edit buildings.</p>
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

          {/* Building Form */}
          {building && (
            <BuildingForm
              building={building}
              onBuildingSaved={() => router.push(`/buildings/${params.id}`)}
              onCancel={() => router.push(`/buildings/${params.id}`)}
            />
          )}
        </div>
      </div>
    </div>
  )
}