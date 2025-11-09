// Unit test setup - Fast and focused tests

// Mock all external dependencies for unit tests
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    asset: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workOrder: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activityLog: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock rate limiting for unit tests
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve({ success: true, remaining: 100 })),
  rateLimiters: {
    general: { points: 100, duration: 60 },
    auth: { points: 5, duration: 60 },
    write: { points: 20, duration: 60 },
    read: { points: 200, duration: 60 },
  },
}))

// Mock activity logger for unit tests
jest.mock('@/lib/robust-activity-logger', () => ({
  logActivity: jest.fn(() => Promise.resolve({ success: true, activityId: 'test-id' })),
  activityHelpers: {
    workOrderCreated: jest.fn(() => Promise.resolve({ success: true })),
    workOrderUpdated: jest.fn(() => Promise.resolve({ success: true })),
    workOrderStatusChanged: jest.fn(() => Promise.resolve({ success: true })),
    assetCreated: jest.fn(() => Promise.resolve({ success: true })),
    assetUpdated: jest.fn(() => Promise.resolve({ success: true })),
  },
}))

console.log('Unit test setup loaded')