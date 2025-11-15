"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

interface OverlayPortalProps {
  children: React.ReactNode
  className?: string
  zIndex?: string
}

export function OverlayPortal({ children, className = "", zIndex = "z-dropdown" }: OverlayPortalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create portal container if it doesn't exist
    if (!portalRef.current) {
      portalRef.current = document.createElement("div")
      portalRef.current.className = `overlay-portal-container fixed inset-0 pointer-events-none ${zIndex}`
      document.body.appendChild(portalRef.current)
    }

    // Create inner container for positioning
    if (!containerRef.current) {
      containerRef.current = document.createElement("div")
      containerRef.current.className = `overlay-portal-content ${className} pointer-events-auto`
      portalRef.current.appendChild(containerRef.current)
    }

    return () => {
      // Cleanup on unmount
      if (containerRef.current && portalRef.current?.contains(containerRef.current)) {
        portalRef.current.removeChild(containerRef.current)
      }
      if (portalRef.current && document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current)
      }
    }
  }, [className, zIndex])

  if (!containerRef.current) {
    return null
  }

  return createPortal(children, containerRef.current)
}

// Hook for positioning dropdowns relative to their triggers
export function useDropdownPosition(triggerRef: React.RefObject<HTMLElement>) {
  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 }

    const rect = triggerRef.current.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    return {
      top: rect.bottom + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
    }
  }

  return { getPosition }
}