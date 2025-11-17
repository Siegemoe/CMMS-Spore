/**
 * Shared type definitions used across multiple entities
 * This file consolidates duplicate type definitions to maintain consistency
 * and reduce code duplication across the application.
 */

// Base entity types that are shared across different contexts
export interface BaseRoom {
  id: string
  number: string
  floor: number | null
}

export interface BaseBuilding {
  id: string
  name: string
  number: string
}

export interface BaseSite {
  id: string
  name: string
  address: string | null
}

export interface BaseUser {
  name: string | null
  email: string
}

export interface BaseCount {
  workOrders: number
}

// Location information interface used by different entities
export interface LocationInfo<T = any> {
  type: 'site' | 'building' | 'room' | 'location'
  name: string
  data: T | null
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

// Pagination interfaces
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Common status types
export type Status = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ARCHIVED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// Date handling utilities
export type DateInput = string | Date
export type OptionalDate = string | Date | null

// Common field types
export type OptionalString = string | null
export type OptionalNumber = number | null
export type OptionalBoolean = boolean | null