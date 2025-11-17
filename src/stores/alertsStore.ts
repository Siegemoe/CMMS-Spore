"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Alert, AlertStats, AlertType, AlertPriority, AlertPreferences } from '@/types/alerts'

interface AlertState {
  alerts: Alert[]
  preferences: AlertPreferences
  isLoading: boolean
  error: string | null

  // Actions
  fetchAlerts: (forceRefresh?: boolean) => Promise<void>
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  markAsRead: (alertId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteAlert: (alertId: string) => Promise<void>
  updatePreferences: (preferences: Partial<AlertPreferences>) => Promise<void>
  getStats: () => AlertStats
  getUnreadCount: () => number
}

const defaultPreferences: AlertPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  desktopNotifications: false,
  soundEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  types: {
    [AlertType.INFO]: true,
    [AlertType.SUCCESS]: true,
    [AlertType.WARNING]: true,
    [AlertType.ERROR]: true,
    [AlertType.TASK]: true,
    [AlertType.SYSTEM]: true,
  },
  priorities: {
    [AlertPriority.LOW]: true,
    [AlertPriority.MEDIUM]: true,
    [AlertPriority.HIGH]: true,
    [AlertPriority.CRITICAL]: true,
  }
}

export const useAlertsStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      preferences: defaultPreferences,
      isLoading: false,
      error: null,

      fetchAlerts: async (forceRefresh?: boolean) => {
        const currentState = get()
        if (!forceRefresh && currentState.alerts.length > 0) {
          return // Don't refetch if we already have alerts
        }

        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/alerts/sample')
          if (!response.ok) throw new Error('Failed to fetch alerts')
          const alerts = await response.json()
          set({ alerts, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      addAlert: async (alertData) => {
        try {
          const response = await fetch('/api/alerts/sample', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData),
          })
          if (!response.ok) throw new Error('Failed to add alert')
          const newAlert = await response.json()

          set(state => ({
            alerts: [newAlert, ...state.alerts]
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' })
        }
      },

      markAsRead: async (alertId) => {
        set(state => ({
            alerts: state.alerts.map(alert =>
              alert.id === alertId ? { ...alert, isRead: true, updatedAt: new Date() } : alert
            )
          }))
      },

      markAllAsRead: async () => {
        set(state => ({
            alerts: state.alerts.map(alert => ({ ...alert, isRead: true, updatedAt: new Date() }))
          }))
      },

      deleteAlert: async (alertId) => {
        set(state => ({
            alerts: state.alerts.filter(alert => alert.id !== alertId)
          }))
      },

      updatePreferences: async (newPreferences) => {
        set(state => ({
            preferences: { ...state.preferences, ...newPreferences }
          }))
      },

      getStats: () => {
        const { alerts } = get()
        const stats: AlertStats = {
          total: alerts.length,
          unread: alerts.filter(a => !a.isRead).length,
          byType: Object.values(AlertType).reduce((acc, type) => {
            acc[type] = alerts.filter(a => a.type === type).length
            return acc
          }, {} as Record<AlertType, number>),
          byPriority: Object.values(AlertPriority).reduce((acc, priority) => {
            acc[priority] = alerts.filter(a => a.priority === priority).length
            return acc
          }, {} as Record<AlertPriority, number>)
        }
        return stats
      },

      getUnreadCount: () => {
        const { alerts } = get()
        return alerts.filter(a => !a.isRead).length
      },
    }),
    {
      name: 'alerts-store',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
)