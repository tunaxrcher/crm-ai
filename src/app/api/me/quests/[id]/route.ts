// src/app/api/quests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questService } from '@src/features/quest/service/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
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

    // ดึงรายละเอียดภารกิจ
    const quest = await questService.getQuestById(questId, userId)
    if (!quest)
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    return NextResponse.json(quest)
  } catch (error) {
    console.error('Quest Detail API Error:', error)
  }
}
