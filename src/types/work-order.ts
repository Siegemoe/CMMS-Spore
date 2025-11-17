import { BaseRoom, BaseBuilding, BaseSite, BaseUser, BaseCount, LocationInfo } from './shared'

// Re-export shared types for backward compatibility and specific naming
export type WorkOrderRoom = BaseRoom
export type WorkOrderBuilding = BaseBuilding
export type WorkOrderSite = BaseSite
export type WorkOrderCount = BaseCount
export type WorkOrderLocationInfo = LocationInfo

export interface WorkOrderAssignedTo extends BaseUser {
  id: string
}

export interface WorkOrderCreatedBy extends BaseUser {
  // Note: WorkOrderCreatedBy doesn't have an id field
}

export interface WorkOrderAsset {
  name: string
  assetTag: string | null
  site: WorkOrderSite | null
  building: WorkOrderBuilding | null
  room: WorkOrderRoom | null
}

export interface WorkOrder {
  id: string
  workOrderNumber: string
  title: string
  description: string | null
  priority: string
  status: string
  assetId: string
  asset: WorkOrderAsset
  assignedTo: WorkOrderAssignedTo | null
  assignedToId: string | null
  createdBy: WorkOrderCreatedBy
  workType: string
  scopeOfWork: string | null
  partsRequired: string | null
  toolsRequired: string | null
  otherResources: string | null
  safetyNotes: string | null
  estimatedStart: string | null
  estimatedCompletion: string | null
  ticketType: string | null
  siteLocation: string | null
  roomLocation: string | null
  assetLocation: string | null
  createdAt: string
  updatedAt: string
}

