// API test setup - For testing API endpoints

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url: url || 'http://localhost:3000/api/test',
    method: options?.method || 'GET',
    headers: new Map(Object.entries(options?.headers || {})),
    json: async () => options?.body || {},
    text: async () => JSON.stringify(options?.body || {}),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((body, options) => ({
      status: options?.status || 200,
      headers: new Map(Object.entries(options?.headers || {})),
      json: async () => body,
    })),
    redirect: jest.fn(),
    error: jest.fn(),
  },
}))

// API test utilities
global.apiTestUtils = {
  createMockApiRequest: (url, method = 'GET', body = null, headers = {}) => {
    const { NextRequest } = require('next/server')
    return new NextRequest(url, { method, body, headers })
  },

  createMockSession: (overrides = {}) => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      ...overrides.user,
    },
    expires: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }),

  assertApiResponse: (response, expectedStatus = 200, expectedData = null) => {
    expect(response.status).toBe(expectedStatus)
    if (expectedData !== null) {
      expect(response.json()).resolves.toEqual(expectedData)
    }
  },

  assertSecurityResponse: (response, status = 200) => {
    expect(response.status).toBe(status)
    // Security responses should have proper headers
    expect(typeof response.headers).toBeDefined()
  },
}

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    headers: new Map(),
  })
)

console.log('API test setup loaded')