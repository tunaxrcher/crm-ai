// src/app/api/comments/[commentId]/replies/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { commentService } from '@src/features/feed/service/server'

// POST /api/comments/[commentId]/replies - ตอบความคิดเห็น
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await context.params
    const body = await request.json()
    const reply = await commentService.createReplyComment({
      commentId: parseInt(commentId),
      userId: body.userId,
      content: body.content,
    })

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}
