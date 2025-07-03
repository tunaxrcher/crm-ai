import { NextRequest, NextResponse } from 'next/server'

import { xenyService } from '@src/features/xeny/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET - ดึงประวัติ Xeny transactions
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] GET Xeny Transactions')

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  const transactions = await xenyService.getXenyTransactions(limit, offset)

  return NextResponse.json({
    success: true,
    data: transactions,
  })
})
