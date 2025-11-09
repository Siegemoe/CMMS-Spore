"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Spore CMMS
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/dashboard")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-500"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/assets"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/assets")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-500"
                }`}
              >
                Assets
              </Link>
              <Link
                href="/work-orders"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/work-orders")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-500"
                }`}
              >
                Work Orders
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}