"use client"

import { useActivityPolling } from "@/hooks/useActivityPolling"
import ActivityLogItem from "./ActivityLogItem"

export default function RecentActivity() {
  const { activities, loading } = useActivityPolling(10000) // Poll every 10 seconds

  if (loading) {
    return (
      <div className="text-gray-500 text-xs">
        Loading activity...
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-gray-500 text-xs">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-700 mb-2 px-2">
        Recent Activity
      </div>
      {activities.map((activity) => (
        <ActivityLogItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}