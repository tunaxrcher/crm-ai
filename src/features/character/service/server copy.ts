import { userService } from '@src/features/user/service/server'
import { getDevSession, getServerSession } from '@src/lib/auth'

import { JobClassHelper } from '../helpers/jobClassHelper'
import { PortraitHelper } from '../helpers/portraitHelper'
import { CharacterRepository } from '../repository'
import { StatsAllocationService } from './statsAllocationService'

export class CharacterServerService {
  /**
   * เพิ่ม XP
   */
  static async addXP(characterId: number, amount: number) {
    const session = (await getServerSession()) || (await getDevSession())
    const userId = +session.user.id

    console.log(`[Server] addXP to User Character with ID: ${userId}`)

    const character =
      await CharacterRepository.findByIdWithJobLevels(characterId)

    if (!character) throw new Error('Character not found')

    let newCurrentXP = character.currentXP + amount
    let newLevel = character.level
    let newTotalXP = character.totalXP + amount
    let newNextLevelXP = character.nextLevelXP
    let leveledUp = false
    let portraitUpdated = false
    let unlockedClassLevel: number | null = null
    let newJobLevel: any = null
    let aiReasoning: string | null = null

    const oldLevel = character.level

    // ตรวจสอบการเลเวลอัพ
    while (newCurrentXP >= newNextLevelXP) {
      newCurrentXP -= newNextLevelXP
      newLevel++
      leveledUp = true
      newNextLevelXP = JobClassHelper.calculateNextLevelXP(newLevel)
    }

    let updateData: any = {
      currentXP: newCurrentXP,
      level: newLevel,
      totalXP: newTotalXP,
      nextLevelXP: newNextLevelXP,
    }

    // ถ้ามีการเลเวลอัพ ให้ใช้ AI วิเคราะห์ stats
    if (leveledUp) {
      const statGains = await StatsAllocationService.calculateStatGains(
        characterId,
        oldLevel,
        newLevel,
        character.jobClass.name
      )

      aiReasoning = statGains.reasoning

      // เพิ่ม stats ให้ character
      updateData.statAGI = character.statAGI + statGains.agiGained
      updateData.statSTR = character.statSTR + statGains.strGained
      updateData.statDEX = character.statDEX + statGains.dexGained
      updateData.statVIT = character.statVIT + statGains.vitGained
      updateData.statINT = character.statINT + statGains.intGained
      updateData.statPoints = character.statPoints + 5

      // สร้าง Level History
      await CharacterRepository.createLevelHistory({
        characterId,
        levelFrom: oldLevel,
        levelTo: newLevel,
        agiGained: statGains.agiGained,
        strGained: statGains.strGained,
        dexGained: statGains.dexGained,
        vitGained: statGains.vitGained,
        intGained: statGains.intGained,
        reasoning: `AI Analysis (Auto Level Up): ${statGains.reasoning}`,
      })

      // ตรวจสอบการปลดล็อก class ใหม่
      unlockedClassLevel = PortraitHelper.shouldUnlockNewClass(
        newLevel,
        oldLevel
      )

      if (unlockedClassLevel) {
        const updatedPortraits = PortraitHelper.updateGeneratedPortraits(
          character.generatedPortraits,
          unlockedClassLevel
        )

        const newPortraitUrl = PortraitHelper.getCurrentPortraitUrl(
          newLevel,
          updatedPortraits
        )

        updateData.generatedPortraits = updatedPortraits
        updateData.currentPortraitUrl = newPortraitUrl
        portraitUpdated = true
      }

      // ตรวจสอบการอัพเดท job level
      const jobLevelUpdate = JobClassHelper.shouldUpdateJobLevel(
        character.currentJobLevel,
        character.jobClass.levels,
        newLevel
      )

      if (jobLevelUpdate.shouldUpdate && jobLevelUpdate.newJobLevel) {
        updateData.jobLevelId = jobLevelUpdate.newJobLevel.id
        newJobLevel = jobLevelUpdate.newJobLevel
      }
    }

    const updatedCharacter =
      await CharacterRepository.updateCharacterWithPortraitAndJob(
        characterId,
        updateData
      )

    const dataCharacter = await userService.getUserCharacters()

    return {
      character: dataCharacter.character,
      leveledUp,
      xpAdded: amount,
      unlockedClassLevel,
      newJobLevel,
      portraitUpdated,
      aiReasoning,
    }
  }

  /**
   * เลเวลอัพ
   */
  static async levelUp(characterId: number) {
    const session = (await getServerSession()) || (await getDevSession())
    const userId = +session.user.id

    console.log(`[Server] levelUp to User Character with ID: ${userId}`)

    const character = await CharacterRepository.findByIdWithJobLevels(characterId)

    if (!character) throw new Error('Character not found')

    const oldLevel = character.level
    const newLevel = character.level + 1
    const newNextLevelXP = JobClassHelper.calculateNextLevelXP(newLevel)

    // ใช้ AI คำนวณ stats
    const statGains = await StatsAllocationService.calculateStatGains(
      characterId,
      oldLevel,
      newLevel,
      character.jobClass.name
    )

    console.log(`[LevelUp] Character ${characterId}: ${oldLevel} → ${newLevel}`)
    console.log(`[LevelUp] Stat gains:`, statGains)

    // ตรวจสอบการปลดล็อก class ใหม่
    const unlockedClassLevel = PortraitHelper.shouldUnlockNewClass(
      newLevel,
      oldLevel
    )
    let updatedPortraits = character.generatedPortraits
    let newPortraitUrl = character.currentPortraitUrl

    if (unlockedClassLevel) {
      updatedPortraits = PortraitHelper.updateGeneratedPortraits(
        character.generatedPortraits,
        unlockedClassLevel
      )

      newPortraitUrl = PortraitHelper.getCurrentPortraitUrl(
        newLevel,
        updatedPortraits
      )
    }

    // ตรวจสอบการอัพเดท job level
    const jobLevelUpdate = JobClassHelper.shouldUpdateJobLevel(
      character.currentJobLevel,
      character.jobClass.levels,
      newLevel
    )

    // สร้าง Level History พร้อม AI reasoning
    const levelHistory = await CharacterRepository.createLevelHistory({
      characterId,
      levelFrom: oldLevel,
      levelTo: newLevel,
      agiGained: statGains.agiGained,
      strGained: statGains.strGained,
      dexGained: statGains.dexGained,
      vitGained: statGains.vitGained,
      intGained: statGains.intGained,
      reasoning: `AI Analysis: ${statGains.reasoning}${unlockedClassLevel ? ` | Unlocked class level ${unlockedClassLevel}` : ''}`,
    })

    // เตรียมข้อมูลสำหรับอัพเดท character
    const updateData: any = {
      level: newLevel,
      currentXP: 0,
      nextLevelXP: newNextLevelXP,
      statAGI: character.statAGI + statGains.agiGained,
      statSTR: character.statSTR + statGains.strGained,
      statDEX: character.statDEX + statGains.dexGained,
      statVIT: character.statVIT + statGains.vitGained,
      statINT: character.statINT + statGains.intGained,
      statPoints: character.statPoints + 5,
    }

    // เพิ่มข้อมูล portrait และ job level ถ้ามีการเปลี่ยนแปลง
    if (unlockedClassLevel) {
      updateData.generatedPortraits = updatedPortraits
      updateData.currentPortraitUrl = newPortraitUrl
    }

    if (jobLevelUpdate.shouldUpdate && jobLevelUpdate.newJobLevel) {
      updateData.jobLevelId = jobLevelUpdate.newJobLevel.id
    }

    // อัพเดท Character
    const updatedCharacter =
      await CharacterRepository.updateCharacterWithPortraitAndJob(
        characterId,
        updateData
      )

    // สร้าง Feed Item
    let feedContent = `🎉 ${updatedCharacter.user.name} (${updatedCharacter.jobClass.name}) ได้เลเวลอัพจาก Lv.${levelHistory.levelFrom} เป็น Lv.${levelHistory.levelTo}!`

    if (unlockedClassLevel) {
      feedContent += ` 🌟 ปลดล็อกคลาสใหม่ Level ${unlockedClassLevel}!`
    }

    if (jobLevelUpdate.shouldUpdate && jobLevelUpdate.newJobLevel) {
      feedContent += ` 👑 เลื่อนตำแหน่งเป็น "${jobLevelUpdate.newJobLevel.title}"!`
    }

    feedContent += ` 💪 STR +${statGains.strGained} 🧠 INT +${statGains.intGained} 🏃 AGI +${statGains.agiGained} 🎯 DEX +${statGains.dexGained} ❤️ VIT +${statGains.vitGained}`
    feedContent += ` | 🤖 AI: "${statGains.reasoning}"`

    await CharacterRepository.createFeedItem({
      content: feedContent,
      type: 'level_up',
      mediaType: 'text',
      userId: updatedCharacter.userId,
      levelHistoryId: levelHistory.id,
    })

    return {
      character: updatedCharacter,
      levelHistory,
      statGains,
      unlockedClassLevel,
      newJobLevel: jobLevelUpdate.newJobLevel,
      portraitUpdated: !!unlockedClassLevel,
      aiReasoning: statGains.reasoning,
    }
  }

  /**
   * ส่งเควสประจำวัน
   */
  static async submitDailyQuest(characterId: number) {
    const character =
      await CharacterRepository.findByIdWithJobLevels(characterId)
    if (!character) {
      throw new Error('Character not found')
    }

    // หา daily quest
    const dailyQuest = await CharacterRepository.findActiveDailyQuest()
    if (!dailyQuest) {
      throw new Error('No daily quest available')
    }

    // เช็ค assigned quest
    let assignedQuest = await CharacterRepository.findAssignedQuest(
      characterId,
      dailyQuest.id,
      'active'
    )

    // สร้าง assigned quest ถ้าไม่มี
    if (!assignedQuest) {
      assignedQuest = await CharacterRepository.createAssignedQuest({
        questId: dailyQuest.id,
        characterId,
        userId: character.userId,
        status: 'active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
    }

    // สร้าง Quest Submission
    const questSubmission = await CharacterRepository.createQuestSubmission({
      mediaType: 'text',
      description: `Completed daily quest: ${dailyQuest.title}`,
      ratingAGI: Math.floor(Math.random() * 5) + 1,
      ratingSTR: Math.floor(Math.random() * 5) + 1,
      ratingDEX: Math.floor(Math.random() * 5) + 1,
      ratingVIT: Math.floor(Math.random() * 5) + 1,
      ratingINT: Math.floor(Math.random() * 5) + 1,
      xpEarned: dailyQuest.xpReward,
      characterId,
      questId: dailyQuest.id,
    })

    // อัพเดทสถานะ assigned quest
    await CharacterRepository.updateAssignedQuest(assignedQuest.id, {
      status: 'completed',
    })

    // เพิ่ม XP
    const xpResult = await this.addXP(characterId, dailyQuest.xpReward)

    // สร้าง Feed Item
    await CharacterRepository.createFeedItem({
      content: `${character.user.name} ได้ทำเควส "${dailyQuest.title}" สำเร็จและได้รับ ${dailyQuest.xpReward} XP!`,
      type: 'quest_completion',
      mediaType: 'text',
      userId: character.userId,
      questSubmissionId: questSubmission.id,
    })

    // จัดการ tokens
    await CharacterRepository.createQuestToken({
      userId: character.userId,
      questId: dailyQuest.id,
      characterId,
      tokensEarned: dailyQuest.baseTokenReward,
      bonusTokens: 0,
      multiplier: 1.0,
    })

    const userToken = await CharacterRepository.findUserToken(character.userId)
    if (userToken) {
      await CharacterRepository.updateUserToken(character.userId, {
        currentTokens: userToken.currentTokens + dailyQuest.baseTokenReward,
        totalEarnedTokens:
          userToken.totalEarnedTokens + dailyQuest.baseTokenReward,
      })
    }

    return {
      character: xpResult.character,
      questSubmission,
      xpEarned: dailyQuest.xpReward,
      tokensEarned: dailyQuest.baseTokenReward,
      leveledUp: xpResult.leveledUp,
      unlockedClassLevel: xpResult.unlockedClassLevel,
      newJobLevel: xpResult.newJobLevel,
      aiReasoning: xpResult.aiReasoning,
    }
  }
}
