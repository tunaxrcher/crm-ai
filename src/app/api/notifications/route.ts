import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@src/lib/auth'
import { notificationService } from '@src/features/notifications/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET /api/notifications - ดึงรายการแจ้งเตือนของผู้ใช้
export const GET = withErrorHandling(
  async (request: NextRequest) => {
    console.log(`[API] Get Notifications`)

    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const userId = parseInt(session.user.id)
    const result = await notificationService.getUserNotifications(userId, page, limit)

    return NextResponse.json(result)
  }
) 