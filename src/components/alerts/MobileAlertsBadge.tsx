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

export function MobileAlertsBadge() {
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
    <div className="md:hidden fixed bottom-20 right-4 z-[9999]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-sm border-2 border-white transition-all hover:scale-105"
        aria-label="Alerts"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.5rem] h-6 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] max-h-[70vh] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
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
                    className={`p-3 hover:bg-gray-50 transition-colors relative ${
                      !alert.isRead ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {/* Alert Icon */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${alertTypeColors[alert.type as AlertType].split(' ')[1]}`}>
                        <span className="text-xs">{alertTypeIcons[alert.type as AlertType]}</span>
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-medium ${
                            !alert.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {alert.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {priorityIndicators[alert.priority as AlertPriority] && (
                              <span className="text-xs">{priorityIndicators[alert.priority as AlertPriority]}</span>
                            )}
                            {!alert.isRead && (
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs mt-1 line-clamp-2 ${
                          !alert.isRead ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(alert.createdAt)}
                          </p>
                          {alert.actionUrl && alert.actionText && (
                            <a
                              href={alert.actionUrl}
                              className="text-xs text-orange-600 hover:text-orange-800 font-medium"
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
                          className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete alert"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="text-xs text-orange-600 hover:text-orange-800 font-medium"
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