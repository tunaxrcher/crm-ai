// src/features/quest/service/server.ts
import { characterService } from '@src/features/character/service/server'
import { getServerSession } from '@src/lib/auth'
import { openaiService } from '@src/lib/service/openaiService'
import { s3UploadService } from '@src/lib/service/s3UploadService'
import { BaseService } from '@src/lib/service/server/baseService'

// เพิ่มบรรทัดนี้

import {
  QuestRepository,
  QuestSubmissionRepository,
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
  private isQuestInTimeRange(questType: string, assignedAt: Date): boolean {
    const now = new Date()
    const assignedDate = new Date(assignedAt)

    console.log(now)

    switch (questType.toLowerCase()) {
      case 'daily':
        // ตรวจสอบว่าอยู่ในวันเดียวกันหรือไม่
        console.log(now.toDateString())
        console.log(assignedDate.toDateString())
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

      if (!character) {
        throw new Error('Character not found for this user')
      }

      // ดึงภารกิจที่ได้รับมอบหมาย (ทั้ง active และ completed)
      const assignedQuests =
        await questRepository.getAssignedQuestsByCharacterId(character.id)

      // ดึงภารกิจที่เสร็จสิ้นแล้ว (สำหรับ tab completed)
      const completedQuests =
        await questRepository.getCompletedQuestsByCharacterId(character.id)

      // แปลงข้อมูล assigned quests เป็น Quest objects
      const activeQuests: Quest[] = assignedQuests
        .filter((assignedQuest) => {
          // แสดงภารกิจที่:
          // 1. อยู่ในช่วงเวลาที่กำหนด (สำหรับ daily/weekly)
          // 2. หรือเป็นภารกิจทั่วไป (no-deadline)
          return this.isQuestInTimeRange(
            assignedQuest.quest.type,
            assignedQuest.assignedAt
          )
        })
        .map((assignedQuest) => {
          const quest = assignedQuest.quest
          const deadline = this.calculateDeadline(
            assignedQuest.assignedAt,
            quest.type,
            assignedQuest.expiresAt
          )

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
            completed: assignedQuest.status === 'completed', // *** เปลี่ยนการตรวจสอบ completed ***
            status: assignedQuest.status as any,
            imageUrl: quest.imageUrl || undefined,
            isActive: quest.isActive,
            createdAt: quest.createdAt,
            updatedAt: quest.updatedAt,
          }
        })

      console.log(activeQuests)
      return {
        activeQuests,
        completedQuests,
      }
    } catch (error) {
      console.error('Error in getQuestsForUser:', error)
      throw new Error('Failed to fetch quests for user')
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
        description: quest.description,
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

      // 2. อัพโหลดไฟล์ไป S3 (ถ้ามี)
      let mediaUrl: string | undefined

      if (mediaFile) {
        const uploadResult = await s3UploadService.uploadFile(mediaFile)

        if (!uploadResult.success)
          throw new Error('Failed to upload media file')

        mediaUrl = uploadResult.url
      }

      // 3. วิเคราะห์สื่อ (วิดีโอหรือรูปภาพ)
      let mediaAnalysis: any = undefined

      if (mediaFile && mediaUrl) {
        const mediaType = this.getMediaType(mediaFile)

        if (mediaType === 'video') {
          console.log('Analyzing video content...')
          try {
            mediaAnalysis = await openaiService.analyzeVideo(mediaUrl)
            console.log('Video analysis completed:', mediaAnalysis)
          } catch (videoError) {
            console.error('Video analysis failed:', videoError)
            // ไม่ให้ video analysis ล้มเหลวส่งผลต่อการ submit ทั้งหมด
          }
        } else if (mediaType === 'image') {
          console.log('Analyzing image content...')
          try {
            mediaAnalysis = await openaiService.analyzeImage(mediaUrl)
            console.log('Image analysis completed:', mediaAnalysis)
          } catch (imageError) {
            console.error('Image analysis failed:', imageError)
            // ไม่ให้ image analysis ล้มเหลวส่งผลต่อการ submit ทั้งหมด
          }
        } else {
          console.log('Unknown media type, skipping analysis')
        }

        // 4. เตรียมข้อมูลสำหรับ AI analysis
        const aiPrompt: OpenAIPrompt = {
          questTitle: quest.title,
          questDescription: quest.description,
          questRequirements: [], // ในอนาคตอาจเพิ่ม requirements ใน quest schema
          mediaUrl,
          userDescription: description,
        }

        // 5. ส่งข้อมูลให้ AI วิเคราะห์ (รวมกับข้อมูลวิดีโอ)
        const aiAnalysis = await openaiService.analyzeQuestSubmission(
          aiPrompt,
          mediaAnalysis
        )

        // 6. บันทึก quest submission (รวม media analysis)
        const submission =
          await questSubmissionRepository.createQuestSubmission({
            questId,
            questXpEarned: quest.xpReward,
            characterId,
            mediaType,
            mediaUrl,
            description,
            aiAnalysis,
            mediaAnalysis,
          })

        // 7. อัพเดทสถานะ assigned quest
        await questSubmissionRepository.updateAssignedQuestStatus(
          questId,
          characterId
        )

        // 8. อัพเดท character XP (เพิ่มบรรทัดนี้)
        const characterUpdateResult = await characterService.addXP(
          characterId,
          quest.xpReward
        )

        // 9. สร้าง feed item
        await questSubmissionRepository.createQuestCompletionFeedItem(
          character.userId,
          'quest_completion',
          submission.mediaRevisedTranscript,
          mediaType,
          quest.title,
          quest.xpReward,
          submission.id,
          mediaUrl
        )

        let successMessage = 'Quest completed successfully!'

        if (characterUpdateResult.leveledUp) {
          successMessage = `Quest completed! You gained ${characterUpdateResult.levelsGained} level(s)!`
        }

        if (mediaAnalysis) {
          const mediaType = mediaFile ? this.getMediaType(mediaFile) : 'unknown'
          if (mediaType === 'video') {
            successMessage +=
              ' Video content was analyzed and included in evaluation.'
          } else if (mediaType === 'image') {
            successMessage +=
              ' Image content was analyzed and included in evaluation.'
          }
        }

        return {
          success: true,
          message: successMessage,
          aiAnalysis,
          submission,
          mediaType,
          characterUpdate: characterUpdateResult, // เพิ่มข้อมูลการอัพเดท character
        }
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

      if (!updatedSubmission) {
        throw new Error('Submission not found')
      }

      // 2. อัปเดต feed item ที่เกี่ยวข้อง
      await questSubmissionRepository.updateRelatedFeedItem(
        submissionId,
        newSummary
      )

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
}

export const questSubmissionService = new QuestSubmissionService()
