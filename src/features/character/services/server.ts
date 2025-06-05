import { userService } from '@src/features/user/services/server'
import { getServerSession } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { replicateService } from '@src/lib/services/replicateService'
import { BaseService } from '@src/lib/services/server/baseService'
import bcrypt from 'bcrypt'
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
import { openAIVisionService } from './openaiVisionService'
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
   * Calculate XP required for a specific level
   * Formula: baseXP * level^rate
   */
  private calculateXPForLevel(level: number): number {
    const baseXP = 50
    const rate = 1.45
    return Math.floor(baseXP * Math.pow(level, rate))
  }

  /**
   * Create a new character
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

    // เตรียม generatedPortraits โดยใช้รูปเดียวกันสำหรับทุก level
    const bucket = process.env.DO_SPACES_BUCKET
    const region = process.env.DO_SPACES_REGION
    const baseUrl = `https://${bucket}.${region}.digitaloceanspaces.com`
    const generatedPortraits: Record<string, string> = {
      '1': portraitUrl,
      '10': `${baseUrl}/10.png`,
      '35': `${baseUrl}/35.png`,
      '60': `${baseUrl}/60.png`,
      '80': `${baseUrl}/80.png`,
      '99': `${baseUrl}/99.png`,
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
        statAGI: 0,
        statSTR: 0,
        statDEX: 0,
        statVIT: 0,
        statINT: 0,
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

    console.log(`[Server] levelUp To Character with ID: ${userId}`)

    const userCharacter = await characterRepository.findByUserId(userId)
    if (!userCharacter) throw new Error('User Character not found')
    const characterId = userCharacter.id

    const character =
      await characterRepository.findByIdWithJobLevels(characterId)
    if (!character) throw new Error('Character not found')

    const oldLevel = character.level
    const newLevel = character.level + 1

    // เรียกใช้ฟังก์ชัน processLevelUp พร้อมอัพเดท level
    const levelService = new CharacterLevelService()

    // เรียกใช้ processLevelUp
    const result = await levelService.processLevelUp(
      characterId,
      oldLevel,
      newLevel,
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
   * Generate character portraits using AI
   */
  async generateCharacterPortraits(
    jobClassId: number,
    name: string,
    portraitType: 'upload' | 'generate',
    faceImageUrl?: string
  ): Promise<CharacterGenerateResponse> {
    // ดึงข้อมูล job class และ levels
    const jobClass = await jobClassRepository.findById(jobClassId)
    if (!jobClass) throw new Error('Job class not found')

    let portraits: GeneratedPortrait[] = []
    let personaTraits: string = this.generatePersonaTraits(jobClass.name)

    // ถ้ามีการ upload รูป ให้วิเคราะห์ด้วย OpenAI Vision
    if (portraitType === 'upload' && faceImageUrl) {
      console.log(
        '[CharacterService] Analyzing uploaded image with OpenAI Vision...'
      )
      const analysis =
        await openAIVisionService.analyzePersonaTraits(faceImageUrl)
      if (analysis) {
        personaTraits = analysis.fullDescription
        console.log('[CharacterService] Persona traits:', personaTraits)
      }
    }

    if (portraitType === 'generate') {
      // ใช้ AI สร้างภาพ (แค่ level 1)
      portraits = await replicateService.generatePortraits(
        jobClass.name,
        jobClass.levels[0],
        undefined,
        personaTraits
      )
    } else if (portraitType === 'upload' && faceImageUrl) {
      // ใช้ภาพที่ upload มาเป็น reference
      portraits = await replicateService.generatePortraits(
        jobClass.name,
        jobClass.levels[0],
        faceImageUrl,
        personaTraits
      )
    }

    // สร้าง session ID สำหรับเก็บข้อมูลชั่วคราว
    const sessionId = `char_gen_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // เก็บข้อมูลใน cache หรือ session storage
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

    // ลบ session เก่าที่หมดอายุ (มากกว่า 1 ชั่วโมง)
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
  }

  /**
   * Confirm and create character
   */
  async confirmCharacterCreation(
    payload: CharacterConfirmPayload
  ): Promise<CharacterConfirmResponse> {
    const jobClassId = payload.jobClassId

    // ดึงข้อมูล job class และ first job level
    const jobClass = await jobClassRepository.findById(jobClassId)
    if (!jobClass || jobClass.levels.length === 0)
      throw new Error('Invalid job class')

    const firstJobLevel = jobClass.levels[0]

    // สร้าง user ใหม่
    const rawPassword = Math.random().toString(36).substring(2, 15)
    const hashedPassword = await bcrypt.hash(rawPassword, 10)
    const username =
      payload.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()

    const newUser = await prisma.user.create({
      data: {
        email: `${username}@test.com`,
        username,
        password: hashedPassword,
        name: payload.name,
        avatar: payload.portraitUrl,
        level: 1,
        xp: 0,
      },
    })

    // ดึงข้อมูลจาก session ถ้ามี
    let originalFaceImage = payload.originalFaceImage
    let personaTraits = this.generatePersonaTraits(jobClass.name)

    if (global.characterGenerationSessions) {
      const sessions = Object.values(global.characterGenerationSessions)
      const recentSession = sessions.find(
        (s: any) =>
          s.name === payload.name && s.jobClassId === payload.jobClassId
      )
      if (recentSession) {
        originalFaceImage = recentSession.originalFaceImage || originalFaceImage
        personaTraits = recentSession.personaTraits || personaTraits
      }
    }

    // สร้าง character
    const character = await this.createCharacter({
      userId: newUser.id,
      name: payload.name,
      jobClassId: payload.jobClassId,
      jobLevelId: firstJobLevel.id,
      portraitUrl: payload.portraitUrl,
      originalFaceImage,
      personaTraits,
    })

    // สร้าง user token
    await prisma.userToken.create({
      data: {
        userId: newUser.id,
        currentTokens: 0,
        totalEarnedTokens: 0,
        totalSpentTokens: 0,
      },
    })

    // สร้าง quest streak
    await prisma.questStreak.create({
      data: {
        userId: newUser.id,
        currentStreak: 0,
        longestStreak: 0,
      },
    })

    return {
      success: true,
      character,
      userId: newUser.id,
      message: 'Character created successfully',
      credentials: { username, password: rawPassword },
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
