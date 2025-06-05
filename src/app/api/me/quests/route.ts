// src/app/api/quests/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questService } from '@src/features/quest/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (_request: NextRequest, _context: { params: Promise<any> }) => {
    console.log(`[API] Fetching Quest Character`)

    const quests = await questService.getQuestsForUser()

    return NextResponse.json(quests, { status: 200 })
  }
)
