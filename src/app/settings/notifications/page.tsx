"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"

interface NotificationPreference {
  id: string
  notificationType: string
  emailEnabled: boolean
  inAppEnabled: boolean
  frequency?: string
  customSettings?: any
  createdAt: string
  updatedAt: string
}

const notificationTypes = [
  {
    type: "WORK_ORDER",
    name: "Work Orders",
    description: "Notifications about work order assignments, updates, and completions",
    icon: "🔧",
  },
  {
    type: "MAINTENANCE",
    name: "Maintenance",
    description: "Scheduled maintenance reminders and maintenance-related updates",
    icon: "🛠️",
  },
  {
    type: "ASSET",
    name: "Assets",
    description: "Asset status changes, warranty expirations, and asset updates",
    icon: "📦",
  },
  {
    type: "SYSTEM",
    name: "System",
    description: "System updates, security alerts, and important announcements",
    icon: "⚙️",
  },
]

const frequencyOptions = [
  { value: "IMMEDIATE", label: "Immediately" },
  { value: "DAILY", label: "Daily Digest" },
  { value: "WEEKLY", label: "Weekly Digest" },
]

export default function NotificationSettings() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences")
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.data)
      } else {
        showToast("error", "Failed to load notification preferences")
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
      showToast("error", "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (
    prefId: string,
    field: "emailEnabled" | "inAppEnabled" | "frequency",
    value: boolean | string
  ) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === prefId ? { ...pref, [field]: value } : pref
      )
    )
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        showToast("success", "Notification preferences saved successfully")
        await fetchPreferences() // Refresh data
      } else {
        const data = await response.json()
        showToast("error", "Failed to save preferences", data.error)
      }
    } catch (error) {
      console.error("Failed to save preferences:", error)
      showToast("error", "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
        <p className="mt-2 text-gray-600">Choose how you want to receive notifications</p>
      </div>

      <div className="space-y-6">
        {notificationTypes.map((notificationType) => {
          const preference = preferences.find(p => p.notificationType === notificationType.type)

          return (
            <div key={notificationType.type} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{notificationType.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {notificationType.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notificationType.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email Notifications
                        </label>
                        <p className="text-xs text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handlePreferenceChange(
                            preference?.id || "",
                            "emailEnabled",
                            !preference?.emailEnabled
                          )
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          preference?.emailEnabled ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            preference?.emailEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          In-App Notifications
                        </label>
                        <p className="text-xs text-gray-500">
                          Show notifications in the application
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handlePreferenceChange(
                            preference?.id || "",
                            "inAppEnabled",
                            !preference?.inAppEnabled
                          )
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          preference?.inAppEnabled ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            preference?.inAppEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {(preference?.emailEnabled || preference?.inAppEnabled) && (
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Frequency
                          </label>
                          <p className="text-xs text-gray-500">
                            How often to receive notifications
                          </p>
                        </div>
                        <select
                          value={preference?.frequency || "IMMEDIATE"}
                          onChange={(e) =>
                            handlePreferenceChange(
                              preference?.id || "",
                              "frequency",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full sm:w-40 border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {frequencyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 mt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={fetchPreferences}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={savePreferences}
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}