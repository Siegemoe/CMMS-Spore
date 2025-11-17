"use client"

import { useState, useRef, useEffect } from 'react'
import { useAlertsStore } from '@/stores/alertsStore'
import { Alert, AlertType, AlertPriority } from '@/types/alerts'
import { formatDistanceToNow } from 'date-fns'

const alertTypeIcons = {
  [AlertType.INFO]: '💡',
  [AlertType.SUCCESS]: '✅',
  [AlertType.WARNING]: '⚠️',
  [AlertType.ERROR]: '❌',
  [AlertType.TASK]: '📋',
  [AlertType.SYSTEM]: '⚙️',
}

const alertTypeColors = {
  [AlertType.INFO]: 'text-blue-600 bg-blue-100 border-blue-200',
  [AlertType.SUCCESS]: 'text-green-600 bg-green-100 border-green-200',
  [AlertType.WARNING]: 'text-yellow-600 bg-yellow-100 border-yellow-200',
  [AlertType.ERROR]: 'text-red-600 bg-red-100 border-red-200',
  [AlertType.TASK]: 'text-purple-600 bg-purple-100 border-purple-200',
  [AlertType.SYSTEM]: 'text-gray-600 bg-gray-100 border-gray-200',
}

const priorityIndicators = {
  [AlertPriority.LOW]: '',
  [AlertPriority.MEDIUM]: '🟡',
  [AlertPriority.HIGH]: '🟠',
  [AlertPriority.CRITICAL]: '🔴',
}

export default function AlertsDropdown() {
  const { alerts, fetchAlerts, markAsRead, markAllAsRead, deleteAlert, getUnreadCount, isLoading } = useAlertsStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const unreadCount = getUnreadCount()

  useEffect(() => {
    fetchAlerts(true) // Only fetch on initial mount
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMarkAsRead = async (alertId: string) => {
    await markAsRead(alertId)
  }

  const handleDeleteAlert = async (alertId: string) => {
    await deleteAlert(alertId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const formatTimeAgo = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Alerts Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 text-white hover:bg-blue-500 rounded-full transition-colors relative"
        aria-label="Alerts"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[32rem] overflow-hidden z-[9999]">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div className="max-h-[24rem] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert: Alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors relative ${
                      !alert.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Alert Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${alertTypeColors[alert.type as AlertType].split(' ')[1]}`}>
                        <span className="text-sm">{alertTypeIcons[alert.type as AlertType]}</span>
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !alert.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {alert.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {priorityIndicators[alert.priority as AlertPriority] && (
                              <span className="text-xs">{priorityIndicators[alert.priority as AlertPriority]}</span>
                            )}
                            {!alert.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${
                          !alert.isRead ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(alert.createdAt)}
                          </p>
                          {alert.actionUrl && alert.actionText && (
                            <a
                              href={alert.actionUrl}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => setIsOpen(false)}
                            >
                              {alert.actionText}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete alert"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <a
              href="/alerts"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  )
}