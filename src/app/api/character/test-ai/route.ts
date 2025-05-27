import { NextRequest, NextResponse } from 'next/server'

import { StatsAllocationService } from '@src/features/character/service/statsAllocationService'
import { StatAnalysisService } from '@src/lib/ai/statAnalysisService'

export async function GET(request: NextRequest) {
  try {
    console.log('[AI Test] Starting AI system test...')

    const aiAvailable = await StatAnalysisService.testAIConnection()
    console.log(
      `[AI Test] AI Connection: ${aiAvailable ? 'SUCCESS' : 'FAILED'}`
    )

    if (!aiAvailable) {
      return NextResponse.json({
        success: false,
        error: 'AI connection failed',
        fallback: await StatsAllocationService.testStatAllocation(),
      })
    }

    const statResult =
      await StatsAllocationService.testStatAllocation('โปรแกรมเมอร์')
    console.log('[AI Test] Stat allocation result:', statResult)

    return NextResponse.json({
      success: true,
      aiAvailable,
      testResult: statResult,
      message: 'AI stat allocation test completed successfully',
    })
  } catch (error) {
    console.error('[AI Test] Test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'AI test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
