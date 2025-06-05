import { NextResponse } from 'next/server'

import { rankingService } from '@src/features/ranking/services/server'

export async function GET() {
  try {
    const config = await rankingService.getClassConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in class config API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
