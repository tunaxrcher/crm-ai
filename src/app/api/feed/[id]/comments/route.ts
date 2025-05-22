// src/app/api/feed/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { commentService } from '@src/features/feed/service/server'
import { prisma } from '@src/lib/db'

// GET /api/feed/[id]/comments - ดึงความคิดเห็นทั้งหมด
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const comments = await commentService.getCommentsByFeedItem(parseInt(id))
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/feed/[id]/comments - สร้างความคิดเห็นใหม่
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const comment = await commentService.createComment({
      feedItemId: parseInt(id),
      userId: body.userId,
      content: body.content,
    })

    const commentWithUser = await prisma.comment.findUnique({
      where: { id: comment.id },
      include: { user: true },
    })

    return NextResponse.json(commentWithUser)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
