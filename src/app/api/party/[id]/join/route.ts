import { NextResponse } from 'next/server'

import { joinTeam } from '@src/features/party/service/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST handler for sending a join request to a team
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Await the params to get the id
    const { id } = await params
    console.log(`API: POST /api/party/${id}/join - Processing join request`)

    // Extract message from request body
    const body = await request.json()
    const { message } = body

    // In a real app, we would use the user's ID from an auth token
    // For now, we'll use a mock user ID
    const userId = 'current-user'

    const result = await joinTeam(id, userId, message || '')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    // Since params is async, we need to handle it differently in the error message
    let partyId = 'unknown'
    try {
      const { id } = await params
      partyId = id
    } catch (e) {
      // If we can't get the id, just use 'unknown'
    }

    console.error(`API Error in POST /api/party/${partyId}/join:`, error)

    return NextResponse.json(
      {
        error: 'Failed to process join request',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
