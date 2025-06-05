import { Character, EnumQuestStatus, JobClass, JobLevel } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

export class CharacterRepository extends BaseRepository<Character> {
  private static instance: CharacterRepository

  public static getInstance() {
    if (!CharacterRepository.instance) {
      CharacterRepository.instance = new CharacterRepository()
    }
    return CharacterRepository.instance
  }

  async findAll() {
    return this.prisma.character.findMany()
  }

  async findById(id: number) {
    return this.prisma.character.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.character.create({
      data,
    })
  }

  async update(id: number, data: any) {
    return this.prisma.character.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.character.delete({
      where: { id },
    })
  }

  async findByUserId(userId: number) {
    return this.prisma.character.findUnique({
      where: { userId },
    })
  }

  // ดึงข้อมูล character พร้อม relations
  async findByIdWithRelations(characterId: number) {
    return await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        user: true,
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }

  // ดึงข้อมูล character พร้อม job class levels
  async findByIdWithJobLevels(characterId: number) {
    return await this.prisma.character.findUnique({
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
  async updateCharacterWithPortraitAndJob(
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
    return await this.prisma.character.update({
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
  async createLevelHistory(data: {
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
    return await this.prisma.levelHistory.create({
      data,
    })
  }

  // สร้าง Feed Item
  async createFeedItem(data: {
    content: string
    type: string
    mediaType: any
    userId: number
    questSubmissionId?: number
    levelHistoryId?: number
    achievementId?: number
  }) {
    return await this.prisma.feedItem.create({
      data,
    })
  }

  // ดึง quest submissions ในช่วงระหว่าง levels
  async getQuestSubmissionsBetweenLevels(
    characterId: number,
    fromLevel: number,
    toLevel: number
  ) {
    const levelHistories = await this.prisma.levelHistory.findMany({
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

    return await this.prisma.questSubmission.findMany({
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
  async findActiveDailyQuest() {
    return await this.prisma.quest.findFirst({
      where: {
        type: 'daily',
        isActive: true,
      },
    })
  }

  // หา assigned quest
  async findAssignedQuest(
    characterId: number,
    questId: number,
    status: EnumQuestStatus
  ) {
    return await this.prisma.assignedQuest.findFirst({
      where: {
        characterId,
        questId,
        status,
      },
    })
  }

  // สร้าง assigned quest
  async createAssignedQuest(data: {
    questId: number
    characterId: number
    userId: number
    status: any
    expiresAt?: Date
  }) {
    return await this.prisma.assignedQuest.create({
      data,
    })
  }

  // อัพเดท assigned quest
  async updateAssignedQuest(id: number, data: { status: any }) {
    return await this.prisma.assignedQuest.update({
      where: { id },
      data,
    })
  }

  // สร้าง quest submission
  async createQuestSubmission(data: any) {
    return await this.prisma.questSubmission.create({
      data,
    })
  }

  // สร้าง quest token
  async createQuestToken(data: {
    userId: number
    questId: number
    characterId: number
    tokensEarned: number
    bonusTokens?: number
    multiplier?: number
  }) {
    return await this.prisma.questToken.create({
      data,
    })
  }

  // หา user token
  async findUserToken(userId: number) {
    return await this.prisma.userToken.findUnique({
      where: { userId },
    })
  }

  // อัพเดท user token
  async updateUserToken(
    userId: number,
    data: {
      currentTokens: number
      totalEarnedTokens: number
    }
  ) {
    return await this.prisma.userToken.update({
      where: { userId },
      data,
    })
  }
}
export const characterRepository = CharacterRepository.getInstance()

export class JobClassRepository extends BaseRepository<JobClass> {
  private static instance: JobClassRepository

  public static getInstance() {
    if (!JobClassRepository.instance) {
      JobClassRepository.instance = new JobClassRepository()
    }
    return JobClassRepository.instance
  }

  async findAll() {
    return this.prisma.jobClass.findMany({
      include: {
        levels: {
          orderBy: { level: 'asc' },
          take: 6,
        },
      },
    })
  }

  async findById(id: number) {
    return this.prisma.jobClass.findUnique({
      where: { id },
      include: {
        levels: {
          orderBy: { level: 'asc' },
          take: 6,
        },
      },
    })
  }

  async create(data: Omit<JobClass, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.jobClass.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<JobClass, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.jobClass.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.jobClass.delete({
      where: { id },
    })
  }
}
export const jobClassRepository = JobClassRepository.getInstance()

export class JobLevelRepository extends BaseRepository<JobLevel> {
  private static instance: JobLevelRepository

  public static getInstance() {
    if (!JobLevelRepository.instance) {
      JobLevelRepository.instance = new JobLevelRepository()
    }
    return JobLevelRepository.instance
  }

  async findAll() {
    return this.prisma.jobLevel.findMany()
  }

  async findById(id: number) {
    return this.prisma.jobLevel.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<JobLevel, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.jobLevel.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<JobLevel, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.jobLevel.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.jobLevel.delete({
      where: { id },
    })
  }
}
export const jobLevelRepository = JobLevelRepository.getInstance()
