// src/app/api/character/pre-generate/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { characterRepository } from '@src/features/character/repository'
import { getServerSession } from '@src/lib/auth'
import { portraitGenerationService } from '@src/lib/services/portraitGenerationService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (req: NextRequest) => {
  console.log('[API] POST Pre-generate Portraits')

  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = +session.user.id

  // ดึงข้อมูล character
  const userCharacter = await characterRepository.findByUserId(userId)
  if (!userCharacter) {
    return NextResponse.json(
      { error: 'Character not found' },
      { status: 404 }
    )
  }

  // ตรวจสอบว่าควร pre-generate หรือไม่
  const preGenerateCheck =
    portraitGenerationService.checkPreGenerateCondition(userCharacter.level)

  if (!preGenerateCheck.shouldPreGenerate) {
    return NextResponse.json({
      message: 'No pre-generation needed',
      currentLevel: userCharacter.level,
    })
  }

  // เริ่ม pre-generation (async)
  portraitGenerationService
    .preGeneratePortrait(userCharacter.id)
    .catch((error) => {
      console.error('[API] Pre-generation error:', error)
    })

  return NextResponse.json({
    message: 'Pre-generation started',
    currentLevel: userCharacter.level,
    targetClassLevel: preGenerateCheck.targetClassLevel,
  })
})
