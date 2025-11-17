export interface WorkOrderRoom {
  id: string
  number: string
  floor: number | null
}

export interface WorkOrderBuilding {
  id: string
  name: string
  number: string
}

export interface WorkOrderSite {
  id: string
  name: string
  address: string | null
}

export interface WorkOrderAssignedTo {
  id: string
  name: string | null
  email: string
}

export interface WorkOrderCreatedBy {
  name: string | null
  email: string
}

export interface WorkOrderCount {
  workOrders: number
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

export interface WorkOrderLocationInfo {
  type: 'site' | 'building' | 'room' | 'location'
  name: string
  data: any
}