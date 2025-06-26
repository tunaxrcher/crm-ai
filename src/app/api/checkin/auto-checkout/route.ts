import { NextRequest, NextResponse } from 'next/server'

import { autoCheckoutService } from '@src/features/checkin/services/autoCheckoutService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Process Auto Checkout')

  // Process auto checkouts
  const processedCount = await autoCheckoutService.processAutoCheckouts()

  return NextResponse.json({
    success: true,
    message: `Processed ${processedCount} auto checkouts`,
    processedCount,
  })
})

// GET endpoint สำหรับดู pending auto checkouts
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Check Pending Auto Checkouts')

  // แจ้งเตือน pending auto checkouts
  await autoCheckoutService.checkAndNotifyPendingAutoCheckouts()

  return NextResponse.json({
    success: true,
    message: 'Checked pending auto checkouts',
  })
})
