// Server-side logic for Quest feature
import { mockQuests, mockCompletedQuests } from '@src/data/quest';
import { Quest, CompletedQuest, CompleteQuestRequest, CompleteQuestResponse, QuestsResponse } from '../types';

/**
 * Get all quests for the current user
 * In a real app, this would query the database and filter based on user's context
 * @returns Promise<QuestsResponse> The active and completed quests
 */
export async function getAllQuests(): Promise<QuestsResponse> {
  try {
    console.log('[Server] Fetching all quests...');

    // Mocking API request delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Validate mock data
    if (!Array.isArray(mockQuests) || !Array.isArray(mockCompletedQuests)) {
      console.error('Invalid mock data format');
      // Return empty arrays to prevent errors
      return {
        activeQuests: [],
        completedQuests: []
      };
    }

    // Return mock data
    return {
      activeQuests: mockQuests,
      completedQuests: mockCompletedQuests
    };
  } catch (error) {
    console.error('Error getting quests:', error);
    // Return empty arrays to prevent errors
    return {
      activeQuests: [],
      completedQuests: []
    };
  }
}

/**
 * Get a specific quest by ID
 * @param id - The ID of the quest to fetch
 * @returns Promise<Quest | null> The quest or null if not found
 */
export async function getQuestById(id: string): Promise<Quest | null> {
  try {
    console.log(`[Server] Fetching quest with ID: ${id}`);

    // Mocking API request delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!id) {
      console.error('Quest ID is required');
      return null;
    }

    // Find the quest in the mock data
    const quest = Array.isArray(mockQuests)
      ? mockQuests.find(q => q && q.id === id)
      : null;

    return quest || null;
  } catch (error) {
    console.error(`Error getting quest ${id}:`, error);
    return null;
  }
}

/**
 * Complete a quest
 * @param request - The request containing questId and completion data
 * @returns Promise<CompleteQuestResponse> The result of completing the quest
 */
export async function completeQuest(request: CompleteQuestRequest): Promise<CompleteQuestResponse> {
  try {
    console.log(`[Server] Completing quest with ID: ${request?.questId}`);

    // Mocking API request delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!request || !request.questId) {
      throw new Error('Quest ID is required');
    }

    // Find the quest in the mock data
    const quest = Array.isArray(mockQuests)
      ? mockQuests.find(q => q && q.id === request.questId)
      : null;

    if (!quest) {
      throw new Error(`Quest not found with ID: ${request.questId}`);
    }

    // In a real app, we would update the database
    // For now, create a completed quest object
    const completedQuest: CompletedQuest = {
      id: `completed-${quest.id}`,
      title: quest.title,
      description: quest.description,
      type: quest.type,
      completedOn: new Date(),
      xpEarned: quest.rewards.xp,
      statsGained: quest.rewards.stats
    };

    return {
      success: true,
      quest: completedQuest,
      xpGained: quest.rewards.xp,
      statsGained: quest.rewards.stats
    };
  } catch (error) {
    console.error(`Error completing quest:`, error);
    throw error; // Re-throw to handle in API route
  }
}
