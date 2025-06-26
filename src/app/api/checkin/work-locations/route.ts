import { NextRequest, NextResponse } from 'next/server'

import { checkinService } from '@src/features/checkin/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (_request: NextRequest) => {
  console.log('[API] Get Work Locations')

  const workLocations = await checkinService.getWorkLocations()

  return NextResponse.json({
    success: true,
    data: workLocations,
  })
})
