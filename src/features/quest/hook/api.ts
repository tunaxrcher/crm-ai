'use client'

// Custom hooks for Quest feature API calls
import { useCallback, useEffect, useState } from 'react'

import { completeQuest, fetchQuestById, fetchQuests } from '../service/client'
import {
  CompleteQuestResponse,
  CompletedQuest,
  GroupedQuests,
  Quest,
} from '../types'

/**
 * Hook to fetch all quests
 */
export function useQuests() {
  const [activeQuests, setActiveQuests] = useState<Quest[]>([])
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([])
  const [groupedQuests, setGroupedQuests] = useState<GroupedQuests>({
    daily: [],
    weekly: [],
    'no-deadline': [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadQuests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchQuests()

      if (!data || !data.activeQuests || !data.completedQuests) {
        throw new Error('Invalid response format from server')
      }

      setActiveQuests(data.activeQuests)
      setCompletedQuests(data.completedQuests)

      // Group quests by type
      const grouped: GroupedQuests = {
        daily: [],
        weekly: [],
        'no-deadline': [],
      }

      data.activeQuests.forEach((quest) => {
        if (quest && quest.type && grouped[quest.type]) {
          grouped[quest.type].push(quest)
        }
      })

      setGroupedQuests(grouped)
      setError(null)
    } catch (err) {
      console.error('Error loading quests:', err)
      setError(
        err instanceof Error ? err : new Error('An unknown error occurred')
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadQuests()
  }, [loadQuests])

  // Function to refresh quests
  const refreshQuests = () => {
    setIsRefreshing(true)
    loadQuests()
  }

  return {
    activeQuests,
    completedQuests,
    groupedQuests,
    isLoading,
    isRefreshing,
    error,
    refreshQuests,
  }
}

/**
 * Hook to fetch a single quest by ID
 */
export function useQuest(id: string) {
  const [quest, setQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadQuest = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchQuestById(id)
        setQuest(data)
      } catch (err) {
        console.error(`Error loading quest ${id}:`, err)
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred')
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadQuest()
    }
  }, [id])

  return {
    quest,
    isLoading,
    error,
  }
}

/**
 * Hook for completing a quest
 */
export function useCompleteQuest() {
  const [isCompleting, setIsCompleting] = useState(false)
  const [completionResult, setCompletionResult] =
    useState<CompleteQuestResponse | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const completeQuestById = async (questId: string) => {
    try {
      setIsCompleting(true)
      setError(null)
      const result = await completeQuest(questId)
      setCompletionResult(result)
      return result
    } catch (err) {
      console.error(`Error completing quest ${questId}:`, err)
      setError(
        err instanceof Error ? err : new Error('An unknown error occurred')
      )
      throw err
    } finally {
      setIsCompleting(false)
    }
  }

  return {
    completeQuestById,
    isCompleting,
    completionResult,
    error,
  }
}
