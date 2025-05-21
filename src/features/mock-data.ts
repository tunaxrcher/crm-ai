// Re-export all mock data from the new data structure
// This file is kept for backward compatibility with existing code

// Import all data from the new structure
import * as DataImports from '@/data';

// Re-export all items with the same names
export const {
  // Character
  mockCharacter,
  characterPortrait,

  // Quest
  mockQuests,
  mockCompletedQuests,

  // Feed
  mockStories,
  mockFeedItems,
  formatTimeDiff,
  HOUR_IN_MS,
  DAY_IN_MS,
  NOW,

  // Ranking
  mockRankings,

  // Profile
  mockUsers,

  // Party
  mockTeams,
  mockTeamDetail,
  mockTeamQuests
} = DataImports;
