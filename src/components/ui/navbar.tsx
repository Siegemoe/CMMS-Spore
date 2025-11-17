"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuthorization, PermissionGuard } from "@/hooks/useAuthorization"
import { PERMISSIONS } from "@/lib/authorization"
import UserProfileDropdown, { MobileProfileBadge } from "@/components/ui/UserProfileDropdown"
import AlertsDropdown from "@/components/alerts/AlertsDropdown"
import { MobileAlertsBadge } from "@/components/alerts/MobileAlertsBadge"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { can } = useAuthorization()

  if (!session) return null

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg relative z-[9998]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                Spore CMMS
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-500"
                }`}
              >
                Dashboard
              </Link>
              <PermissionGuard permissions={[PERMISSIONS.SITES_READ]}>
                <Link
                  href="/sites"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/sites")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  Sites
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.BUILDINGS_READ]}>
                <Link
                  href="/buildings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/buildings")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  Buildings
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.ASSETS_READ]}>
                <Link
                  href="/assets"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/assets")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  Assets
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.WORK_ORDERS_READ]}>
                <Link
                  href="/work-orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/work-orders")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  Work Orders
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.USERS_READ]}>
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin/users")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  Users
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.SYSTEM_ADMIN]}>
                <Link
                  href="/admin/rbac"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin/rbac")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  RBAC
                </Link>
              </PermissionGuard>
              <Link
                href="/smac"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/smac")
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-500"
                }`}
                title="Smart Management Access Control"
              >
                SMAC
              </Link>
              <div className="ml-4 hidden md:block">
                <AlertsDropdown />
              </div>
              <div className="ml-2 hidden md:block">
                <UserProfileDropdown />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
                type="button"
                role="button"
                tabIndex={0}
              >
                {/* Hamburger icon */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          <div id="mobile-menu" className={`md:hidden transition-all duration-300 ease-in-out relative z-dropdown ${
            isMenuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-blue-400">
              <Link
                href="/dashboard"
                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-500"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <PermissionGuard permissions={[PERMISSIONS.SITES_READ]}>
                <Link
                  href="/sites"
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive("/sites")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sites
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.BUILDINGS_READ]}>
                <Link
                  href="/buildings"
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive("/buildings")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Buildings
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.ASSETS_READ]}>
                <Link
                  href="/assets"
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive("/assets")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Assets
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.WORK_ORDERS_READ]}>
                <Link
                  href="/work-orders"
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive("/work-orders")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Work Orders
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.USERS_READ]}>
                <Link
                  href="/admin/users"
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive("/admin/users")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Users
                </Link>
              </PermissionGuard>
              <PermissionGuard permissions={[PERMISSIONS.SYSTEM_ADMIN]}>
                <Link
                  href="/admin/rbac"
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive("/admin/rbac")
                      ? "bg-blue-700 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  RBAC
                </Link>
              </PermissionGuard>
              <Link
                href="/smac"
                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive("/smac")
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-500"
                }`}
                onClick={() => setIsMenuOpen(false)}
                title="Smart Management Access Control"
              >
                SMAC
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Floating Profile Badge */}
      <MobileProfileBadge />
      {/* Mobile Floating Alerts Badge */}
      <MobileAlertsBadge />
    </>
  )
}