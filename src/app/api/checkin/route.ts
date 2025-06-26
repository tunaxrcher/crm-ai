import { NextRequest, NextResponse } from 'next/server'

import { CheckinService } from '@src/features/checkin/services/server'
import type { CheckinRequest } from '@src/features/checkin/types'
import { authOptions } from '@src/lib/auth'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as CheckinRequest

    // Validate request
    if (!body.lat || !body.lng || !body.photoBase64 || !body.checkinType) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })
    }

    const result = await CheckinService.checkin(parseInt(session.user.id), body)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Checkin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint สำหรับดูประวัติ checkin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const today = searchParams.get('today') === 'true'

    let data
    if (today) {
      data = await CheckinService.getTodayCheckins(parseInt(session.user.id))
    } else {
      const limit = parseInt(searchParams.get('limit') || '30')
      data = await CheckinService.getHistory(parseInt(session.user.id), limit)
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Get checkin history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
