import { NextRequest, NextResponse } from 'next/server'

import { CharacterServerService } from '@src/features/character/service/server'

export async function POST(request: NextRequest) {
  try {
    const characterId = 1

    const result = await CharacterServerService.submitDailyQuest(characterId)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Daily quest submitted successfully!',
    })
  } catch (error) {
    console.error('Error submitting daily quest:', error)
    return NextResponse.json(
      { error: 'Failed to submit daily quest' },
      { status: 500 }
    )
  }
}
