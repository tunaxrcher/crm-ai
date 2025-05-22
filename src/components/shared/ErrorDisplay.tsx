'use client'

import React from 'react'

import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  XCircle,
} from 'lucide-react'

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'
export type ErrorDisplaySize = 'small' | 'medium' | 'large'

interface ErrorDisplayProps {
  /** Error title or main message */
  title: string
  /** Optional detailed error message */
  message?: string
  /** Error severity level - determines styling and icon */
  severity?: ErrorSeverity
  /** Size of the error display component */
  size?: ErrorDisplaySize
  /** Function to call when retry button is clicked */
  onRetry?: () => void
  /** Whether to show a retry button */
  showRetry?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether to show the error in a card UI */
  withCard?: boolean
  /** Technical error details, only shown in development */
  technicalDetails?: string | Error
}

/**
 * A flexible error display component with different severity levels and sizes
 */
export default function ErrorDisplay({
  title,
  message,
  severity = 'error',
  size = 'medium',
  onRetry,
  showRetry = true,
  className = '',
  withCard = true,
  technicalDetails,
}: ErrorDisplayProps) {
  // Get appropriate icon based on severity
  const getIcon = () => {
    switch (severity) {
      case 'info':
        return <Info className={getSizeClass('icon')} />
      case 'warning':
        return (
          <AlertTriangle className={`${getSizeClass('icon')} text-amber-400`} />
        )
      case 'error':
        return (
          <AlertCircle className={`${getSizeClass('icon')} text-red-400`} />
        )
      case 'critical':
        return <XCircle className={`${getSizeClass('icon')} text-red-600`} />
      default:
        return <AlertCircle className={getSizeClass('icon')} />
    }
  }

  // Get appropriate size classes
  const getSizeClass = (
    element: 'container' | 'icon' | 'title' | 'message' | 'button'
  ) => {
    switch (element) {
      case 'container':
        return size === 'small' ? 'p-2' : size === 'medium' ? 'p-4' : 'p-6'
      case 'icon':
        return size === 'small'
          ? 'h-5 w-5'
          : size === 'medium'
            ? 'h-8 w-8'
            : 'h-12 w-12'
      case 'title':
        return size === 'small'
          ? 'text-sm font-medium'
          : size === 'medium'
            ? 'text-base font-medium'
            : 'text-lg font-medium'
      case 'message':
        return size === 'small'
          ? 'text-xs'
          : size === 'medium'
            ? 'text-sm'
            : 'text-base'
      case 'button':
        return size === 'small'
          ? 'h-8 text-xs'
          : size === 'medium'
            ? 'h-9'
            : 'h-10'
      default:
        return ''
    }
  }

  // Get container classes based on severity
  const getContainerClass = () => {
    switch (severity) {
      case 'info':
        return 'bg-blue-500/10 border-blue-200 dark:border-blue-900'
      case 'warning':
        return 'bg-amber-500/10 border-amber-200 dark:border-amber-900'
      case 'error':
        return 'bg-red-500/10 border-red-200 dark:border-red-900'
      case 'critical':
        return 'bg-red-600/15 border-red-300 dark:border-red-900'
      default:
        return ''
    }
  }

  const content = (
    <div
      className={`
        flex ${size === 'small' ? 'items-start' : 'flex-col items-center text-center'}
        ${getSizeClass('container')}
        ${!withCard ? `rounded-md border ${getContainerClass()}` : ''}
        ${className}
      `}>
      {size === 'small' ? (
        <div className="flex items-start">
          <div className="mr-3 mt-0.5 flex-shrink-0">{getIcon()}</div>
          <div className="flex-1">
            <p className={getSizeClass('title')}>{title}</p>
            {message && (
              <p
                className={`${getSizeClass('message')} text-muted-foreground mt-1`}>
                {message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">{getIcon()}</div>
          <h3 className={`${getSizeClass('title')} mb-2`}>{title}</h3>
          {message && (
            <p
              className={`${getSizeClass('message')} text-muted-foreground mb-4 max-w-md`}>
              {message}
            </p>
          )}
        </>
      )}

      {/* Technical details - only in development */}
      {process.env.NODE_ENV === 'development' && technicalDetails && (
        <div className="bg-secondary/20 p-2 rounded-md my-2 w-full overflow-auto text-left">
          <p className="text-muted-foreground font-mono text-xs break-words">
            {technicalDetails instanceof Error
              ? technicalDetails.message
              : typeof technicalDetails === 'string'
                ? technicalDetails
                : JSON.stringify(technicalDetails, null, 2)}
          </p>
        </div>
      )}

      {showRetry && onRetry && size !== 'small' && (
        <Button
          onClick={onRetry}
          className={`flex items-center ${getSizeClass('button')}`}>
          <RefreshCw className="mr-2 h-4 w-4" />
          ลองใหม่
        </Button>
      )}

      {showRetry && onRetry && size === 'small' && (
        <Button size="sm" variant="ghost" onClick={onRetry} className="ml-auto">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )

  if (withCard) {
    return (
      <Card className={`w-full overflow-hidden ${className}`}>
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    )
  }

  return content
}
