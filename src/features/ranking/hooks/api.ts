// src/features/ranking/hooks/api.ts
import { useCallback } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { rankingService } from '../services/client'
import {
  CharacterClass,
  GetRankingsResponse,
  JobClassInfo,
  RankingPeriod,
} from '../types'

// Query keys
const QUERY_KEYS = {
  rankings: (period: RankingPeriod, characterClass: CharacterClass) => [
    'rankings',
    period,
    characterClass,
  ],
  jobClasses: ['jobClasses'],
  userRanking: (userId: string, period: RankingPeriod) => [
    'rankings',
    'user',
    userId,
    period,
  ],
}

/**
 * Hook for fetching rankings data
 */
export function useRankings(
  period: RankingPeriod,
  selectedClass: CharacterClass
) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery<
    GetRankingsResponse,
    Error
  >({
    queryKey: QUERY_KEYS.rankings(period, selectedClass),
    queryFn: () =>
      rankingService.getRankings({
        period,
        characterClass: selectedClass,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Get ordered rankings (excluding top user and prioritizing current user)
  const getOrderedRankings = useCallback(() => {
    if (!data) return []

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

  // Invalidate and refetch rankings
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.rankings(period, selectedClass),
    })
    return refetch()
  }, [queryClient, period, selectedClass, refetch])

  return {
    rankings: data?.rankings || [],
    topUser: data?.topUser,
    currentUser: data?.currentUser,
    orderedRankings: getOrderedRankings(),
    isLoading,
    error,
    refresh,
  }
}

/**
 * Hook for fetching job classes
 */
export function useJobClasses() {
  const { data, isLoading, error } = useQuery<JobClassInfo[], Error>({
    queryKey: QUERY_KEYS.jobClasses,
    queryFn: async () => {
      const response = await fetch('/api/job-class')
      if (!response.ok) throw new Error('Failed to fetch job classes')
      return response.json()
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  return {
    jobClasses: data || [],
    isLoading,
    error,
  }
}

/**
 * Hook for fetching specific user ranking details
 */
export function useUserRanking(userId: string, period: RankingPeriod) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.userRanking(userId, period),
    queryFn: () => rankingService.getUserRankingDetails(userId, period),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  })

  return {
    userRanking: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to prefetch rankings data
 */
export function usePrefetchRankings() {
  const queryClient = useQueryClient()

  const prefetchRankings = useCallback(
    async (period: RankingPeriod, characterClass: CharacterClass) => {
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.rankings(period, characterClass),
        queryFn: () =>
          rankingService.getRankings({
            period,
            characterClass,
          }),
        staleTime: 1000 * 60 * 5, // 5 minutes
      })
    },
    [queryClient]
  )

  return { prefetchRankings }
}

/**
 * Hook to invalidate all ranking queries
 */
export function useInvalidateRankings() {
  const queryClient = useQueryClient()

  const invalidateAll = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['rankings'],
    })
  }, [queryClient])

  const invalidateSpecific = useCallback(
    async (period?: RankingPeriod, characterClass?: CharacterClass) => {
      if (period && characterClass) {
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.rankings(period, characterClass),
        })
      } else if (period) {
        await queryClient.invalidateQueries({
          queryKey: ['rankings', period],
        })
      } else {
        await queryClient.invalidateQueries({
          queryKey: ['rankings'],
        })
      }
    },
    [queryClient]
  )

  return { invalidateAll, invalidateSpecific }
}
