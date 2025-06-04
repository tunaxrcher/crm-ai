import { NextRequest, NextResponse } from 'next/server'

import { questSubmissionService } from '@src/features/quest/service/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<any> }) => {
    console.log(`[API] Submit Quest`)

    const { id: questId } = await context.params

    // ดึงข้อมูลจาก FormData
    const formData = await request.formData()

    const characterId = formData.get('characterId') as string
    const description = formData.get('description') as string | null
    const mediaFile = formData.get('mediaFile') as File | null

    // Validate required fields
    if (!characterId) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      )
    }

    // เรียกใช้ service เพื่อประมวลผล quest submission
    const result = await questSubmissionService.submitQuest(
      Number(questId),
      Number(characterId),
      mediaFile || undefined,
      description || undefined
    )

    return NextResponse.json(result)
  }
)

// PUT สำหรับอัพเดท summary
export const PUT = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<any> }) => {

    console.log(`[API] Update Quest`)

    const { id: questId } = await context.params
    const body = await request.json()

    const { submissionId, summary } = body

    if (!submissionId || !summary) {
      return NextResponse.json(
        { error: 'Submission ID and summary are required' },
        { status: 400 }
      )
    }

    const updated = await questSubmissionService.updateSubmissionSummary(
      submissionId,
      summary
    )

    return NextResponse.json({
      success: true,
      submission: updated,
    })
  }
)

