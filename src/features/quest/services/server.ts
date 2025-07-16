// src/features/quest/services/server.ts
import { characterRepository } from '@src/features/character/repository'
import { characterService } from '@src/features/character/services/server'
import { storyService } from '@src/features/feed/services/server'
import { tokenCalculationService } from '@src/features/token/services/tokenCalculationService'
import { getServerSession } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { openaiService } from '@src/lib/services/openaiService'
import { s3UploadService } from '@src/lib/services/s3UploadService'
import { BaseService } from '@src/lib/services/server/baseService'
import { videoConversionService } from '@src/lib/services/videoConversionService'
import { videoThumbnailService } from '@src/lib/services/videoThumbnailService'
import OpenAI from 'openai'

import {
  QuestRepository,
  QuestSubmissionRepository,
  assignedQuestRepository,
  questRepository,
  questSubmissionRepository,
} from '../repository'
import { Quest, QuestDifficulty, QuestListResponse, QuestType } from '../types'
import { OpenAIPrompt } from '../types/index'

export class QuestService extends BaseService {
  private static instance: QuestService
  private questRepository: QuestRepository

  constructor() {
    super()
    this.questRepository = questRepository
  }

  public static getInstance() {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService()
    }

    return QuestService.instance
  }

  // แปลงระดับความยากเป็น difficulty type
  private mapDifficultyLevel(level: number): QuestDifficulty {
    if (level <= 2) return 'easy'
    if (level <= 4) return 'medium'
    return 'hard'
  }

  // แปลง quest type string เป็น QuestType
  private mapQuestType(type: string): QuestType {
    switch (type.toLowerCase()) {
      case 'daily':
        return 'daily'
      case 'weekly':
        return 'weekly'
      default:
        return 'no-deadline'
    }
  }

  // คำนวณ deadline จาก assignedAt และ quest type
  private calculateDeadline(
    assignedAt: Date,
    questType: string,
    expiresAt: Date | null
  ): Date | null {
    if (expiresAt) {
      return expiresAt
    }

    const deadline = new Date(assignedAt)

    switch (questType.toLowerCase()) {
      case 'daily':
        deadline.setDate(deadline.getDate() + 1)
        return deadline
      case 'weekly':
        deadline.setDate(deadline.getDate() + 7)
        return deadline
      default:
        return null // ไม่มีกำหนดเวลา
    }
  }

  // ตรวจสอบว่า quest อยู่ในช่วงเวลาที่กำหนดหรือไม่
  private isQuestInTimeRange(
    questType: string,
    assignedAt: Date,
    expiresAt: Date | null
  ): boolean {
    const now = new Date()
    const assignedDate = new Date(assignedAt)

    // ถ้ามีการกำหนด expiresAt และเลยเวลาหมดอายุแล้ว ให้ถือว่าไม่อยู่ในช่วงเวลาที่กำหนด
    if (expiresAt && now > new Date(expiresAt)) {
      return false
    }

    switch (questType.toLowerCase()) {
      case 'daily':
        // ตรวจสอบว่าอยู่ในวันเดียวกันหรือไม่
        return assignedDate.toDateString() === now.toDateString()
      case 'weekly':
        // ตรวจสอบว่าอยู่ในสัปดาห์เดียวกันหรือไม่
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay()) // เริ่มต้นสัปดาห์ (วันอาทิตย์)
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        return assignedDate >= startOfWeek && assignedDate <= endOfWeek
      default:
        return true // ภารกิจทั่วไปแสดงเสมอ
    }
  }

  // ดึงภารกิจสำหรับ user
  async getQuestsForUser(): Promise<QuestListResponse> {
    const session = await getServerSession()
    const userId = +session.user.id

    try {
      // ดึงข้อมูล character ของ user
      const character = await questRepository.getCharacterByUserId(userId)
      if (!character) throw new Error('Character not found for this user')

      // ดึงภารกิจที่ได้รับมอบหมาย (ทั้ง active และ completed)
      const assignedQuests =
        await questRepository.getAssignedQuestsByCharacterId(character.id)

      // ตรวจสอบเควสที่หมดอายุและจัดการตามประเภท
      await this.handleExpiredQuests(character.id, userId, assignedQuests)

      // หลังจากอัปเดตเควสที่หมดอายุแล้ว ดึงข้อมูลเควสอีกครั้ง
      const updatedAssignedQuests =
        await questRepository.getAssignedQuestsByCharacterId(character.id)

      // ตรวจสอบว่ามีเควสหรือไม่ ถ้าไม่มีให้สุ่มเควสและมอบหมายให้
      if (updatedAssignedQuests.length === 0) {
        console.log('No quests assigned. Assigning initial quests...')
        await this.assignInitialQuestsForNewUser(character.id, userId)

        // ดึงภารกิจที่เพิ่งมอบหมายใหม่อีกครั้ง
        const newAssignedQuests =
          await questRepository.getAssignedQuestsByCharacterId(character.id)

        return this.processQuestData(newAssignedQuests, character.id)
      }

      // ตรวจสอบว่ามีเควสรายวันอยู่ในวันนี้หรือไม่
      const hasDailyQuestToday = this.hasDailyQuestForToday(
        updatedAssignedQuests
      )

      // ถ้าไม่มีเควสรายวันในวันนี้ ให้มอบหมายเควสรายวันใหม่
      if (!hasDailyQuestToday) {
        console.log('No daily quests for today. Assigning new daily quests...')

        await this.assignNewDailyQuests(character.id, userId)
      } else {
        console.log(
          'Daily quests for today already exist. Not assigning new ones.'
        )
      }

      // ตรวจสอบเควสรายสัปดาห์
      await this.checkAndAssignWeeklyQuests(
        character.id,
        userId,
        updatedAssignedQuests
      )

      // ดึงภารกิจอีกครั้งหลังมอบหมายเควสใหม่ (ถ้ามี)
      const finalAssignedQuests =
        await questRepository.getAssignedQuestsByCharacterId(character.id)

      return this.processQuestData(finalAssignedQuests, character.id)
    } catch (error) {
      console.error('Error in getQuestsForUser:', error)
      throw new Error('Failed to fetch quests for user')
    }
  }
  // ตรวจสอบว่ามีเควสรายวันสำหรับวันนี้หรือไม่
  private hasDailyQuestForToday(assignedQuests: any[]): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // เริ่มต้นวันนี้

    // กรองเควสที่เป็นรายวัน และ:
    // 1. มีสถานะเป็น active หรือ completed
    // 2. ถูกมอบหมายในวันนี้หรือยังไม่หมดอายุ
    const dailyQuestsForToday = assignedQuests.filter((aq) => {
      // ตรวจสอบว่าเป็นเควสรายวันหรือไม่
      if (aq.quest.type !== 'daily') return false

      // ตรวจสอบสถานะของเควส (active หรือ completed)
      if (aq.status !== 'active' && aq.status !== 'completed') return false

      // ตรวจสอบว่าเควสนี้ถูกมอบหมายในวันนี้หรือไม่
      const assignedDate = new Date(aq.assignedAt)
      assignedDate.setHours(0, 0, 0, 0)

      // หรือเควสยังไม่หมดอายุ (expiresAt ยังไม่ถึงหรือยังเป็นวันเดียวกัน)
      if (aq.expiresAt) {
        const expiryDate = new Date(aq.expiresAt)
        expiryDate.setHours(0, 0, 0, 0)

        // ถ้าวันหมดอายุยังไม่ถึงหรือเป็นวันนี้ และเควสถูกมอบหมายวันนี้ด้วย
        return (
          expiryDate.getTime() >= today.getTime() &&
          assignedDate.getTime() === today.getTime()
        )
      }

      // กรณีไม่มีวันหมดอายุ ให้ตรวจสอบเฉพาะวันที่มอบหมาย
      return assignedDate.getTime() === today.getTime()
    })

    console.log(`Found ${dailyQuestsForToday.length} daily quests for today`)
    return dailyQuestsForToday.length > 0
  }

  // จัดการกับเควสที่หมดอายุ
  private async handleExpiredQuests(
    characterId: number,
    userId: number,
    assignedQuests: any[]
  ): Promise<void> {
    const now = new Date()
    const expiredQuests = assignedQuests.filter((aq) => {
      return (
        aq.status === 'active' && aq.expiresAt && new Date(aq.expiresAt) < now
      )
    })

    if (expiredQuests.length === 0) return

    console.log(
      `Found ${expiredQuests.length} expired quests for user ${userId}`
    )

    // อัปเดตสถานะเควสที่หมดอายุเป็น 'expired'
    const updatePromises = expiredQuests.map((aq) => {
      return prisma.assignedQuest.update({
        where: { id: aq.id },
        data: { status: 'expired' },
      })
    })

    await Promise.all(updatePromises)
    console.log(`Updated ${expiredQuests.length} quests to expired status`)
  }

  // มอบหมายเควสรายวันใหม่
  private async assignNewDailyQuests(
    characterId: number,
    userId: number
  ): Promise<void> {
    try {
      // ดึงข้อมูล character เพื่อตรวจสอบ level
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { level: true },
      })

      if (!character) {
        console.log('Character not found')
        return
      }

      let dailyQuests: any[] = []

      // ตรวจสอบ level
      if (character.level >= 10) {
        // สำหรับ level 10+ ใช้ personal quests
        const personalQuests = await prisma.quest.findMany({
          where: {
            characterId: characterId,
            type: 'daily',
            isActive: true,
          } as any,
        })

        if (personalQuests.length > 0) {
          // สุ่มเลือก personal quests
          const shuffled = [...personalQuests].sort(() => 0.5 - Math.random())
          dailyQuests = shuffled.slice(0, Math.min(5, personalQuests.length))
          console.log(
            `Using ${dailyQuests.length} personal daily quests for level ${character.level} character`
          )
        } else {
          // ถ้าไม่มี personal quests ให้ใช้ระบบเดิม
          console.log('No personal quests found, falling back to random quests')
          dailyQuests = await this.getRandomQuestsByType('daily', 5)
        }
      } else {
        // สำหรับ level < 10 ใช้ระบบเดิม
        dailyQuests = await this.getRandomQuestsByType('daily', 3)

        if (dailyQuests.length === 0) {
          console.log('No daily quests available')
          return
        }

        console.log(
          `Assigning ${dailyQuests.length} new daily quests for user ${userId}`
        )

        // มอบหมายเควสรายวันใหม่
        const assignPromises = dailyQuests.map((quest) => {
          // กำหนด expiresAt (หมดอายุเวลา 23:59:59 ของวันนี้)
          const expiresAt = new Date()
          expiresAt.setHours(23, 59, 59, 999)

          return prisma.assignedQuest.create({
            data: {
              questId: quest.id,
              characterId: characterId,
              status: 'active',
              assignedAt: new Date(),
              expiresAt: expiresAt,
            },
          })
        })

        await Promise.all(assignPromises)
      }

      console.log('New daily quests assigned successfully')
    } catch (error) {
      console.error('Error assigning new daily quests:', error)
      throw new Error('Failed to assign new daily quests')
    }
  }

  // ตรวจสอบว่าเควสรายสัปดาห์สำหรับสัปดาห์นี้มีหรือไม่ และสร้างใหม่ถ้าไม่มี
  private async checkAndAssignWeeklyQuests(
    characterId: number,
    userId: number,
    assignedQuests: any[]
  ): Promise<void> {
    // ดึงเควสที่เป็นรายสัปดาห์และยังไม่หมดอายุ
    const activeWeeklyQuests = assignedQuests.filter((aq) => {
      return (
        aq.quest.type === 'weekly' &&
        aq.status === 'active' &&
        aq.expiresAt &&
        new Date(aq.expiresAt) > new Date()
      )
    })

    // ถ้ามีเควสรายสัปดาห์อยู่แล้ว ไม่ต้องทำอะไร
    if (activeWeeklyQuests.length > 0) return

    // ถ้าไม่มีเควสรายสัปดาห์ ให้มอบหมายเควสรายสัปดาห์ใหม่
    try {
      // ดึงข้อมูล character เพื่อตรวจสอบ level
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { level: true },
      })

      if (!character) {
        console.log('Character not found')
        return
      }

      let weeklyQuests: any[] = []

      // ตรวจสอบ level
      if (character.level >= 10) {
        // สำหรับ level 10+ ใช้ personal quests
        // TODO: หลังจาก run `npx prisma generate` แล้ว สามารถเอา 'as any' ออกได้
        const personalQuests = await prisma.quest.findMany({
          where: {
            characterId: characterId,
            type: 'weekly',
            isActive: true,
          } as any,
        })

        if (personalQuests.length > 0) {
          // สุ่มเลือก personal quests
          const shuffled = [...personalQuests].sort(() => 0.5 - Math.random())
          weeklyQuests = shuffled.slice(0, Math.min(3, personalQuests.length))
          console.log(
            `Using ${weeklyQuests.length} personal weekly quests for level ${character.level} character`
          )
        } else {
          // ถ้าไม่มี personal quests ให้ใช้ระบบเดิม
          console.log(
            'No personal weekly quests found, falling back to random quests'
          )
          weeklyQuests = await this.getRandomQuestsByType('weekly', 3)
        }
      } else {
        // สำหรับ level < 10 ใช้ระบบเดิม
        weeklyQuests = await this.getRandomQuestsByType('weekly', 3)

        if (weeklyQuests.length === 0) {
          console.log('No weekly quests available')
          return
        }

        console.log(
          `Assigning ${weeklyQuests.length} new weekly quests for user ${userId}`
        )

        // มอบหมายเควสรายสัปดาห์ใหม่
        const assignPromises = weeklyQuests.map((quest) => {
          // กำหนด expiresAt (หมดอายุ 7 วันนับจากวันนี้)
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 7)
          expiresAt.setHours(23, 59, 59, 999)

          return prisma.assignedQuest.create({
            data: {
              questId: quest.id,
              characterId: characterId,
              status: 'active',
              assignedAt: new Date(),
              expiresAt: expiresAt,
            },
          })
        })

        await Promise.all(assignPromises)
      }

      console.log('New weekly quests assigned successfully')
    } catch (error) {
      console.error('Error assigning new weekly quests:', error)
      throw new Error('Failed to assign new weekly quests')
    }
  }

  private async assignInitialQuestsForNewUser(
    characterId: number,
    userId: number
  ): Promise<void> {
    try {
      // ดึงข้อมูล character เพื่อตรวจสอบ level
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { level: true },
      })

      if (!character) {
        console.log('Character not found')
        return
      }

      // สำหรับ level 10+ ตรวจสอบว่ามี personal quests หรือยัง
      if (character.level >= 10) {
        // TODO: หลังจาก run `npx prisma generate` แล้ว สามารถเอา 'as any' ออกได้
        const personalQuestCount = await prisma.quest.count({
          where: {
            characterId: characterId,
          } as any,
        })

        if (personalQuestCount === 0) {
          console.log(
            `Level ${character.level} character has no personal quests yet, using standard quests`
          )
        } else {
          // ถ้ามี personal quests แล้ว ให้ใช้ตามปกติ
          await this.assignNewDailyQuests(characterId, userId)
          await this.checkAndAssignWeeklyQuests(characterId, userId, [])
          return
        }
      }

      // สำหรับ level < 10 หรือ level 10+ ที่ยังไม่มี personal quests
      // ดึงเควสรายวัน 3 อัน
      const dailyQuests = await this.getRandomQuestsByType('daily', 3)

      // ดึงเควสรายสัปดาห์ 3 อัน
      const weeklyQuests = await this.getRandomQuestsByType('weekly', 3)

      // ดึงเควสทั่วไป 3 อัน
      const generalQuests = await this.getRandomQuestsByType('special', 3)

      // รวมเควสทั้งหมด
      const allQuests = [...dailyQuests, ...weeklyQuests, ...generalQuests]

      console.log(
        `Assigning ${allQuests.length} initial quests for user ${userId}, character ${characterId}`
      )

      // มอบหมายเควสทั้งหมดให้ character
      const assignPromises = allQuests.map((quest) => {
        // กำหนด expiresAt ตามประเภทเควส
        let expiresAt = null
        if (quest.type === 'daily') {
          expiresAt = new Date()
          expiresAt.setHours(23, 59, 59, 999) // หมดอายุในวันนี้เวลา 23:59:59
        } else if (quest.type === 'weekly') {
          expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 7) // หมดอายุใน 7 วัน
          expiresAt.setHours(23, 59, 59, 999)
        }

        // บันทึกลงในตาราง AssignedQuest
        return prisma.assignedQuest.create({
          data: {
            questId: quest.id,
            characterId: characterId,
            status: 'active',
            assignedAt: new Date(),
            expiresAt: expiresAt,
          },
        })
      })

      await Promise.all(assignPromises)
      console.log('Initial quests assigned successfully')
    } catch (error) {
      console.error('Error assigning initial quests:', error)
      throw new Error('Failed to assign initial quests')
    }
  }

  /**
   * ดึงเควสแบบสุ่มตามประเภทที่กำหนด
   */
  private async getRandomQuestsByType(type: string, count: number) {
    try {
      // ดึงเควสทั้งหมดตามประเภท
      const quests = await prisma.quest.findMany({
        where: {
          type: type,
          isActive: true,
        },
      })

      // สุ่มเลือกเควสตามจำนวนที่กำหนด
      const shuffled = [...quests].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, Math.min(count, quests.length))
    } catch (error) {
      console.error(`Error fetching ${type} quests:`, error)
      return [] // ส่งค่า array ว่างถ้าเกิดข้อผิดพลาด
    }
  }

  /**
   * ประมวลผลข้อมูลเควสเพื่อส่งกลับไปยังผู้ใช้
   */
  // src/features/quest/services/server.ts

  // แก้ไขเมธอด processQuestData
  private async processQuestData(
    assignedQuests: any[],
    characterId: number
  ): Promise<QuestListResponse> {
    // ดึงภารกิจที่เสร็จสิ้นแล้ว (สำหรับ tab completed)
    const completedQuests =
      await questRepository.getCompletedQuestsByCharacterId(characterId)

    const today = new Date()
    today.setHours(0, 0, 0, 0) // เริ่มต้นวันนี้

    // แปลงข้อมูล assigned quests เป็น Quest objects
    const activeQuests: Quest[] = assignedQuests
      .filter((assignedQuest) => {
        // แสดงภารกิจที่:
        // 1. มีสถานะเป็น active หรือ completed และยังไม่หมดอายุ
        // 2. สำหรับเควสรายวัน ให้แสดงเฉพาะเควสของวันนี้เท่านั้น

        if (
          assignedQuest.status !== 'active' &&
          assignedQuest.status !== 'completed'
        ) {
          return false
        }

        // ตรวจสอบว่าเควสหมดอายุหรือยัง
        if (
          assignedQuest.expiresAt &&
          new Date(assignedQuest.expiresAt) < new Date()
        ) {
          return false
        }

        // สำหรับเควสรายวัน ให้แสดงเฉพาะเควสของวันนี้
        if (assignedQuest.quest.type === 'daily') {
          const assignedDate = new Date(assignedQuest.assignedAt)
          assignedDate.setHours(0, 0, 0, 0)
          return assignedDate.getTime() === today.getTime()
        }

        // สำหรับเควสประเภทอื่น แสดงตามปกติ
        return true
      })
      .map((assignedQuest) => {
        const quest = assignedQuest.quest
        const deadline = this.calculateDeadline(
          assignedQuest.assignedAt,
          quest.type,
          assignedQuest.expiresAt
        )

        // ตรวจสอบว่าเควสนี้มี submission หรือไม่
        const hasSubmission =
          Array.isArray(assignedQuest.questSubmissions) &&
          assignedQuest.questSubmissions.length > 0

        // ถ้ามี submission แล้ว ให้ถือว่าเควสนี้ completed ไม่ว่า status จะเป็นอะไร
        const isCompleted =
          hasSubmission || assignedQuest.status === 'completed'

        return {
          id: quest.id.toString(),
          title: quest.title,
          description: quest.description,
          type: this.mapQuestType(quest.type),
          difficulty: this.mapDifficultyLevel(quest.difficultyLevel),
          rewards: {
            xp: quest.xpReward,
            tokens: quest.baseTokenReward,
          },
          deadline,
          completed: isCompleted,
          status: isCompleted ? 'completed' : (assignedQuest.status as any),
          imageUrl: quest.imageUrl || undefined,
          isActive: quest.isActive,
          createdAt: quest.createdAt,
          updatedAt: quest.updatedAt,
          assignedQuestId: assignedQuest.id,
        }
      })

    return {
      activeQuests,
      completedQuests,
    }
  }

  // ดึงรายละเอียดภารกิจเดียว
  async getQuestById(questId: string, userId: number): Promise<Quest | null> {
    try {
      const character = await questRepository.getCharacterByUserId(userId)

      if (!character) {
        return null
      }

      const assignedQuests =
        await questRepository.getAssignedQuestsByCharacterId(character.id)
      const assignedQuest = assignedQuests.find(
        (aq) => aq.quest.id.toString() === questId
      )

      if (!assignedQuest) {
        return null
      }

      const quest = assignedQuest.quest
      const deadline = this.calculateDeadline(
        assignedQuest.assignedAt,
        quest.type,
        assignedQuest.expiresAt
      )

      return {
        id: quest.id.toString(),
        title: quest.title,
        description: quest.description || '',
        type: this.mapQuestType(quest.type),
        difficulty: this.mapDifficultyLevel(quest.difficultyLevel),
        rewards: {
          xp: quest.xpReward,
          tokens: quest.baseTokenReward,
        },
        deadline,
        completed: assignedQuest.status === 'completed',
        status: assignedQuest.status as any,
        imageUrl: quest.imageUrl || undefined,
        isActive: quest.isActive,
        createdAt: quest.createdAt,
        updatedAt: quest.updatedAt,
      }
    } catch (error) {
      console.error('Error in getQuestById:', error)
      throw new Error('Failed to fetch quest details')
    }
  }
}
export const questService = QuestService.getInstance()

export class QuestSubmissionService extends BaseService {
  private static instance: QuestSubmissionService
  private questSubmissionRepository: QuestSubmissionRepository

  constructor() {
    super()
    this.questSubmissionRepository = questSubmissionRepository
  }

  public static getInstance() {
    if (!QuestSubmissionService.instance) {
      QuestSubmissionService.instance = new QuestSubmissionService()
    }

    return QuestSubmissionService.instance
  }

  // ตรวจสอบว่าไฟล์เป็นวิดีโอหรือไม่
  private isVideoFile(file: File): boolean {
    return (
      file.type.startsWith('video/') ||
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.mov') ||
      file.name.toLowerCase().endsWith('.avi') ||
      file.name.toLowerCase().endsWith('.mkv')
    )
  }

  // ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
  private isImageFile(file: File): boolean {
    return (
      file.type.startsWith('image/') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg') ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.gif') ||
      file.name.toLowerCase().endsWith('.webp')
    )
  }

  // กำหนดประเภทของสื่อ
  private getMediaType(file: File): 'image' | 'video' | 'text' {
    if (this.isImageFile(file)) return 'image'
    if (this.isVideoFile(file)) return 'video'
    return 'text'
  }

  async submitQuest(
    questId: number,
    characterId: number,
    mediaFile?: File,
    description?: string
  ) {
    try {
      // 1. ดึงข้อมูล quest และ character
      const { quest, character } =
        await questSubmissionRepository.getQuestAndCharacter(
          questId,
          characterId
        )
      if (!quest || !character) throw new Error('Quest or character not found')

      // 2. ตรวจสอบว่ามี active assigned quest หรือไม่
      const assignedQuest = await prisma.assignedQuest.findFirst({
        where: {
          questId,
          characterId,
          status: 'active',
        },
        orderBy: {
          assignedAt: 'desc',
        },
      })

      if (!assignedQuest)
        throw new Error('No active assigned quest found for this user')

      // 2.1 ตรวจสอบและแปลงไฟล์วิดีโอ MOV เป็น MP4
      let processedMediaFile = mediaFile

      if (mediaFile) {
        const fileExtension = mediaFile.name.split('.').pop()?.toLowerCase()
        console.log(fileExtension)
        // ถ้าเป็นไฟล์ .mov ให้แปลงเป็น .mp4
        if (fileExtension === 'mov') {
          console.log('Detected MOV file, converting to MP4...')
          try {
            processedMediaFile =
              await videoConversionService.convertMovToMp4(mediaFile)
            console.log('MOV to MP4 conversion completed')
          } catch (conversionError) {
            console.error('Failed to convert MOV to MP4:', conversionError)
            throw new Error('Failed to convert video format')
          }
        }
      }

      // 2.2 อัพโหลดไฟล์ไป S3
      let mediaUrl: string | undefined
      let mediaType: 'image' | 'video' | 'text' = 'text'
      let thumbnailUrl: string | undefined

      if (processedMediaFile) {
        const uploadResult =
          await s3UploadService.uploadFile(processedMediaFile)

        if (!uploadResult.success)
          throw new Error('Failed to upload media file')

        mediaUrl = uploadResult.url
        mediaType = this.getMediaType(processedMediaFile)

        // ถ้าเป็นวิดีโอ ให้สร้าง thumbnail
        if (mediaType === 'video') {
          try {
            thumbnailUrl =
              await videoThumbnailService.generateAndUploadThumbnail(
                processedMediaFile
              )
            console.log('Generated video thumbnail:', thumbnailUrl)
          } catch (thumbnailError) {
            console.error('Failed to generate thumbnail:', thumbnailError)
          }
        }
      }

      // 3. วิเคราะห์สื่อ (วิดีโอหรือรูปภาพ)
      let mediaAnalysis: any = undefined

      if (processedMediaFile && mediaUrl) {
        if (mediaType === 'video') {
          console.log('Analyzing video content...')
          try {
            mediaAnalysis = await openaiService.analyzeVideo(mediaUrl)
            console.log('Video analysis completed:', mediaAnalysis)
          } catch (videoError) {
            console.error('Video analysis failed:', videoError)
          }
        } else if (mediaType === 'image') {
          console.log('Analyzing image content...')
          try {
            mediaAnalysis = await openaiService.analyzeImage(mediaUrl)
            console.log('Image analysis completed:', mediaAnalysis)
          } catch (imageError) {
            console.error('Image analysis failed:', imageError)
          }
        }
      }

      // 4. เตรียมข้อมูลสำหรับ AI analysis
      const aiPrompt: OpenAIPrompt = {
        questTitle: quest.title,
        questDescription: quest.description || '',
        questRequirements: [],
        mediaUrl,
        userDescription: description,
        questXpReward: quest.xpReward,
      }

      // 5. ส่งข้อมูลให้ AI วิเคราะห์
      const aiAnalysis = await openaiService.analyzeQuestSubmission(
        aiPrompt,
        mediaAnalysis
      )

      // 6. คำนวณ Token Reward
      const tokenCalculation =
        await tokenCalculationService.calculateTokenReward({
          quest,
          character,
          aiScore: aiAnalysis.score,
          ratings: aiAnalysis.ratings,
        })
      console.log('Token calculation result:', tokenCalculation)

      // 7. บันทึก quest submission พร้อม token reward
      const finalTokens = Math.floor(tokenCalculation.finalTokens / 10)
      const { submission, userToken } =
        await questSubmissionRepository.createQuestSubmissionWithToken({
          questId,
          questXpEarned: aiAnalysis.xpEarned, //quest.xpReward,
          characterId,
          mediaType,
          mediaUrl,
          description,
          aiAnalysis,
          mediaAnalysis,
          tokenReward: {
            tokensEarned: finalTokens, //tokenCalculation.finalTokens,
            tokenMultiplier:
              tokenCalculation.performanceMultiplier *
              tokenCalculation.characterBoostMultiplier *
              tokenCalculation.eventMultiplier,
            bonusTokens: tokenCalculation.bonusTokens,
          },
        })

      // 8. อัพเดทสถานะ assigned quest
      await questSubmissionRepository.updateAssignedQuestStatus(
        questId,
        characterId
      )

      // 9. อัพเดท character XP
      const characterUpdateResult = await characterService.addXP(
        aiAnalysis.xpEarned
      )

      // 10. อัพเดท Quest Streak
      await tokenCalculationService.updateQuestStreak(character.userId)

      // 11. สร้าง feed item (รวม token ที่ได้)
      const feedContent = `ทำเควส "${quest.title}" สำเร็จและได้รับ ${aiAnalysis.xpEarned} XP และ ${finalTokens} Tokens!`

      const feedItem =
        await questSubmissionRepository.createQuestCompletionFeedItem(
          character.userId,
          'quest_completion',
          submission.mediaRevisedTranscript || feedContent,
          mediaType,
          quest.title,
          aiAnalysis.xpEarned,
          submission.id,
          mediaUrl
        )

      // 12. สร้าง story
      const story = await storyService.createStory({
        userId: character.userId,
        content: feedContent,
        type: mediaType,
        mediaUrl,
        thumbnailUrl,
        text: submission.mediaRevisedTranscript || description,
        expiresInHours: 24,
      })

      let successMessage = `Quest completed! You earned ${aiAnalysis.xpEarned} XP and ${finalTokens} tokens!`

      if (characterUpdateResult.leveledUp) {
        successMessage = `Quest completed! You gained ${characterUpdateResult.levelsGained} level(s), ${aiAnalysis.xpEarned} XP and ${finalTokens} tokens!`
      }

      // เพิ่มข้อมูล bonus ที่ได้รับ
      if (tokenCalculation.appliedBonuses.length > 0) {
        successMessage += ` Bonuses: ${tokenCalculation.appliedBonuses.join(', ')}`
      }

      return {
        success: true,
        message: successMessage,
        aiAnalysis,
        submission,
        mediaType,
        thumbnailUrl,
        characterUpdate: characterUpdateResult,
        feedItem,
        story,
        tokenReward: tokenCalculation,
        userToken: {
          currentTokens: userToken.currentTokens,
          tokensEarned: finalTokens,
        },
      }
    } catch (error) {
      console.error('Quest submission error:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to submit quest'
      )
    }
  }

  async getQuestSubmission(questId: string, characterId: number) {
    try {
      // เพิ่มการตรวจสอบ AssignedQuest ที่เป็นปัจจุบัน
      const assignedQuest = await prisma.assignedQuest.findFirst({
        where: {
          questId: parseInt(questId),
          characterId,
          // อาจเพิ่มเงื่อนไขเวลาตามประเภทของเควส (รายวัน/รายสัปดาห์)
        },
        orderBy: {
          assignedAt: 'desc',
        },
      })

      if (!assignedQuest) return null

      const submission =
        await questSubmissionRepository.getQuestSubmissionByQuestAndCharacter(
          parseInt(questId),
          characterId
        )

      return submission
    } catch (error) {
      console.error('Error in getQuestSubmission:', error)
      throw new Error('Failed to fetch quest submission')
    }
  }

  async updateSubmissionSummary(submissionId: number, newSummary: string) {
    try {
      // 1. อัปเดต quest submission
      const updatedSubmission =
        await questSubmissionRepository.updateSubmissionSummary(
          submissionId,
          newSummary
        )

      if (!updatedSubmission) throw new Error('Submission not found')

      // 2. อัปเดต feed item ที่เกี่ยวข้อง
      await questSubmissionRepository.updateRelatedFeedItem(
        submissionId,
        newSummary
      )

      // 3. ค้นหา story ที่เกี่ยวข้องและอัพเดต (ไม่สร้างใหม่)
      if (updatedSubmission.character && updatedSubmission.character.user) {
        // ค้นหา story ที่เกี่ยวข้องกับ quest submission นี้
        const relatedStory = await prisma.story.findFirst({
          where: {
            userId: updatedSubmission.character.user.id,
            // ค้นหา story ที่สร้างในช่วงเวลาใกล้เคียงกับ submission
            createdAt: {
              gte: new Date(
                updatedSubmission.submittedAt.getTime() - 5 * 60000
              ), // 5 นาทีก่อน submission
              lte: new Date(
                updatedSubmission.submittedAt.getTime() + 5 * 60000
              ), // 5 นาทีหลัง submission
            },
            // ตรวจสอบเนื้อหาที่เกี่ยวข้องกับเควส
            content: {
              contains: updatedSubmission.quest.title,
            },
          },
        })

        if (relatedStory) {
          // อัพเดต story ที่พบ
          await prisma.story.update({
            where: { id: relatedStory.id },
            data: {
              text: newSummary,
              updatedAt: new Date(),
            },
          })
        } else {
          // ถ้าไม่พบ story ที่เกี่ยวข้อง (อาจเกิดจากกรณีที่ story หมดอายุแล้ว)
          // สร้าง story ใหม่
          await storyService.createStory({
            userId: updatedSubmission.character.user.id,
            content: `อัปเดตเควส "${updatedSubmission.quest.title}"`,
            type: updatedSubmission.mediaType as 'text' | 'image' | 'video',
            mediaUrl: updatedSubmission.mediaUrl || undefined,
            text: newSummary,
            expiresInHours: 24, // story หมดอายุใน 24 ชั่วโมง
          })
        }
      }

      return {
        success: true,
        message: 'Summary updated successfully',
        submission: updatedSubmission,
        updatedContent: newSummary,
      }
    } catch (error) {
      console.error('Error updating submission summary:', error)
      throw new Error('Failed to update submission summary')
    }
  }

  async selfSubmitQuest(mediaFile?: File, description?: string) {
    try {
      const session = await getServerSession()
      const userId = +session.user.id

      // 1. ดึงข้อมูล character ของ user
      const character = await characterRepository.findByUserId(userId)
      if (!character) throw new Error('Character not found for this user')

      // 2. ตรวจสอบและแปลงไฟล์วิดีโอ MOV เป็น MP4
      let processedMediaFile = mediaFile

      if (mediaFile) {
        const fileExtension = mediaFile.name.split('.').pop()?.toLowerCase()

        // ถ้าเป็นไฟล์ .mov ให้แปลงเป็น .mp4
        if (fileExtension === 'mov') {
          console.log('Detected MOV file, converting to MP4...')
          try {
            processedMediaFile =
              await videoConversionService.convertMovToMp4(mediaFile)
            console.log('MOV to MP4 conversion completed')
          } catch (conversionError) {
            console.error('Failed to convert MOV to MP4:', conversionError)
            throw new Error('Failed to convert video format')
          }
        }
      }

      // 3. อัพโหลดไฟล์ไป S3
      let mediaUrl: string | undefined
      let mediaType: 'image' | 'video' | 'text' = 'text'
      let thumbnailUrl: string | undefined

      if (processedMediaFile) {
        const uploadResult =
          await s3UploadService.uploadFile(processedMediaFile)

        if (!uploadResult.success)
          throw new Error('Failed to upload media file')

        mediaUrl = uploadResult.url
        mediaType = this.getMediaType(processedMediaFile)

        // ถ้าเป็นวิดีโอ ให้สร้าง thumbnail
        if (mediaType === 'video') {
          try {
            thumbnailUrl =
              await videoThumbnailService.generateAndUploadThumbnail(
                processedMediaFile
              )
            console.log('Generated video thumbnail:', thumbnailUrl)
          } catch (thumbnailError) {
            console.error('Failed to generate thumbnail:', thumbnailError)
          }
        }
      }

      // 4. วิเคราะห์สื่อ (วิดีโอหรือรูปภาพ)
      let mediaAnalysis: any = undefined
      if (processedMediaFile && mediaUrl) {
        if (mediaType === 'video') {
          console.log('Analyzing video content...')
          try {
            mediaAnalysis = await openaiService.analyzeVideo(mediaUrl)
            console.log('Video analysis completed:', mediaAnalysis)
          } catch (videoError) {
            console.error('Video analysis failed:', videoError)
          }
        } else if (mediaType === 'image') {
          console.log('Analyzing image content...')
          try {
            mediaAnalysis = await openaiService.analyzeImage(mediaUrl)
            console.log('Image analysis completed:', mediaAnalysis)
          } catch (imageError) {
            console.error('Image analysis failed:', imageError)
          }
        }
      }

      // 5. ให้ AI วิเคราะห์เพื่อสร้างภารกิจใหม่
      const questInfo = await this.generateQuestFromSubmission(
        description || '',
        mediaAnalysis,
        character.level
      )

      // 6. สร้างเควสใหม่
      const newQuest = await questRepository.create({
        title: questInfo.title,
        description: questInfo.description,
        type: 'self',
        difficultyLevel: questInfo.difficultyLevel,
        xpReward: questInfo.xpReward,
        baseTokenReward: Math.floor(questInfo.xpReward / 100),
        isActive: true,
        jobClassId: character.jobClassId,
      })

      // 7. สร้าง AssignedQuest ให้กับผู้ใช้
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setHours(23, 59, 59, 999) // หมดอายุตอนสิ้นวัน
      const assignedQuest = await assignedQuestRepository.create({
        questId: newQuest.id,
        characterId: character.id,
        assignedAt: now,
        expiresAt: expiresAt,
        status: 'active',
      })

      // 8. เตรียมข้อมูลสำหรับ AI analysis
      const aiPrompt: OpenAIPrompt = {
        questTitle: newQuest.title,
        questDescription: newQuest.description || '',
        questRequirements: [], // อาจเพิ่มข้อกำหนดในอนาคต
        mediaUrl,
        userDescription: description,
      }

      // 9. ส่งข้อมูลให้ AI วิเคราะห์
      const aiAnalysis = await openaiService.analyzeQuestSubmission(
        aiPrompt,
        mediaAnalysis
      )

      // 10. คำนวณ Token Reward
      const tokenCalculation =
        await tokenCalculationService.calculateTokenReward({
          quest: newQuest,
          character,
          aiScore: aiAnalysis.score,
          ratings: aiAnalysis.ratings,
        })

      // 11. บันทึก quest submission พร้อม token
      const { submission, userToken } =
        await questSubmissionRepository.createQuestSubmissionWithToken({
          questId: newQuest.id,
          questXpEarned: newQuest.xpReward,
          characterId: character.id,
          mediaType,
          mediaUrl,
          description,
          aiAnalysis,
          mediaAnalysis,
          tokenReward: {
            tokensEarned: tokenCalculation.finalTokens,
            tokenMultiplier:
              tokenCalculation.performanceMultiplier *
              tokenCalculation.characterBoostMultiplier *
              tokenCalculation.eventMultiplier,
            bonusTokens: tokenCalculation.bonusTokens,
          },
        })

      // 12. อัพเดทสถานะ assigned quest
      await questSubmissionRepository.updateAssignedQuestStatus(
        newQuest.id,
        character.id
      )

      // 13. อัพเดท character XP
      const characterUpdateResult = await characterService.addXP(
        newQuest.xpReward
      )

      // 14. อัพเดท Quest Streak
      await tokenCalculationService.updateQuestStreak(character.userId)

      // 15. สร้าง feed item
      const feedItem =
        await questSubmissionRepository.createQuestCompletionFeedItem(
          character.userId,
          'quest_completion',
          submission.mediaRevisedTranscript,
          mediaType,
          newQuest.title,
          newQuest.xpReward,
          submission.id,
          mediaUrl
        )

      // 16. สร้าง story
      const story = await storyService.createStory({
        userId: character.userId,
        content: `ทำเควส "${newQuest.title}" สำเร็จ`,
        type: mediaType,
        mediaUrl,
        thumbnailUrl,
        text: submission.mediaRevisedTranscript || description,
        expiresInHours: 24,
      })

      let successMessage = `Quest created and completed! You earned ${newQuest.xpReward} XP and ${tokenCalculation.finalTokens} tokens!`

      if (tokenCalculation.appliedBonuses.length > 0) {
        successMessage += ` Bonuses: ${tokenCalculation.appliedBonuses.join(', ')}`
      }

      return {
        success: true,
        message: successMessage,
        quest: newQuest,
        submission,
        characterUpdate: characterUpdateResult,
        feedItem,
        story,
        tokenReward: tokenCalculation,
        userToken: {
          currentTokens: userToken.currentTokens,
          tokensEarned: tokenCalculation.finalTokens,
        },
      }
    } catch (error) {
      console.error('Self-submit quest error:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to process quest submission'
      )
    }
  }

  private async generateQuestFromSubmission(
    description: string,
    mediaAnalysis: any,
    characterLevel: number
  ) {
    try {
      // สร้าง prompt สำหรับ OpenAI
      const prompt = `
        ผู้ใช้ได้ส่งหลักฐานการทำงานหรือความสำเร็จ ช่วยสร้างภารกิจที่เหมาะสมกับสิ่งที่ผู้ใช้ทำ
        
        ${description ? `คำอธิบายของผู้ใช้: ${description}` : ''}
        
        ${
          mediaAnalysis
            ? `การวิเคราะห์สื่อ:
          ${mediaAnalysis.summary ? `สรุป: ${mediaAnalysis.summary}` : ''}
          ${mediaAnalysis.description ? `รายละเอียด: ${mediaAnalysis.description}` : ''}
          ${mediaAnalysis.actions ? `การกระทำ: ${mediaAnalysis.actions.join(', ')}` : ''}
          ${mediaAnalysis.keyPoints ? `จุดสำคัญ: ${mediaAnalysis.keyPoints.join(', ')}` : ''}
        `
            : ''
        }
        
        ระดับของตัวละคร: ${characterLevel}
        
        ตอบกลับในรูปแบบ JSON ภาษาไทย:
        {
          "title": "ชื่อภารกิจที่สั้นและกระชับ",
          "description": "คำอธิบายภารกิจโดยละเอียดที่สอดคล้องกับสิ่งที่ผู้ใช้ทำ",
          "difficultyLevel": 3, // 1-5 โดย 1 = ง่ายมาก, 5 = ยากมาก
          "xpReward": [คำนวณจากระดับความยาก: ถ้ายากมากให้ใกล้ 500, ถ้าง่ายให้ใกล้ 100]
        }
      `
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'คุณเป็น AI ที่ช่วยสร้างภารกิจสำหรับแอปจำลองเกม RPG ที่ช่วยเพิ่มประสิทธิภาพการทำงาน',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      const result = completion.choices[0]?.message?.content

      if (!result) throw new Error('No response from OpenAI')

      const questInfo = JSON.parse(result)

      return {
        title: questInfo.title,
        description: questInfo.description,
        difficultyLevel: Math.min(Math.max(questInfo.difficultyLevel, 1), 5), // ระหว่าง 1-5
        xpReward: Math.min(Math.max(questInfo.xpReward, 100), 500), // ระหว่าง 100-1500
      }
    } catch (error) {
      console.error('Error generating quest from submission:', error)

      // Fallback หากไม่สามารถสร้างเควสได้
      return {
        title: description
          ? `บันทึกความสำเร็จ: ${description.substring(0, 30)}...`
          : 'บันทึกความสำเร็จใหม่',
        description:
          description || 'ผู้ใช้ได้บันทึกความสำเร็จและส่งหลักฐานการทำงาน',
        difficultyLevel: 0,
        xpReward: 0, // เพิ่ม XP ตามเลเวล
      }
    }
  }
}

export const questSubmissionService = new QuestSubmissionService()
