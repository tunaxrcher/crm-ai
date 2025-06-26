import { NextRequest, NextResponse } from 'next/server'

import { checkinService } from '@src/features/checkin/services/server'
import { getServerSession } from '@src/lib/auth'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Check Location')
  
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { lat, lng } = body

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'ต้องระบุพิกัด latitude และ longitude' },
      { status: 400 }
    )
  }

  const locationResult = await checkinService.checkLocation(lat, lng)

  return NextResponse.json({
    success: true,
    data: locationResult,
  })
})
