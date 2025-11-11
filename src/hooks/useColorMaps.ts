/**
 * Shared color mapping utilities for status displays
 * Eliminates duplication across components
 */

export const statusColorMap = {
  // Asset statuses
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RETIRED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-red-100 text-red-800",

  // Work Order statuses
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  ON_HOLD: "bg-gray-100 text-gray-800",
} as const

export const priorityColorMap = {
  URGENT: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
} as const

export const categoryColorMap = {
  equipment: "bg-blue-100 text-blue-800",
  vehicle: "bg-green-100 text-green-800",
  building: "bg-yellow-100 text-yellow-800",
  tool: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
} as const

export const workTypeColorMap = {
  corrective: "bg-red-100 text-red-800",
  preventive: "bg-green-100 text-green-800",
  inspection: "bg-blue-100 text-blue-800",
} as const

/**
 * Hook for getting status colors with TypeScript safety
 */
export const useStatusColors = () => {
  const getStatusColor = (status: keyof typeof statusColorMap | string) => {
    return statusColorMap[status as keyof typeof statusColorMap] || "bg-gray-100 text-gray-800"
  }

  return { getStatusColor }
}

/**
 * Hook for getting priority colors
 */
export const usePriorityColors = () => {
  const getPriorityColor = (priority: keyof typeof priorityColorMap | string) => {
    return priorityColorMap[priority as keyof typeof priorityColorMap] || "bg-gray-100 text-gray-800"
  }

  return { getPriorityColor }
}

/**
 * Hook for getting category colors
 */
export const useCategoryColors = () => {
  const getCategoryColor = (category: keyof typeof categoryColorMap | string) => {
    return categoryColorMap[category as keyof typeof categoryColorMap] || "bg-gray-100 text-gray-800"
  }

  return { getCategoryColor }
}

/**
 * Hook for getting work type colors
 */
export const useWorkTypeColors = () => {
  const getWorkTypeColor = (workType: keyof typeof workTypeColorMap | string) => {
    return workTypeColorMap[workType as keyof typeof workTypeColorMap] || "bg-gray-100 text-gray-800"
  }

  return { getWorkTypeColor }
}