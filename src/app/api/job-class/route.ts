import { NextRequest, NextResponse } from 'next/server'

import { jobClassService } from '@src/features/character/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(async (_request: NextRequest) => {
  console.log(`[API] GET ALL Job Class`)

  const jobClass = await jobClassService.getAllJobClasss()

  return NextResponse.json(jobClass)
})
