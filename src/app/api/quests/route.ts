// src/app/api/quests/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questService } from '@src/features/quest/services/server'

export async function GET(request: NextRequest) {
  try {
    // ดึงข้อมูลภารกิจ
    const questData = await questService.getQuestsForUser()

    return NextResponse.json(questData)
  } catch (error) {
    console.error('Quest API Error:', error)

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
