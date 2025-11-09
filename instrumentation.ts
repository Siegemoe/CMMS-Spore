// Next.js instrumentation file for Sentry
import * as Sentry from '@sentry/nextjs'

export const onRequestError = Sentry.captureRequestError

export async function register() {
  if (process.env.NEXT_RUNTIME === 'node') {
    // Only initialize Sentry on the server side
    const SENTRY_DSN = process.env.SENTRY_DSN

    Sentry.init({
      dsn: SENTRY_DSN,
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1.0,

      environment: process.env.NODE_ENV || 'development',

      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,

      // If the entire session is not sampled, use the below sample rate to sample
      // sessions when an error occurs.
      replaysOnErrorSampleRate: 1.0,

      // Note: Integrations are now automatically configured by @sentry/nextjs
      // If you need custom integrations, add them here

      // beforeSend to filter out sensitive data
      beforeSend(event, hint) {
        // Filter out any potentially sensitive data
        if (event.exception) {
          const exception = event.exception.values?.[0]
          const errorValue = exception?.value || ''

          // Don't send errors that might contain sensitive information
          if (errorValue.includes('password') ||
              errorValue.includes('token') ||
              errorValue.includes('secret') ||
              errorValue.includes('key') ||
              errorValue.includes('auth')) {
            // Sanitize error message
            if (exception) {
              exception.value = 'Authentication/Security related error (sanitized)'
            }
          }
        }

        // Remove sensitive headers and cookies
        if (event.request?.headers) {
          const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
          const headers = event.request.headers as any
          Object.keys(headers).forEach(key => {
            if (sensitiveHeaders.includes(key.toLowerCase())) {
              delete headers[key]
            }
          })
        }

        // Add custom context for server-side errors
        event.contexts = {
          ...event.contexts,
          server: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
          },
          app: {
            name: 'SPORE CMMS',
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
          },
          security: {
            rateLimiting: true,
            validation: true,
            headers: true,
            cors: true,
          }
        }

        return event
      },

      // Ignore specific errors that are not actionable
      ignoreErrors: [
        // Common server errors that don't need monitoring
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        // Database connection errors that might be temporary
        'Connection lost',
        'Connection timeout',
        // Non-actionable network errors
        'Network request failed',
        'NetworkError',
      ],

      // Don't send transactions for certain operations
      tracesSampler(samplingContext) {
        // Don't sample health checks and status endpoints
        if (samplingContext.transactionContext?.name) {
          const name = samplingContext.transactionContext.name
          if (name.includes('/health') ||
              name.includes('/status') ||
              name.includes('/api/health')) {
            return 0
          }
        }

        // Sample all other transactions at 10%
        return 0.1
      },

      // Before sending a transaction
      beforeSendTransaction(event) {
        // Filter out transactions from bots and health checks
        const userAgent = event.request?.headers?.['user-agent'] || ''
        if (userAgent.includes('bot') ||
            userAgent.includes('crawler') ||
            userAgent.includes('spider')) {
          return null
        }

        return event
      },
    })

    // Add custom error classifications
    Sentry.setTag('appType', 'cmms')
    Sentry.setTag('security', 'enabled')

    // Capture unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      Sentry.captureException(reason, {
        contexts: {
          unhandledRejection: {
            promise: promise.toString(),
            reason: String(reason),
          },
        },
      })
    })

    // Capture uncaught exceptions
    process.on('uncaughtException', (error) => {
      Sentry.captureException(error, {
        contexts: {
          uncaughtException: {
            message: error.message,
            stack: error.stack,
          },
        },
      })

      // Exit after capturing exception
      process.exit(1)
    })
  }
}