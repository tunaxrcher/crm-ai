// src/features/ranking/services/server.ts
import { getServerSession } from '@src/lib/auth'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import { RankingRepository, rankingRepository } from '../repository'
import { GetRankingsParams, GetRankingsResponse, RankingUser } from '../types'

/**
 * Convert DB ranking to frontend format
 */
function mapToRankingUser(dbRanking: any): RankingUser {
  return {
    id: dbRanking.userId.toString(),
    name: dbRanking.userName, // มาจาก character.name
    avatar: dbRanking.currentPortraitUrl || '/images/default-avatar.png', // ใช้ currentPortraitUrl
    level: dbRanking.level,
    xp: dbRanking.totalXP,
    title: dbRanking.jobLevelTitle,
    class: dbRanking.jobClassName,
    classImage: dbRanking.jobClassImage,
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

      console.log(
        `[SERVER] Fetching rankings for period: ${period}, class: ${characterClass}`
      )

      // Get job class ID for filtering
      let jobClassId: number | undefined
      if (characterClass !== 'all') {
        const jobClassIdNum = parseInt(characterClass)
        if (!isNaN(jobClassIdNum)) {
          jobClassId = jobClassIdNum
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

      // Get current user's ranking
      const currentUserRanking = await rankingRepository.getUserRanking(
        userId,
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
    console.log('[SERVER] Fetching class config for rankings')

    try {
      const jobClasses = await rankingRepository.getJobClasses()

      // Create simple response
      return jobClasses.map((jc) => ({
        id: jc.id,
        name: jc.name,
        description: jc.description,
        imageUrl: jc.imageUrl,
      }))
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
