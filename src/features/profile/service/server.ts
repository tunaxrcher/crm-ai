import { mockUsers } from '@src/data/profile';
import { GetProfileParams, GetProfileResponse, UserProfile } from '../types';

/**
 * Get user profile by user ID
 * @param params - Object containing userId to fetch
 * @returns Promise<GetProfileResponse> The user profile data
 */
export async function getProfile({ userId }: GetProfileParams): Promise<GetProfileResponse> {
  try {
    console.log('Server getProfile called with userId:', userId);
    console.log('Available mockUsers keys:', Object.keys(mockUsers));

    // Get user profile from mock data
    const profile = mockUsers[userId];

    console.log('Profile found:', !!profile);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      profile
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error; // Preserve the original error
  }
}

/**
 * Get stat icon configuration
 * @returns Promise<Object> The stat configuration with icons and descriptions
 */
export async function getStatConfig() {
  // This would be retrieved from an API in a real application
  return {
    AGI: {
      name: 'Agility',
      description: 'Speed, responsiveness',
      icon: 'zap'
    },
    STR: {
      name: 'Strength',
      description: 'Heavy workload handling',
      icon: 'swords'
    },
    DEX: {
      name: 'Dexterity',
      description: 'Precision, accuracy',
      icon: 'badgePercent'
    },
    VIT: {
      name: 'Vitality',
      description: 'Consistency, endurance',
      icon: 'clock'
    },
    INT: {
      name: 'Intelligence',
      description: 'Planning, analysis',
      icon: 'shield'
    }
  };
}
