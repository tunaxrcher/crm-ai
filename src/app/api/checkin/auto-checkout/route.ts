import { NextRequest, NextResponse } from 'next/server'

import { AutoCheckoutService } from '@src/features/checkin/services/autoCheckoutService'
import { authOptions } from '@src/lib/auth'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(authOptions)

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
    const processedCount = await AutoCheckoutService.processAutoCheckouts()

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} auto checkouts`,
      processedCount,
    })
  } catch (error) {
    console.error('Auto checkout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint สำหรับดู pending auto checkouts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // แจ้งเตือน pending auto checkouts
    await AutoCheckoutService.checkAndNotifyPendingAutoCheckouts()

    return NextResponse.json({
      success: true,
      message: 'Checked pending auto checkouts',
    })
  } catch (error) {
    console.error('Auto checkout check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
