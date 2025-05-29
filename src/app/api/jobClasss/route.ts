import { NextResponse } from 'next/server'

import { jobClassService } from '@src/features/character/service/server'

export const GET = async () => {
  try {
    const workspaces = await jobClassService.getAllJobClasss()
    return NextResponse.json(workspaces)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
