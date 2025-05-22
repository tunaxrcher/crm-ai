'use client'

import React from 'react'

import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  /** Main error message to display */
  title?: string
  /** Detailed error message */
  message?: string
  /** Function to call when retry button is clicked */
  onRetry?: () => void
  /** Whether to show the retry button */
  showRetry?: boolean
  /** Custom class name for the container */
  className?: string
  /** Icon to show, defaults to AlertCircle */
  icon?: React.ReactNode
}

/**
 * A reusable error state component with customizable options
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  showRetry = true,
  className = '',
  icon = <AlertCircle className="h-10 w-10 text-red-400" />,
}: ErrorStateProps) {
  return (
    <Card className={`w-full overflow-hidden ${className}`}>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>

        <h3 className="text-lg font-medium mb-2">{title}</h3>

        {message && (
          <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
        )}

        {showRetry && onRetry && (
          <Button onClick={onRetry} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
