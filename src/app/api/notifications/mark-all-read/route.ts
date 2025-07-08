import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@src/lib/auth'
import { notificationService } from '@src/features/notifications/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// PUT /api/notifications/mark-all-read - อ่านแจ้งเตือนทั้งหมดแล้ว
export const PUT = withErrorHandling(
  async (request: NextRequest) => {
    console.log(`[API] Mark All Notifications As Read`)

    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    await notificationService.markAllAsRead(userId)

    return NextResponse.json({ success: true })
  }
) 