"use client"

import { useTheme } from '@/contexts/theme-context'

interface DarkModeToggleProps {
  variant?: 'dropdown' | 'mobile'
}

export default function DarkModeToggle({ variant = 'dropdown' }: DarkModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    } else if (theme === 'light') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    } else {
      // System theme
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  }

  const getLabel = () => {
    if (theme === 'dark') return 'Dark Mode'
    if (theme === 'light') return 'Light Mode'
    return 'System Theme'
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={toggleTheme}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center justify-between w-full">
          <span>{getLabel()}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {resolvedTheme}
            </span>
            {getIcon()}
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
      title={`Current: ${getLabel()} (${resolvedTheme})`}
    >
      {getIcon()}
      <span className="ml-2">{getLabel()}</span>
      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        ({resolvedTheme})
      </span>
    </button>
  )
}