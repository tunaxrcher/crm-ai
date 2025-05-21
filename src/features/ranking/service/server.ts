// Server-side logic for Ranking feature
import { mockRankings } from '@src/data/ranking';
import { mockJobClasses } from '@src/data/character';
import { GetRankingsParams, GetRankingsResponse } from '../types';

/**
 * Get rankings based on period and character class
 * @param period - The time period for rankings (all-time, weekly, etc.)
 * @param characterClass - The character class to filter by (all, marketing, sales, etc.)
 * @returns Promise<GetRankingsResponse> The rankings data
 */
export async function getRankings({ period, characterClass }: GetRankingsParams): Promise<GetRankingsResponse> {
  try {
    console.log(`[Server] Fetching rankings for period: ${period}, class: ${characterClass}`);

    // Get rankings from mock data based on period and class
    // If the period or class doesn't exist, default to all-time/all
    const periodData = mockRankings[period] || mockRankings['all-time'];
    const rankings = periodData[characterClass] || periodData['all'];

    // Find current user's ranking (with id 'current-user')
    const currentUser = rankings.find(r => r.id === 'current-user');

    // Find top user (position 1)
    const topUser = rankings.length > 0 ? rankings.find(r => r.position === 1) : undefined;

    return {
      rankings,
      currentUser,
      topUser
    };
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return {
      rankings: [],
    };
  }
}

/**
 * Get the class configuration for rankings
 * @returns Promise<Object> The class configuration data
 */
export async function getClassConfig() {
  console.log('[Server] Fetching class config for rankings');

  // Create class config based on job classes from mock data
  const config: Record<string, { name: string; icon: string }> = {
    marketing: {
      name: 'นักการตลาด',
      icon: 'marketing'
    },
    sales: {
      name: 'นักขาย',
      icon: 'sales'
    },
    accounting: {
      name: 'นักบัญชี',
      icon: 'accounting'
    }
  };

  return config;
}
