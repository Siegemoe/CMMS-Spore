export const Loading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export const LoadingSpinner = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600`}></div>
  )
}