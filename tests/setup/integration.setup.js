// Integration test setup - Test component interactions

// For integration tests, we want to use more realistic mocks
jest.mock('@/lib/prisma', () => {
  const originalModule = jest.requireActual('@/lib/prisma')
  return {
    ...originalModule,
    // Override specific methods for testing
  }
})

// Mock authentication with realistic session data
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock rate limiting with actual behavior
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn((request, type = 'general') => {
    // Simulate actual rate limiting behavior
    return Promise.resolve({ success: true, remaining: 95 })
  }),
  rateLimiters: {
    general: { points: 100, duration: 60 },
    auth: { points: 5, duration: 60 },
    write: { points: 20, duration: 60 },
    read: { points: 200, duration: 60 },
  },
}))

console.log('Integration test setup loaded')