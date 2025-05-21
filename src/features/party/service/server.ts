import { mockTeams, mockTeamDetail, mockTeamQuests } from '@src/data/party';
import type { Team, TeamDetail, GlobalTeamQuest } from '../types';

/**
 * Get list of all teams
 * @returns Promise<Team[]> Array of all teams
 */
export async function getTeams(): Promise<Team[]> {
  console.log('[Server] Fetching teams...');
  // In a real app, this would fetch from a database/API
  return mockTeams;
}

/**
 * Get a specific team's details by ID
 * @param teamId - The ID of the team to fetch
 * @returns Promise<TeamDetail | null> The team details or null if not found
 */
export async function getTeamDetails(teamId: string): Promise<TeamDetail | null> {
  console.log(`[Server] Fetching team details for ${teamId}...`);

  // In a real app, this would fetch from a database/API
  if (teamId === 'team-1') {
    return mockTeamDetail;
  }

  // If team is not found or only have basic info, create a simplified detail
  const basicTeam = mockTeams.find(team => team.id === teamId);
  if (!basicTeam) return null;

  // Return a skeleton team detail based on the basic team info
  return {
    id: basicTeam.id,
    name: basicTeam.name,
    description: basicTeam.description,
    members: [], // In real app, would fetch actual members
    pendingRequests: [],
    teamQuests: [],
    completedQuests: [],
    chat: [],
    benefits: [],
    achievements: [],
    level: basicTeam.level,
    xp: basicTeam.xp,
    xpToNextLevel: basicTeam.xpToNextLevel
  };
}

/**
 * Get available team quests
 * @returns Promise<GlobalTeamQuest[]> Array of available team quests
 */
export async function getTeamQuests(): Promise<GlobalTeamQuest[]> {
  console.log('[Server] Fetching team quests...');
  // In a real app, this would fetch from a database/API
  return mockTeamQuests;
}

/**
 * Join a team (request to join)
 * @param teamId - The ID of the team to join
 * @param userId - The ID of the user requesting to join
 * @param message - The message from the user to the team leader
 * @returns Promise<{success: boolean; message: string}> Result of the join request
 */
export async function joinTeam(teamId: string, userId: string, message: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Server] Processing join request for team ${teamId} from user ${userId}`);

  // In a real app, this would:
  // 1. Validate if the team can be joined (not full, user meets requirements)
  // 2. Create a join request in the database
  // 3. Notify the team leader

  // For now, just return success
  return {
    success: true,
    message: 'Join request sent successfully'
  };
}

/**
 * Create a new team
 * @param teamData - Data for the new team
 * @returns Promise<{success: boolean; teamId?: string; message: string}> Result of team creation
 */
export async function createTeam(teamData: Partial<Team>): Promise<{ success: boolean; teamId?: string; message: string }> {
  console.log('[Server] Creating new team:', teamData.name);

  // In a real app, this would:
  // 1. Validate the team data
  // 2. Create a new team in the database
  // 3. Add the current user as leader

  // For now, just return success with a mock ID
  return {
    success: true,
    teamId: 'new-team-' + Date.now(),
    message: 'Team created successfully'
  };
}
