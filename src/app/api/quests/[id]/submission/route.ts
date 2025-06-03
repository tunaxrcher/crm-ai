import { NextRequest, NextResponse } from 'next/server'

import {
  questService,
  questSubmissionService,
} from '@src/features/quest/service/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  console.log(`[API] GET Quest Submission`)

  try {
    const { id: questId } = await context.params
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')

    if (!characterId) {
      return NextResponse.json(
        { message: 'Character ID is required' },
        { status: 400 }
      )
    }

    const submission = await questSubmissionService.getQuestSubmission(
      questId,
      parseInt(characterId)
    )

    if (!submission) {
      return NextResponse.json(
        { message: 'Quest submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching quest submission:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  console.log(`[API] UPDATE Quest Submission`)

  try {
    const { id: questId } = await context.params

    const body = await request.json()
    const { submissionId, summary } = body

    if (!submissionId || !summary) {
      return NextResponse.json(
        { message: 'Submission ID and summary are required' },
        { status: 400 }
      )
    }

    const result = await questSubmissionService.updateSubmissionSummary(
      submissionId,
      summary
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating submission summary:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal server error',
        success: false,
      },
      { status: 500 }
    )
  }
}
