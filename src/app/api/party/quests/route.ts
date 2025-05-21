import { NextResponse } from 'next/server';
import { getTeamQuests } from '@/features/party/service/server';

/**
 * GET handler for fetching available team quests
 */
export async function GET() {
  try {
    console.log('API: GET /api/party/quests - Fetching team quests');
    const quests = await getTeamQuests();

    return NextResponse.json(
      { quests, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error in GET /api/party/quests:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch team quests',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
