import { NextResponse } from 'next/server'

import { getAllQuests } from '@src/features/quest/service/server'

export async function GET() {
  try {
    const data = await getAllQuests()

    // Extra validation for the response
    if (!data) {
      console.error('Empty response from getAllQuests')
      return NextResponse.json(
        { activeQuests: [], completedQuests: [], error: 'No data available' },
        { status: 200 }
      )
    }

    // Ensure we have the expected arrays, even if empty
    const safeResponse = {
      activeQuests: Array.isArray(data.activeQuests) ? data.activeQuests : [],
      completedQuests: Array.isArray(data.completedQuests)
        ? data.completedQuests
        : [],
    }

    return NextResponse.json(safeResponse)
  } catch (error) {
    console.error('Error fetching quests:', error)

    // Provide a graceful failure response with empty arrays
    return NextResponse.json(
      {
        activeQuests: [],
        completedQuests: [],
        error: 'Failed to fetch quests',
      },
      { status: 500 }
    )
  }
}
