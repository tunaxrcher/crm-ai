import { NextResponse } from 'next/server';
import { getTeams } from '@src/features/party/service/server';

/**
 * GET handler for fetching all teams
 */
export async function GET() {
  try {
    console.log('API: GET /api/party - Fetching all teams');
    const teams = await getTeams();

    return NextResponse.json(
      { teams, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error in GET /api/party:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch teams',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
