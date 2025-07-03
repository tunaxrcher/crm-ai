import { NextRequest, NextResponse } from 'next/server'

import { xenyService } from '@src/features/xeny/services/server'

// POST - แลก Token เป็น Xeny
export async function POST(request: NextRequest) {
  try {
    const { tokenAmount, exchangeRate = 10 } = await request.json()

    if (!tokenAmount || tokenAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid token amount' },
        { status: 400 }
      )
    }

    const result = await xenyService.exchangeTokenToXeny(
      tokenAmount,
      exchangeRate
    )

    return NextResponse.json({
      success: true,
      message: 'Exchange successful',
      data: result,
    })
  } catch (error) {
    console.error('Exchange token to Xeny error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to exchange tokens',
      },
      { status: 400 }
    )
  }
}
