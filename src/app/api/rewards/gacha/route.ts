import { NextRequest, NextResponse } from 'next/server'
import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// src/app/api/rewards/gacha/route.ts
export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] POST Gacha Pull')

  const { pullCount = 1 } = await request.json()

  if (pullCount !== 1 && pullCount !== 10) {
    return NextResponse.json(
      { error: 'Invalid pull count. Must be 1 or 10' },
      { status: 400 }
    )
  }

  const data = await rewardService.pullGacha(pullCount)

  return NextResponse.json(data)
})
