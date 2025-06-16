import { NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'

// src/app/api/rewards/history/route.ts
export async function GET() {
  try {
    const purchases = await rewardService.getCharacterPurchaseHistory()
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Get purchase history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase history' },
      { status: 500 }
    )
  }
}
