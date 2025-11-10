/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers (additional)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Webpack configuration for better bundling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    return config
  },
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin, keep reading!
  silent: true, // Suppresses all logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}

// Make sure to include Sentry options when exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
