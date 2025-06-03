import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/service/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (_request: NextRequest) => {
  console.log(`[API] Level Up`)

  const result = await characterService.levelUp()

  return NextResponse.json({
    success: true,
    data: result,
    message: 'Level up successful!',
  })
})
