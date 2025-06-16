import { NextRequest, NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'

// src/app/api/rewards/gacha/route.ts
export async function POST(request: NextRequest) {
  try {
    const { pullCount } = await request.json()

    if (pullCount !== 1 && pullCount !== 10) {
      return NextResponse.json(
        { error: 'Invalid pull count. Must be 1 or 10' },
        { status: 400 }
      )
    }

    const result = await rewardService.pullGacha(pullCount)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Gacha pull error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to pull gacha',
      },
      { status: 400 }
    )
  }
}
