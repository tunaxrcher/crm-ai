import { NextRequest, NextResponse } from 'next/server'

import { monthlyEvaluationService } from '@src/features/evaluation/services/monthlyEvaluationService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// POST - Cronjob endpoint สำหรับรันประเมินผลอัตโนมัติ
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    console.log('[CRON] Monthly evaluation cronjob started')

    // Security check: ตรวจสอบ cron secret (optional)
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const providedSecret = request.headers.get('x-cron-secret')
      if (providedSecret !== cronSecret) {
        console.error('[CRON] Invalid cron secret')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // คำนวณเดือนและปีที่ต้องประเมิน (เดือนที่แล้ว)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const month = lastMonth.getMonth() + 1 // JavaScript months are 0-based
    const year = lastMonth.getFullYear()

    console.log(`[CRON] Evaluating month ${month}/${year}`)

    // ตรวจสอบว่าเป็นการ force run หรือไม่
    const forceRun = request.headers.get('x-force-run') === 'true'
    const isValidTime = now.getDate() <= 3 // อนุญาตให้รันได้ในช่วง 3 วันแรกของเดือน

    if (!isValidTime && !forceRun) {
      return NextResponse.json({
        success: false,
        message:
          'Can only run in the first 3 days of the month or with force flag',
        currentDate: now.toISOString(),
        currentDay: now.getDate(),
      })
    }

    // รันการประเมิน
    const results =
      await monthlyEvaluationService.createMonthlyEvaluationsForAllCharacters(
        month,
        year
      )

    const successCount = results.length
    const message = `Monthly evaluation completed for ${month}/${year}. Created ${successCount} evaluations.`

    console.log(`[CRON] ${message}`)

    return NextResponse.json({
      success: true,
      message,
      data: {
        month,
        year,
        evaluationsCreated: successCount,
        executedAt: new Date().toISOString(),
        isForceRun: forceRun,
      },
    })
  } catch (error) {
    console.error('[CRON] Monthly evaluation cronjob error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Monthly evaluation cronjob failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
})

// GET - ตรวจสอบสถานะ cronjob
export const GET = withErrorHandling(async (request: NextRequest) => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const month = lastMonth.getMonth() + 1
  const year = lastMonth.getFullYear()

  return NextResponse.json({
    success: true,
    message: 'Monthly evaluation cronjob is healthy',
    data: {
      currentTime: now.toISOString(),
      nextEvaluationMonth: month,
      nextEvaluationYear: year,
      isFirstDayOfMonth: now.getDate() === 1,
    },
  })
})
