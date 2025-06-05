import { Ranking } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'
import { endOfWeek, startOfWeek } from 'date-fns'

export interface RankingQueryParams {
  period: 'all-time' | 'weekly'
  jobClassId?: number
  limit?: number
  offset?: number
}

export interface UserRanking {
  userId: number
  characterId: number
  userName: string
  currentPortraitUrl: string | null
  level: number
  totalXP: number
  jobClassName: string
  jobLevelTitle: string
  position?: number
  change?: number
}

export class RankingRepository extends BaseRepository<Ranking> {
  private static instance: RankingRepository

  public static getInstance() {
    if (!RankingRepository.instance) {
      RankingRepository.instance = new RankingRepository()
    }
    return RankingRepository.instance
  }

  async findAll() {
    return this.prisma.ranking.findMany()
  }

  async findById(id: number) {
    return this.prisma.ranking.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<Ranking, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.ranking.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<Ranking, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.ranking.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.ranking.delete({
      where: { id },
    })
  }

  /**
   * Get rankings based on filters
   */
  async getRankings(params: RankingQueryParams): Promise<UserRanking[]> {
    const { period, jobClassId, limit = 100, offset = 0 } = params

    // Build where conditions
    const whereConditions: Prisma.CharacterWhereInput = {}

    if (jobClassId) {
      whereConditions.jobClassId = jobClassId
    }

    // For weekly rankings, filter by quest submissions in current week
    let weeklyFilter = {}
    if (period === 'weekly') {
      const now = new Date()
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

      weeklyFilter = {
        questSubmissions: {
          some: {
            submittedAt: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        },
      }
    }

    // Get characters with calculated XP
    const characters = await this.prisma.character.findMany({
      where: {
        ...whereConditions,
        ...weeklyFilter,
      },
      select: {
        id: true,
        totalXP: true,
        level: true,
        currentPortraitUrl: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        jobClass: {
          select: {
            name: true,
          },
        },
        currentJobLevel: {
          select: {
            title: true,
          },
        },
        questSubmissions:
          period === 'weekly'
            ? {
                where: {
                  submittedAt: {
                    gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
                    lte: endOfWeek(new Date(), { weekStartsOn: 1 }),
                  },
                },
                select: {
                  xpEarned: true,
                },
              }
            : false,
      },
      orderBy:
        period === 'weekly'
          ? undefined
          : {
              totalXP: 'desc',
            },
      skip: offset,
      take: limit,
    })

    // Calculate rankings
    let rankings: UserRanking[] = characters.map((character) => {
      const weeklyXP =
        period === 'weekly' && character.questSubmissions
          ? (character.questSubmissions as any[]).reduce(
              (sum, sub) => sum + sub.xpEarned,
              0
            )
          : character.totalXP

      return {
        userId: character.userId,
        characterId: character.id,
        userName: character.user.name,
        currentPortraitUrl: character.currentPortraitUrl,
        level: character.level,
        totalXP: period === 'weekly' ? weeklyXP : character.totalXP,
        jobClassName: character.jobClass.name,
        jobLevelTitle: character.currentJobLevel.title,
      }
    })

    // Sort by XP for weekly rankings
    if (period === 'weekly') {
      rankings.sort((a, b) => b.totalXP - a.totalXP)
    }

    // Add positions
    rankings = rankings.map((ranking, index) => ({
      ...ranking,
      position: index + 1 + offset,
      change: 0, // TODO: Implement change tracking
    }))

    return rankings
  }

  /**
   * Get specific user's ranking
   */
  async getUserRanking(
    userId: number,
    params: RankingQueryParams
  ): Promise<UserRanking | null> {
    const character = await this.prisma.character.findUnique({
      where: { userId },
      select: {
        id: true,
        level: true,
        currentPortraitUrl: true,
        totalXP: true,
        userId: true,
        jobClassId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        jobClass: {
          select: {
            name: true,
          },
        },
        currentJobLevel: {
          select: {
            title: true,
          },
        },
        questSubmissions:
          params.period === 'weekly'
            ? {
                where: {
                  submittedAt: {
                    gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
                    lte: endOfWeek(new Date(), { weekStartsOn: 1 }),
                  },
                },
                select: {
                  xpEarned: true,
                },
              }
            : false,
      },
    })

    if (!character) return null

    // Calculate weekly XP if needed
    const weeklyXP =
      params.period === 'weekly' && character.questSubmissions
        ? (character.questSubmissions as any[]).reduce(
            (sum, sub) => sum + sub.xpEarned,
            0
          )
        : character.totalXP

    // Calculate position
    const whereConditions: any = {}
    if (params.jobClassId) {
      whereConditions.jobClassId = params.jobClassId
    }

    let position: number
    if (params.period === 'weekly') {
      // For weekly, we need to calculate position based on weekly XP
      const allCharacters = await this.prisma.character.findMany({
        where: whereConditions,
        select: {
          id: true,
          questSubmissions: {
            where: {
              submittedAt: {
                gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
                lte: endOfWeek(new Date(), { weekStartsOn: 1 }),
              },
            },
            select: {
              xpEarned: true,
            },
          },
        },
      })

      const rankedCharacters = allCharacters
        .map((c) => ({
          id: c.id,
          xp: c.questSubmissions.reduce((sum, sub) => sum + sub.xpEarned, 0),
        }))
        .sort((a, b) => b.xp - a.xp)

      position = rankedCharacters.findIndex((c) => c.id === character.id) + 1
    } else {
      // For all-time, use totalXP
      position =
        (await this.prisma.character.count({
          where: {
            ...whereConditions,
            totalXP: { gt: character.totalXP },
          },
        })) + 1
    }

    return {
      userId: character.userId,
      characterId: character.id,
      userName: character.user.name,
      currentPortraitUrl: character.currentPortraitUrl,
      level: character.level,
      totalXP: params.period === 'weekly' ? weeklyXP : character.totalXP,
      jobClassName: character.jobClass.name,
      jobLevelTitle: character.currentJobLevel.title,
      position,
      change: 0, // TODO: Implement change tracking
    }
  }

  /**
   * Get all job classes for filtering
   */
  async getJobClasses() {
    return await this.prisma.jobClass.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  /**
   * Track ranking changes (for future implementation)
   */
  async trackRankingChange(
    userId: number,
    oldPosition: number,
    newPosition: number
  ) {
    // TODO: Implement ranking history tracking
    // This could be stored in a separate table or Redis
  }
}

export const rankingRepository = RankingRepository.getInstance()
