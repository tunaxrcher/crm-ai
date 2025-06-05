import { NextRequest, NextResponse } from 'next/server'

import { getClassConfig } from '@src/features/ranking/services/server'

export async function GET(request: NextRequest) {
  try {
    // Get class config
    const config = await getClassConfig()

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in class config API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class config' },
      { status: 500 }
    )
  }
}
