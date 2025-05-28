import { EnumMediaType, Quest, QuestSubmission } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

import { AssignedQuestWithDetails } from './types'
import { AIAnalysisResult } from './types/index'

// import { AIAnalysisResult } from './types/submission'

interface MediaAnalysisResult {
  transcript: string
  revised_transcript: string
  summary: string
  actions: string[]
  spokenContent: string[]
  keyPoints: string[]
}

interface ImageAnalysisResult {
  description: string
  summary: string
  actions: string[]
  visibleContent: string[]
  keyPoints: string[]
  workQuality: string
}

export class QuestRepository extends BaseRepository<Quest> {
  private static instance: QuestRepository

  public static getInstance() {
    if (!QuestRepository.instance) {
      QuestRepository.instance = new QuestRepository()
    }
    return QuestRepository.instance
  }

  async findAll() {
    return this.prisma.quest.findMany()
  }

  async findById(id: number) {
    return this.prisma.quest.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.quest.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.quest.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.quest.delete({
      where: { id },
    })
  }

  // ดึงภารกิจที่ถูกมอบหมายให้ character (ทั้ง active และ completed)
  async getAssignedQuestsByCharacterId(
    characterId: number
  ): Promise<AssignedQuestWithDetails[]> {
    try {
      const assignedQuests = await this.prisma.assignedQuest.findMany({
        where: {
          characterId: characterId,
          quest: {
            isActive: true,
          },
          // *** เอา filter status ออก เพื่อให้ดึงทั้ง active และ completed ***
        },
        include: {
          quest: true,
        },
        orderBy: [
          { status: 'asc' }, // active quests first, then completed
          { assignedAt: 'desc' },
        ],
      })

      // ดึง quest submissions แยกต่างหาก
      const questSubmissions = await this.prisma.questSubmission.findMany({
        where: {
          characterId: characterId,
          questId: {
            in: assignedQuests.map((aq) => aq.questId),
          },
        },
        select: {
          id: true,
          questId: true,
          xpEarned: true,
          submittedAt: true,
        },
      })

      // รวมข้อมูล quest submissions เข้ากับ assigned quests
      const enrichedQuests = assignedQuests.map((assignedQuest) => ({
        ...assignedQuest,
        questSubmissions: questSubmissions.filter(
          (submission) => submission.questId === assignedQuest.questId
        ),
      }))

      return enrichedQuests
    } catch (error) {
      console.error('Error fetching assigned quests:', error)
      throw new Error('Failed to fetch assigned quests')
    }
  }

  // ดึงภารกิจที่เสร็จสิ้นแล้ว (สำหรับแสดงใน completed tab)
  async getCompletedQuestsByCharacterId(characterId: number) {
    try {
      const completedQuests = await this.prisma.questSubmission.findMany({
        where: {
          characterId: characterId,
        },
        include: {
          quest: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        take: 50, // จำกัดไว้ที่ 50 รายการล่าสุด
      })

      return completedQuests.map((submission) => ({
        id: submission.quest.id.toString(),
        title: submission.quest.title,
        xpEarned: submission.xpEarned,
        completedOn: submission.submittedAt,
      }))
    } catch (error) {
      console.error('Error fetching completed quests:', error)
      throw new Error('Failed to fetch completed quests')
    }
  }

  // ดึงข้อมูล character จาก userId
  async getCharacterByUserId(userId: number) {
    try {
      const character = await this.prisma.character.findUnique({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          name: true,
          level: true,
          userId: true,
        },
      })

      return character
    } catch (error) {
      console.error('Error fetching character:', error)
      throw new Error('Failed to fetch character data')
    }
  }
}
export const questRepository = new QuestRepository()

export class QuestSubmissionRepository extends BaseRepository<QuestSubmission> {
  private static instance: QuestSubmissionRepository

  public static getInstance() {
    if (!QuestSubmissionRepository.instance) {
      QuestSubmissionRepository.instance = new QuestSubmissionRepository()
    }
    return QuestSubmissionRepository.instance
  }

  async findAll() {
    return this.prisma.questSubmission.findMany()
  }

  async findById(id: number) {
    return this.prisma.questSubmission.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.questSubmission.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.questSubmission.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.questSubmission.delete({
      where: { id },
    })
  }

  // บันทึก quest submission
  async createQuestSubmission(data: {
    questId: number
    questXpEarned: number
    characterId: number
    mediaType: string
    mediaUrl?: string
    description?: string
    aiAnalysis: AIAnalysisResult
    mediaAnalysis?: MediaAnalysisResult | ImageAnalysisResult
  }) {
    try {
      const mediaType = data.mediaType

      const baseData: any = {
        questId: data.questId,
        characterId: data.characterId,
        mediaType,
        mediaUrl: data.mediaUrl,
        description: data.description,
        tags: data.aiAnalysis.tags,
        ratingAGI: data.aiAnalysis.ratings.agi,
        ratingSTR: data.aiAnalysis.ratings.str,
        ratingDEX: data.aiAnalysis.ratings.dex,
        ratingVIT: data.aiAnalysis.ratings.vit,
        ratingINT: data.aiAnalysis.ratings.int,
        // xpEarned: data.aiAnalysis.xpEarned,
        xpEarned: data.questXpEarned,
        feedback: data.aiAnalysis.feedback,
        score: data.aiAnalysis.score,
        submittedAt: new Date(),
      }

      if (
        mediaType === 'video' &&
        data.mediaAnalysis &&
        'transcript' in data.mediaAnalysis
      ) {
        baseData.mediaTranscript = data.mediaAnalysis.transcript
        baseData.mediaRevisedTranscript = data.mediaAnalysis.revised_transcript
        baseData.mediaAnalysis = data.mediaAnalysis.summary
      }

      if (
        mediaType === 'image' &&
        data.mediaAnalysis &&
        'description' in data.mediaAnalysis
      ) {
        baseData.mediaAnalysis = data.mediaAnalysis.summary
      }

      const submission = await this.prisma.questSubmission.create({
        data: baseData,
      })

      return submission
    } catch (error) {
      console.error('Error creating quest submission:', error)
      throw new Error('Failed to create quest submission')
    }
  }

  // อัพเดทสถานะ assigned quest เป็น completed
  async updateAssignedQuestStatus(questId: number, characterId: number) {
    try {
      const updated = await this.prisma.assignedQuest.updateMany({
        where: {
          questId: questId,
          characterId: characterId,
          status: 'active',
        },
        data: {
          status: 'completed',
        },
      })

      return updated
    } catch (error) {
      console.error('Error updating assigned quest status:', error)
      throw new Error('Failed to update assigned quest status')
    }
  }

  // สร้าง feed item สำหรับ quest completion
  async createQuestCompletionFeedItem(
    userId: number,
    type: string,
    post: string | null,
    mediaType: EnumMediaType,
    questTitle: string,
    xpEarned: number,
    questSubmissionId: number,
    mediaUrl?: string
  ) {
    try {
      const feedItem = await this.prisma.feedItem.create({
        data: {
          content: `ทำเควส "${questTitle}" สำเร็จและได้รับ ${xpEarned} XP!`,
          // type: 'quest_completion',
          type,
          post,
          mediaType,
          mediaUrl,
          userId,
          questSubmissionId,
        },
      })

      return feedItem
    } catch (error) {
      console.error('Error creating feed item:', error)
      throw new Error('Failed to create feed item')
    }
  }

  // ดึงข้อมูล quest และ character
  async getQuestAndCharacter(questId: number, characterId: number) {
    try {
      const quest = await this.prisma.quest.findUnique({
        where: { id: questId },
        select: {
          id: true,
          title: true,
          description: true,
          xpReward: true,
          baseTokenReward: true,
        },
      })

      const character = await this.prisma.character.findUnique({
        where: { id: characterId },
        select: {
          id: true,
          userId: true,
          name: true,
          level: true,
        },
      })

      return { quest, character }
    } catch (error) {
      console.error('Error fetching quest and character:', error)
      throw new Error('Failed to fetch quest and character data')
    }
  }

  // อัพเดท character XP
  async updateCharacterXP(characterId: number, xpToAdd: number) {
    try {
      const character = await this.prisma.character.findUnique({
        where: { id: characterId },
        select: {
          currentXP: true,
          totalXP: true,
          level: true,
          nextLevelXP: true,
        },
      })

      if (!character) {
        throw new Error('Character not found')
      }

      const newCurrentXP = character.currentXP + xpToAdd
      const newTotalXP = character.totalXP + xpToAdd

      // คำนวณ level up (simplified logic)
      let newLevel = character.level
      let newNextLevelXP = character.nextLevelXP
      let currentXP = newCurrentXP

      while (currentXP >= newNextLevelXP) {
        currentXP -= newNextLevelXP
        newLevel += 1
        newNextLevelXP = newLevel * 1000 // Simple level progression
      }

      const updatedCharacter = await this.prisma.character.update({
        where: { id: characterId },
        data: {
          currentXP: currentXP,
          totalXP: newTotalXP,
          level: newLevel,
          nextLevelXP: newNextLevelXP,
        },
      })

      return {
        ...updatedCharacter,
        leveledUp: newLevel > character.level,
        levelsGained: newLevel - character.level,
      }
    } catch (error) {
      console.error('Error updating character XP:', error)
      throw new Error('Failed to update character XP')
    }
  }

  // อัพเดท summary ของ quest submission
  // async updateSubmissionSummary(submissionId: number, newSummary: string) {
  //   try {
  //     const updated = await this.prisma.questSubmission.update({
  //       where: { id: submissionId },
  //       data: { description: newSummary },
  //     })

  //     return updated
  //   } catch (error) {
  //     console.error('Error updating submission summary:', error)
  //     throw new Error('Failed to update submission summary')
  //   }
  // }

  async getQuestSubmissionByQuestAndCharacter(
    questId: number,
    characterId: number
  ) {
    return await this.prisma.questSubmission.findFirst({
      where: {
        questId,
        characterId,
      },
      include: {
        quest: true,
        character: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  // แก้ไข updateSubmissionSummary เพื่อส่งข้อมูลที่ครบถ้วน
  async updateSubmissionSummary(submissionId: number, newSummary: string) {
    const updatedSubmission = await this.prisma.questSubmission.update({
      where: { id: submissionId },
      data: {
        mediaRevisedTranscript: newSummary,
      },
      include: {
        quest: true,
        character: {
          include: {
            user: true,
          },
        },
      },
    })

    return updatedSubmission
  }

  // แก้ไข updateRelatedFeedItem เพื่อให้ส่ง content ที่อัปเดตแล้ว
  async updateRelatedFeedItem(submissionId: number, newContent: string) {
    const updatedFeedItems = await this.prisma.feedItem.updateMany({
      where: {
        questSubmissionId: submissionId,
        type: 'quest_completion',
      },
      data: {
        content: newContent,
        updatedAt: new Date(),
      },
    })

    return updatedFeedItems
  }
}
export const questSubmissionRepository = new QuestSubmissionRepository()
