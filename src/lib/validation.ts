import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email address')
const nonEmptyString = z.string().min(1, 'This field is required')
const optionalString = z.string().optional()
const optionalNumber = z.number().optional()
const limitedString = (max: number) => z.string().min(1, 'This field is required').max(max, `Must be less than ${max} characters`)
const limitedOptionalString = (max: number) => z.string().max(max, `Must be less than ${max} characters`).optional()

// Asset validation schemas
export const createAssetSchema = z.object({
  name: limitedString(255),
  description: limitedOptionalString(1000),
  assetTag: limitedOptionalString(50),
  category: z.enum(['equipment', 'vehicle', 'building', 'tool', 'other']),
  location: limitedString(255),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED']).default('ACTIVE'),
  purchaseDate: z.string().optional().nullable(),
  purchaseCost: z.union([
    z.string().transform(val => {
      if (!val || val.trim() === '') return null
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }),
    z.number().min(0, 'Purchase cost must be positive').optional().nullable()
  ]).optional().nullable(),
  warrantyEnd: z.string().optional().nullable(),
})

// Work Order validation schemas
export const createWorkOrderSchema = z.object({
  title: limitedString(255),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('OPEN'),
  assetId: z.string().min(1, 'Asset ID is required').regex(/^[a-zA-Z0-9-]+$/, 'Invalid asset ID format'),
  assignedToId: z.string().regex(/^[a-zA-Z0-9-]*$/, 'Invalid user ID format').optional(),
  workType: z.enum(['corrective', 'preventive', 'inspection']),
  scopeOfWork: z.string().max(2000, 'Scope of work must be less than 2000 characters').optional(),
  partsRequired: z.string().max(1000, 'Parts required must be less than 1000 characters').optional(),
  toolsRequired: z.string().max(1000, 'Tools required must be less than 1000 characters').optional(),
  otherResources: z.string().max(1000, 'Other resources must be less than 1000 characters').optional(),
  safetyNotes: z.string().max(1000, 'Safety notes must be less than 1000 characters').optional(),
  estimatedStart: z.string().datetime().optional().nullable(),
  estimatedCompletion: z.string().datetime().optional().nullable(),
  ticketType: z.string().max(100, 'Ticket type must be less than 100 characters').optional(),
  siteLocation: z.string().max(255, 'Site location must be less than 255 characters').optional(),
  roomLocation: z.string().max(255, 'Room location must be less than 255 characters').optional(),
  assetLocation: z.string().max(255, 'Asset location must be less than 255 characters').optional(),
})

export const updateWorkOrderSchema = createWorkOrderSchema.partial().omit({
  assetId: true // Asset ID cannot be changed after creation
})

export const updateWorkOrderStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
})

// User validation schemas
export const registerUserSchema = z.object({
  email: emailSchema,
  name: limitedString(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['ADMIN', 'USER', 'TECHNICIAN']).default('USER')
})

export const loginUserSchema = z.object({
  email: emailSchema,
  password: nonEmptyString
})

// Query parameter validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['createdAt', 'updatedAt', 'name', 'status', 'priority']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export const assetFilterSchema = z.object({
  category: z.enum(['equipment', 'vehicle', 'building', 'tool', 'other']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED']).optional(),
  location: z.string().optional(),
  search: z.string().max(100).optional()
}).merge(paginationSchema)

export const workOrderFilterSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assetId: z.string().optional(),
  assignedToId: z.string().optional(),
  workType: z.enum(['corrective', 'preventive', 'inspection']).optional(),
  search: z.string().max(100).optional()
}).merge(paginationSchema)

// Validation helper functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map(err => err.message)
    return { success: false, errors }
  }

  return { success: true, data: result.data }
}

// Export types for TypeScript
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>
export type UpdateWorkOrderStatusInput = z.infer<typeof updateWorkOrderStatusSchema>
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
export type AssetFilterParams = z.infer<typeof assetFilterSchema>
export type WorkOrderFilterParams = z.infer<typeof workOrderFilterSchema>