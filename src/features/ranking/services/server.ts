import { getServerSession } from '@src/lib/auth'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import { RankingRepository, rankingRepository } from '../repository'
import { GetRankingsParams, GetRankingsResponse, RankingUser } from '../types'

/**
 * Map job class names to frontend format
 */
const classNameMap: Record<string, string> = {
  นักการตลาด: 'marketing',
  นักขาย: 'sales',
  นักบัญชี: 'accounting',
  ดีไซน์เนอร์: 'designer',
  โปรแกรมเมอร์: 'programmer',
  ช่าง: 'mechanic',
}

/**
 * Convert DB ranking to frontend format
 */
function mapToRankingUser(dbRanking: any): RankingUser {
  return {
    id: dbRanking.userId.toString(),
    name: dbRanking.userName,
    avatar: dbRanking.userAvatar || '/images/default-avatar.png',
    level: dbRanking.userLevel,
    xp: dbRanking.totalXP,
    title: dbRanking.jobLevelTitle,
    class: classNameMap[dbRanking.jobClassName] || 'unknown',
    position: dbRanking.position || 0,
    change: dbRanking.change || 0,
  }
}

export class RankingService extends BaseService {
  private static instance: RankingService
  private rankingRepository: RankingRepository

  constructor() {
    super()
    this.rankingRepository = rankingRepository
  }

  public static getInstance() {
    if (!RankingService.instance) {
      RankingService.instance = new RankingService()
    }

    return RankingService.instance
  }

  async getAllRankings() {
    return this.rankingRepository.findAll()
  }

  async getRanking(id: number) {
    return this.rankingRepository.findById(id)
  }

  async deleteRanking(id: number) {
    return this.rankingRepository.delete(id)
  }

  /**
   * Get rankings based on period and character class
   */
  async getRankings({
    period,
    characterClass,
  }: GetRankingsParams): Promise<GetRankingsResponse> {
    try {
      const session = await getServerSession()
      const userId = +session.user.id
      const characterId = +session.user.characterId!

      console.log(
        `[Server] Fetching rankings for period: ${period}, class: ${characterClass}`
      )

      // Get job classes for filtering
      let jobClassId: number | undefined
      if (characterClass !== 'all') {
        const jobClasses = await rankingRepository.getJobClasses()
        const targetClassName = Object.entries(classNameMap).find(
          ([_, value]) => value === characterClass
        )?.[0]

        if (targetClassName) {
          const jobClass = jobClasses.find((jc) => jc.name === targetClassName)
          jobClassId = jobClass?.id
        }
      }

      // Get rankings from database
      const dbRankings = await rankingRepository.getRankings({
        period,
        jobClassId,
        limit: 100,
      })

      // Convert to frontend format
      const rankings = dbRankings.map(mapToRankingUser)

      // Get current user's ranking (assuming userId is available from session)
      // For now, we'll use a placeholder userId
      const currentUserId = userId
      const currentUserRanking = await rankingRepository.getUserRanking(
        currentUserId,
        {
          period,
          jobClassId,
        }
      )

      const currentUser = currentUserRanking
        ? mapToRankingUser(currentUserRanking)
        : undefined

      // Find top user
      const topUser = rankings.length > 0 ? rankings[0] : undefined

      return {
        rankings,
        currentUser,
        topUser,
      }
    } catch (error) {
      console.error('Error fetching rankings from database:', error)
      throw new Error('Failed to fetch rankings')
    }
  }

  /**
   * Get the class configuration for rankings
   */
  async getClassConfig() {
    console.log('[Server] Fetching class config for rankings')

    try {
      const jobClasses = await rankingRepository.getJobClasses()

      // Create class config based on job classes from database
      const config: Record<string, { name: string; icon: string }> = {}

      jobClasses.forEach((jobClass) => {
        const key = classNameMap[jobClass.name]
        if (key) {
          config[key] = {
            name: jobClass.name,
            icon: key, // Icon name matches the key
          }
        }
      })

      return config
    } catch (error) {
      console.error('Error fetching class config from database:', error)
      throw new Error('Failed to fetch class configuration')
    }
  }

  /**
   * Get user ranking details
   */
  async getUserRankingDetails(userId: number, period: 'all-time' | 'weekly') {
    try {
      const userRanking = await rankingRepository.getUserRanking(userId, {
        period,
      })

      if (!userRanking) {
        return null
      }

      return mapToRankingUser(userRanking)
    } catch (error) {
      console.error('Error fetching user ranking details:', error)
      throw new Error('Failed to fetch user ranking details')
    }
  }
}

export const rankingService = RankingService.getInstance()
