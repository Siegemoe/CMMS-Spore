// Next.js client instrumentation file for Sentry
import * as Sentry from '@sentry/nextjs'

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Only initialize Sentry on the client/edge runtime
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

    Sentry.init({
      dsn: SENTRY_DSN,
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1.0,

      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,

      // If the entire session is not sampled, use the below sample rate to sample
      // sessions when an error occurs.
      replaysOnErrorSampleRate: 1.0,

      integrations: [
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Performance monitoring
      environment: process.env.NODE_ENV || 'development',

      // beforeSend to filter out sensitive data
      beforeSend(event) {
        // Filter out any potentially sensitive data
        if (event.exception) {
          const exception = event.exception.values?.[0]
          if (exception?.value?.includes('password') ||
              exception?.value?.includes('token') ||
              exception?.value?.includes('secret')) {
            return null // Don't send sensitive errors
          }
        }

        // Add custom context
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'SPORE CMMS',
            version: process.env.npm_package_version || '0.1.0',
          },
          security: {
            rateLimiting: true,
            validation: true,
            headers: true,
          }
        }

        return event
      },

      // Ignore specific errors that are not actionable
      ignoreErrors: [
        // ResizeObserver loop limit exceeded (browser issue)
        'ResizeObserver loop limit exceeded',
        // Non-actionable network errors
        'Network request failed',
        'NetworkError',
        // Third-party script errors
        /^Script error\.?$/,
        /^Non-Error promise rejection captured/,
      ],

      // Don't send certain URLs
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        // Third-party scripts
        /graph\.facebook\.com/i,
        /connect\.facebook\.net/i,
      ],
    })

    // Add custom error classifications
    Sentry.setTag('appType', 'cmms')
    Sentry.setTag('security', 'enabled')
  }
}