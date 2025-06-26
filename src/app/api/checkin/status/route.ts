import { NextResponse } from 'next/server'

import { CheckinService } from '@src/features/checkin/services/server'
import { authOptions } from '@src/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await CheckinService.getCheckinStatus(
      parseInt(session.user.id)
    )

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Get checkin status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
