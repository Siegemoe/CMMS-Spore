// Security test setup - Focus on security testing

// Enhanced security-focused mocks
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  rateLimiters: {
    general: { points: 100, duration: 60 },
    auth: { points: 5, duration: 60 },
    write: { points: 20, duration: 60 },
    read: { points: 200, duration: 60 },
  },
}))

// Mock security headers
jest.mock('@/lib/security-headers', () => ({
  addSecurityHeaders: jest.fn((response) => response),
  addRateLimitHeaders: jest.fn((response, remaining, limit, resetTime) => response),
  addCorsHeaders: jest.fn((response, origin) => response),
  createSecurityResponse: jest.fn((request, body, status, headers) => ({
    json: jest.fn(() => body),
    status: jest.fn(() => ({ json: jest.fn(() => body) })),
    headers: {
      set: jest.fn(),
    },
  })),
}))

// Security test utilities
global.securityTestUtils = {
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/api/test',
    headers: {
      'x-forwarded-for': '127.0.0.1',
      'user-agent': 'jest-test',
      ...overrides.headers,
    },
    ...overrides,
  }),

  createMockResponse: () => ({
    headers: new Map(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  }),

  assertSecurityHeaders: (response) => {
    const headers = response.headers || {}
    expect(headers.get('x-frame-options')).toBe('DENY')
    expect(headers.get('x-content-type-options')).toBe('nosniff')
    expect(headers.get('x-xss-protection')).toBe('1; mode=block')
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
  },

  assertRateLimitHeaders: (response) => {
    const headers = response.headers || {}
    expect(headers.has('x-ratelimit-limit')).toBe(true)
    expect(headers.has('x-ratelimit-remaining')).toBe(true)
    expect(headers.has('x-ratelimit-reset')).toBe(true)
  },
}

console.log('Security test setup loaded')