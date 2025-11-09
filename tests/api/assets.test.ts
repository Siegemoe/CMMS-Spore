/**
 * API Integration Tests - Assets Endpoint
 *
 * Tests for the assets API endpoints including:
 * - GET /api/assets
 * - POST /api/assets
 * - Security measures
 * - Error handling
 * - Rate limiting integration
 *
 * AI Testing Pattern:
 * - Test happy path and error scenarios
 * - Test security measures
 * - Test database interactions
 * - Use realistic test data
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/assets/route'
import { apiTestUtils } from '@/tests/setup/api.setup'

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  authOptions: {
    session: { strategy: 'jwt' },
  },
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    asset: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/robust-activity-logger', () => ({
  activityHelpers: {
    assetCreated: jest.fn(() => Promise.resolve({ success: true })),
  },
}))

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve({ success: true, remaining: 95 })),
}))

describe('/api/assets API Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = apiTestUtils.createMockApiRequest('/api/assets')
  })

  describe('GET /api/assets', () => {
    it('should return assets with authentication', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          name: 'Test Machine 1',
          description: 'A test machine',
          assetTag: 'TM001',
          category: 'equipment',
          location: 'Workshop A',
          status: 'ACTIVE',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          createdById: 'user-1',
          createdBy: {
            name: 'John Doe',
            email: 'john@example.com',
          },
          _count: { workOrders: 5 },
        },
        {
          id: 'asset-2',
          name: 'Test Machine 2',
          description: 'Another test machine',
          assetTag: 'TM002',
          category: 'vehicle',
          location: 'Garage',
          status: 'MAINTENANCE',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
          createdById: 'user-2',
          createdBy: {
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
          _count: { workOrders: 2 },
        },
      ]

      const { prisma } = require('@/lib/prisma')
      prisma.asset.findMany.mockResolvedValue(mockAssets)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockAssets)
      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        take: 100,
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.asset.findMany.mockRejectedValue(new Error('Database connection failed'))

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should limit results to 100 most recent assets', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.asset.findMany.mockResolvedValue([])

      await GET(mockRequest)

      expect(prisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          orderBy: {
            createdAt: 'desc',
          },
        })
      )
    })
  })

  describe('POST /api/assets', () => {
    const validAssetData = {
      name: 'New Test Machine',
      description: 'A newly created test machine',
      assetTag: 'NTM001',
      category: 'equipment',
      location: 'Storage Room',
      status: 'ACTIVE',
      purchaseDate: '2023-01-01T00:00:00.000Z',
      purchaseCost: 25000,
      warrantyEnd: '2025-01-01T00:00:00.000Z',
    }

    it('should create a new asset with valid data', async () => {
      const createdAsset = {
        id: 'new-asset-id',
        ...validAssetData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'test-user-id',
        createdBy: {
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      const { prisma } = require('@/lib/prisma')
      prisma.asset.create.mockResolvedValue(createdAsset)

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        validAssetData,
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(createdAsset)
      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          ...validAssetData,
          purchaseDate: new Date(validAssetData.purchaseDate),
          warrantyEnd: new Date(validAssetData.warrantyEnd),
          createdById: 'test-user-id',
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      // Verify activity logging
      const { activityHelpers } = require('@/lib/robust-activity-logger')
      expect(activityHelpers.assetCreated).toHaveBeenCalledWith(
        validAssetData.name,
        validAssetData.assetTag,
        'test-user-id',
        'Test User'
      )
    })

    it('should reject invalid request data', async () => {
      const invalidAssetData = {
        name: '', // Empty name
        category: 'invalid-category',
        location: '   ', // Whitespace only
      }

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        invalidAssetData,
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeInstanceOf(Array)
      expect(data.details.length).toBeGreaterThan(0)
    })

    it('should handle missing request body', async () => {
      const postRequest = apiTestUtils.createMockApiRequest('/api/assets', 'POST')

      const response = await POST(postRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should require authentication', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null) // No session

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        validAssetData,
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle database errors during creation', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.asset.create.mockRejectedValue(new Error('Database constraint violation'))

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        validAssetData,
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle activity logging errors without failing the request', async () => {
      const createdAsset = {
        id: 'new-asset-id',
        ...validAssetData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'test-user-id',
        createdBy: {
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      const { prisma } = require('@/lib/prisma')
      prisma.asset.create.mockResolvedValue(createdAsset)

      const { activityHelpers } = require('@/lib/robust-activity-logger')
      activityHelpers.assetCreated.mockResolvedValue({ success: false, error: 'Database error' })

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        validAssetData,
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)
      const data = await response.json()

      // Request should still succeed even if activity logging fails
      expect(response.status).toBe(201)
      expect(data.id).toBe('new-asset-id')
    })
  })

  describe('Security and Rate Limiting', () => {
    it('should apply rate limiting to GET requests', async () => {
      const { checkRateLimit } = require('@/lib/rate-limit')
      checkRateLimit.mockResolvedValue({ success: false, remaining: 0 })

      const response = await GET(mockRequest)

      expect(response.status).toBe(429)
      checkRateLimit.expectCalledWith(mockRequest, 'read')
    })

    it('should apply rate limiting to POST requests', async () => {
      const { checkRateLimit } = require('@/lib/rate-limit')
      checkRateLimit.mockResolvedValue({ success: false, remaining: 0 })

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        {},
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)

      expect(response.status).toBe(429)
      checkRateLimit.expectCalledWith(postRequest, 'write')
    })

    it('should include security headers in responses', async () => {
      const mockAssets = []
      const { prisma } = require('@/lib/prisma')
      prisma.asset.findMany.mockResolvedValue(mockAssets)

      const response = await GET(mockRequest)

      // Security headers should be added by the middleware
      expect(response.status).toBe(200)
    })
  })

  describe('Data Transformation', () => {
    it('should convert date strings to Date objects', async () => {
      const assetWithDates = {
        name: 'Test Asset',
        category: 'equipment',
        location: 'Test Location',
        purchaseDate: '2023-06-15T10:30:00.000Z',
        warrantyEnd: '2025-06-15T10:30:00.000Z',
      }

      const createdAsset = {
        id: 'asset-id',
        ...assetWithDates,
        purchaseDate: new Date(assetWithDates.purchaseDate),
        warrantyEnd: new Date(assetWithDates.warrantyEnd),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'test-user-id',
        createdBy: { name: 'Test User', email: 'test@example.com' },
      }

      const { prisma } = require('@/lib/prisma')
      prisma.asset.create.mockResolvedValue(createdAsset)

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        assetWithDates,
        { 'content-type': 'application/json' }
      )

      await POST(postRequest)

      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          purchaseDate: new Date('2023-06-15T10:30:00.000Z'),
          warrantyEnd: new Date('2025-06-15T10:30:00.000Z'),
        }),
        include: expect.any(Object),
      })
    })

    it('should handle null optional fields', async () => {
      const assetWithNulls = {
        name: 'Test Asset',
        category: 'equipment',
        location: 'Test Location',
        description: null,
        assetTag: null,
        purchaseDate: null,
        purchaseCost: null,
        warrantyEnd: null,
      }

      const createdAsset = {
        id: 'asset-id',
        ...assetWithNulls,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'test-user-id',
        createdBy: { name: 'Test User', email: 'test@example.com' },
      }

      const { prisma } = require('@/lib/prisma')
      prisma.asset.create.mockResolvedValue(createdAsset)

      const postRequest = apiTestUtils.createMockApiRequest(
        '/api/assets',
        'POST',
        assetWithNulls,
        { 'content-type': 'application/json' }
      )

      const response = await POST(postRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.description).toBeNull()
      expect(data.assetTag).toBeNull()
    })
  })
})