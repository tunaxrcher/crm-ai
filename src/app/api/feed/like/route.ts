import { NextResponse } from 'next/server';
import { likeFeedItem } from '@src/features/feed/service/server';
import { LikeRequest } from '@src/features/feed/types';

export async function POST(request: Request) {
  try {
    const body = await request.json() as LikeRequest;

    if (!body.feedItemId) {
      return NextResponse.json(
        { error: 'Missing feedItemId' },
        { status: 400 }
      );
    }

    const result = await likeFeedItem(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error liking feed item:', error);
    return NextResponse.json(
      { error: 'Failed to like feed item' },
      { status: 500 }
    );
  }
}
