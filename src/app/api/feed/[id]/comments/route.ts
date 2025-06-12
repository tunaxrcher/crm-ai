import { NextRequest, NextResponse } from 'next/server'

import { commentService } from '@src/features/feed/services/server'
import { prisma } from '@src/lib/db'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET /api/feed/[id]/comments - ดึงความคิดเห็นทั้งหมด
export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    console.log(`[API] Get Comments`)

    const { id: feedItemId } = await context.params

    const comments = await commentService.getCommentsByFeedItem(
      Number(feedItemId)
    )

    return NextResponse.json(comments)
  }
)

// POST /api/feed/[id]/comments - สร้างความคิดเห็นใหม่
export const POST = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    console.log(`[API] Create Comments`)

    const { id: feedItemId } = await context.params
    const body = await request.json()

    const comment = await commentService.createComment(
      Number(feedItemId),
      body.content
    )

    const commentWithUser = await prisma.comment.findUnique({
      where: { id: comment.id },
      include: {
        user: {
          include: {
            character: {
              include: {
                currentJobLevel: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(commentWithUser)
  }
)
