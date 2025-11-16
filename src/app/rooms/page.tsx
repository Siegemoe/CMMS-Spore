"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { Loading, Card, CardHeader, CardContent, Button } from "@/components/shared"
import { useAuthRedirect, useStatusColors } from "@/hooks"

interface Room {
  id: string
  number: string
  description: string | null
  floor: number | null
  squareFootage: number | null
  status: string
  thumbnailImage: string | null
  building: {
    id: string
    name: string
    number: string
  }
  tenant: {
    id: string
    names: string
    phoneNumbers: string
    email: string | null
    status: string
  } | null
  _count: {
    assets: number
  }
}

interface Building {
  id: string
  name: string
  number: string
}

function RoomsListContent() {
  const { session, isLoading, isAuthenticated } = useAuthRedirect()
  const { getStatusColor } = useStatusColors()
  const searchParams = useSearchParams()
  const buildingId = searchParams.get("buildingId")

  const [rooms, setRooms] = useState<Room[]>([])
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms()
      if (buildingId) {
        fetchBuilding()
      }
    }
  }, [isAuthenticated, buildingId])

  const fetchRooms = async () => {
    try {
      const url = buildingId
        ? `/api/rooms?buildingId=${buildingId}&limit=100`
        : `/api/rooms?limit=100`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRooms(data.data || [])
      } else {
        setError("Failed to fetch rooms")
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const fetchBuilding = async () => {
    if (!buildingId) return

    try {
      const response = await fetch(`/api/buildings/${buildingId}`)
      if (response.ok) {
        const data = await response.json()
        setBuilding(data)
      }
    } catch (error) {
      console.error("Failed to fetch building:", error)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "Available"
      case "OCCUPIED": return "Occupied"
      case "CLEANING": return "Cleaning"
      case "MAINTENANCE": return "Maintenance"
      case "OUT_OF_SERVICE": return "Out of Service"
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

  if (isLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
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
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href="/buildings"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to Buildings
                  </Link>
                  {building && (
                    <>
                      <span className="text-gray-400">/</span>
                      <Link
                        href={`/buildings/${building.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {building.name}
                      </Link>
                    </>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {building ? `${building.name} - Rooms` : 'All Rooms'}
                </h1>
                {building && (
                  <p className="text-lg text-gray-600">Building {building.number}</p>
                )}
                <p className="text-sm text-gray-500">
                  {rooms.length} room{rooms.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <div className="flex gap-2">
                {buildingId && (
                  <Button
                    variant="secondary"
                    onClick={() => window.history.back()}
                  >
                    Back
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Rooms</h3>
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
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <div className="text-6xl mb-4">🚪</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                    <p className="text-gray-500">
                      {buildingId
                        ? "This building doesn't have any rooms yet."
                        : "No rooms found in the system."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/rooms/${room.id}`}
                      className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {room.building.number}-{room.number}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                            {getStatusText(room.status)}
                          </span>
                        </div>

                        {room.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                        )}

                        <div className="text-xs text-gray-500 space-y-1">
                          {room.floor !== null && (
                            <div>Floor: {room.floor}</div>
                          )}
                          {room.squareFootage !== null && (
                            <div>Area: {room.squareFootage} sq ft</div>
                          )}
                          {room._count.assets > 0 && (
                            <div>Assets: {room._count.assets}</div>
                          )}
                          {room.tenant && (
                            <div>Tenant: {room.tenant.names}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function RoomsList() {
  return (
    <Suspense fallback={<Loading />}>
      <RoomsListContent />
    </Suspense>
  )
}