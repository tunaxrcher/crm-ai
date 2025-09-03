import {
  AssignedQuest,
  EnumMediaType,
  Quest,
  QuestSubmission,
} from '@prisma/client'
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

  async create(data: any) {
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
  // async getAssignedQuestsByCharacterId(
  //   characterId: number
  // ): Promise<AssignedQuestWithDetails[]> {
  //   try {
  //     const assignedQuests = await this.prisma.assignedQuest.findMany({
  //       where: {
  //         characterId: characterId,
  //         quest: {
  //           isActive: true,
  //         },
  //       },
  //       include: {
  //         quest: true,
  //       },
  //       orderBy: [
  //         { status: 'asc' }, // active quests first, then completed
  //         { assignedAt: 'desc' },
  //       ],
  //     })

  //     // ดึง quest submissions แยกต่างหาก
  //     const questSubmissions = await this.prisma.questSubmission.findMany({
  //       where: {
  //         characterId: characterId,
  //         questId: {
  //           in: assignedQuests.map((aq) => aq.questId),
  //         },
  //       },
  //       select: {
  //         id: true,
  //         questId: true,
  //         xpEarned: true,
  //         submittedAt: true,
  //       },
  //     })

  //     // รวมข้อมูล quest submissions เข้ากับ assigned quests
  //     const enrichedQuests = assignedQuests.map((assignedQuest) => ({
  //       ...assignedQuest,
  //       questSubmissions: questSubmissions.filter(
  //         (submission) => submission.questId === assignedQuest.questId
  //       ),
  //     }))

  //     return enrichedQuests
  //   } catch (error) {
  //     console.error('Error fetching assigned quests:', error)
  //     throw new Error('Failed to fetch assigned quests')
  //   }
  // }
  async getAssignedQuestsByCharacterId(characterId: number) {
    try {
      const assignedQuests = await this.prisma.assignedQuest.findMany({
        where: {
          characterId: characterId,
          quest: {
            isActive: true,
          },
        },
        include: {
          quest: true,
        },
        orderBy: [
          { status: 'asc' }, // active quests first, then completed
          { assignedAt: 'desc' },
        ],
      })

      // ดึง quest submissions แยกต่างหาก และผูกกับ assignedQuest ที่ถูกต้อง
      const submissions = await Promise.all(
        assignedQuests.map(async (aq) => {
          // ดึงเฉพาะ submission ที่ถูกส่งหลังจากที่ quest นี้ถูก assign
          const submissions = await this.prisma.questSubmission.findMany({
            where: {
              questId: aq.questId,
              characterId: characterId,
              submittedAt: {
                gte: aq.assignedAt, // เฉพาะ submission ที่ส่งหลังจาก assigned
              },
            },
            select: {
              id: true,
              questId: true,
              xpEarned: true,
              submittedAt: true,
            },
            orderBy: {
              submittedAt: 'desc',
            },
          })

          return {
            ...aq,
            questSubmissions: submissions,
          }
        })
      )

      return submissions
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

export class AssignedQuestRepository extends BaseRepository<AssignedQuest> {
  private static instance: AssignedQuestRepository

  public static getInstance() {
    if (!AssignedQuestRepository.instance) {
      AssignedQuestRepository.instance = new AssignedQuestRepository()
    }
    return AssignedQuestRepository.instance
  }

  async findAll() {
    return this.prisma.assignedQuest.findMany()
  }

  async findById(id: number) {
    return this.prisma.assignedQuest.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.assignedQuest.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<AssignedQuest, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.assignedQuest.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.assignedQuest.delete({
      where: { id },
    })
  }
}
export const assignedQuestRepository = new AssignedQuestRepository()

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

  async update(id: number, data: any) {
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
      // ค้นหา AssignedQuest ที่เกี่ยวข้องก่อนที่จะสร้าง submission
      const assignedQuest = await this.prisma.assignedQuest.findFirst({
        where: {
          questId: data.questId,
          characterId: data.characterId,
          status: 'active',
        },
        orderBy: {
          assignedAt: 'desc',
        },
      })

      if (!assignedQuest) {
        throw new Error('No active assigned quest found')
      }

      const mediaType = data.mediaType

      const baseData: any = {
        // เพิ่มความสัมพันธ์โดยตรงแทนการใช้ ID
        character: {
          connect: { id: data.characterId },
        },
        quest: {
          connect: { id: data.questId },
        },
        assignedQuest: {
          connect: { id: assignedQuest.id },
        },
        mediaType,
        mediaUrl: data.mediaUrl,
        description: data.description,
        tags: data.aiAnalysis.tags,
        ratingAGI: data.aiAnalysis.ratings.agi,
        ratingSTR: data.aiAnalysis.ratings.str,
        ratingDEX: data.aiAnalysis.ratings.dex,
        ratingVIT: data.aiAnalysis.ratings.vit,
        ratingINT: data.aiAnalysis.ratings.int,
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

  // บันทึก quest submission พร้อมระบบ token
  async createQuestSubmissionWithToken(data: {
    questId: number
    questXpEarned: number
    characterId: number
    mediaType: string
    mediaUrl?: string
    description?: string
    aiAnalysis: AIAnalysisResult
    mediaAnalysis?: MediaAnalysisResult | ImageAnalysisResult
    tokenReward: {
      tokensEarned: number
      tokenMultiplier: number
      bonusTokens: number
    }
  }) {
    try {
      // ใช้ transaction เพื่อความถูกต้องของข้อมูล
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. ค้นหา AssignedQuest
        const assignedQuest = await tx.assignedQuest.findFirst({
          where: {
            questId: data.questId,
            characterId: data.characterId,
            status: 'active',
          },
          orderBy: {
            assignedAt: 'desc',
          },
        })

        if (!assignedQuest) {
          throw new Error('No active assigned quest found')
        }

        // 2. ดึงข้อมูล character และ user
        const character = await tx.character.findUnique({
          where: { id: data.characterId },
          include: { user: true },
        })

        if (!character) {
          throw new Error('Character not found')
        }

        // 3. สร้าง Quest Submission
        const submission = await tx.questSubmission.create({
          data: {
            character: { connect: { id: data.characterId } },
            quest: { connect: { id: data.questId } },
            assignedQuest: { connect: { id: assignedQuest.id } },
            mediaType: data.mediaType as any,
            mediaUrl: data.mediaUrl,
            description: data.description,
            tags: data.aiAnalysis.tags,
            ratingAGI: data.aiAnalysis.ratings.agi,
            ratingSTR: data.aiAnalysis.ratings.str,
            ratingDEX: data.aiAnalysis.ratings.dex,
            ratingVIT: data.aiAnalysis.ratings.vit,
            ratingINT: data.aiAnalysis.ratings.int,
            xpEarned: data.questXpEarned,
            tokensEarned: data.tokenReward.tokensEarned,
            tokenMultiplier: data.tokenReward.tokenMultiplier,
            bonusTokens: data.tokenReward.bonusTokens,
            feedback: data.aiAnalysis.feedback,
            score: data.aiAnalysis.score,
            mediaTranscript:
              data.mediaType === 'video' &&
              data.mediaAnalysis &&
              'transcript' in data.mediaAnalysis
                ? data.mediaAnalysis.transcript
                : undefined,
            mediaRevisedTranscript:
              data.mediaType === 'video' &&
              data.mediaAnalysis &&
              'revised_transcript' in data.mediaAnalysis
                ? data.mediaAnalysis.revised_transcript
                : undefined,
            mediaAnalysis: data.mediaAnalysis?.summary,
            submittedAt: new Date(),
          },
        })

        // 4. อัพเดท UserToken
        let userToken = await tx.userToken.findUnique({
          where: { userId: character.userId },
        })

        if (!userToken) {
          // สร้าง UserToken ถ้ายังไม่มี
          userToken = await tx.userToken.create({
            data: {
              userId: character.userId,
              currentTokens: data.tokenReward.tokensEarned,
              totalEarnedTokens: data.tokenReward.tokensEarned,
              totalSpentTokens: 0,
            },
          })
        } else {
          // อัพเดท tokens
          userToken = await tx.userToken.update({
            where: { userId: character.userId },
            data: {
              currentTokens: { increment: data.tokenReward.tokensEarned },
              totalEarnedTokens: { increment: data.tokenReward.tokensEarned },
            },
          })
        }

        // 5. สร้าง QuestToken record
        await tx.questToken.create({
          data: {
            userId: character.userId,
            questId: data.questId,
            characterId: data.characterId,
            tokensEarned: data.tokenReward.tokensEarned,
            bonusTokens: data.tokenReward.bonusTokens,
            multiplier: data.tokenReward.tokenMultiplier,
            completedAt: new Date(),
          },
        })

        // 6. สร้าง TokenTransaction
        await tx.tokenTransaction.create({
          data: {
            userId: character.userId,
            characterId: data.characterId,
            amount: data.tokenReward.tokensEarned,
            type: 'quest_completion',
            description: `Completed quest and earned ${data.tokenReward.tokensEarned} tokens`,
            referenceId: submission.id,
            referenceType: 'quest_submission',
            balanceBefore:
              userToken.currentTokens - data.tokenReward.tokensEarned,
            balanceAfter: userToken.currentTokens,
          },
        })

        return { submission, userToken }
      })

      return result
    } catch (error) {
      console.error('Error creating quest submission with token:', error)
      throw new Error('Failed to create quest submission with token reward')
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
    // ค้นหา AssignedQuest ที่เกี่ยวข้องก่อน
    const assignedQuest = await this.prisma.assignedQuest.findFirst({
      where: {
        questId,
        characterId,
        // ดึงเฉพาะ AssignedQuest ปัจจุบัน (ไม่ใช่ของเก่า)
        assignedAt: {
          // ช่วงเวลาที่สร้าง AssignedQuest (เช่น ภายใน 1 วันล่าสุดสำหรับ daily)
          gte: (() => {
            const date = new Date()
            date.setHours(0, 0, 0, 0) // เริ่มต้นวันนี้
            return date
          })(),
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    })

    if (!assignedQuest) return null

    // ค้นหา QuestSubmission ที่เกี่ยวข้องกับ AssignedQuest นั้น
    return await this.prisma.questSubmission.findFirst({
      where: {
        questId,
        characterId,
        // เพิ่มเงื่อนไขเวลาที่สร้าง submission ต้องหลังจากเวลาที่ assigned quest
        submittedAt: {
          gte: assignedQuest.assignedAt,
        },
      },
      include: {
        quest: true,
        character: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
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
        post: newContent,
        updatedAt: new Date(),
      },
    })

    return updatedFeedItems
  }
}
export const questSubmissionRepository = new QuestSubmissionRepository()
