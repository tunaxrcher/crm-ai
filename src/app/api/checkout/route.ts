import { NextRequest, NextResponse } from 'next/server'

import { checkinService } from '@src/features/checkin/services/server'
import type { CheckoutRequest } from '@src/features/checkin/types'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('[API] Checkout')

  const body = (await request.json()) as CheckoutRequest

  // Validate request
  if (!body.lat || !body.lng || !body.photoBase64)
    return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })

  const result = await checkinService.checkout(body)

  return NextResponse.json(result)
})
