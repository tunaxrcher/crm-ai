// src/app/api/quests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questService } from '@src/features/quest/services/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log(`[API] Fetching Quest By ID`)

    const { id: questId } = await context.params

    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')

    if (!userIdParam) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userId = parseInt(userIdParam)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    // ดึงรายละเอียดภารกิจ
    const quest = await questService.getQuestById(questId, userId)
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    return NextResponse.json(quest)
  } catch (error) {
    console.error('Quest Detail API Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
