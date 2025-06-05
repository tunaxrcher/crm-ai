// src/app/api/stories/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { storyService } from '@src/features/feed/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (_request: NextRequest) => {
  console.log(`[API] GET Story`)

  const stories = await storyService.getActiveStories()

  return NextResponse.json(stories)
})

// POST /api/stories - สร้าง story ใหม่
export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] CREATE Story`)

  const body = await request.json()

  const story = await storyService.createStory(body)

  return NextResponse.json(story)
})
