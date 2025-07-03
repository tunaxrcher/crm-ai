'use client'

import { Skeleton } from '@src/components/ui/skeleton'
import { Gem } from 'lucide-react'
import { useUserXeny } from '../hooks/api'

interface XenyDisplayProps {
  className?: string
  showLabel?: boolean
  showIcon?: boolean
}

export function XenyDisplay({ 
  className = '', 
  showLabel = true,
  showIcon = false 
}: XenyDisplayProps) {
  const { data, isLoading } = useUserXeny()

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Gem className="h-4 w-4 text-purple-500" />}
      {showLabel && <span className="text-sm text-muted-foreground">Xeny:</span>}
      <span className="font-semibold text-purple-600 dark:text-purple-500">
        {data?.userXeny?.currentXeny?.toLocaleString() || 0}
      </span>
    </div>
  )
} 