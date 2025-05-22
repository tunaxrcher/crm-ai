'use client'

import { useCallback, useState } from 'react'

type ErrorWithMessage = {
  message: string
}

/**
 * Ensures an error is converted to an object with a message property
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

  if (typeof error === 'string') return error

  const errorWithMessage = error as ErrorWithMessage
  if (errorWithMessage?.message) return errorWithMessage.message

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
}

/**
 * Hook to handle errors in async operations in functional components
 */
export default function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Reset error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Wrap async operation with error handling
  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      loadingState = true
    ): Promise<T | null> => {
      try {
        if (loadingState) {
          setIsLoading(true)
        }
        clearError()

        const result = await operation()
        return result
      } catch (caughtError) {
        const errorMessage = getErrorMessage(caughtError)
        console.error('Operation error:', errorMessage)
        setError(new Error(errorMessage))
        return null
      } finally {
        if (loadingState) {
          setIsLoading(false)
        }
      }
    },
    [clearError]
  )

  return {
    error,
    setError,
    clearError,
    isLoading,
    setIsLoading,
    handleAsyncOperation,
    getErrorMessage,
  }
}
