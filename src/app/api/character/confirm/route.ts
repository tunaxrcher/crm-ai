import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/service/server'
import { CharacterConfirmPayload } from '@src/features/character/types'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] Confirm Create Character`)

  const payload: CharacterConfirmPayload = await request.json()

  const result = await characterService.confirmCharacterCreation(payload)

  return NextResponse.json(result)
})
