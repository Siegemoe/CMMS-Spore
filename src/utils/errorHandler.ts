/**
 * Standardized Error Handling System
 * Provides consistent error handling, logging, and user feedback across the application
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  originalError?: Error | unknown
  context?: Record<string, any>
  timestamp: Date
  userFriendlyMessage?: string
}

export interface ErrorHandlingOptions {
  showToast?: boolean
  logToConsole?: boolean
  logToServer?: boolean
  context?: Record<string, any>
  userFriendlyMessage?: string
}

/**
 * Wraps async functions with standardized error handling
 * Reduces try/catch boilerplate and provides consistent error management
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlingOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    const {
      showToast = true,
      logToConsole = true,
      logToServer = false,
      context,
      userFriendlyMessage
    } = options

    try {
      return await fn(...args)
    } catch (error) {
      const appError = createAppError(error, {
        context,
        userFriendlyMessage
      })

      if (logToConsole) {
        logErrorToConsole(appError)
      }

      if (logToServer) {
        logErrorToServer(appError)
      }

      if (showToast) {
        showErrorToast(appError)
      }

      throw appError
    }
  }) as T
}

/**
 * Creates a standardized application error from any error
 */
export function createAppError(
  error: Error | unknown,
  options: Omit<ErrorHandlingOptions, 'showToast' | 'logToConsole' | 'logToServer'> = {}
): AppError {
  // Check if it's already an AppError by checking the structure
  if (error && typeof error === 'object' && 'type' in error && 'severity' in error && 'message' in error) {
    return error as AppError
  }

  const { context, userFriendlyMessage } = options
  const timestamp = new Date()

  if (error instanceof Error) {
    const type = determineErrorType(error)
    const severity = determineErrorSeverity(error, type)

    return {
      type,
      severity,
      message: error.message,
      originalError: error,
      context,
      timestamp,
      userFriendlyMessage: userFriendlyMessage || generateUserFriendlyMessage(type, error.message)
    }
  }

  // Handle non-Error objects
  const message = typeof error === 'string' ? error : 'An unknown error occurred'
  const type = ErrorType.UNKNOWN
  const severity = ErrorSeverity.MEDIUM

  return {
    type,
    severity,
    message,
    originalError: error,
    context,
    timestamp,
    userFriendlyMessage: userFriendlyMessage || 'Something went wrong. Please try again.'
  }
}

/**
 * Determines the error type based on error characteristics
 */
function determineErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK
  }

  if (message.includes('unauthorized') || message.includes('authentication')) {
    return ErrorType.AUTHENTICATION
  }

  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorType.AUTHORIZATION
  }

  if (message.includes('not found') || message.includes('404')) {
    return ErrorType.NOT_FOUND
  }

  if (message.includes('validation') || message.includes('required')) {
    return ErrorType.VALIDATION
  }

  if (message.includes('server error') || message.includes('500')) {
    return ErrorType.SERVER_ERROR
  }

  return ErrorType.UNKNOWN
}

/**
 * Determines error severity based on type and content
 */
function determineErrorSeverity(error: Error, type: ErrorType): ErrorSeverity {
  switch (type) {
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return ErrorSeverity.HIGH
    case ErrorType.SERVER_ERROR:
      return ErrorSeverity.CRITICAL
    case ErrorType.NETWORK:
    case ErrorType.NOT_FOUND:
      return ErrorSeverity.MEDIUM
    case ErrorType.VALIDATION:
      return ErrorSeverity.LOW
    default:
      return ErrorSeverity.MEDIUM
  }
}

/**
 * Generates user-friendly error messages
 */
function generateUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Connection issue. Please check your internet connection and try again.'
    case ErrorType.AUTHENTICATION:
      return 'Please log in to continue.'
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.'
    case ErrorType.NOT_FOUND:
      return 'The requested item was not found.'
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.'
    case ErrorType.SERVER_ERROR:
      return 'Server error occurred. Please try again later.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Logs errors to console with structured formatting
 */
function logErrorToConsole(error: AppError): void {
  const logData = {
    type: error.type,
    severity: error.severity,
    message: error.message,
    timestamp: error.timestamp,
    context: error.context,
    stack: error.originalError instanceof Error ? error.originalError.stack : undefined
  }

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      console.error('🚨 Critical Error:', logData)
      break
    case ErrorSeverity.MEDIUM:
      console.warn('⚠️ Warning:', logData)
      break
    case ErrorSeverity.LOW:
      console.info('ℹ️ Info:', logData)
      break
  }
}

/**
 * Logs errors to server for monitoring and debugging
 */
async function logErrorToServer(error: AppError): Promise<void> {
  try {
    await fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: error.type,
        severity: error.severity,
        message: error.message,
        context: error.context,
        timestamp: error.timestamp.toISOString(),
        stack: error.originalError instanceof Error ? error.originalError.stack : undefined,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    })
  } catch (logError) {
    console.warn('Failed to log error to server:', logError)
  }
}

/**
 * Shows error toast notifications (placeholder - integrate with your toast system)
 */
function showErrorToast(error: AppError): void {
  // This would integrate with your toast/notification system
  // For now, we'll use a simple alert as placeholder

  if (error.userFriendlyMessage) {
    // In a real app, this would use your toast library
    console.log('Toast Notification:', error.userFriendlyMessage)
  }
}

/**
 * Utility class for managing errors throughout the application
 */
export class ErrorHandler {
  private static errors: AppError[] = []
  private static maxErrors = 100

  /**
   * Logs and stores an error
   */
  static log(error: Error | unknown, options: ErrorHandlingOptions = {}): AppError {
    const appError = createAppError(error, options)

    // Store error for debugging
    this.errors.push(appError)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Handle error based on options
    if (options.logToConsole !== false) {
      logErrorToConsole(appError)
    }

    if (options.logToServer) {
      logErrorToServer(appError)
    }

    if (options.showToast) {
      showErrorToast(appError)
    }

    return appError
  }

  /**
   * Gets all logged errors
   */
  static getErrors(): AppError[] {
    return [...this.errors]
  }

  /**
   * Clears error log
   */
  static clearErrors(): void {
    this.errors = []
  }

  /**
   * Gets errors by type
   */
  static getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter(error => error.type === type)
  }

  /**
   * Gets errors by severity
   */
  static getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(error => error.severity === severity)
  }
}

// Export convenience functions
export const handleError = ErrorHandler.log.bind(ErrorHandler)
export const getErrors = ErrorHandler.getErrors.bind(ErrorHandler)
export const clearErrors = ErrorHandler.clearErrors.bind(ErrorHandler)