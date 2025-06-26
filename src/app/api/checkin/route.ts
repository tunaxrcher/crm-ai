import { NextRequest, NextResponse } from 'next/server'

import { checkinService } from '@src/features/checkin/services/server'
import type { CheckinRequest } from '@src/features/checkin/types'
import { getServerSession } from '@src/lib/auth'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Checkin')
  
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as CheckinRequest

  // Validate request
  if (!body.lat || !body.lng || !body.photoBase64 || !body.checkinType) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })
  }

  const result = await checkinService.checkin(parseInt(session.user.id), body)

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  return NextResponse.json(result)
})

// GET endpoint สำหรับดูประวัติ checkin
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Get Checkin History')
  
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const today = searchParams.get('today') === 'true'

  let data
  if (today) {
    data = await checkinService.getTodayCheckins(parseInt(session.user.id))
  } else {
    const limit = parseInt(searchParams.get('limit') || '30')
    data = await checkinService.getHistory(parseInt(session.user.id), limit)
  }

  return NextResponse.json({
    success: true,
    data,
  })
})
