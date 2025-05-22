import { useCallback, useEffect, useState } from 'react'

import {
  createTeam,
  getTeamDetails,
  getTeamQuests,
  getTeams,
  joinTeam,
} from '../service/client'
import type { GlobalTeamQuest, Team, TeamDetail } from '../types'

/**
 * Hook to fetch teams
 */
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTeams()
      setTeams(data)
    } catch (err) {
      console.error('Error fetching teams:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  return { teams, loading, error, refetch: fetchTeams }
}

/**
 * Hook to fetch a specific team's details
 */
export function useTeamDetails(teamId: string) {
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTeamDetails = useCallback(async () => {
    if (!teamId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getTeamDetails(teamId)
      setTeam(data)
    } catch (err) {
      console.error(`Error fetching team details for ${teamId}:`, err)
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch team details for ${teamId}`)
      )
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    fetchTeamDetails()
  }, [fetchTeamDetails])

  return { team, loading, error, refetch: fetchTeamDetails }
}

/**
 * Hook to fetch available team quests
 */
export function useTeamQuests() {
  const [quests, setQuests] = useState<GlobalTeamQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTeamQuests()
      setQuests(data)
    } catch (err) {
      console.error('Error fetching team quests:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch team quests')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  return { quests, loading, error, refetch: fetchQuests }
}

/**
 * Hook for joining a team
 */
export function useJoinTeam() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const requestJoin = useCallback(async (teamId: string, message: string) => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)
      const response = await joinTeam(teamId, message)
      setResult(response)
      return response
    } catch (err) {
      console.error(`Error joining team ${teamId}:`, err)
      const error =
        err instanceof Error ? err : new Error(`Failed to join team ${teamId}`)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { requestJoin, loading, error, result }
}

/**
 * Hook for creating a team
 */
export function useCreateTeam() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    teamId?: string
    message: string
  } | null>(null)

  const create = useCallback(
    async (teamData: {
      name: string
      description: string
      isPrivate: boolean
      tags: string[]
      maxMembers: number
    }) => {
      try {
        setLoading(true)
        setError(null)
        setResult(null)
        const response = await createTeam(teamData)
        setResult(response)
        return response
      } catch (err) {
        console.error('Error creating team:', err)
        const error =
          err instanceof Error ? err : new Error('Failed to create team')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { create, loading, error, result }
}
