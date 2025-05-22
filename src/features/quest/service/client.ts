// Client-side service for Quest feature
import {
  CompleteQuestRequest,
  CompleteQuestResponse,
  CompletedQuest,
  Quest,
  QuestsResponse,
} from '../types'

/**
 * Fetch all quests for the current user
 */
export async function fetchQuests(): Promise<QuestsResponse> {
  try {
    const response = await fetch('/api/quest')

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch quests: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Validate the response has the expected properties
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format')
    }

    // Default values for missing properties
    const result: QuestsResponse = {
      activeQuests: Array.isArray(data.activeQuests) ? data.activeQuests : [],
      completedQuests: Array.isArray(data.completedQuests)
        ? data.completedQuests
        : [],
    }

    return result
  } catch (error) {
    console.error('Error in fetchQuests:', error)
    // Re-throw error for the hook to handle
    throw error
  }
}

/**
 * Fetch a single quest by ID
 */
export async function fetchQuestById(id: string): Promise<Quest> {
  try {
    const response = await fetch(`/api/quest/${id}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch quest: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching quest ${id}:`, error)
    throw error
  }
}

/**
 * Complete a quest
 */
export async function completeQuest(
  questId: string
): Promise<CompleteQuestResponse> {
  try {
    const payload: CompleteQuestRequest = { questId }

    const response = await fetch('/api/quest/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to complete quest: ${response.status} ${errorText}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error(`Error completing quest ${questId}:`, error)
    throw error
  }
}
