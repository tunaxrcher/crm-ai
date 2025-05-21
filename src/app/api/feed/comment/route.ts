import { NextResponse } from 'next/server';
import { addComment } from '@src/features/feed/service/server';
import { AddCommentRequest } from '@src/features/feed/types';

export async function POST(request: Request) {
  try {
    const body = await request.json() as AddCommentRequest;

    if (!body.feedItemId || !body.text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await addComment(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
