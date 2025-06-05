import { NextResponse } from 'next/server'

import { getTeamDetails } from '@src/features/party/services/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET handler for fetching a specific team's details
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Await the params to get the id
    const { id } = await params
    console.log(`API: GET /api/party/${id} - Fetching team details`)

    const team = await getTeamDetails(id)

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({ team, success: true }, { status: 200 })
  } catch (error) {
    console.error('API Error in GET /api/party/[id]:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch team details',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
