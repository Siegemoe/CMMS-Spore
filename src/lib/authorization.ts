import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type Permission = string
export type Resource = string

// Define permission constants
export const PERMISSIONS = {
  // User management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',

  // Site management
  SITES_READ: 'sites:read',
  SITES_WRITE: 'sites:write',
  SITES_DELETE: 'sites:delete',
  SITES_MANAGE: 'sites:manage',

  // Building management
  BUILDINGS_READ: 'buildings:read',
  BUILDINGS_WRITE: 'buildings:write',
  BUILDINGS_DELETE: 'buildings:delete',
  BUILDINGS_MANAGE: 'buildings:manage',

  // Room management
  ROOMS_READ: 'rooms:read',
  ROOMS_WRITE: 'rooms:write',
  ROOMS_DELETE: 'rooms:delete',
  ROOMS_MANAGE: 'rooms:manage',

  // Asset management
  ASSETS_READ: 'assets:read',
  ASSETS_WRITE: 'assets:write',
  ASSETS_DELETE: 'assets:delete',
  ASSETS_MANAGE: 'assets:manage',

  // Work order management
  WORK_ORDERS_READ: 'work_orders:read',
  WORK_ORDERS_WRITE: 'work_orders:write',
  WORK_ORDERS_DELETE: 'work_orders:delete',
  WORK_ORDERS_MANAGE: 'work_orders:manage',
  WORK_ORDERS_ASSIGN: 'work_orders:assign',

  // Tenant management
  TENANTS_READ: 'tenants:read',
  TENANTS_WRITE: 'tenants:write',
  TENANTS_DELETE: 'tenants:delete',
  TENANTS_MANAGE: 'tenants:manage',

  // System administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_READ: 'system:read',
} as const

// Role definitions with default permissions
export const DEFAULT_ROLES = {
  ADMIN: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS)
  ],
  USER: [
    // Basic user permissions
    PERMISSIONS.SITES_READ,
    PERMISSIONS.BUILDINGS_READ,
    PERMISSIONS.ROOMS_READ,
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.WORK_ORDERS_READ,
    PERMISSIONS.TENANTS_READ,
  ],
  TECHNICIAN: [
    // Technician permissions
    PERMISSIONS.SITES_READ,
    PERMISSIONS.BUILDINGS_READ,
    PERMISSIONS.ROOMS_READ,
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_WRITE,
    PERMISSIONS.WORK_ORDERS_READ,
    PERMISSIONS.WORK_ORDERS_WRITE,
    PERMISSIONS.TENANTS_READ,
  ],
} as const

export type RoleName = keyof typeof DEFAULT_ROLES

/**
 * Get user permissions from database
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    const permissions: Permission[] = []

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        permissions.push(rolePermission.permission.name)
      }
    }

    return [...new Set(permissions)] // Remove duplicates
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return []
  }
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return userPermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.some(permission => userPermissions.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.every(permission => userPermissions.includes(permission))
}

/**
 * Get user from session and return their permissions
 */
export async function getSessionUserPermissions() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { user: null, permissions: [] }
  }

  const permissions = await getUserPermissions(session.user.id)

  return {
    user: session.user,
    permissions
  }
}

/**
 * Authorization middleware for API routes
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, ...args: any[]) => {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const hasRequiredPermission = await hasPermission(session.user.id, permission)

    if (!hasRequiredPermission) {
      return Response.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    // Continue with the request
    return null
  }
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (req: Request, ...args: any[]) => {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const hasRequiredPermission = await hasAnyPermission(session.user.id, permissions)

    if (!hasRequiredPermission) {
      return Response.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    // Continue with the request
    return null
  }
}

/**
 * Check if user has admin-level access
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return await hasPermission(userId, PERMISSIONS.SYSTEM_ADMIN)
}

/**
 * Get user's roles
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        role: true
      }
    })

    return userRoles.map(ur => ur.role.name)
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return []
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes(roleName)
}

/**
 * Initialize default roles and permissions in database
 */
export async function initializeRBAC() {
  try {
    // Create all permissions
    const allPermissions = Object.values(PERMISSIONS)

    for (const permissionName of allPermissions) {
      await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: {
          name: permissionName,
          resource: permissionName.split(':')[0],
          action: permissionName.split(':')[1],
          description: `${permissionName.replace(/_/g, ' ')} permission`
        }
      })
    }

    // Create default roles
    for (const [roleName, permissionNames] of Object.entries(DEFAULT_ROLES)) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: `Default ${roleName.toLowerCase()} role`,
          isDefault: roleName === 'USER'
        }
      })

      // Assign permissions to role
      for (const permissionName of permissionNames) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        })

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id
            }
          })
        }
      }
    }

    console.log('RBAC system initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing RBAC:', error)
    return false
  }
}