'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import ErrorDisplay, { ErrorSeverity } from './ErrorDisplay'

interface ErrorContextType {
  showError: (title: string, options?: ErrorOptions) => void
  clearError: () => void
  error: ErrorState | null
}

interface ErrorState {
  title: string
  message?: string
  severity: ErrorSeverity
  technicalDetails?: string
}

interface ErrorOptions {
  message?: string
  severity?: ErrorSeverity
  technicalDetails?: string
  autoHideAfter?: number // milliseconds
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

/**
 * Provider component for application-wide error handling
 */
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<ErrorState | null>(null)
  const [autoHideTimeoutId, setAutoHideTimeoutId] =
    useState<NodeJS.Timeout | null>(null)

  const clearError = useCallback(() => {
    setError(null)
    if (autoHideTimeoutId) {
      clearTimeout(autoHideTimeoutId)
      setAutoHideTimeoutId(null)
    }
  }, [autoHideTimeoutId])

  const showError = useCallback(
    (
      title: string,
      {
        message,
        severity = 'error',
        technicalDetails,
        autoHideAfter,
      }: ErrorOptions = {}
    ) => {
      // Clear any existing timeout
      if (autoHideTimeoutId) {
        clearTimeout(autoHideTimeoutId)
        setAutoHideTimeoutId(null)
      }

      setError({ title, message, severity, technicalDetails })

      // Set auto-hide if specified
      if (autoHideAfter && autoHideAfter > 0) {
        const timeoutId = setTimeout(() => {
          setError(null)
          setAutoHideTimeoutId(null)
        }, autoHideAfter)

        setAutoHideTimeoutId(timeoutId)
      }
    },
    [autoHideTimeoutId]
  )

  const contextValue = {
    showError,
    clearError,
    error,
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}

      {error && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-50 max-w-md mx-auto">
          <ErrorDisplay
            title={error.title}
            message={error.message}
            severity={error.severity}
            technicalDetails={error.technicalDetails}
            onRetry={clearError}
            className="shadow-lg border border-border"
          />
        </div>
      )}
    </ErrorContext.Provider>
  )
}

/**
 * Hook to use the error context in components
 */
export function useError() {
  const context = useContext(ErrorContext)

  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }

  return context
}
