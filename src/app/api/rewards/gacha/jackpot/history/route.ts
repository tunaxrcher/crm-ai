import { NextRequest, NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] GET Jackpot Winners History')

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  const winners = await rewardService.getJackpotWinners(limit)

  return NextResponse.json({
    success: true,
    data: winners,
  })
})
