/**
 * Unit Tests for Validation Functions
 *
 * AI-Generated Test Pattern:
 * - Test both valid and invalid inputs
 * - Test edge cases
 * - Test error messages
 * - Use descriptive test names
 * - Group related tests
 */

import { z } from 'zod'
import {
  validateRequest,
  createAssetSchema,
  createWorkOrderSchema,
  registerUserSchema,
  loginUserSchema
} from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateRequest', () => {
    it('should return success for valid data against schema', () => {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })

      const validData = {
        name: 'Test Asset',
        email: 'test@example.com',
      }

      const result = validateRequest(schema, validData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
      expect(result.errors).toBeUndefined()
    })

    it('should return failure with errors for invalid data', () => {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })

      const invalidData = {
        name: '',
        email: 'invalid-email',
      }

      const result = validateRequest(schema, invalidData)

      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('This field is required')
      expect(result.errors).toContain('Invalid email address')
    })

    it('should handle null/undefined input gracefully', () => {
      const schema = z.object({
        name: z.string().min(1),
      })

      const result1 = validateRequest(schema, null)
      const result2 = validateRequest(schema, undefined)

      expect(result1.success).toBe(false)
      expect(result2.success).toBe(false)
    })
  })

  describe('Asset Validation Schema', () => {
    it('should validate a complete valid asset', () => {
      const validAsset = {
        name: 'Test Machine',
        description: 'A test machine asset',
        assetTag: 'TM-001',
        category: 'equipment' as const,
        location: 'Workshop A',
        status: 'ACTIVE' as const,
        purchaseDate: '2023-01-01T00:00:00.000Z',
        purchaseCost: 15000,
        warrantyEnd: '2025-01-01T00:00:00.000Z',
      }

      const result = validateRequest(createAssetSchema, validAsset)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject(validAsset)
    })

    it('should validate asset with minimal required fields', () => {
      const minimalAsset = {
        name: 'Basic Asset',
        category: 'equipment' as const,
        location: 'Storage',
      }

      const result = validateRequest(createAssetSchema, minimalAsset)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Basic Asset')
      expect(result.data?.category).toBe('equipment')
    })

    it('should reject invalid asset categories', () => {
      const invalidAsset = {
        name: 'Test Asset',
        category: 'invalid-category',
        location: 'Test Location',
      }

      const result = validateRequest(createAssetSchema, invalidAsset)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid enum value')
    })

    it('should reject empty required fields', () => {
      const invalidAsset = {
        name: '',
        category: 'equipment',
        location: '   ',
      }

      const result = validateRequest(createAssetSchema, invalidAsset)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('This field is required')
    })

    it('should enforce string length limits', () => {
      const tooLongName = 'a'.repeat(256)
      const tooLongDescription = 'a'.repeat(1001)

      const invalidAsset = {
        name: tooLongName,
        category: 'equipment' as const,
        location: 'Test',
        description: tooLongDescription,
      }

      const result = validateRequest(createAssetSchema, invalidAsset)

      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('255'))).toBe(true)
      expect(result.errors?.some(error => error.includes('1000'))).toBe(true)
    })
  })

  describe('Work Order Validation Schema', () => {
    it('should validate a complete work order', () => {
      const validWorkOrder = {
        title: 'Fix broken machine',
        description: 'The machine is making weird noises',
        priority: 'HIGH' as const,
        status: 'OPEN' as const,
        assetId: 'test-asset-id',
        assignedToId: 'test-user-id',
        workType: 'corrective' as const,
        scopeOfWork: 'Diagnose and repair',
        estimatedStart: '2023-12-01T09:00:00.000Z',
        estimatedCompletion: '2023-12-01T17:00:00.000Z',
      }

      const result = validateRequest(createWorkOrderSchema, validWorkOrder)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject(validWorkOrder)
    })

    it('should validate work order with minimal fields', () => {
      const minimalWorkOrder = {
        title: 'Basic Work Order',
        assetId: 'asset-123',
        workType: 'corrective' as const,
      }

      const result = validateRequest(createWorkOrderSchema, minimalWorkOrder)

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Basic Work Order')
      expect(result.data?.priority).toBe('MEDIUM') // Default value
      expect(result.data?.status).toBe('OPEN') // Default value
    })

    it('should reject invalid asset ID format', () => {
      const invalidWorkOrder = {
        title: 'Test Work Order',
        assetId: 'invalid asset id with spaces',
        workType: 'corrective' as const,
      }

      const result = validateRequest(createWorkOrderSchema, invalidWorkOrder)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid asset ID format')
    })

    it('should enforce field length limits', () => {
      const invalidWorkOrder = {
        title: 'x'.repeat(256),
        description: 'y'.repeat(2001),
        assetId: 'valid-id',
        workType: 'corrective' as const,
        scopeOfWork: 'z'.repeat(2001),
        partsRequired: 'a'.repeat(1001),
        toolsRequired: 'b'.repeat(1001),
        otherResources: 'c'.repeat(1001),
        safetyNotes: 'd'.repeat(1001),
        ticketType: 'e'.repeat(101),
        siteLocation: 'f'.repeat(256),
        roomLocation: 'g'.repeat(256),
        assetLocation: 'h'.repeat(256),
      }

      const result = validateRequest(createWorkOrderSchema, invalidWorkOrder)

      expect(result.success).toBe(false)
      expect(result.errors?.length || 0).toBeGreaterThan(0)
    })
  })

  describe('User Validation Schemas', () => {
    describe('registerUserSchema', () => {
      it('should validate user registration with strong password', () => {
        const validUser = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          role: 'USER' as const,
        }

        const result = validateRequest(registerUserSchema, validUser)

        expect(result.success).toBe(true)
        expect(result.data).toMatchObject(validUser)
      })

      it('should reject weak passwords', () => {
        const weakPasswords = [
          'password', // No uppercase, number, or special char
          'PASSWORD', // No lowercase, number, or special char
          '12345678', // No letters or special chars
          'password123', // No uppercase or special char
          'Password!', // No numbers
          'Pass123', // Too short
        ]

        weakPasswords.forEach(password => {
          const invalidUser = {
            name: 'Test User',
            email: 'test@example.com',
            password,
          }

          const result = validateRequest(registerUserSchema, invalidUser)

          expect(result.success).toBe(false)
          expect(result.errors?.length || 0).toBeGreaterThan(0)
        })
      })

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'not-an-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          'user@domain',
        ]

        invalidEmails.forEach(email => {
          const invalidUser = {
            name: 'Test User',
            email,
            password: 'SecurePass123!',
          }

          const result = validateRequest(registerUserSchema, invalidUser)

          expect(result.success).toBe(false)
          expect(result.errors).toContain('Invalid email address')
        })
      })
    })

    describe('loginUserSchema', () => {
      it('should validate login credentials', () => {
        const validLogin = {
          email: 'user@example.com',
          password: 'userpassword123',
        }

        const result = validateRequest(loginUserSchema, validLogin)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(validLogin)
      })

      it('should reject empty email or password', () => {
        const emptyEmail = {
          email: '',
          password: 'password123',
        }

        const emptyPassword = {
          email: 'user@example.com',
          password: '',
        }

        const result1 = validateRequest(loginUserSchema, emptyEmail)
        const result2 = validateRequest(loginUserSchema, emptyPassword)

        expect(result1.success).toBe(false)
        expect(result2.success).toBe(false)
        expect(result1.errors).toContain('This field is required')
        expect(result2.errors).toContain('This field is required')
      })
    })
  })
})