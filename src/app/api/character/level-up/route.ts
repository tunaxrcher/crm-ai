import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/service/server'

export async function POST(_request: NextRequest) {
  try {

    const result = await characterService.levelUp()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Level up successful!',
    })
  } catch (error) {
    console.error('Error leveling up:', error)
    return NextResponse.json({ error: 'Failed to level up' }, { status: 500 })
  }
}
