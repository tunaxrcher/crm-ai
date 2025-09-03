import { NextRequest, NextResponse } from 'next/server'

import { monthlyEvaluationService } from '@src/features/evaluation/services/monthlyEvaluationService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET - ดึงการประเมินรายเดือน
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const characterId = searchParams.get('characterId')
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const limit = searchParams.get('limit')

  if (!characterId) {
    return NextResponse.json(
      { error: 'characterId is required' },
      { status: 400 }
    )
  }

  try {
    if (month && year) {
      // ดึงการประเมินเฉพาะเดือน
      const evaluation = await monthlyEvaluationService.getEvaluationByMonth(
        parseInt(characterId),
        parseInt(month),
        parseInt(year)
      )

      return NextResponse.json({
        success: true,
        data: evaluation,
      })
    } else {
      // ดึงการประเมินทั้งหมด
      const evaluations =
        await monthlyEvaluationService.getCharacterEvaluations(
          parseInt(characterId),
          limit ? parseInt(limit) : 12
        )

      return NextResponse.json({
        success: true,
        data: evaluations,
      })
    }
  } catch (error) {
    console.error('[API] Monthly evaluation GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
})

// POST - สร้างการประเมินรายเดือนสำหรับทุกคน (สำหรับ cronjob)
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { month, year } = body

    if (!month || !year) {
      return NextResponse.json(
        { error: 'month and year are required' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าเป็นเดือนและปีที่ถูกต้อง
    if (
      month < 1 ||
      month > 12 ||
      year < 2020 ||
      year > new Date().getFullYear()
    ) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      )
    }

    console.log(`[API] Starting monthly evaluation for ${month}/${year}`)

    const results =
      await monthlyEvaluationService.createMonthlyEvaluationsForAllCharacters(
        month,
        year
      )

    return NextResponse.json({
      success: true,
      message: `Created ${results.length} monthly evaluations`,
      data: {
        month,
        year,
        evaluationsCreated: results.length,
        evaluations: results,
      },
    })
  } catch (error) {
    console.error('[API] Monthly evaluation POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create monthly evaluations' },
      { status: 500 }
    )
  }
})
