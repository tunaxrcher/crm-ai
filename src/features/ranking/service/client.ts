import { GetRankingsParams, GetRankingsResponse } from '../types';

/**
 * Client service for getting rankings data from the API
 */
export async function getRankings({ period, characterClass }: GetRankingsParams): Promise<GetRankingsResponse> {
  try {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('class', characterClass);

    const response = await fetch(`/api/ranking?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch rankings data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rankings from API:', error);
    return {
      rankings: [],
    };
  }
}

/**
 * Client service for getting class configuration from the API
 */
export async function getClassConfig() {
  try {
    const response = await fetch('/api/ranking/class-config');

    if (!response.ok) {
      throw new Error('Failed to fetch class config data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching class config from API:', error);
    return {};
  }
}
