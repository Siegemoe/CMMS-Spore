/**
 * Validation Utility Functions
 * Provides common validation patterns and reusable validators across the application
 */

import { useState } from 'react'

export interface ValidationRule {
  validator: (value: any) => boolean
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldValidator {
  rules: ValidationRule[]
  required?: boolean
}

/**
 * Core validation functions
 */
export const validators = {
  // Required field validation
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  },

  // String validations
  minLength: (min: number) => (value: string): boolean => {
    return typeof value === 'string' && value.length >= min
  },

  maxLength: (max: number) => (value: string): boolean => {
    return typeof value === 'string' && value.length <= max
  },

  email: (value: string): boolean => {
    if (typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value.trim())
  },

  phone: (value: string): boolean => {
    if (typeof value !== 'string') return false
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(value.replace(/\s/g, ''))
  },

  url: (value: string): boolean => {
    if (typeof value !== 'string') return false
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  // Number validations
  number: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value)
  },

  integer: (value: any): boolean => {
    return Number.isInteger(Number(value))
  },

  positive: (value: number): boolean => {
    return typeof value === 'number' && value > 0
  },

  nonNegative: (value: number): boolean => {
    return typeof value === 'number' && value >= 0
  },

  min: (min: number) => (value: number): boolean => {
    return typeof value === 'number' && value >= min
  },

  max: (max: number) => (value: number): boolean => {
    return typeof value === 'number' && value <= max
  },

  range: (min: number, max: number) => (value: number): boolean => {
    return typeof value === 'number' && value >= min && value <= max
  },

  // Date validations
  date: (value: any): boolean => {
    const date = new Date(value)
    return date instanceof Date && !isNaN(date.getTime())
  },

  dateAfter: (date: Date) => (value: any): boolean => {
    const inputDate = new Date(value)
    return inputDate instanceof Date && !isNaN(inputDate.getTime()) && inputDate > date
  },

  dateBefore: (date: Date) => (value: any): boolean => {
    const inputDate = new Date(value)
    return inputDate instanceof Date && !isNaN(inputDate.getTime()) && inputDate < date
  },

  futureDate: (value: any): boolean => {
    return validators.dateAfter(new Date())(value)
  },

  pastDate: (value: any): boolean => {
    return validators.dateBefore(new Date())(value)
  },

  // Pattern validations
  pattern: (regex: RegExp) => (value: string): boolean => {
    return typeof value === 'string' && regex.test(value)
  },

  alphanumeric: (value: string): boolean => {
    return typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value)
  },

  alphabetic: (value: string): boolean => {
    return typeof value === 'string' && /^[a-zA-Z\s]+$/.test(value)
  },

  // Specific business validations
  assetTag: (value: string): boolean => {
    if (typeof value !== 'string') return false
    // Asset tags typically follow patterns like: ABC-12345, A12345, etc.
    return /^[A-Z]{2,4}-?\d{4,8}$/.test(value.toUpperCase().trim())
  },

  priority: (value: string): boolean => {
    return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(value?.toUpperCase())
  },

  status: (value: string): boolean => {
    return ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED'].includes(value?.toUpperCase())
  },

  workOrderNumber: (value: string): boolean => {
    if (typeof value !== 'string') return false
    // Work order numbers like: WO-2024-001, 2024-0001, etc.
    return /^(WO-)?\d{4}-\d{4,}$/.test(value.trim())
  },

  // Array validations
  array: (value: any): boolean => {
    return Array.isArray(value)
  },

  arrayMinLength: (min: number) => (value: any[]): boolean => {
    return Array.isArray(value) && value.length >= min
  },

  arrayMaxLength: (max: number) => (value: any[]): boolean => {
    return Array.isArray(value) && value.length <= max
  }
}

/**
 * Validation rule creators with error messages
 */
export const createRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validator: validators.required,
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: validators.minLength(min),
    message: message || `Must be at least ${min} characters long`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: validators.maxLength(max),
    message: message || `Must be no more than ${max} characters long`
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validator: validators.email,
    message
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validator: validators.phone,
    message
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validator: validators.url,
    message
  }),

  number: (message = 'Please enter a valid number'): ValidationRule => ({
    validator: validators.number,
    message
  }),

  positive: (message = 'Must be a positive number'): ValidationRule => ({
    validator: validators.positive,
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validator: validators.min(min),
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validator: validators.max(max),
    message: message || `Must be no more than ${max}`
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    validator: validators.range(min, max),
    message: message || `Must be between ${min} and ${max}`
  }),

  date: (message = 'Please enter a valid date'): ValidationRule => ({
    validator: validators.date,
    message
  }),

  futureDate: (message = 'Must be a future date'): ValidationRule => ({
    validator: validators.futureDate,
    message
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validator: validators.pattern(regex),
    message
  }),

  assetTag: (message = 'Please enter a valid asset tag (e.g., ABC-12345)'): ValidationRule => ({
    validator: validators.assetTag,
    message
  }),

  priority: (message = 'Must be a valid priority (LOW, MEDIUM, HIGH, CRITICAL)'): ValidationRule => ({
    validator: validators.priority,
    message
  }),

  status: (message = 'Must be a valid status'): ValidationRule => ({
    validator: validators.status,
    message
  })
}

/**
 * Validates a single field against a set of rules
 */
export function validateField(value: any, fieldValidator: FieldValidator): ValidationResult {
  const errors: string[] = []

  // Check if required and empty
  if (fieldValidator.required && !validators.required(value)) {
    errors.push('This field is required')
    return { isValid: false, errors }
  }

  // Skip other validations if field is empty and not required
  if (!fieldValidator.required && !validators.required(value)) {
    return { isValid: true, errors: [] }
  }

  // Run all validation rules
  for (const rule of fieldValidator.rules) {
    if (!rule.validator(value)) {
      errors.push(rule.message)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates multiple fields
 */
export function validateForm(data: Record<string, any>, schema: Record<string, FieldValidator>): ValidationResult {
  const allErrors: string[] = []

  for (const [fieldName, fieldValidator] of Object.entries(schema)) {
    const result = validateField(data[fieldName], fieldValidator)
    if (!result.isValid) {
      allErrors.push(...result.errors.map(error => `${fieldName}: ${error}`))
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

/**
 * Common validation schemas for the application
 */
export const validationSchemas = {
  // User schemas
  user: {
    name: {
      rules: [createRules.minLength(2), createRules.maxLength(100)],
      required: true
    },
    email: {
      rules: [createRules.email()],
      required: true
    },
    password: {
      rules: [
        createRules.minLength(8, 'Password must be at least 8 characters'),
        createRules.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
      ],
      required: true
    }
  },

  // Asset schemas
  asset: {
    name: {
      rules: [createRules.minLength(1), createRules.maxLength(200)],
      required: true
    },
    description: {
      rules: [createRules.maxLength(1000)]
    },
    assetTag: {
      rules: [createRules.assetTag()]
    },
    category: {
      rules: [createRules.minLength(1)],
      required: true
    },
    purchaseCost: {
      rules: [createRules.positive()]
    }
  },

  // Work order schemas
  workOrder: {
    title: {
      rules: [createRules.minLength(3), createRules.maxLength(200)],
      required: true
    },
    description: {
      rules: [createRules.maxLength(2000)]
    },
    priority: {
      rules: [createRules.priority()],
      required: true
    },
    status: {
      rules: [createRules.status()]
    },
    estimatedStart: {
      rules: [createRules.date()]
    },
    estimatedCompletion: {
      rules: [createRules.date()]
    }
  },

  // Site schemas
  site: {
    name: {
      rules: [createRules.minLength(1), createRules.maxLength(200)],
      required: true
    },
    address: {
      rules: [createRules.maxLength(500)]
    }
  },

  // Building schemas
  building: {
    name: {
      rules: [createRules.minLength(1), createRules.maxLength(200)],
      required: true
    },
    number: {
      rules: [createRules.minLength(1), createRules.maxLength(20)],
      required: true
    }
  }
}

/**
 * Higher-order function that adds validation to a function
 */
export function withValidation<T extends (...args: any[]) => any>(
  schema: Record<string, FieldValidator>,
  fn: T,
  options: { throwError?: boolean } = {}
): T {
  return ((...args: Parameters<T>) => {
    // Assume first argument is the data object to validate
    const data = args[0]
    const validationResult = validateForm(data, schema)

    if (!validationResult.isValid) {
      const error = new Error(`Validation failed: ${validationResult.errors.join(', ')}`)
      if (options.throwError) {
        throw error
      } else {
        console.error(error)
        return null
      }
    }

    return fn(...args)
  }) as T
}

/**
 * React hook for form validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  schema: Record<string, FieldValidator>
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateFieldValue = (fieldName: keyof T, value: any): string[] => {
    const fieldValidator = schema[fieldName as string]
    if (!fieldValidator) return []

    const result = validateField(value, fieldValidator)
    return result.errors
  }

  const setFieldValue = (fieldName: keyof T, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }))
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    const fieldErrors = validateFieldValue(fieldName, value)
    setErrors(prev => ({ ...prev, [fieldName]: fieldErrors.length > 0 ? fieldErrors.join(', ') : undefined }))
  }

  const validateAll = (): boolean => {
    const allErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    for (const fieldName of Object.keys(schema) as (keyof T)[]) {
      const fieldErrors = validateFieldValue(fieldName, data[fieldName])
      if (fieldErrors.length > 0) {
        allErrors[fieldName] = fieldErrors.join(', ')
        isValid = false
      }
    }

    setErrors(allErrors)
    setTouched(Object.keys(schema).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    return isValid
  }

  return {
    data,
    errors,
    touched,
    setFieldValue,
    validateAll,
    setData
  }
}