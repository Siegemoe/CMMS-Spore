export enum AlertType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TASK = 'task',
  SYSTEM = 'system'
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Alert {
  id: string
  type: AlertType
  priority: AlertPriority
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
  userId?: string
  actionUrl?: string
  actionText?: string
  autoDismiss?: boolean
  dismissAfter?: number // milliseconds
  metadata?: Record<string, any>
}

export interface AlertStats {
  total: number
  unread: number
  byType: Record<AlertType, number>
  byPriority: Record<AlertPriority, number>
}

export interface AlertPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  soundEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  types: Record<AlertType, boolean>
  priorities: Record<AlertPriority, boolean>
}