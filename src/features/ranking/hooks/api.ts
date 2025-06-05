import { useCallback, useEffect, useState } from 'react'

import * as RankingService from '../services/client'
import {
  CharacterClass,
  GetRankingsParams,
  GetRankingsResponse,
  RankingPeriod,
} from '../types'

export function useRankings() {
  const [data, setData] = useState<GetRankingsResponse>({ rankings: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [period, setPeriod] = useState<RankingPeriod>('all-time')
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('all')

  const fetchRankings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: GetRankingsParams = {
        period,
        characterClass: selectedClass,
      }

      const result = await RankingService.getRankings(params)
      setData(result)
    } catch (err) {
      console.error('Error fetching rankings:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch rankings')
      )
    } finally {
      setIsLoading(false)
    }
  }, [period, selectedClass])

  useEffect(() => {
    fetchRankings()
  }, [fetchRankings])

  const changePeriod = useCallback((newPeriod: RankingPeriod) => {
    setPeriod(newPeriod)
  }, [])

  const changeClass = useCallback((newClass: CharacterClass) => {
    setSelectedClass(newClass)
  }, [])

  // Get ordered rankings (excluding top user and prioritizing current user)
  const getOrderedRankings = useCallback(() => {
    const { rankings, topUser, currentUser } = data

    if (!rankings || rankings.length === 0) {
      return []
    }

    // Filter out top user and current user (if they exist and aren't the same)
    return rankings.filter(
      (user) =>
        !(topUser && user.position === 1) &&
        !(
          currentUser &&
          currentUser.id !== topUser?.id &&
          user.id === currentUser.id
        )
    )
  }, [data])

  return {
    rankings: data.rankings || [],
    topUser: data.topUser,
    currentUser: data.currentUser,
    orderedRankings: getOrderedRankings(),
    isLoading,
    error,
    period,
    selectedClass,
    changePeriod,
    changeClass,
    refresh: fetchRankings,
  }
}

export function useClassConfig() {
  const [config, setConfig] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchClassConfig = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await RankingService.getClassConfig()
      setConfig(result)
    } catch (err) {
      console.error('Error fetching class config:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch class config')
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClassConfig()
  }, [fetchClassConfig])

  return {
    config,
    isLoading,
    error,
    refresh: fetchClassConfig,
  }
}
