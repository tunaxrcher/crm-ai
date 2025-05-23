import { NextRequest, NextResponse } from 'next/server'

import { userService } from '@src/features/user/service/server'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (_request: NextRequest, _context: { params: Promise<any> }) => {
    const character = await userService.getUserCharacters()

    return NextResponse.json(character)
  }
)
