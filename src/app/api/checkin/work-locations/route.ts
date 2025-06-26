import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@src/lib/auth'
import { CheckinService } from '@src/features/checkin/services/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const workLocations = await CheckinService.getWorkLocations()

    return NextResponse.json({
      success: true,
      data: workLocations,
    })
  } catch (error) {
    console.error('Get work locations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 