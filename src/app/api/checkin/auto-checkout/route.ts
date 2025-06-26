import { NextRequest, NextResponse } from 'next/server'

import { autoCheckoutService } from '@src/features/checkin/services/autoCheckoutService'
import { getServerSession } from '@src/lib/auth'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Process Auto Checkout')
  
  // ตรวจสอบ session
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ตรวจสอบสิทธิ์ (อนุญาตเฉพาะ admin หรือใน dev mode)
  const isDev = process.env.NODE_ENV === 'development'
  const isAdmin = session.user?.email === 'admin@example.com' // ปรับตามระบบของคุณ

  if (!isDev && !isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin only' },
      { status: 403 }
    )
  }

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
  
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // แจ้งเตือน pending auto checkouts
  await autoCheckoutService.checkAndNotifyPendingAutoCheckouts()

  return NextResponse.json({
    success: true,
    message: 'Checked pending auto checkouts',
  })
})
