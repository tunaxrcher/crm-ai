import { NextRequest, NextResponse } from 'next/server'

import { completeQuest } from '@src/features/quest/service/server'
import { CompleteQuestRequest } from '@src/features/quest/types'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompleteQuestRequest

    if (!body.questId) {
      return NextResponse.json({ error: 'Missing questId' }, { status: 400 })
    }

    const result = await completeQuest(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error completing quest:', error)
    return NextResponse.json(
      { error: 'Failed to complete quest' },
      { status: 500 }
    )
  }
}
