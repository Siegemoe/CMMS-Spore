import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    const baseClasses = "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation"

    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:opacity-50",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50",
      ghost: "bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 border border-gray-300 shadow-sm"
    }

    const sizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base"
    }

    const responsiveSizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 sm:py-2 text-sm sm:text-base py-3",
      lg: "px-4 py-3 text-base sm:py-3 sm:text-lg"
    }

    const classes = [
      baseClasses,
      variantClasses[variant],
      size === "md" ? responsiveSizeClasses.md : sizeClasses[size],
      fullWidth && "w-full sm:w-auto",
      className
    ].filter(Boolean).join(" ")

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"