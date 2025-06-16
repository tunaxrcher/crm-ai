// src/app/api/rewards/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { rewardService } from '@src/features/reward/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (_request: NextRequest) => {
  console.log(`[API] GET Rewards`)

  const data = await rewardService.getRewards()

  return NextResponse.json(data)
})
