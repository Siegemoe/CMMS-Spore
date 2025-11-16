"use client"

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { Permission, PERMISSIONS } from '@/lib/authorization'

interface UseAuthorizationReturn {
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  isAdmin: boolean
  isLoading: boolean
  isAuthenticated: boolean
  permissions: Permission[]
}

/**
 * Hook for checking user permissions on the client side
 */
export function useAuthorization(): UseAuthorizationReturn {
  const { data: session, status } = useSession()

  const permissions = useMemo(() => {
    if (!session?.user) {
      return []
    }

    // For now, we'll use a simple role-based permission system
    // In a real app, you'd fetch this from an API or include in the session
    const userRole = session.user.role || 'USER'

    switch (userRole) {
      case 'ADMIN':
        return Object.values(PERMISSIONS)

      case 'TECHNICIAN':
        return [
          PERMISSIONS.SITES_READ,
          PERMISSIONS.BUILDINGS_READ,
          PERMISSIONS.ROOMS_READ,
          PERMISSIONS.ASSETS_READ,
          PERMISSIONS.ASSETS_WRITE,
          PERMISSIONS.WORK_ORDERS_READ,
          PERMISSIONS.WORK_ORDERS_WRITE,
          PERMISSIONS.TENANTS_READ,
        ]

      case 'USER':
      default:
        return [
          PERMISSIONS.SITES_READ,
          PERMISSIONS.BUILDINGS_READ,
          PERMISSIONS.ROOMS_READ,
          PERMISSIONS.ASSETS_READ,
          PERMISSIONS.WORK_ORDERS_READ,
          PERMISSIONS.TENANTS_READ,
        ]
    }
  }, [session])

  const can = useMemo(() => {
    return (permission: Permission): boolean => {
      return permissions.includes(permission)
    }
  }, [permissions])

  const canAny = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some(permission => permissions.includes(permission))
    }
  }, [permissions])

  const canAll = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every(permission => permissions.includes(permission))
    }
  }, [permissions])

  const isAdmin = useMemo(() => {
    return permissions.includes(PERMISSIONS.SYSTEM_ADMIN)
  }, [permissions])

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    permissions
  }
}

/**
 * HOC for protecting components that require specific permissions
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: Permission[],
  fallback?: React.ComponentType
) {
  return function WithPermissionComponent(props: P) {
    const { canAny, isLoading } = useAuthorization()

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!canAny(requiredPermissions)) {
      const FallbackComponent = fallback || (() => <div>Access Denied</div>)
      return <FallbackComponent />
    }

    return <WrappedComponent {...props} />
  }
}

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGuardProps {
  permissions: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({
  permissions,
  requireAll = false,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { canAny, canAll, isLoading } = useAuthorization()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const hasPermission = requireAll ? canAll(permissions) : canAny(permissions)

  return hasPermission ? <>{children}</> : <>{fallback}</>
}