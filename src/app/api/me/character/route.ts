import { NextRequest, NextResponse } from 'next/server'

import { userService } from '@src/features/user/services/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (_request: NextRequest, _context: { params: Promise<any> }) => {
    console.log(`[API] Fetching User Character`)

    const character = await userService.getUserCharacters()

    return NextResponse.json(character, { status: 200 })
  }
)
