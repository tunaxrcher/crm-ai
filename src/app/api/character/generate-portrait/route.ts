// src/app/api/character/generate-portrait/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { characterRepository } from '@src/features/character/repository'
import { getServerSession } from '@src/lib/auth'
import { portraitGenerationService } from '@src/lib/services/portraitGenerationService'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (req: NextRequest) => {
  console.log('[API] POST Generate Portrait')

  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { classLevel } = await req.json()
  const userId = +session.user.id

  // ดึงข้อมูล character
  const userCharacter = await characterRepository.findByUserId(userId)
  if (!userCharacter) {
    return NextResponse.json(
      { error: 'Character not found' },
      { status: 404 }
    )
  }

  // ตรวจสอบว่า character ถึง level ที่จะ unlock class level นี้แล้วหรือยัง
  if (userCharacter.level < classLevel) {
    return NextResponse.json(
      { error: 'Character level not high enough' },
      { status: 400 }
    )
  }

  // Generate portrait
  const portraitUrl = await portraitGenerationService.generateOnLevelUp(
    userCharacter.id,
    classLevel
  )

  if (!portraitUrl) {
    return NextResponse.json(
      { error: 'Failed to generate portrait' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    portraitUrl,
    classLevel,
  })
})
