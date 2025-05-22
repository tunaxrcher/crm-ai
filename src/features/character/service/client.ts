// Client-side service for Character feature
import {
  AllocateStatPointsRequest,
  Character,
  CharacterResponse,
  JobClass,
  LevelRequirement,
  Stat,
} from '../types'

/**
 * Fetch character data
 */
export async function fetchCharacter(id?: string): Promise<CharacterResponse> {
  // In a real app, this would be an actual API call
  const response = await fetch(`/api/character${id ? `/${id}` : ''}`)

  if (!response.ok) {
    throw new Error('Failed to fetch character data')
  }

  return response.json()
}

/**
 * Fetch all job classes
 */
export async function fetchJobClasses(): Promise<JobClass[]> {
  const response = await fetch('/api/character/job-classes')

  if (!response.ok) {
    throw new Error('Failed to fetch job classes')
  }

  return response.json()
}

/**
 * Fetch XP table (level requirements)
 */
export async function fetchXPTable(): Promise<LevelRequirement[]> {
  const response = await fetch('/api/character/xp-table')

  if (!response.ok) {
    throw new Error('Failed to fetch XP requirements')
  }

  return response.json()
}

/**
 * Allocate stat points
 */
export async function allocateStatPoints(
  characterId: string,
  stats: Stat
): Promise<Character> {
  const payload: AllocateStatPointsRequest = {
    characterId,
    stats,
  }

  const response = await fetch('/api/character/allocate-stats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to allocate stat points')
  }

  return response.json()
}
