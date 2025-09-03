import { NextRequest, NextResponse } from 'next/server'

import { userRepository } from '@src/features/user/repository'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ) => {
    const { userId } = await context.params
    const userIdNumber = parseInt(userId)

    console.log(`[API] Fetching Character for User: ${userIdNumber}`)

    if (isNaN(userIdNumber)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // ดึงข้อมูล user พร้อม character
    const userWithCharacter =
      await userRepository.findUserWithCharacterById(userIdNumber)

    if (!userWithCharacter || !userWithCharacter.character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    const character = userWithCharacter.character
    const user = userWithCharacter

    // ดึงข้อมูลเพิ่มเติม
    const [questStats, achievements] = await Promise.all([
      userRepository.getCharacterQuestStats(character.id),
      userRepository.getAllAchievementsWithUserProgress(userIdNumber),
    ])

    // หา current job level
    let currentJobLevel = null
    if (character.jobClass && character.jobClass.levels) {
      for (let i = character.jobClass.levels.length - 1; i >= 0; i--) {
        const jobLevel = character.jobClass.levels[i]
        if (character.level >= jobLevel.requiredCharacterLevel) {
          currentJobLevel = jobLevel
          break
        }
      }
      // หากไม่พบ ให้ใช้ level แรก
      if (!currentJobLevel) {
        currentJobLevel = character.jobClass.levels[0]
      }
    }

    // สร้างข้อมูล character สำหรับ CharacterDialog
    const characterData = {
      id: character.id,
      name: character.name,
      level: character.level,
      currentXP: character.currentXP,
      nextLevelXP: character.nextLevelXP,
      totalXP: character.totalXP,
      currentPortraitUrl: character.currentPortraitUrl,
      statAGI: character.statAGI,
      statSTR: character.statSTR,
      statDEX: character.statDEX,
      statVIT: character.statVIT,
      statINT: character.statINT,
      statPoints: character.statPoints,
      jobClass: character.jobClass
        ? {
            id: character.jobClass.id,
            name: character.jobClass.name,
            description: character.jobClass.description,
            imageUrl: character.jobClass.imageUrl,
          }
        : null,
      currentJobLevel: currentJobLevel
        ? {
            level: currentJobLevel.level,
            title: currentJobLevel.title,
            requiredCharacterLevel: currentJobLevel.requiredCharacterLevel,
            imageUrl: currentJobLevel.imageUrl,
          }
        : null,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      questStats,
      achievements,
    }

    return NextResponse.json(characterData)
  }
)
