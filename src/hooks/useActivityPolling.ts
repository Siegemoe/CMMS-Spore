"use client"

import { useEffect, useState } from "react"

interface Activity {
  id: string
  action: string
  entityType: string
  entityId: string
  entityName: string | null
  description: string
  details: string | null
  userName: string
  createdAt: string
}

export function useActivityPolling(interval: number = 10000) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activity")
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchActivities()

    // Set up polling
    const intervalId = setInterval(fetchActivities, interval)

    // Listen for custom refresh events
    const handleRefresh = () => {
      fetchActivities()
    }

    window.addEventListener('refresh-activity', handleRefresh)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('refresh-activity', handleRefresh)
    }
  }, [interval])

  const refresh = () => {
    fetchActivities()
  }

  return { activities, loading, refresh }
}

// Helper function to trigger activity refresh globally
export const triggerActivityRefresh = () => {
  window.dispatchEvent(new CustomEvent('refresh-activity'))
}