"use client"

import { useState, useCallback } from "react"

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

/**
 * A reusable API hook that standardizes data fetching, loading states, and error handling
 * across the entire application. Reduces code duplication and provides consistent behavior.
 *
 * @param initialState - Optional initial state for the API call
 * @returns An object with state and fetch function
 */
export function useApi<T = any>(initialState: Partial<ApiState<T>> = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    ...initialState
  })

  const execute = useCallback(async (url: string, options: ApiOptions = {}) => {
    const {
      method = 'GET',
      body,
      headers = {},
      onSuccess,
      onError
    } = options

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(url, config)
      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      setState(prev => ({ ...prev, data: responseData, loading: false, error: null }))
      onSuccess?.(responseData)
      return responseData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      onError?.(errorMessage)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState(prev => ({ ...prev, data: null, error: null, loading: false }))
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Specialized hook for GET requests that provides a simpler interface
 */
export function useFetch<T = any>(url: string | null = null, options: Omit<ApiOptions, 'method'> = {}) {
  const api = useApi<T>()
  const [data, setData] = useState<T | null>(null)

  const fetch = useCallback(async (fetchUrl?: string) => {
    const targetUrl = fetchUrl || url
    if (!targetUrl) {
      throw new Error('No URL provided for fetch')
    }
    return api.execute(targetUrl, { ...options, method: 'GET' })
  }, [api, url, options])

  // Auto-fetch if URL is provided
  const fetchData = useCallback(async () => {
    if (url) {
      try {
        const result = await fetch()
        setData(result)
        return result
      } catch (error) {
        console.error('Auto-fetch failed:', error)
      }
    }
  }, [fetch, url])

  return {
    ...api,
    data,
    fetch,
    fetchData,
    execute: api.execute
  }
}

/**
 * Specialized hook for POST requests
 */
export function usePost<T = any>(options: Omit<ApiOptions, 'method'> = {}) {
  const api = useApi<T>()

  const post = useCallback(async (url: string, body?: any, postOptions?: Omit<ApiOptions, 'method' | 'body'>) => {
    return api.execute(url, {
      ...options,
      ...postOptions,
      method: 'POST',
      body
    })
  }, [api, options])

  return {
    ...api,
    post
  }
}

/**
 * Specialized hook for PATCH requests
 */
export function usePatch<T = any>(options: Omit<ApiOptions, 'method'> = {}) {
  const api = useApi<T>()

  const patch = useCallback(async (url: string, body?: any, patchOptions?: Omit<ApiOptions, 'method' | 'body'>) => {
    return api.execute(url, {
      ...options,
      ...patchOptions,
      method: 'PATCH',
      body
    })
  }, [api, options])

  return {
    ...api,
    patch
  }
}

/**
 * Specialized hook for DELETE requests
 */
export function useDelete<T = any>(options: Omit<ApiOptions, 'method'> = {}) {
  const api = useApi<T>()

  const del = useCallback(async (url: string, deleteOptions?: Omit<ApiOptions, 'method'>) => {
    return api.execute(url, {
      ...options,
      ...deleteOptions,
      method: 'DELETE'
    })
  }, [api, options])

  return {
    ...api,
    delete: del
  }
}

/**
 * Pre-configured API hooks for common endpoints
 */
export const useApiEndpoints = {
  // Dashboard
  useDashboardStats: () => useFetch('/api/dashboard/stats'),

  // Work Orders
  useWorkOrders: () => useFetch('/api/work-orders'),
  useCreateWorkOrder: () => usePost('/api/work-orders'),
  useUpdateWorkOrder: (id: string) => usePatch(`/api/work-orders/${id}`),
  useDeleteWorkOrder: (id: string) => useDelete(`/api/work-orders/${id}`),

  // Assets
  useAssets: () => useFetch('/api/assets'),
  useCreateAsset: () => usePost('/api/assets'),
  useUpdateAsset: (id: string) => usePatch(`/api/assets/${id}`),
  useDeleteAsset: (id: string) => useDelete(`/api/assets/${id}`),

  // Sites
  useSites: () => useFetch('/api/sites'),
  useCreateSite: () => usePost('/api/sites'),
  useUpdateSite: (id: string) => usePatch(`/api/sites/${id}`),
  useDeleteSite: (id: string) => useDelete(`/api/sites/${id}`),

  // Buildings
  useBuildings: () => useFetch('/api/buildings'),
  useCreateBuilding: () => usePost('/api/buildings'),
  useUpdateBuilding: (id: string) => usePatch(`/api/buildings/${id}`),
  useDeleteBuilding: (id: string) => useDelete(`/api/buildings/${id}`),

  // Users
  useUsers: () => useFetch('/api/users'),
  useCreateUser: () => usePost('/api/users'),
  useUpdateUser: (id: string) => usePatch(`/api/users/${id}`),
  useDeleteUser: (id: string) => useDelete(`/api/users/${id}`),

  // User Profile
  useUserProfile: () => useFetch('/api/user/profile'),
  useUpdateUserProfile: () => usePatch('/api/user/profile'),
  useChangePassword: () => usePost('/api/user/change-password'),

  // Notifications
  useNotificationPreferences: () => useFetch('/api/notifications/preferences'),
  useUpdateNotificationPreferences: () => usePost('/api/notifications/preferences'),

  // Activity
  useActivity: () => useFetch('/api/activity'),

  // Alerts
  useAlerts: () => useFetch('/api/alerts/sample'),
  useCreateAlert: () => usePost('/api/alerts/sample'),
}