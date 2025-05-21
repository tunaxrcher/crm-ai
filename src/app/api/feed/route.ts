import { NextResponse } from 'next/server';
import { getFeed } from '@/features/feed/service/server';

export async function GET() {
  try {
    const data = await getFeed();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed data' },
      { status: 500 }
    );
  }
}
