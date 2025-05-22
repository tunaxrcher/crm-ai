import { NextRequest, NextResponse } from 'next/server'

import { getQuestById } from '@src/features/quest/service/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const { id } = await params

    const quest = await getQuestById(id)

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    return NextResponse.json(quest)
  } catch (error) {
    // Need to get id for error logging
    let questId = 'unknown'
    try {
      const { id } = await params
      questId = id
    } catch (e) {
      // If we can't get the id, just use 'unknown'
    }

    console.error(`Error fetching quest ${questId}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch quest' },
      { status: 500 }
    )
  }
}
