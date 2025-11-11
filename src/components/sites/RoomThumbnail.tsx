"use client"

import Link from "next/link"
import { useRoomStatusColors } from "@/hooks"

interface Room {
  id: string
  number: string
  description: string | null
  floor: number | null
  status: string
  thumbnailImage: string | null
  tenant: {
    id: string
    names: string
    phoneNumbers: string
    email: string | null
  } | null
  assets: Array<{
    id: string
    name: string
    category: string
    status: string
  }>
  building: {
    name: string
    number: string
    site: {
      name: string
    }
  }
}

interface RoomThumbnailProps {
  room: Room
  onStatusUpdate?: (roomId: string, newStatus: string) => void
}

export default function RoomThumbnail({ room, onStatusUpdate }: RoomThumbnailProps) {
  const { getRoomStatusColor, getRoomStatusBadgeColor } = useRoomStatusColors()

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

  const handleStatusClick = (e: React.MouseEvent, newStatus: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (onStatusUpdate) {
      onStatusUpdate(room.id, newStatus)
    }
  }

  // Extract first name from names string (comma-separated)
  const primaryTenantName = room.tenant?.names?.split(',')[0]?.trim() || ""

  // Extract first phone number (comma-separated)
  const primaryPhoneNumber = room.tenant?.phoneNumbers?.split(',')[0]?.trim() || ""

  return (
    <Link href={`/rooms/${room.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* Status Badge */}
        <div className={`h-2 ${getRoomStatusBadgeColor(room.status)}`} />

        <div className="p-4">
          {/* Room Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {room.building.name} {room.number}
              </h3>
              {room.floor && (
                <p className="text-sm text-gray-500">Floor {room.floor}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
              {getStatusText(room.status)}
            </span>
          </div>

          {/* Thumbnail or Placeholder */}
          <div className="mb-3">
            {room.thumbnailImage ? (
              <img
                src={room.thumbnailImage}
                alt={`Room ${room.number}`}
                className="w-full h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">🏠</div>
                  <p className="text-xs text-gray-500">Room {room.number}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tenant Information (only show for occupied rooms) */}
          {room.status === "OCCUPIED" && room.tenant ? (
            <div className="mb-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-1">Tenant Information</p>
              <p className="text-sm text-blue-800 font-medium">{primaryTenantName}</p>
              {primaryPhoneNumber && (
                <p className="text-sm text-blue-700">{primaryPhoneNumber}</p>
              )}
              {room.tenant.email && (
                <p className="text-xs text-blue-600 mt-1">{room.tenant.email}</p>
              )}
            </div>
          ) : (
            <div className="mb-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                {room.status === "AVAILABLE" && "Ready for occupancy"}
                {room.status === "CLEANING" && "Currently being cleaned"}
                {room.status === "MAINTENANCE" && "Under maintenance"}
                {room.status === "OUT_OF_SERVICE" && "Temporarily unavailable"}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => handleStatusClick(e, "AVAILABLE")}
              disabled={room.status === "AVAILABLE"}
              className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                room.status === "AVAILABLE"
                  ? "bg-green-500 text-white cursor-default"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Available
            </button>
            <button
              onClick={(e) => handleStatusClick(e, "CLEANING")}
              disabled={room.status === "CLEANING"}
              className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                room.status === "CLEANING"
                  ? "bg-yellow-500 text-white cursor-default"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              Cleaning
            </button>
            <button
              onClick={(e) => handleStatusClick(e, "MAINTENANCE")}
              disabled={room.status === "MAINTENANCE"}
              className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                room.status === "MAINTENANCE"
                  ? "bg-orange-500 text-white cursor-default"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              Maintenance
            </button>
          </div>

          {/* Assets Count */}
          {room.assets && room.assets.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {room.assets.length} asset{room.assets.length !== 1 ? "s" : ""} assigned
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}