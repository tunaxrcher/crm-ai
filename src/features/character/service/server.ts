// Server-side logic for Character feature
import { mockCharacter, mockJobClasses, xpTable, characterPortrait } from '@src/data/character';
import { Character, CharacterResponse, AllocateStatPointsRequest, JobClass, LevelRequirement } from '../types';

/**
 * Get character data by ID
 * @param id - The ID of the character to fetch
 * @returns Promise<CharacterResponse> The character data and portrait
 */
export async function getCharacter(id: string): Promise<CharacterResponse> {
  console.log(`[Server] Fetching character with ID: ${id}`);

  // In a mock implementation, we return the same character regardless of ID
  // In a real implementation, we would fetch the character from the database
  return {
    character: mockCharacter,
    portrait: characterPortrait,
    jobClass: mockJobClasses.find(jc => jc.id === mockCharacter.jobClassId) || mockJobClasses[0]
  };
}

/**
 * Get current user's character
 * @returns Promise<CharacterResponse> The current user's character data
 */
export async function getCurrentUserCharacter(): Promise<CharacterResponse> {
  console.log('[Server] Fetching current user character');

  // In a mock implementation, we return the predefined character
  return getCharacter(mockCharacter.id);
}

/**
 * Get job class data by ID
 * @param id - The ID of the job class to fetch
 * @returns Promise<JobClass | null> The job class data
 */
export async function getJobClass(id: string): Promise<JobClass | null> {
  console.log(`[Server] Fetching job class with ID: ${id}`);

  // Find the job class in our mock data
  const jobClass = mockJobClasses.find(jc => jc.id === id);
  if (!jobClass) {
    return null;
  }

  return jobClass;
}

/**
 * Get all available job classes
 * @returns Promise<JobClass[]> List of all job classes
 */
export async function getAllJobClasses(): Promise<JobClass[]> {
  console.log('[Server] Fetching all job classes');

  // Return all mock job classes
  return mockJobClasses;
}

/**
 * Get the XP requirements table
 * @returns Promise<LevelRequirement[]> The XP requirements for each level
 */
export async function getXPRequirements(): Promise<LevelRequirement[]> {
  console.log('[Server] Fetching XP requirements table');

  // Return the XP table from mock data
  return xpTable;
}

/**
 * Allocate stat points for a character
 * @param request - The request containing stats to allocate
 * @returns Promise<Character> The updated character data
 */
export async function allocateStatPoints(request: AllocateStatPointsRequest): Promise<Character> {
  console.log('[Server] Allocating stat points:', request.stats);

  // In a mock implementation, we update the mock character and return it
  // In a real implementation, we would update the character in the database
  const updatedCharacter = {
    ...mockCharacter,
    stats: {
      ...request.stats
    },
    statPoints: 0 // Use all stat points
  };

  return updatedCharacter;
}
