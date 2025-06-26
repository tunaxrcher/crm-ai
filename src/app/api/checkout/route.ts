import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@src/lib/auth'
import { checkinService } from '@src/features/checkin/services/server'
import type { CheckoutRequest } from '@src/features/checkin/types'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Checkout')
  
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await request.json() as CheckoutRequest

  // Validate request
  if (!body.lat || !body.lng || !body.photoBase64) {
    return NextResponse.json(
      { error: 'ข้อมูลไม่ครบถ้วน' },
      { status: 400 }
    )
  }

  const result = await checkinService.checkout(
    parseInt(session.user.id),
    body
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.message },
      { status: 400 }
    )
  }

  return NextResponse.json(result)
}) 