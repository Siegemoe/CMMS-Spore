import { Prisma } from '@prisma/client'
import { BaseRoom, BaseBuilding, BaseSite, BaseUser, BaseCount, LocationInfo } from './shared'

// Re-export shared types for backward compatibility and specific naming
export type AssetRoom = BaseRoom
export type AssetBuilding = BaseBuilding
export type AssetSite = BaseSite
export type AssetCreatedBy = BaseUser
export type AssetCount = BaseCount
export type AssetLocationInfo = LocationInfo

// Asset type matching the API response structure
export type Asset = {
  id: string
  name: string
  description: string | null
  assetTag: string | null
  category: string
  location: string
  status: string
  purchaseDate: Date | null
  purchaseCost: number | null
  warrantyEnd: Date | null
  createdAt: Date
  updatedAt: Date
  createdById: string | null
  siteId: string | null
  buildingId: string | null
  roomId: string | null
  createdBy: AssetCreatedBy | null
  site: AssetSite | null
  building: AssetBuilding | null
  room: AssetRoom | null
  _count: AssetCount
}

// Asset location information for display purposes
export interface AssetLocationInfo {
  type: 'site' | 'building' | 'room' | 'location'
  name: string
  data: any // Site | Building | Room | null
}

// Archived asset type (same as Asset but filtered by status)
export type ArchivedAsset = Asset