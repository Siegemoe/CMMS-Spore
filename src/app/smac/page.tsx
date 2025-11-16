"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"

export default function SMACPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen gradient-bg-subtle">
      {/* Public Landing Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg relative z-base">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/smac" className="text-xl font-bold">
                Spore CMMS
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/smac"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-700 text-white`}
              >
                SMAC
              </Link>
              <Link
                href={session ? "/dashboard" : "/auth/signin"}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-white hover:bg-blue-500"
              >
                {session ? "CMMS" : "Sign In"}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <div className="flex items-center space-x-2">
                <Link
                  href={session ? "/dashboard" : "/auth/signin"}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {session ? "CMMS" : "Sign In"}
                </Link>
                <button
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  type="button"
                  aria-label="Open navigation menu"
                  title="Open navigation menu"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 gradient-bg-primary rounded-2xl mb-6 shadow-colored">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-6">
                SMAC
              </h1>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
                Smart Management Access Control
              </h2>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Advanced management platform integrating VSaaS and PACS capabilities for modern facilities. Monitor, control, and secure your premises with intelligent video surveillance and access control systems.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-6xl w-full">
              <div className="gradient-bg-card rounded-2xl p-8 border border-gray-200 shadow-modern hover:shadow-modern-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-colored">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Authentication</h3>
                <p className="text-gray-600">Multi-factor authentication with biometric and visual verification for enhanced security</p>
              </div>

              <div className="gradient-bg-card rounded-2xl p-8 border border-gray-200 shadow-modern hover:shadow-modern-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-modern">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Surveillance (VSaaS)</h3>
                <p className="text-gray-600">AI-powered video analytics with real-time threat detection and live monitoring capabilities</p>
              </div>

              <div className="gradient-bg-card rounded-2xl p-8 border border-gray-200 shadow-modern hover:shadow-modern-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-modern">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Control (PACS)</h3>
                <p className="text-gray-600">Enterprise-grade physical access control with credential management and zone-based security</p>
              </div>

              <div className="gradient-bg-card rounded-2xl p-8 border border-gray-200 shadow-modern hover:shadow-modern-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-modern">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Management</h3>
                <p className="text-gray-600">Unified platform management with automated policies and seamless system integration</p>
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 gradient-bg-secondary border border-gray-300 rounded-full shadow-modern">
                <span className="relative flex h-3 w-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-white font-semibold text-lg">Coming Soon</span>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="gradient-bg-card rounded-2xl p-8 border border-gray-200 shadow-modern-lg max-w-2xl w-full">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Be the First to Know</h3>
              <p className="text-gray-600 mb-6">
                Get notified when SMAC launches and receive early access to our comprehensive VSaaS and PACS management platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 gradient-bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-colored transition-all duration-200 shadow-modern">
                  Request Early Access
                </button>
                <button className="flex-1 gradient-bg-card text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-modern">
                  Learn More
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-12 text-gray-500 text-sm">
              <p>SMAC integrates seamlessly with your existing CMMS, VSaaS, and PACS infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}