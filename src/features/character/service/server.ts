import { userService } from '@src/features/user/service/server'
import { getDevSession, getServerSession } from '@src/lib/auth'
import { BaseService } from '@src/lib/service/server/baseService'
import 'server-only'

import { JobClassHelper } from '../helpers/jobClassHelper'
import { PortraitHelper } from '../helpers/portraitHelper'
import {
  CharacterRepository,
  JobClassRepository,
  JobLevelRepository,
  characterRepository,
  jobClassRepository,
  jobLevelRepository,
} from '../repository'
import { Character, JobLevel } from '../types'
import { StatsAllocationService } from './statsAllocationService'

export class CharacterService extends BaseService {
  private static instance: CharacterService
  private characterRepository: CharacterRepository

  constructor() {
    super()
    this.characterRepository = characterRepository
  }

  public static getInstance() {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService()
    }

    return CharacterService.instance
  }

  /**
   * เพิ่ม XP (แยกการคำนวณออกจากการเลเวลอัพ)
   */
  async addXP(characterId: number, amount: number) {
    const session = (await getServerSession()) || (await getDevSession())
    const userId = +session.user.id

    console.log(`[Server] addXP To Character with ID: ${userId}`)

    const character =
      await CharacterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    let newCurrentXP = character.currentXP + amount
    let newLevel = character.level
    let newTotalXP = character.totalXP + amount
    let newNextLevelXP = character.nextLevelXP
    let levelsGained = 0

    const oldLevel = character.level

    // ตรวจสอบการเลเวลอัพหลายระดับ
    while (newCurrentXP >= newNextLevelXP) {
      newCurrentXP -= newNextLevelXP
      newLevel++
      levelsGained++
      newNextLevelXP = JobClassHelper.calculateNextLevelXP(newLevel)
    }

    // อัพเดท XP เบื้องต้น (ยังไม่รวม stats)
    const updatedCharacter =
      await CharacterRepository.updateCharacterWithPortraitAndJob(characterId, {
        currentXP: newCurrentXP,
        level: newLevel,
        totalXP: newTotalXP,
        nextLevelXP: newNextLevelXP,
      })

    // ถ้ามีการเลเวลอัพ ให้เรียกใช้ฟังก์ชัน levelUp สำหรับแต่ละ level
    let levelUpResults: any[] = []
    let totalUnlockedClassLevels: number[] = []
    let latestJobLevel = null
    let allAiReasonings: string[] = []

    if (levelsGained > 0) {
      console.log(
        `[AddXP] Character gained ${levelsGained} levels: ${oldLevel} → ${newLevel}`
      )

      for (let i = 0; i < levelsGained; i++) {
        const currentLevelForLevelUp = oldLevel + i + 1
        console.log(
          `[AddXP] Processing level up for level ${currentLevelForLevelUp}`
        )

        try {
          // เรียกใช้ฟังก์ชัน levelUp แต่ไม่อัพเดท level (เพราะอัพเดทแล้ว)
          const levelUpResult = await this.processLevelUp(
            characterId,
            currentLevelForLevelUp - 1,
            currentLevelForLevelUp,
            false // ไม่ต้องอัพเดท level ใน DB
          )

          levelUpResults.push(levelUpResult)

          if (levelUpResult.unlockedClassLevel)
            totalUnlockedClassLevels.push(levelUpResult.unlockedClassLevel)

          if (levelUpResult.newJobLevel)
            latestJobLevel = levelUpResult.newJobLevel

          if (levelUpResult.aiReasoning)
            allAiReasonings.push(
              `Lv.${currentLevelForLevelUp}: ${levelUpResult.aiReasoning}`
            )
        } catch (error) {
          console.error(
            `[AddXP] Error processing level up for level ${currentLevelForLevelUp}:`,
            error
          )
        }
      }
    }

    // ดึงข้อมูล character ล่าสุดหลังจากการเลเวลอัพทั้งหมด
    const getUserCharacters = await userService.getUserCharacters()

    return {
      character: getUserCharacters.character,
      leveledUp: levelsGained > 0,
      levelsGained,
      xpAdded: amount,
      unlockedClassLevels: totalUnlockedClassLevels,
      newJobLevel: latestJobLevel,
      portraitUpdated: totalUnlockedClassLevels.length > 0,
      aiReasonings: allAiReasonings,
      levelUpResults,
    }
  }

  /**
   * เลเวลอัพ (เรียกใช้ processLevelUp)
   */
  async levelUp(characterId: number) {
    const session = (await getServerSession()) || (await getDevSession())
    const userId = +session.user.id

    console.log(`[Server] levelUp To Character with ID: ${userId}`)

    const character =
      await CharacterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    const oldLevel = character.level
    const newLevel = character.level + 1

    // เรียกใช้ฟังก์ชัน processLevelUp พร้อมอัพเดท level
    const result = await this.processLevelUp(
      characterId,
      oldLevel,
      newLevel,
      true
    )

    return {
      ...result,
      leveledUp: true,
      levelsGained: 1,
    }
  }

  /**
   * ฟังก์ชันหลักสำหรับการเลเวลอัพ (แยกออกมาเพื่อ reuse)
   */
  private async processLevelUp(
    characterId: number,
    oldLevel: number,
    newLevel: number,
    shouldUpdateLevel: boolean = true
  ) {
    const character =
      await CharacterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    console.log(
      `[ProcessLevelUp] Processing level up: ${oldLevel} → ${newLevel}`
    )

    // ใช้ AI คำนวณ stats
    const statGains = await StatsAllocationService.calculateStatGains(
      characterId,
      oldLevel,
      newLevel,
      character.jobClass.name
    )
    console.log(`[ProcessLevelUp] AI stat gains:`, statGains)

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

      console.log(`[ProcessLevelUp] Unlocked class level ${unlockedClassLevel}`)
    }

    // ตรวจสอบการอัพเดท job level
    const jobLevelUpdate = JobClassHelper.shouldUpdateJobLevel(
      character.currentJobLevel,
      character.jobClass.levels,
      newLevel
    )

    // สร้าง Level History
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
      statAGI: character.statAGI + statGains.agiGained,
      statSTR: character.statSTR + statGains.strGained,
      statDEX: character.statDEX + statGains.dexGained,
      statVIT: character.statVIT + statGains.vitGained,
      statINT: character.statINT + statGains.intGained,
      statPoints: character.statPoints + 5,
    }

    // อัพเดท level ถ้าจำเป็น (สำหรับการเรียกจาก levelUp โดยตรง)
    if (shouldUpdateLevel) {
      updateData.level = newLevel
      updateData.currentXP = 0
      updateData.nextLevelXP = JobClassHelper.calculateNextLevelXP(newLevel)
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

    // แสดง AI reasoning แบบสั้น ๆ ใน feed
    const shortReasoning =
      statGains.reasoning.length > 100
        ? statGains.reasoning.substring(0, 100) + '...'
        : statGains.reasoning
    feedContent += ` | 🤖 ${shortReasoning}`

    await CharacterRepository.createFeedItem({
      content: feedContent,
      type: 'level_up',
      mediaType: 'text',
      userId: updatedCharacter.userId,
      levelHistoryId: levelHistory.id,
    })

    const getUserCharacters = await userService.getUserCharacters()

    return {
      character: getUserCharacters.character,
      levelHistory,
      statGains,
      unlockedClassLevel,
      newJobLevel: jobLevelUpdate.newJobLevel,
      portraitUpdated: !!unlockedClassLevel,
      aiReasoning: statGains.reasoning,
    }
  }

  /**
   * ส่งเควสประจำวัน (ไม่เปลี่ยน)
   */
  async submitDailyQuest(characterId: number) {
    const character =
      await CharacterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    // หา daily quest
    const dailyQuest = await CharacterRepository.findActiveDailyQuest()
    if (!dailyQuest) throw new Error('No daily quest available')

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

    // เพิ่ม XP (จะเรียกใช้ processLevelUp ถ้ามีการเลเวลอัพ)
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
      levelsGained: xpResult.levelsGained,
      unlockedClassLevels: xpResult.unlockedClassLevels,
      newJobLevel: xpResult.newJobLevel,
      aiReasonings: xpResult.aiReasonings,
    }
  }
}
export const characterService = CharacterService.getInstance()

export class JobClassService extends BaseService {
  private static instance: JobClassService
  private jobClassRepository: JobClassRepository

  constructor() {
    super()
    this.jobClassRepository = jobClassRepository
  }

  public static getInstance() {
    if (!JobClassService.instance) {
      JobClassService.instance = new JobClassService()
    }

    return JobClassService.instance
  }

  async getAllJobClasss() {
    return this.jobClassRepository.findAll()
  }

  async getJobClass(id: number) {
    return this.jobClassRepository.findById(id)
  }
}
export const jobClassService = JobClassService.getInstance()

export class JobLevelService extends BaseService {
  private static instance: JobLevelService
  private jobLevelRepository: JobLevelRepository

  constructor() {
    super()
    this.jobLevelRepository = jobLevelRepository
  }

  public static getInstance() {
    if (!JobLevelService.instance) {
      JobLevelService.instance = new JobLevelService()
    }

    return JobLevelService.instance
  }
}

export const jobLevelService = JobLevelService.getInstance()
