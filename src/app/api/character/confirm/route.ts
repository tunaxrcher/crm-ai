import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/service/server'
import { CharacterConfirmPayload } from '@src/features/character/types'

export async function POST(request: NextRequest) {
  try {
    const payload: CharacterConfirmPayload = await request.json()

    const result = await characterService.confirmCharacterCreation(payload)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error confirming character:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create character',
      },
      { status: 500 }
    )
  }
}
