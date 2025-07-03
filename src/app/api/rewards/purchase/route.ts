import { NextRequest, NextResponse } from 'next/server'
import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// src/app/api/rewards/purchase/route.ts
export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] POST Purchase Reward')

  const { rewardId } = await request.json()

  if (!rewardId) {
    return NextResponse.json(
      { error: 'Reward ID is required' },
      { status: 400 }
    )
  }

  const result = await rewardService.purchaseReward(rewardId)
  return NextResponse.json(result)
})
