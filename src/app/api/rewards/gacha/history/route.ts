import { NextResponse } from 'next/server'
import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// src/app/api/rewards/gacha/history/route.ts
export const GET = withErrorHandling(async () => {
  console.log('[API] GET Gacha History')

  const data = await rewardService.getCharacterGachaHistory()

  return NextResponse.json(data)
})
