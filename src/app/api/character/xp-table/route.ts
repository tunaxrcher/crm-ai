import { NextResponse } from 'next/server';
import { getXPRequirements } from '@src/features/character/service/server';

export async function GET() {
  try {
    const xpTable = await getXPRequirements();
    return NextResponse.json(xpTable);
  } catch (error) {
    console.error('Error fetching XP table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP requirements' },
      { status: 500 }
    );
  }
}
