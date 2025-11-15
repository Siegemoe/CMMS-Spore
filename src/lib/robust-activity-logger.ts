import { prisma } from './prisma'

export interface LogActivityParams {
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'completed'
  entityType: 'work_order' | 'asset' | 'user'
  entityId: string
  entityName: string
  description: string
  userId: string
  userName: string
  details?: Record<string, any>
}

export interface ActivityResult {
  success: boolean
  error?: string
  activityId?: string
}

// System user constants
export const SYSTEM_USER_EMAIL = 'system@cmms.local'
export const SYSTEM_USER_NAME = 'System'

/**
 * Robust activity logging with comprehensive error handling and fallbacks
 */
export async function logActivity(params: LogActivityParams): Promise<ActivityResult> {
  try {
    const { action, entityType, entityId, entityName, description, userId, userName, details } = params

    // Step 0: Validate required parameters
    if (!entityId || !entityName || !description || !userId) {
      return {
        success: false,
        error: 'Missing required parameters: entityId, entityName, description, or userId'
      }
    }

    // Step 1: Validate and get a valid user ID
    const validUser = await getOrCreateValidUser(userId, userName)

    // Step 2: Create the activity log with validated user
    const activity = await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        entityName,
        description,
        details: details ? JSON.stringify(details) : null,
        userId: validUser.id,
        userName: validUser.userName,
      },
      // Don't include the user relationship in the response to avoid circular dependencies
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        entityName: true,
        description: true,
        details: true,
        userId: true,
        userName: true,
        createdAt: true
      }
    })

    return {
      success: true,
      activityId: activity.id,
    }
  } catch (error) {
    console.error('Failed to log activity:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      params: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
      }
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get or create a valid user for activity logging
 */
async function getOrCreateValidUser(inputUserId: string, inputUserName: string) {
  // First, try to find the user from the session
  let user = await prisma.user.findUnique({
    where: { id: inputUserId },
    select: { id: true, name: true, email: true }
  })

  // If user exists, return it
  if (user) {
    return {
      id: user.id,
      userName: user.name || inputUserName
    }
  }

  // If user doesn't exist, look for system user
  user = await prisma.user.findFirst({
    where: { email: SYSTEM_USER_EMAIL },
    select: { id: true, name: true, email: true }
  })

  if (user) {
    return {
      id: user.id,
      userName: user.name || SYSTEM_USER_NAME
    }
  }

  // Create system user if it doesn't exist
  const systemUser = await prisma.user.create({
    data: {
      email: SYSTEM_USER_EMAIL,
      name: SYSTEM_USER_NAME,
      password: 'system-logging-user', // Won't be used for login
      role: 'ADMIN',
    },
    select: { id: true, name: true, email: true }
  })

  console.log('Created system user for activity logging:', systemUser.id)

  return {
    id: systemUser.id,
    userName: systemUser.name || SYSTEM_USER_NAME
  }
}

// Helper functions for common activity types - simplified version
export const activityHelpers = {
  // Work Order activities
  workOrderCreated: async (workOrderNumber: string, title: string, userId: string, userName: string, workOrderId?: string): Promise<ActivityResult> =>
    logActivity({
      action: 'created',
      entityType: 'work_order',
      entityId: workOrderId || workOrderNumber, // Use ID if provided, fallback to number
      entityName: `#${workOrderNumber} - ${title}`,
      description: `Created work order ${workOrderNumber}`,
      userId,
      userName,
      details: { workOrderNumber, workOrderId },
    }),

  workOrderStatusChanged: async (workOrderNumber: string, title: string, oldStatus: string, newStatus: string, userId: string, userName: string, workOrderId?: string): Promise<ActivityResult> =>
    logActivity({
      action: 'status_changed',
      entityType: 'work_order',
      entityId: workOrderId || workOrderNumber,
      entityName: `#${workOrderNumber} - ${title}`,
      description: `Changed status from ${oldStatus} to ${newStatus} for work order ${workOrderNumber}`,
      userId,
      userName,
      details: { oldStatus, newStatus, workOrderNumber, workOrderId },
    }),

  workOrderUpdated: async (workOrderNumber: string, title: string, changes: Record<string, any>, userId: string, userName: string, workOrderId?: string): Promise<ActivityResult> =>
    logActivity({
      action: 'updated',
      entityType: 'work_order',
      entityId: workOrderId || workOrderNumber,
      entityName: `#${workOrderNumber} - ${title}`,
      description: `Updated work order ${workOrderNumber}`,
      userId,
      userName,
      details: { ...changes, workOrderNumber, workOrderId },
    }),

  workOrderDeleted: async (workOrderNumber: string, title: string, userId: string, userName: string, workOrderId?: string): Promise<ActivityResult> =>
    logActivity({
      action: 'deleted',
      entityType: 'work_order',
      entityId: workOrderId || workOrderNumber,
      entityName: `#${workOrderNumber} - ${title}`,
      description: `Deleted work order ${workOrderNumber}`,
      userId,
      userName,
      details: { workOrderNumber, workOrderId },
    }),

  // Asset activities
  assetCreated: async (assetName: string, assetTag: string | null, userId: string, userName: string): Promise<ActivityResult> =>
    logActivity({
      action: 'created',
      entityType: 'asset',
      entityId: assetName,
      entityName: assetTag ? `${assetName} (${assetTag})` : assetName,
      description: `Created asset ${assetName}`,
      userId,
      userName,
    }),

  assetUpdated: async (assetName: string, assetTag: string | null, changes: Record<string, any>, userId: string, userName: string): Promise<ActivityResult> =>
    logActivity({
      action: 'updated',
      entityType: 'asset',
      entityId: assetName,
      entityName: assetTag ? `${assetName} (${assetTag})` : assetName,
      description: `Updated asset ${assetName}`,
      userId,
      userName,
      details: changes,
    }),

  assetDeleted: async (assetName: string, assetTag: string | null, userId: string, userName: string): Promise<ActivityResult> =>
    logActivity({
      action: 'deleted',
      entityType: 'asset',
      entityId: assetName,
      entityName: assetTag ? `${assetName} (${assetTag})` : assetName,
      description: `Deleted asset ${assetName}`,
      userId,
      userName,
    }),

  assetArchived: async (assetName: string, assetTag: string | null, userId: string, userName: string): Promise<ActivityResult> =>
    logActivity({
      action: 'status_changed',
      entityType: 'asset',
      entityId: assetName,
      entityName: assetTag ? `${assetName} (${assetTag})` : assetName,
      description: `Archived asset ${assetName}`,
      userId,
      userName,
      details: { oldStatus: 'active', newStatus: 'archived' },
    }),

  assetUnarchived: async (assetName: string, assetTag: string | null, userId: string, userName: string): Promise<ActivityResult> =>
    logActivity({
      action: 'status_changed',
      entityType: 'asset',
      entityId: assetName,
      entityName: assetTag ? `${assetName} (${assetTag})` : assetName,
      description: `Unarchived asset ${assetName}`,
      userId,
      userName,
      details: { oldStatus: 'archived', newStatus: 'active' },
    }),

  assetStatusUpdated: async (assetName: string, assetTag: string | null, oldStatus: string, newStatus: string, userId: string, userName: string): Promise<ActivityResult> =>
    logActivity({
      action: 'status_changed',
      entityType: 'asset',
      entityId: assetName,
      entityName: assetTag ? `${assetName} (${assetTag})` : assetName,
      description: `Changed status from ${oldStatus} to ${newStatus} for asset ${assetName}`,
      userId,
      userName,
      details: { oldStatus, newStatus },
    }),
}

export class ActivityLogger {
  static async log(params: {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'COMPLETE' | 'STATUS_CHANGE' | 'BULK_CREATE'
    entityType: string
    entityId: string
    entityName?: string
    description: string
    userId: string
    userName: string
    details?: any
  }): Promise<ActivityResult> {
    // Map actions to the expected format
    const actionMap = {
      'CREATE': 'created' as const,
      'UPDATE': 'updated' as const,
      'DELETE': 'deleted' as const,
      'ASSIGN': 'assigned' as const,
      'COMPLETE': 'completed' as const,
      'STATUS_CHANGE': 'status_changed' as const,
      'BULK_CREATE': 'created' as const
    }

    return logActivity({
      action: actionMap[params.action] || 'created',
      entityType: params.entityType.toLowerCase() as any,
      entityId: params.entityId,
      entityName: params.entityName || '',
      description: params.description,
      userId: params.userId,
      userName: params.userName,
      details: params.details
    })
  }
}