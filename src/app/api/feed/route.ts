// src/app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { feedService } from '@src/features/feed/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET /api/feed - ดึงข้อมูล feed items ทั้งหมด
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] GET Feed`)

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const result = await feedService.getFeedItems({
    page,
    limit,
  })

  return NextResponse.json(result)
})

// POST /api/feed - สร้าง feed item ใหม่
export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] CREATE Feed`)

  const body = await request.json()

  const feedItem = await feedService.createFeedItem(body)

  return NextResponse.json(feedItem)
})
