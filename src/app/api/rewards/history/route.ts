import { NextResponse } from 'next/server'
import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// src/app/api/rewards/history/route.ts
export const GET = withErrorHandling(async () => {
  console.log('[API] GET Purchase History')

  const data = await rewardService.getCharacterPurchaseHistory()

  return NextResponse.json(data)
})
