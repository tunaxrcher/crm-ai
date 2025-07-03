'use client'

import { Skeleton } from '@src/components/ui/skeleton'
import { useUserXeny } from '@src/features/xeny/hooks/api'
import { Coins } from 'lucide-react'

interface TokenDisplayProps {
  className?: string
  showLabel?: boolean
  showIcon?: boolean
}

export function TokenDisplay({
  className = '',
  showLabel = true,
  showIcon = true,
}: TokenDisplayProps) {
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
      {showIcon && <Coins className="h-4 w-4 text-yellow-500" />}
      {showLabel && (
        <span className="text-sm text-muted-foreground">Token:</span>
      )}
      <span className="font-semibold text-yellow-600 dark:text-yellow-500">
        {data?.userToken?.currentTokens?.toLocaleString() || 0} Token
      </span>
    </div>
  )
}
