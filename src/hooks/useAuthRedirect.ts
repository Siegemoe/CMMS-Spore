"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Common authentication and redirect logic
 * Eliminates duplicate auth checks across components
 */
export const useAuthRedirect = (redirectTo: string = "/auth/signin") => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo)
    }
  }, [status, router, redirectTo])

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated" && !!session

  return {
    session,
    isLoading,
    isAuthenticated,
    redirectToLogin: () => router.push(redirectTo),
  }
}