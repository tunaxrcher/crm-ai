import { userService } from '@src/features/user/services/server'
import { getServerSession } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { fluxService } from '@src/lib/services/fluxService'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import {
  CharacterRepository,
  JobClassRepository,
  JobLevelRepository,
  characterRepository,
  jobClassRepository,
  jobLevelRepository,
} from '../repository'
import {
  CharacterConfirmPayload,
  CharacterConfirmResponse,
  CharacterGenerateResponse,
  GeneratedPortrait,
} from '../types'
import { CharacterLevelService, JobClassHelper } from './CharacterLevelService'

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
   * Calculate XP required for a specific level
   * Formula: baseXP * level^rate
   */
  private calculateXPForLevel(level: number): number {
    const baseXP = 50
    const rate = 1.45
    return Math.floor(baseXP * Math.pow(level, rate))
  }

  /**
   * สร้าง character พร้อม initialize generatedPortraits
   */
  private async createCharacter(params: {
    userId: number
    name: string
    jobClassId: number
    jobLevelId: number
    portraitUrl: string
    originalFaceImage?: string
    personaTraits: string
  }): Promise<any> {
    const {
      userId,
      name,
      jobClassId,
      jobLevelId,
      portraitUrl,
      originalFaceImage,
      personaTraits,
    } = params

    // Calculate starting XP values
    const level = 1
    const currentXP = 0
    const nextLevelXP = this.calculateXPForLevel(level + 1)
    const totalXP = 0

    // Initialize generatedPortraits with level 1 only
    const generatedPortraits: Record<string, string> = {
      '1': portraitUrl,
      '10': '',
      '35': '',
      '60': '',
      '80': '',
      '99': '',
    }

    // สร้าง character
    const character = await prisma.character.create({
      data: {
        name,
        level,
        currentXP,
        nextLevelXP,
        totalXP,
        statPoints: 0,
        statAGI: 10,
        statSTR: 10,
        statDEX: 10,
        statVIT: 10,
        statINT: 10,
        currentPortraitUrl: portraitUrl,
        customPortrait: true,
        originalFaceImage: originalFaceImage || null,
        generatedPortraits,
        personaTraits,
        userId,
        jobClassId,
        jobLevelId,
      },
    })

    return character
  }

  /**
   * เพิ่ม XP (แยกการคำนวณออกจากการเลเวลอัพ)
   */
  async addXP(amount: number) {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[Server] addXP To Character with ID: ${userId}`)

    const userCharacter = await characterRepository.findByUserId(userId)
    if (!userCharacter) throw new Error('User Character not found')
    const characterId = userCharacter.id

    const character =
      await characterRepository.findByIdWithJobLevels(characterId)
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
      await characterRepository.updateCharacterWithPortraitAndJob(characterId, {
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
          // เรียกใช้ฟังก์ชัน processLevelUp พร้อมอัพเดท level
          const levelService = new CharacterLevelService()

          // เรียกใช้ processLevelUp
          const result = await levelService.processLevelUp(
            characterId,
            currentLevelForLevelUp - 1,
            currentLevelForLevelUp,
            false // shouldUpdateLevel
          )

          levelUpResults.push(result)

          if (result.unlockedClassLevel)
            totalUnlockedClassLevels.push(result.unlockedClassLevel)

          if (result.newJobLevel) latestJobLevel = result.newJobLevel

          if (result.aiReasoning)
            allAiReasonings.push(
              `Lv.${currentLevelForLevelUp}: ${result.aiReasoning}`
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
  async levelUp() {
    const session = await getServerSession()
    const userId = +session.user.id

    const userCharacter = await characterRepository.findByUserId(userId)
    if (!userCharacter) throw new Error('User Character not found')

    const characterId = userCharacter.id

    const character =
      await characterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    console.log(`[Server] levelUp To Character with ID: ${characterId}`)

    // เรียกใช้ฟังก์ชัน processLevelUp พร้อมอัพเดท level
    const levelService = new CharacterLevelService()
    const result = await levelService.processLevelUp(
      character,
      character.level,
      character.level + 1,
      true // shouldUpdateLevel
    )

    return {
      ...result,
      leveledUp: true,
      levelsGained: 1,
    }
  }

  /**
   * ส่งเควสประจำวัน (ไม่เปลี่ยน)
   */
  async submitDailyQuest(characterId: number) {
    const character =
      await characterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    // หา daily quest
    const dailyQuest = await characterRepository.findActiveDailyQuest()
    if (!dailyQuest) throw new Error('No daily quest available')

    // เช็ค assigned quest
    let assignedQuest = await characterRepository.findAssignedQuest(
      characterId,
      dailyQuest.id,
      'active'
    )

    // สร้าง assigned quest ถ้าไม่มี
    if (!assignedQuest) {
      assignedQuest = await characterRepository.createAssignedQuest({
        questId: dailyQuest.id,
        characterId,
        userId: character.userId,
        status: 'active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
    }

    // สร้าง Quest Submission
    const questSubmission = await characterRepository.createQuestSubmission({
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
    await characterRepository.updateAssignedQuest(assignedQuest.id, {
      status: 'completed',
    })

    // เพิ่ม XP (จะเรียกใช้ processLevelUp ถ้ามีการเลเวลอัพ)
    const xpResult = await this.addXP(dailyQuest.xpReward)

    // สร้าง Feed Item
    await characterRepository.createFeedItem({
      content: `${character.user.name} ได้ทำเควส "${dailyQuest.title}" สำเร็จและได้รับ ${dailyQuest.xpReward} XP!`,
      type: 'quest_completion',
      mediaType: 'text',
      userId: character.userId,
      questSubmissionId: questSubmission.id,
    })

    // จัดการ tokens
    await characterRepository.createQuestToken({
      userId: character.userId,
      questId: dailyQuest.id,
      characterId,
      tokensEarned: dailyQuest.baseTokenReward,
      bonusTokens: 0,
      multiplier: 1.0,
    })

    const userToken = await characterRepository.findUserToken(character.userId)
    if (userToken) {
      await characterRepository.updateUserToken(character.userId, {
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

  /**
   * Generate character portraits using AI สำหรับการสร้าง character ใหม่
   */
  async generateCharacterPortraits(
    jobClassId: number,
    name: string,
    portraitType: 'upload' | 'generate',
    faceImageUrl?: string
  ): Promise<CharacterGenerateResponse> {
    try {
      // ดึงข้อมูล job class และ first level
      const jobClass = await jobClassRepository.findById(jobClassId)
      if (!jobClass) throw new Error('Job class not found')

      const firstJobLevel = jobClass.levels[0]
      if (!firstJobLevel) throw new Error('First job level not found')

      let portraits: GeneratedPortrait[] = []
      let personaTraits: string = this.generatePersonaTraits(jobClass.name)

      // สร้าง prompt สำหรับ class level 1 โดยใช้ personaDescription จาก JobLevel
      const prompt = fluxService.createPrompt(
        jobClass.name,
        firstJobLevel.personaDescription ||
          'Wearing basic work attire, starting professional appearance',
        1,
        personaTraits,
        true // บอกว่าเป็น class แรก ต้องการ full prompt
      )

      console.log(
        '[CharacterService] Generated prompt for class level 1:',
        prompt
      )

      let referenceBase64: string | undefined

      if (portraitType === 'upload' && faceImageUrl) {
        // แปลงรูป reference เป็น base64
        referenceBase64 = await fluxService.imageToBase64(faceImageUrl)
      }

      // Generate รูป class level 1
      const generateResponse = await fluxService.generatePortrait({
        prompt,
        input_image: referenceBase64,
        output_format: 'png',
        aspect_ratio: '1:1',
        safety_tolerance: 2,
        prompt_upsampling: true,
      })

      console.log(
        `[CharacterService] Generation started with ID: ${generateResponse.id}`
      )

      // รอผลลัพธ์
      console.log('[CharacterService] Waiting for generation result...')
      const resultImageUrl = await fluxService.waitForResult(
        generateResponse.id,
        600000
      )

      console.log(
        '[CharacterService] Generation completed, result URL:',
        resultImageUrl
      )

      // Download, ลบพื้นหลัง และอัพโหลดไป S3
      const tempCharacterId = Date.now()
      const finalPortraitUrl = await fluxService.downloadRemoveBgAndUploadToS3(
        resultImageUrl,
        tempCharacterId,
        1
      )

      // สร้าง GeneratedPortrait object
      portraits = [
        {
          id: 'class_1',
          url: finalPortraitUrl,
          prompt: prompt,
          model: 'flux-kontext-pro',
        },
      ]

      // สร้าง session ID สำหรับเก็บข้อมูลชั่วคราว
      const sessionId = `char_gen_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // เก็บข้อมูลใน global cache
      global.characterGenerationSessions =
        global.characterGenerationSessions || {}
      global.characterGenerationSessions[sessionId] = {
        jobClassId,
        name,
        portraits,
        originalFaceImage: faceImageUrl,
        personaTraits,
        createdAt: new Date(),
      }

      // ลบ session เก่าที่หมดอายุ
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      Object.keys(global.characterGenerationSessions).forEach((key) => {
        if (global.characterGenerationSessions[key].createdAt < oneHourAgo) {
          delete global.characterGenerationSessions[key]
        }
      })

      return {
        portraits,
        sessionId,
      }
    } catch (error) {
      console.error(
        '[CharacterService] Generate character portraits error:',
        error
      )
      throw error
    }
  }

  /**
   * Confirm and create character for existing authenticated user
   */
  async confirmCharacterCreation(
    payload: CharacterConfirmPayload
  ): Promise<CharacterConfirmResponse> {
    try {
      // ดึงข้อมูล session ของ user ที่ login อยู่
      const session = await getServerSession()
      if (!session?.user?.id) {
        throw new Error('User not authenticated')
      }

      const userId = parseInt(session.user.id)

      // ตรวจสอบว่า user มี character อยู่แล้วหรือไม่
      const existingCharacter = await characterRepository.findByUserId(userId)
      if (existingCharacter) {
        throw new Error('User already has a character')
      }

      const jobClassId = payload.jobClassId

      // ดึงข้อมูล job class และ first job level
      const jobClass = await jobClassRepository.findById(jobClassId)
      if (!jobClass || jobClass.levels.length === 0) {
        throw new Error('Invalid job class')
      }

      const firstJobLevel = jobClass.levels[0]

      // ดึงข้อมูลจาก session ถ้ามี (ข้อมูลที่เก็บไว้จากการ generate)
      let originalFaceImage = payload.originalFaceImage
      let personaTraits = this.generatePersonaTraits(jobClass.name)

      if (global.characterGenerationSessions && payload.sessionId) {
        const sessionData =
          global.characterGenerationSessions[payload.sessionId]
        if (sessionData) {
          originalFaceImage = sessionData.originalFaceImage || originalFaceImage
          personaTraits = sessionData.personaTraits || personaTraits

          // ลบ session หลังจากใช้แล้ว
          delete global.characterGenerationSessions[payload.sessionId]
        }
      }

      // สร้าง character ให้ user ที่ login อยู่
      const character = await this.createCharacter({
        userId: userId,
        name: payload.name,
        jobClassId: payload.jobClassId,
        jobLevelId: firstJobLevel.id,
        portraitUrl: payload.portraitUrl,
        originalFaceImage,
        personaTraits,
      })

      // สร้าง user token ถ้ายังไม่มี
      const existingUserToken = await characterRepository.findUserToken(userId)
      if (!existingUserToken) {
        await prisma.userToken.create({
          data: {
            userId: userId,
            currentTokens: 0,
            totalEarnedTokens: 0,
            totalSpentTokens: 0,
          },
        })
      }

      // สร้าง quest streak ถ้ายังไม่มี
      const existingQuestStreak = await prisma.questStreak.findUnique({
        where: { userId: userId },
      })
      if (!existingQuestStreak) {
        await prisma.questStreak.create({
          data: {
            userId: userId,
            currentStreak: 0,
            longestStreak: 0,
          },
        })
      }

      // สร้าง welcome feed item
      await characterRepository.createFeedItem({
        content: `🎉 ยินดีต้อนรับ ${character.name} สู่โลกแห่งการผจญภัย! เริ่มต้นเส้นทาง${jobClass.name}ของคุณได้เลย`,
        type: 'character_created',
        mediaType: 'text',
        userId: userId,
      })

      return {
        success: true,
        character,
        userId: userId,
        message: 'Character created successfully',
      }
    } catch (error) {
      console.error(
        '[CharacterService] Confirm character creation error:',
        error
      )
      throw error
    }
  }

  /**
   * Add XP to character and handle level up
   */
  async addXPToCharacter(
    characterId: number,
    xpToAdd: number
  ): Promise<{
    leveledUp: boolean
    newLevel?: number
    currentXP: number
    nextLevelXP: number
  }> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    })

    if (!character) {
      throw new Error('Character not found')
    }

    let currentXP = character.currentXP + xpToAdd
    let totalXP = character.totalXP + xpToAdd
    let level = character.level
    let leveledUp = false

    // Check for level up
    while (currentXP >= character.nextLevelXP) {
      currentXP -= character.nextLevelXP
      level++
      leveledUp = true
    }

    const nextLevelXP = this.calculateXPForLevel(level + 1)

    // Update character
    await prisma.character.update({
      where: { id: characterId },
      data: {
        level,
        currentXP,
        nextLevelXP,
        totalXP,
      },
    })

    return {
      leveledUp,
      newLevel: leveledUp ? level : undefined,
      currentXP,
      nextLevelXP,
    }
  }

  private generatePersonaTraits(jobClassName: string): string {
    const traits: Record<string, string> = {
      นักการตลาด:
        'bright confident eyes, styled hair, charismatic smile, and energetic posture',
      นักบัญชี:
        'focused eyes behind glasses, neat hair, serious expression, and organized appearance',
      นักขาย:
        'friendly eyes, approachable smile, neat appearance, and persuasive charm',
      ดีไซน์เนอร์:
        'creative eyes, artistic hairstyle, unique fashion sense, and innovative aura',
      โปรแกรมเมอร์:
        'intelligent eyes, casual hair, focused expression, and tech-savvy appearance',
      ช่าง: 'practical eyes, short hair, determined face, and strong build',
    }

    return (
      traits[jobClassName] || 'professional appearance with confident demeanor'
    )
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
