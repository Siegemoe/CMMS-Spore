import { RateLimiterMemory } from 'rate-limiter-flexible'
import type { NextRequest } from 'next/server'

// Create rate limiters for different types of requests
const createRateLimiter = (opts: {
  points: number // Number of requests
  duration: number // Per seconds
}) => new RateLimiterMemory({
  keyPrefix: 'api_limit',
  points: opts.points,
  duration: opts.duration,
})

// Different rate limits for different endpoints
export const rateLimiters = {
  // General API rate limit: 100 requests per minute
  general: createRateLimiter({ points: 100, duration: 60 }),

  // Authentication endpoints: 5 requests per minute
  auth: createRateLimiter({ points: 5, duration: 60 }),

  // POST/PUT/DELETE endpoints: 20 requests per minute
  write: createRateLimiter({ points: 20, duration: 60 }),

  // GET endpoints: 200 requests per minute
  read: createRateLimiter({ points: 200, duration: 60 }),
}

export type RateLimitType = keyof typeof rateLimiters

export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'general'
): Promise<{ success: boolean; remaining?: number }> {
  // Extract IP from headers (Next.js 15 doesn't have request.ip by default)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

  const limiter = rateLimiters[type]

  try {
    const result = await limiter.consume(ip)
    return {
      success: true,
      remaining: result.remainingPoints || 0
    }
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
    return {
      success: false,
      remaining: 0
    }
  }
}

export function getRateLimitHeaders(
  request: NextRequest,
  type: RateLimitType = 'general'
): Record<string, string> {
  const limiter = rateLimiters[type]
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

  return {
    'X-RateLimit-Limit': limiter.points.toString(),
    'X-RateLimit-Remaining': limiter.points.toString(),
    'X-RateLimit-Reset': new Date(Date.now() + limiter.duration * 1000).toISOString()
  }
}