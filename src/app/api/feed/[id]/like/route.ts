import { NextRequest, NextResponse } from 'next/server'

import { likeService } from '@src/features/feed/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    console.log(`[API] Like Feed`)

    const { id: feedItemId } = await context.params

    const like = await likeService.toggleLike(Number(feedItemId))

    return NextResponse.json(like)
  }
)

export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    console.log(`[API] GET Like Feed`)

    const { id: feedItemId } = await context.params

    const likes = await likeService.getLikesByFeedItem(Number(feedItemId))

    return NextResponse.json(likes)
  }
)
