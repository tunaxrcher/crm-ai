import { NextRequest, NextResponse } from 'next/server'

import { rankingService } from '@src/features/ranking/services/server'
import { GetRankingsParams } from '@src/features/ranking/types'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (request: NextRequest, _context: { params: Promise<any> }) => {
    console.log(`[API] Fetching Ranking`)

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') as 'all-time' | 'weekly'
    const characterClass = searchParams.get('class') as any

    // Validate parameters
    if (!period || !['all-time', 'weekly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period parameter' },
        { status: 400 }
      )
    }

    if (
      !characterClass ||
      ![
        'all',
        'marketing',
        'sales',
        'accounting',
        'designer',
        'programmer',
        'mechanic',
      ].includes(characterClass)
    ) {
      return NextResponse.json(
        { error: 'Invalid class parameter' },
        { status: 400 }
      )
    }

    const params: GetRankingsParams = {
      period,
      characterClass,
    }

    const result = await rankingService.getRankings(params)

    return NextResponse.json(result)
  }
)
