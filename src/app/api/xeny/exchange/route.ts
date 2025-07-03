import { NextRequest, NextResponse } from 'next/server'

import { xenyService } from '@src/features/xeny/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// POST - แลก Token เป็น Xeny
export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] POST Exchange Token to Xeny')

  const { tokenAmount, exchangeRate = 10 } = await request.json()

  if (!tokenAmount || tokenAmount <= 0) {
    return NextResponse.json({ error: 'Invalid token amount' }, { status: 400 })
  }

  const result = await xenyService.exchangeTokenToXeny(
    tokenAmount,
    exchangeRate
  )

  return NextResponse.json({
    success: true,
    message: 'Token exchange successful',
    data: result,
  })
})
