import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] POST Add XP')

  const { amount } = await request.json()

  const result = await characterService.addXP(amount)

  return NextResponse.json(result, { status: 200 })
})
