// src/app/api/quests/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questSubmissionService } from '@src/features/quest/service/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
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
  } catch (error) {
    console.error('Quest submission API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// PUT สำหรับอัพเดท summary
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const questId = params.id
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
  } catch (error) {
    console.error('Update submission API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
