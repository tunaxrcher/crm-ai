import { NextRequest, NextResponse } from 'next/server'

import { xenyService } from '@src/features/xeny/services/server'

// GET - ดึงข้อมูล Xeny ของ user
export async function GET(request: NextRequest) {
  try {
    const userXeny = await xenyService.getUserXeny()

    return NextResponse.json({
      success: true,
      data: userXeny,
    })
  } catch (error) {
    console.error('Get user Xeny error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get user Xeny',
      },
      { status: 400 }
    )
  }
}
