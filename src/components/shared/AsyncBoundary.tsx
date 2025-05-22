'use client'

import React, { Suspense } from 'react'

import GlobalErrorBoundary from './GlobalErrorBoundary'
import SkeletonLoading from './SkeletonLoading'

interface AsyncBoundaryProps {
  /** The content to render when no loading or error occurs */
  children: React.ReactNode
  /** Custom error fallback component */
  errorFallback?: React.ReactNode
  /** Custom loading component */
  loadingFallback?: React.ReactNode
  /** Type of skeleton to show when loading */
  skeletonType?:
    | 'feed'
    | 'character'
    | 'quest'
    | 'ranking'
    | 'party'
    | 'default'
  /** Additional CSS classes */
  className?: string
}

/**
 * A boundary component that handles both async loading states and error states
 * Combines Suspense for loading states and ErrorBoundary for error handling
 */
export default function AsyncBoundary({
  children,
  errorFallback,
  loadingFallback,
  skeletonType = 'default',
  className = '',
}: AsyncBoundaryProps) {
  // If no custom loading fallback is provided, use the SkeletonLoading component
  const defaultLoadingFallback = (
    <div className={`w-full ${className}`}>
      <SkeletonLoading type={skeletonType} />
    </div>
  )

  return (
    <GlobalErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback || defaultLoadingFallback}>
        {children}
      </Suspense>
    </GlobalErrorBoundary>
  )
}
