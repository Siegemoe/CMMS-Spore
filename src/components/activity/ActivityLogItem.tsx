import Link from "next/link"

interface ActivityLogItemProps {
  activity: {
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
}

export default function ActivityLogItem({ activity }: ActivityLogItemProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-600'
      case 'updated': return 'text-blue-600'
      case 'deleted': return 'text-red-600'
      case 'status_changed': return 'text-purple-600'
      case 'assigned': return 'text-yellow-600'
      case 'completed': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '➕'
      case 'updated': return '✏️'
      case 'deleted': return '🗑️'
      case 'status_changed': return '🔄'
      case 'assigned': return '👤'
      case 'completed': return '✅'
      default: return '📝'
    }
  }

  const getEntityLink = () => {
    if (activity.entityType === 'work_order') {
      // Extract the work order ID from details if available, otherwise use entityId
      if (activity.details) {
        try {
          const details = JSON.parse(activity.details);
          return `/work-orders/${details.workOrderId || activity.entityId}`;
        } catch {
          return `/work-orders/${activity.entityId}`;
        }
      }
      return `/work-orders/${activity.entityId}`;
    } else if (activity.entityType === 'asset') {
      return `/assets`;
    } else if (activity.entityType === 'user') {
      return `/dashboard`;
    }
    return '#';
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="group hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3 p-2">
        <span className="text-lg mt-0.5 flex-shrink-0">
          {getActionIcon(activity.action)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${getActionColor(activity.action)}`}>
                {activity.action.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {activity.entityType.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatTimestamp(activity.createdAt)}
            </span>
          </div>
          <div className="mt-1">
            <Link
              href={getEntityLink()}
              className="text-xs font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {activity.entityName}
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-tight">
            {activity.description}
          </p>
          <div className="flex items-center mt-1 text-xs text-gray-400">
            <span>by {activity.userName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}