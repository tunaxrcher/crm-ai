import { NextResponse } from 'next/server';
import { createTeam } from '@/features/party/service/server';
import type { Team } from '@/features/party/types';

/**
 * POST handler for creating a new team
 */
export async function POST(request: Request) {
  try {
    console.log('API: POST /api/party/create - Creating new team');

    // Extract team data from request body
    const body = await request.json();
    const { name, description, isPrivate, tags, maxMembers } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required', success: false },
        { status: 400 }
      );
    }

    // In a real app, we would use the user's ID from an auth token
    // For now, we'll use a mock user ID
    const userId = 'current-user';

    // Create a team object to pass to the service
    const teamData: Partial<Team> = {
      name,
      description: description || '',
      members: 1, // Start with just the leader
      maxMembers: maxMembers || 5,
      isPrivate: Boolean(isPrivate),
      tags: Array.isArray(tags) ? tags : [],
      leader: {
        id: userId,
        name: 'Alex Johnson', // Mock user name
        level: 8, // Mock user level
        role: 'Marketing Specialist', // Mock user role
        avatar: 'AJ' // Mock user avatar
      }
    };

    const result = await createTeam(teamData);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API Error in POST /api/party/create:', error);

    return NextResponse.json(
      {
        error: 'Failed to create team',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
