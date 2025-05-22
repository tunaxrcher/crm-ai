import type { GlobalTeamQuest, Team, TeamDetail } from '../types'

/**
 * Get list of all teams from the API
 */
export async function getTeams(): Promise<Team[]> {
  try {
    const response = await fetch('/api/party', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.status}`)
    }

    const data = await response.json()
    return data.teams
  } catch (error) {
    console.error('Error fetching teams:', error)
    throw error
  }
}

/**
 * Get details for a specific team
 */
export async function getTeamDetails(teamId: string): Promise<TeamDetail> {
  try {
    const response = await fetch(`/api/party/${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch team details: ${response.status}`)
    }

    const data = await response.json()
    return data.team
  } catch (error) {
    console.error(`Error fetching team details for ${teamId}:`, error)
    throw error
  }
}

/**
 * Get available team quests
 */
export async function getTeamQuests(): Promise<GlobalTeamQuest[]> {
  try {
    const response = await fetch('/api/party/quests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch team quests: ${response.status}`)
    }

    const data = await response.json()
    return data.quests
  } catch (error) {
    console.error('Error fetching team quests:', error)
    throw error
  }
}

/**
 * Send a request to join a team
 */
export async function joinTeam(
  teamId: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/party/${teamId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send join request: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error joining team ${teamId}:`, error)
    throw error
  }
}

/**
 * Create a new team
 */
export async function createTeam(teamData: {
  name: string
  description: string
  isPrivate: boolean
  tags: string[]
  maxMembers: number
}): Promise<{ success: boolean; teamId?: string; message: string }> {
  try {
    const response = await fetch('/api/party/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create team: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating team:', error)
    throw error
  }
}
