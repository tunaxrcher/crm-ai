import { NextRequest, NextResponse } from 'next/server'

import { notificationService } from '@src/features/notifications/services/server'
import { getServerSession } from '@src/lib/auth'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET /api/notifications/unread-count - ดึงจำนวนแจ้งเตือนที่ยังไม่อ่าน
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] Get Unread Notifications Count`)

  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const count = await notificationService.getUnreadCount(userId)

  return NextResponse.json({ count })
})
