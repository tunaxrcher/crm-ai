import { NextRequest, NextResponse } from 'next/server'

import { likeService } from '@src/features/feed/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    console.log(`[API] GET Likes for Feed Item`)

    const { id: feedItemId } = await context.params

    const likes = await likeService.getLikesByFeedItem(Number(feedItemId))

    return NextResponse.json(likes)
  }
)
