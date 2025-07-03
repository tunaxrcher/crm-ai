import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@src/lib/db'
import { withErrorHandling } from '@src/lib/withErrorHandling'

export const GET = withErrorHandling(
  async (_request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params
    const characterId = parseInt(id)

    console.log(`[API] Fetching Token Data for Character: ${characterId}`)

    // ดึงข้อมูล character พร้อม user และ userToken
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        user: {
          include: {
            userToken: true,
          },
        },
      },
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    const tokenData = {
      currentTokens: character.user.userToken?.currentTokens || 0,
      totalEarnedTokens: character.user.userToken?.totalEarnedTokens || 0,
      totalSpentTokens: character.user.userToken?.totalSpentTokens || 0,
    }

    return NextResponse.json(tokenData, { status: 200 })
  }
) 