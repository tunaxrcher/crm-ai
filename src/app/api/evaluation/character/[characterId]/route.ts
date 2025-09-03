import { NextRequest, NextResponse } from 'next/server'

import { monthlyEvaluationService } from '@src/features/evaluation/services/monthlyEvaluationService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET - ดึงการประเมินของ character
export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ characterId: string }> }
  ) => {
    console.log(`[API] GET Character Evaluation`)

    try {
      const { characterId: characterIdStr } = await context.params
      const characterId = parseInt(characterIdStr)

      if (isNaN(characterId)) {
        return NextResponse.json(
          { error: 'Invalid characterId' },
          { status: 400 }
        )
      }

      const { searchParams } = new URL(request.url)
      const month = searchParams.get('month')
      const year = searchParams.get('year')
      const limit = searchParams.get('limit')

      if (month && year) {
        // ดึงการประเมินเฉพาะเดือน
        const evaluation = await monthlyEvaluationService.getEvaluationByMonth(
          characterId,
          parseInt(month),
          parseInt(year)
        )

        if (!evaluation) {
          return NextResponse.json(
            { error: 'Evaluation not found for specified month/year' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: evaluation,
        })
      } else {
        // ดึงการประเมินทั้งหมด
        const evaluations =
          await monthlyEvaluationService.getCharacterEvaluations(
            characterId,
            limit ? parseInt(limit) : 12
          )

        return NextResponse.json({
          success: true,
          data: evaluations,
        })
      }
    } catch (error) {
      console.error('[API] Character evaluation GET error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch character evaluations' },
        { status: 500 }
      )
    }
  }
)
