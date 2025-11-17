/**
 * Security Tests - Rate Limiting
 *
 * Tests for rate limiting functionality to prevent:
 * - DDoS attacks
 * - Brute force attacks
 * - API abuse
 *
 * AI Testing Pattern:
 * - Test both positive and negative scenarios
 * - Test different rate limit types
 * - Test edge cases and boundary conditions
 * - Test security headers integration
 */

import { checkRateLimit, rateLimiters, RateLimitType } from '@/lib/rate-limit'
// Setup file loaded via jest.config.js - no import needed

// Global test utilities from setup files
declare global {
  var apiTestUtils: any
  var securityTestUtils: any
}

// Mock the rate limiter module
const mockRateLimiter = {
  consume: jest.fn(),
}

jest.mock('rate-limiter-flexible', () => ({
  RateLimiterMemory: jest.fn(() => mockRateLimiter),
}))

describe('Rate Limiting Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimiter.consume.mockResolvedValue({
      remainingPoints: 95,
      msBeforeNext: 60000,
    })
  })

  describe('checkRateLimit function', () => {
    it('should allow requests within rate limit', async () => {
      const mockRequest = securityTestUtils.createMockRequest({
        headers: { 'x-forwarded-for': '192.168.1.100' },
      })

      const result = await checkRateLimit(mockRequest, 'general')

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(95)
      expect(mockRateLimiter.consume).toHaveBeenCalledWith('192.168.1.100')
    })

    it('should block requests exceeding rate limit', async () => {
      mockRateLimiter.consume.mockRejectedValue({
        msBeforeNext: 60000,
      })

      const mockRequest = securityTestUtils.createMockRequest({
        headers: { 'x-forwarded-for': '192.168.1.100' },
      })

      const result = await checkRateLimit(mockRequest, 'auth')

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should extract IP from x-real-ip header when x-forwarded-for is not available', async () => {
      const mockRequest = securityTestUtils.createMockRequest({
        headers: { 'x-real-ip': '10.0.0.1' },
      })

      await checkRateLimit(mockRequest, 'general')

      expect(mockRateLimiter.consume).toHaveBeenCalledWith('10.0.0.1')
    })

    it('should use fallback IP when headers are not available', async () => {
      const mockRequest = securityTestUtils.createMockRequest({
        headers: {},
      })

      await checkRateLimit(mockRequest, 'general')

      expect(mockRateLimiter.consume).toHaveBeenCalledWith('unknown')
    })

    it('should handle x-forwarded-for with multiple IPs (take first one)', async () => {
      const mockRequest = securityTestUtils.createMockRequest({
        headers: {
          'x-forwarded-for': '203.0.113.1, 192.168.1.1, 10.0.0.1',
        },
      })

      await checkRateLimit(mockRequest, 'general')

      expect(mockRateLimiter.consume).toHaveBeenCalledWith('203.0.113.1')
    })
  })

  describe('Rate Limiter Configuration', () => {
    it('should have different rate limits for different endpoint types', () => {
      expect(rateLimiters.general.points).toBe(100) // 100 requests per minute
      expect(rateLimiters.general.duration).toBe(60)

      expect(rateLimiters.auth.points).toBe(5) // 5 requests per minute (stricter)
      expect(rateLimiters.auth.duration).toBe(60)

      expect(rateLimiters.write.points).toBe(20) // 20 write operations per minute
      expect(rateLimiters.write.duration).toBe(60)

      expect(rateLimiters.read.points).toBe(200) // 200 read operations per minute
      expect(rateLimiters.read.duration).toBe(60)
    })

    it('should enforce stricter limits for authentication endpoints', () => {
      const authLimit = rateLimiters.auth
      const generalLimit = rateLimiters.general

      expect(authLimit.points).toBeLessThan(generalLimit.points)
      expect(authLimit.duration).toBe(generalLimit.duration)
    })

    it('should allow more read operations than write operations', () => {
      const readLimit = rateLimiters.read
      const writeLimit = rateLimiters.write

      expect(readLimit.points).toBeGreaterThan(writeLimit.points)
      expect(readLimit.duration).toBe(writeLimit.duration)
    })
  })

  describe('Rate Limiting Edge Cases', () => {
    it('should handle malformed IP addresses gracefully', async () => {
      const mockRequest = securityTestUtils.createMockRequest({
        headers: { 'x-forwarded-for': 'invalid-ip-address' },
      })

      // Should not throw an error
      const result = await checkRateLimit(mockRequest, 'general')

      expect(result).toBeDefined()
      expect(mockRateLimiter.consume).toHaveBeenCalledWith('invalid-ip-address')
    })

    it('should handle rate limiter database errors gracefully', async () => {
      mockRateLimiter.consume.mockRejectedValue(new Error('Database connection failed'))

      const mockRequest = securityTestUtils.createMockRequest()

      const result = await checkRateLimit(mockRequest, 'general')

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should handle multiple concurrent requests for the same IP', async () => {
      const mockRequest = securityTestUtils.createMockRequest({
        headers: { 'x-forwarded-for': '192.168.1.100' },
      })

      // Make multiple concurrent requests
      const promises = Array(10).fill(null).map(() => checkRateLimit(mockRequest, 'general'))
      const results = await Promise.all(promises)

      // All should succeed if within limits
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      expect(mockRateLimiter.consume).toHaveBeenCalledTimes(10)
    })
  })

  describe('Rate Limiting with Different Request Types', () => {
    const testCases: Array<{
      type: RateLimitType
      expectedPoints: number
      expectedDuration: number
      description: string
    }> = [
      {
        type: 'general',
        expectedPoints: 100,
        expectedDuration: 60,
        description: 'General API endpoints',
      },
      {
        type: 'auth',
        expectedPoints: 5,
        expectedDuration: 60,
        description: 'Authentication endpoints',
      },
      {
        type: 'write',
        expectedPoints: 20,
        expectedDuration: 60,
        description: 'Write operations (POST, PUT, DELETE)',
      },
      {
        type: 'read',
        expectedPoints: 200,
        expectedDuration: 60,
        description: 'Read operations (GET)',
      },
    ]

    testCases.forEach(({ type, expectedPoints, expectedDuration, description }) => {
      it(`should apply correct rate limits for ${description}`, async () => {
        const mockRequest = securityTestUtils.createMockRequest()

        await checkRateLimit(mockRequest, type)

        // Verify the correct rate limiter was called
        const { RateLimiterMemory } = require('rate-limiter-flexible')
        expect(RateLimiterMemory).toHaveBeenCalledWith({
          keyPrefix: 'api_limit',
          points: expectedPoints,
          duration: expectedDuration,
        })
      })
    })
  })

  describe('Rate Limiting Security Headers Integration', () => {
    it('should provide rate limit information for headers', async () => {
      mockRateLimiter.consume.mockResolvedValue({
        remainingPoints: 42,
        msBeforeNext: 45000,
      })

      const mockRequest = securityTestUtils.createMockRequest()
      const result = await checkRateLimit(mockRequest, 'auth')

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(42)
    })

    it('should return zero remaining when rate limited', async () => {
      mockRateLimiter.consume.mockRejectedValue({
        msBeforeNext: 30000,
      })

      const mockRequest = securityTestUtils.createMockRequest()
      const result = await checkRateLimit(mockRequest, 'auth')

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })
})