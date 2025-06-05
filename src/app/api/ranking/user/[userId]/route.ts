import { NextRequest, NextResponse } from 'next/server'

import { rankingService } from '@src/features/ranking/services/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') as 'all-time' | 'weekly'

    // Validate parameters
    if (!period || !['all-time', 'weekly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period parameter' },
        { status: 400 }
      )
    }

    const result = await rankingService.getUserRankingDetails(
      Number(userId),
      period
    )

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in user ranking API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
