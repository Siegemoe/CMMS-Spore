"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Determine the actual theme to apply
    let actualTheme: 'light' | 'dark' = 'light'

    if (theme === 'dark') {
      actualTheme = 'dark'
    } else if (theme === 'light') {
      actualTheme = 'light'
    } else {
      // system preference
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Remove the previous theme class
    root.classList.remove('light', 'dark')

    // Add the new theme class
    root.classList.add(actualTheme)

    setResolvedTheme(actualTheme)

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(newResolvedTheme)

      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(newResolvedTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div className="h-screen w-full bg-white dark:bg-gray-900">
        {/* Loading placeholder to prevent flash */}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}