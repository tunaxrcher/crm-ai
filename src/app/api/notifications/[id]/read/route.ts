import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@src/lib/auth'
import { notificationService } from '@src/features/notifications/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// PUT /api/notifications/[id]/read - อ่านแจ้งเตือนแล้ว
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    console.log(`[API] Mark Notification As Read`)

    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const notificationId = parseInt(id)

    const notification = await notificationService.markAsRead(notificationId)

    return NextResponse.json(notification)
  }
) 