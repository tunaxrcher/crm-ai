// src/app/api/stories/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { storyService } from '@src/features/feed/services/server'

// POST /api/stories/[id]/view - บันทึกการดู story
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log(`[API] POST Story View`)

  try {
    const { id } = await context.params
    const body = await request.json()
    const view = await storyService.markStoryAsViewed({
      storyId: parseInt(id),
      userId: body.userId,
    })

    return NextResponse.json(view)
  } catch (error) {
    console.error('Error marking story as viewed:', error)
    return NextResponse.json(
      { error: 'Failed to mark story as viewed' },
      { status: 500 }
    )
  }
}
