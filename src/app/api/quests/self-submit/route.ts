// src/app/api/quests/self-submit/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questSubmissionService } from '@src/features/quest/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] Submit Quest`)

  const formData = await request.formData()

  // รับไฟล์และข้อมูลจาก request
  const mediaFile = formData.get('mediaFile') as File | null
  const description = formData.get('description') as string | null

  // ส่งข้อมูลไปยังเซอร์วิส
  const result = await questSubmissionService.selfSubmitQuest(
    mediaFile || undefined,
    description || undefined
  )

  return NextResponse.json(result)
})
