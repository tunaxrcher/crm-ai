import { NextRequest, NextResponse } from 'next/server'
import { xenyService } from '@src/features/xeny/services/server'

// GET - ดึงประวัติ Xeny transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await xenyService.getXenyTransactions(limit, offset)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Get Xeny transactions error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transactions',
      },
      { status: 400 }
    )
  }
} 