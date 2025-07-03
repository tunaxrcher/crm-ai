import { NextRequest, NextResponse } from 'next/server'

import { xenyService } from '@src/features/xeny/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

// GET - ดึงข้อมูล Xeny ของ user
export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] GET User Xeny')

  const userXeny = await xenyService.getUserXeny()

  return NextResponse.json({
    success: true,
    data: userXeny,
  })
})
