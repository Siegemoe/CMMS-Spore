import React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact" | "elevated" | "glass"
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", padding = "md", hover = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "card-modern",
      compact: "card-modern-compact",
      elevated: "card-modern shadow-modern-lg hover:shadow-modern-xl",
      glass: "glass rounded-xl"
    }

    const paddingClasses = {
      none: "",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-6 sm:p-8"
    }

    const classes = cn(
      variantClasses[variant],
      paddingClasses[padding],
      hover && "hover-lift cursor-pointer",
      className
    )

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mb-4 sm:mb-6", className)} {...props}>
        {children}
      </div>
    )
  }
)

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    )
  }
)

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100", className)} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"