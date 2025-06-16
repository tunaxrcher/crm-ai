import { NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'

// src/app/api/rewards/gacha/history/route.ts
export async function GET() {
  try {
    const data = await rewardService.getCharacterGachaHistory()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Get gacha history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gacha history' },
      { status: 500 }
    )
  }
}
