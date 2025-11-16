"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/ui/navbar"
import { useAuthRedirect } from "@/hooks"
import { Loading, Card, CardHeader, CardContent, Button } from "@/components/shared"
import { useToast } from "@/components/ui/toast"

interface Integration {
  id: string
  name: string
  description: string
  category: string
  status: "available" | "coming-soon" | "beta"
  icon: string
  features: string[]
  connectionStatus?: "connected" | "disconnected" | "error"
}

const integrations: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Get real-time notifications in your Slack workspace",
    category: "Communication",
    status: "available",
    icon: "💬",
    features: [
      "Work order notifications",
      "Maintenance alerts",
      "Asset status updates",
      "Team collaboration"
    ]
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Integrate with Microsoft Teams for seamless communication",
    category: "Communication",
    status: "available",
    icon: "👥",
    features: [
      "Channel notifications",
      "Work order assignments",
      "Status updates",
      "File sharing"
    ]
  },
  {
    id: "outlook-calendar",
    name: "Outlook Calendar",
    description: "Sync maintenance schedules with your Outlook calendar",
    category: "Calendar",
    status: "coming-soon",
    icon: "📅",
    features: [
      "Maintenance scheduling",
      "Work order due dates",
      "Team availability",
      "Automated reminders"
    ]
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Connect your Google Calendar for schedule synchronization",
    category: "Calendar",
    status: "coming-soon",
    icon: "📆",
    features: [
      "Maintenance planning",
      "Work order scheduling",
      "Technician availability",
      "Recurring tasks"
    ]
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Connect with QuickBooks for financial management",
    category: "Accounting",
    status: "beta",
    icon: "💰",
    features: [
      "Invoice generation",
      "Expense tracking",
      "Financial reporting",
      "Budget management"
    ]
  },
  {
    id: "xero",
    name: "Xero",
    description: "Integrate with Xero for streamlined accounting",
    category: "Accounting",
    status: "coming-soon",
    icon: "📊",
    features: [
      "Payment processing",
      "Financial insights",
      "Tax management",
      "Cash flow tracking"
    ]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5000+ apps through Zapier automation",
    category: "Automation",
    status: "available",
    icon: "⚡",
    features: [
      "Custom workflows",
      "Data synchronization",
      "Automated triggers",
      "Multi-app connections"
    ]
  },
  {
    id: "webhooks",
    name: "Custom Webhooks",
    description: "Set up custom webhooks for real-time data integration",
    category: "Developer",
    status: "beta",
    icon: "🔗",
    features: [
      "Real-time events",
      "Custom payloads",
      "Authentication support",
      "Error handling"
    ]
  }
]

const categories = ["All", "Communication", "Calendar", "Accounting", "Automation", "Developer"]

export default function ConnectPage() {
  const { session, isLoading: authLoading, isAuthenticated } = useAuthRedirect()
  const { showToast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<Record<string, "connected" | "disconnected" | "error">>({})

  if (authLoading) {
    return <Loading />
  }

  if (!isAuthenticated || !session) {
    return null
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "All" || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Available
          </span>
        )
      case "beta":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Beta
          </span>
        )
      case "coming-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        )
    }
  }

  const getConnectionBadge = (integrationId: string) => {
    const status = connectionStatus[integrationId]
    if (!status) return null

    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Connected
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ⚠ Error
          </span>
        )
      default:
        return null
    }
  }

  const handleConnect = (integrationId: string, integrationName: string) => {
    // Simulate connection process
    showToast({ type: "info", title: "Connecting...", message: `Establishing connection to ${integrationName}` })

    setTimeout(() => {
      setConnectionStatus(prev => ({
        ...prev,
        [integrationId]: "connected"
      }))
      showToast({ type: "success", title: "Connected Successfully", message: `${integrationName} has been connected to your account` })
    }, 2000)
  }

  const handleDisconnect = (integrationId: string, integrationName: string) => {
    setConnectionStatus(prev => ({
      ...prev,
      [integrationId]: "disconnected"
    }))
    showToast({ type: "info", title: "Disconnected", message: `${integrationName} has been disconnected from your account` })
  }

  return (
    <div className="min-h-screen gradient-bg-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-base">
        <div className="px-0 py-4 sm:py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Connect & Integrate</h1>
            <p className="mt-2 text-gray-600">
              Connect Spore CMMS with your favorite tools and services to streamline your workflow
            </p>
          </div>

          {/* Search and Filters */}
          <Card variant="elevated" className="mb-8">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const isConnected = connectionStatus[integration.id] === "connected"

              return (
                <Card key={integration.id} variant="elevated" className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {integration.name}
                          </h3>
                          <p className="text-sm text-gray-500">{integration.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(integration.status)}
                        {getConnectionBadge(integration.id)}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{integration.description}</p>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {integration.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex space-x-3">
                      {integration.status === "available" && !isConnected && (
                        <Button
                          onClick={() => handleConnect(integration.id, integration.name)}
                          className="flex-1"
                        >
                          Connect
                        </Button>
                      )}
                      {integration.status === "available" && isConnected && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => handleDisconnect(integration.id, integration.name)}
                            className="flex-1"
                          >
                            Disconnect
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-4"
                          >
                            Configure
                          </Button>
                        </>
                      )}
                      {integration.status === "beta" && (
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => showToast({ type: "info", title: "Beta Program", message: "Join our beta program to get early access" })}
                        >
                          Join Beta
                        </Button>
                      )}
                      {integration.status === "coming-soon" && (
                        <Button
                          variant="secondary"
                          disabled
                          className="flex-1"
                        >
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <Card variant="elevated">
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Developer Section */}
          <div className="mt-12">
            <Card variant="elevated">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Custom Integrations</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Use our powerful API and webhooks to build custom integrations that fit your unique workflow needs
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="flex-1 sm:flex-initial">
                      View API Documentation
                    </Button>
                    <Button variant="secondary" className="flex-1 sm:flex-initial">
                      Explore Webhooks
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}