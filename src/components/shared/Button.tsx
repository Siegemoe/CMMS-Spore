import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    const baseClasses = "font-medium rounded-xl transition-modern focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation relative overflow-hidden group"

    const variantClasses = {
      primary: "gradient-bg-primary text-white hover:shadow-colored focus:ring-blue-500 disabled:opacity-50 disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98]",
      secondary: "gradient-bg-secondary text-white hover:shadow-modern-lg focus:ring-gray-500 disabled:opacity-50 disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98]",
      danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-500/25 focus:ring-red-500 disabled:opacity-50 disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98]",
      ghost: "gradient-bg-card text-gray-700 hover:bg-gray-50 focus:ring-blue-500 border border-gray-200 shadow-modern hover:shadow-modern-lg hover:border-gray-300"
    }

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    }

    const responsiveSizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm sm:text-base sm:py-3",
      lg: "px-6 py-3.5 text-base sm:text-lg sm:py-4"
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
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"></div>
      </button>
    )
  }
)

Button.displayName = "Button"