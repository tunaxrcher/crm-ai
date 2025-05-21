import { NextRequest, NextResponse } from 'next/server';
import { allocateStatPoints } from '@src/features/character/service/server';
import { AllocateStatPointsRequest } from '@src/features/character/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AllocateStatPointsRequest;

    if (!body.characterId || !body.stats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedCharacter = await allocateStatPoints(body);
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error('Error allocating stat points:', error);
    return NextResponse.json(
      { error: 'Failed to allocate stat points' },
      { status: 500 }
    );
  }
}
