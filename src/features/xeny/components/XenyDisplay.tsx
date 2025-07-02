'use client'

import { Skeleton } from '@src/components/ui/skeleton'
import { useUserXeny } from '../hooks/api'

interface XenyDisplayProps {
  className?: string
  showLabel?: boolean
}

export function XenyDisplay({ className = '', showLabel = true }: XenyDisplayProps) {
  const { data: userXeny, isLoading } = useUserXeny()

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-sm text-muted-foreground">Xeny:</span>}
      <span className="font-semibold text-primary">
        {userXeny?.currentXeny?.toLocaleString() || 0}
      </span>
    </div>
  )
} 