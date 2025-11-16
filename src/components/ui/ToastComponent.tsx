"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ToastMessage {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true)

    return () => {
      setIsLeaving(true)
    }
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getToastStyles = () => {
    const baseStyles = "relative max-w-sm w-full rounded-lg shadow-modern-lg border p-4 transition-all duration-300 ease-in-out"

    let bgStyles = ""
    let iconStyles = ""
    let borderStyles = ""

    switch (toast.type) {
      case "success":
        bgStyles = "bg-green-50 border-green-200"
        iconStyles = "text-green-500"
        borderStyles = "border-green-200"
        break
      case "error":
        bgStyles = "bg-red-50 border-red-200"
        iconStyles = "text-red-500"
        borderStyles = "border-red-200"
        break
      case "warning":
        bgStyles = "bg-yellow-50 border-yellow-200"
        iconStyles = "text-yellow-500"
        borderStyles = "border-yellow-200"
        break
      case "info":
      default:
        bgStyles = "bg-blue-50 border-blue-200"
        iconStyles = "text-blue-500"
        borderStyles = "border-blue-200"
        break
    }

    const animationStyles = isVisible && !isLeaving
      ? "opacity-100 transform translate-y-0"
      : isLeaving
      ? "opacity-0 transform translate-y-2"
      : "opacity-0 transform translate-y-2"

    return `${baseStyles} ${bgStyles} ${borderStyles} ${animationStyles}`
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case "info":
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {/* Icon */}
        <div className={`flex-shrink-0 ${getIconClassName(toast.type)}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${getTextColorClass(toast.type)}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`mt-1 text-sm ${getTextColorClass(toast.type, true)}`}>
              {toast.message}
            </p>
          )}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className={`text-sm font-medium ${getActionTextClass(toast.type)} hover:underline`}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleRemove}
            aria-label="Close notification"
            className={`inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function getIconClassName(type: ToastMessage["type"]): string {
  switch (type) {
    case "success":
      return "text-green-500"
    case "error":
      return "text-red-500"
    case "warning":
      return "text-yellow-500"
    case "info":
    default:
      return "text-blue-500"
  }
}

function getTextColorClass(type: ToastMessage["type"], isSecondary = false): string {
  switch (type) {
    case "success":
      return isSecondary ? "text-green-700" : "text-green-800"
    case "error":
      return isSecondary ? "text-red-700" : "text-red-800"
    case "warning":
      return isSecondary ? "text-yellow-700" : "text-yellow-800"
    case "info":
    default:
      return isSecondary ? "text-blue-700" : "text-blue-800"
  }
}

function getActionTextClass(type: ToastMessage["type"]): string {
  switch (type) {
    case "success":
      return "text-green-700"
    case "error":
      return "text-red-700"
    case "warning":
      return "text-yellow-700"
    case "info":
  default:
    return "text-blue-700"
  }
}