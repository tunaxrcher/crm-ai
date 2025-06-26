import { NextRequest, NextResponse } from 'next/server'

import { checkinService } from '@src/features/checkin/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (_request: NextRequest) => {
  console.log('[API] Get Checkin Status')

  const status = await checkinService.getCheckinStatus()

  return NextResponse.json({
    success: true,
    data: status,
  })
})
