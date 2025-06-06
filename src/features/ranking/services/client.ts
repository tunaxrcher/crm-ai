// src/features/ranking/services/client.ts
import { BaseService } from '@src/lib/services/client/baseService'

import { GetRankingsParams, GetRankingsResponse } from '../types'

export class RankingService extends BaseService {
  private static instance: RankingService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!RankingService.instance) {
      RankingService.instance = new RankingService()
    }
    return RankingService.instance
  }

  /**
   * Client service for getting rankings data from the API
   */
  async getRankings({
    period,
    characterClass,
  }: GetRankingsParams): Promise<GetRankingsResponse> {
    try {
      const params = new URLSearchParams()
      params.append('period', period)
      params.append('class', characterClass)

      const response = await fetch(`/api/ranking?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch rankings data')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching rankings from API:', error)
      throw error
    }
  }

  /**
   * Client service for getting class configuration from the API
   */
  async getClassConfig() {
    try {
      const response = await fetch('/api/ranking/class-config')

      if (!response.ok) {
        throw new Error('Failed to fetch class config data')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching class config from API:', error)
      throw error
    }
  }

  /**
   * Client service for getting user ranking details
   */
  async getUserRankingDetails(userId: string, period: 'all-time' | 'weekly') {
    try {
      const response = await fetch(
        `/api/ranking/user/${userId}?period=${period}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch user ranking details')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching user ranking details from API:', error)
      throw error
    }
  }
}

export const rankingService = RankingService.getInstance()
