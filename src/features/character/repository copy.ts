import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CharacterRepository {
  // ดึงข้อมูล character พร้อม relations
  static async findByIdWithRelations(characterId: number) {
    return await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        user: true,
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }

  // ดึงข้อมูล character พร้อม job class levels
  static async findByIdWithJobLevels(characterId: number) {
    return await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        user: true,
        jobClass: {
          include: {
            levels: {
              orderBy: { level: 'asc' },
            },
          },
        },
        currentJobLevel: true,
      },
    })
  }

  // อัพเดท character พร้อม portrait และ job level
  static async updateCharacterWithPortraitAndJob(
    characterId: number,
    data: {
      currentXP?: number
      level?: number
      totalXP?: number
      nextLevelXP?: number
      statAGI?: number
      statSTR?: number
      statDEX?: number
      statVIT?: number
      statINT?: number
      statPoints?: number
      generatedPortraits?: any
      currentPortraitUrl?: string
      jobLevelId?: number
    }
  ) {
    return await prisma.character.update({
      where: { id: characterId },
      data,
      include: {
        user: true,
        jobClass: {
          include: {
            levels: {
              orderBy: { level: 'asc' },
            },
          },
        },
        currentJobLevel: true,
      },
    })
  }

  // สร้าง Level History
  static async createLevelHistory(data: {
    characterId: number
    levelFrom: number
    levelTo: number
    agiGained: number
    strGained: number
    dexGained: number
    vitGained: number
    intGained: number
    reasoning?: string
  }) {
    return await prisma.levelHistory.create({
      data,
    })
  }

  // สร้าง Feed Item
  static async createFeedItem(data: {
    content: string
    type: string
    mediaType: any
    userId: number
    questSubmissionId?: number
    levelHistoryId?: number
    achievementId?: number
  }) {
    return await prisma.feedItem.create({
      data,
    })
  }

  // ดึง quest submissions ในช่วงระหว่าง levels
  static async getQuestSubmissionsBetweenLevels(
    characterId: number,
    fromLevel: number,
    toLevel: number
  ) {
    const levelHistories = await prisma.levelHistory.findMany({
      where: {
        characterId,
        levelFrom: {
          gte: fromLevel,
        },
        levelTo: {
          lte: toLevel,
        },
      },
      orderBy: {
        recordedAt: 'asc',
      },
    })

    let startDate: Date
    let endDate: Date = new Date()

    if (levelHistories.length > 0) {
      startDate = levelHistories[0].recordedAt
    } else {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }

    return await prisma.questSubmission.findMany({
      where: {
        characterId,
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        quest: {
          select: {
            title: true,
            type: true,
            description: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    })
  }

  // หา daily quest ที่ active
  static async findActiveDailyQuest() {
    return await prisma.quest.findFirst({
      where: {
        type: 'daily',
        isActive: true,
      },
    })
  }

  // หา assigned quest
  static async findAssignedQuest(
    characterId: number,
    questId: number,
    status: string
  ) {
    return await prisma.assignedQuest.findFirst({
      where: {
        characterId,
        questId,
        status,
      },
    })
  }

  // สร้าง assigned quest
  static async createAssignedQuest(data: {
    questId: number
    characterId: number
    userId: number
    status: any
    expiresAt?: Date
  }) {
    return await prisma.assignedQuest.create({
      data,
    })
  }

  // อัพเดท assigned quest
  static async updateAssignedQuest(id: number, data: { status: any }) {
    return await prisma.assignedQuest.update({
      where: { id },
      data,
    })
  }

  // สร้าง quest submission
  static async createQuestSubmission(data: {
    mediaType: any
    description?: string
    ratingAGI?: number
    ratingSTR?: number
    ratingDEX?: number
    ratingVIT?: number
    ratingINT?: number
    xpEarned: number
    characterId: number
    questId: number
  }) {
    return await prisma.questSubmission.create({
      data,
    })
  }

  // สร้าง quest token
  static async createQuestToken(data: {
    userId: number
    questId: number
    characterId: number
    tokensEarned: number
    bonusTokens?: number
    multiplier?: number
  }) {
    return await prisma.questToken.create({
      data,
    })
  }

  // หา user token
  static async findUserToken(userId: number) {
    return await prisma.userToken.findUnique({
      where: { userId },
    })
  }

  // อัพเดท user token
  static async updateUserToken(
    userId: number,
    data: {
      currentTokens: number
      totalEarnedTokens: number
    }
  ) {
    return await prisma.userToken.update({
      where: { userId },
      data,
    })
  }
}
