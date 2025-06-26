import { NextRequest, NextResponse } from 'next/server'

import { checkinService } from '@src/features/checkin/services/server'
import { getServerSession } from '@src/lib/auth'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Get Checkin Status')
  
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await checkinService.getCheckinStatus(
    parseInt(session.user.id)
  )

  return NextResponse.json({
    success: true,
    data: status,
  })
})
