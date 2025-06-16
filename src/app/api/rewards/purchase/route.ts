import { NextRequest, NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'

// src/app/api/rewards/purchase/route.ts
export async function POST(request: NextRequest) {
  try {
    const { rewardId } = await request.json()

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      )
    }

    const result = await rewardService.purchaseReward(rewardId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Purchase reward error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to purchase reward',
      },
      { status: 400 }
    )
  }
}
