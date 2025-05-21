import { GetProfileParams, GetProfileResponse } from '../types';

/**
 * Client service for getting user profile data from the API
 */
export async function getProfile({ userId }: GetProfileParams): Promise<GetProfileResponse> {
  try {
    console.log(`Fetching profile for userId: ${userId}`);
    const response = await fetch(`/api/profile/${userId}`);

    if (!response.ok) {
      console.error(`API Response not OK: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch profile data: ${response.status}`);
    }

    const data = await response.json();
    console.log("Profile data received:", data);
    return data;
  } catch (error) {
    console.error('Error fetching profile from API:', error);
    throw error;
  }
}

/**
 * Client service for getting stat configuration from the API
 */
export async function getStatConfig() {
  try {
    console.log('Fetching stat configuration from API');
    const response = await fetch('/api/profile/stat-config');

    if (!response.ok) {
      console.error(`API Response not OK: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch stat config data');
    }

    const data = await response.json();
    console.log("Stat config data received:", data);
    return data;
  } catch (error) {
    console.error('Error fetching stat config from API:', error);
    return {};
  }
}
