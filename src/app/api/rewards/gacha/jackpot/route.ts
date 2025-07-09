import { NextRequest, NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (_request: NextRequest) => {
  console.log('[API] GET Current Jackpot')

  const jackpot = await rewardService.getCurrentJackpot()

  return NextResponse.json({
    success: true,
    data: jackpot,
  })
})
