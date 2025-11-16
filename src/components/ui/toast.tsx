"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Toast } from "./ToastComponent"

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

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-hide toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, newToast.duration)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value = {
    showToast,
    hideToast,
    clearAllToasts,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={hideToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }: {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Convenience functions for common toast types
export const toast = {
  success: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: "success", title, message })
  },
  error: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: "error", title, message })
  },
  warning: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: "warning", title, message })
  },
  info: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: "info", title, message })
  }
}