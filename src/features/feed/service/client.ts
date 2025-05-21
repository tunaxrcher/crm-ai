// Client-side service for Feed feature
import {
  FeedResponse,
  AddCommentRequest,
  AddCommentResponse,
  LikeRequest,
  LikeResponse
} from '../types';

/**
 * Fetch feed data
 */
export async function fetchFeed(): Promise<FeedResponse> {
  const response = await fetch('/api/feed');

  if (!response.ok) {
    throw new Error('Failed to fetch feed data');
  }

  return response.json();
}

/**
 * Add a comment to a feed item
 */
export async function addComment(feedItemId: string, text: string): Promise<AddCommentResponse> {
  const payload: AddCommentRequest = {
    feedItemId,
    text
  };

  const response = await fetch('/api/feed/comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }

  return response.json();
}

/**
 * Like a feed item
 */
export async function likeFeedItem(feedItemId: string): Promise<LikeResponse> {
  const payload: LikeRequest = {
    feedItemId
  };

  const response = await fetch('/api/feed/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to like feed item');
  }

  return response.json();
}
