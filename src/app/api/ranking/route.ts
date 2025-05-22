import { NextRequest, NextResponse } from 'next/server'

import { getRankings } from '@src/features/ranking/service/server'
import { CharacterClass, RankingPeriod } from '@src/features/ranking/types'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get('period') as RankingPeriod) || 'all-time'
    const characterClass =
      (searchParams.get('class') as CharacterClass) || 'all'

    // Validate parameters
    if (!['all-time', 'weekly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period parameter' },
        { status: 400 }
      )
    }

    if (!['all', 'marketing', 'sales', 'accounting'].includes(characterClass)) {
      return NextResponse.json(
        { error: 'Invalid class parameter' },
        { status: 400 }
      )
    }

    // Get rankings
    const rankings = await getRankings({ period, characterClass })

    return NextResponse.json(rankings)
  } catch (error) {
    console.error('Error in rankings API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
