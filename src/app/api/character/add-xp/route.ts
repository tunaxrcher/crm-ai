import { NextRequest, NextResponse } from 'next/server'

import { characterService } from '@src/features/character/service/server'

export async function POST(request: NextRequest) {
  console.log(`[API] Add XP to Character`)

  try {
    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 })
    }

    // ในที่นี้ hardcode characterId = 1 เพื่อทดสอบ
    const characterId = 1

    const result = await characterService.addXP(characterId, amount)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Added ${amount} XP successfully!`,
    })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 })
  }
}
