import { Prisma } from '@prisma/client'

// Define the nested types explicitly to avoid type inference issues
export interface AssetRoom {
  id: string
  number: string
  floor: number | null
}

export interface AssetBuilding {
  id: string
  name: string
  number: string
}

export interface AssetSite {
  id: string
  name: string
  address: string | null
}

export interface AssetCreatedBy {
  name: string | null
  email: string
}

export interface AssetCount {
  workOrders: number
}

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