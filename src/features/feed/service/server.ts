// Server-side logic for Feed feature
import { mockFeedItems, mockStories } from "@/data/feed";
import {
  FeedResponse,
  AddCommentRequest,
  AddCommentResponse,
  LikeRequest,
  LikeResponse,
  Comment,
  FeedItem,
} from "../types";

/**
 * Get feed data
 * @returns Promise<FeedResponse> The feed items and stories
 */
export async function getFeed(): Promise<FeedResponse> {
  console.log("[Server] Fetching feed data...");

  // Return mock data
  return {
    feedItems: mockFeedItems,
    stories: mockStories,
  };
}

/**
 * Add a comment to a feed item
 * @param request - The request containing feedItemId and comment text
 * @returns Promise<AddCommentResponse> The result of adding the comment
 */
export async function addComment(
  request: AddCommentRequest
): Promise<AddCommentResponse> {
  console.log(`[Server] Adding comment to feed item: ${request.feedItemId}`);

  // Find the feed item in our mock data
  const feedItem = mockFeedItems.find((item) => item.id === request.feedItemId);
  if (!feedItem) {
    throw new Error("Feed item not found");
  }

  // Create a new comment (in a real app, this would be saved to the database)
  const newComment: Comment = {
    id: `comment-${Date.now()}`, // Generate a unique ID
    user: {
      id: "user-1",
      name: "อเล็กซ์ จอห์นสัน",
      avatar: "https://same-assets.com/avatars/marketing-specialist-1.png",
      title: "ผู้เชี่ยวชาญด้านการตลาด",
      level: 8,
    },
    text: request.text,
    timestamp: new Date(),
  };

  // In a real app, we would add the comment to the database
  // For the mock implementation, we simply return success and the new comment
  return {
    success: true,
    comment: newComment,
  };
}

/**
 * Like a feed item
 * @param request - The request containing feedItemId
 * @returns Promise<LikeResponse> The result of liking the feed item
 */
export async function likeFeedItem(
  request: LikeRequest
): Promise<LikeResponse> {
  console.log(`[Server] Liking feed item: ${request.feedItemId}`);

  // Find the feed item in our mock data
  const feedItem = mockFeedItems.find((item) => item.id === request.feedItemId);
  if (!feedItem) {
    throw new Error("Feed item not found");
  }

  // Get current likes count from the feed item content
  let currentLikes = 0;

  if ("engagement" in feedItem.content) {
    currentLikes = feedItem.content.engagement.likes;
  }

  // In a real app, we would toggle the like in the database
  // For the mock implementation, we increment the likes count and return success
  return {
    success: true,
    likes: currentLikes + 1,
  };
}
