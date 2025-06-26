import { NextRequest, NextResponse } from 'next/server'

import { CheckinService } from '@src/features/checkin/services/server'
import { authOptions } from '@src/lib/auth'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { lat, lng } = body

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'ต้องระบุพิกัด latitude และ longitude' },
        { status: 400 }
      )
    }

    const locationResult = await CheckinService.checkLocation(lat, lng)

    return NextResponse.json({
      success: true,
      data: locationResult,
    })
  } catch (error) {
    console.error('Check location error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
