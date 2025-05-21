"use client";

// Custom hooks for Feed feature API calls
import { useState, useEffect, useCallback } from 'react';
import {
  FeedItem,
  Story,
  Comment,
  AddCommentResponse,
  LikeResponse
} from '../types';
import {
  fetchFeed,
  addComment as addCommentService,
  likeFeedItem as likeFeedItemService
} from '../service/client';
import { formatTimeDiff } from '@/features/mock-data';

/**
 * Hook to fetch feed data
 */
export function useFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFeed();

      if (!data || !data.feedItems || !data.stories) {
        throw new Error('Invalid response format from server');
      }

      setFeedItems(data.feedItems);
      setStories(data.stories);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Function to refresh feed
  const refreshFeed = () => {
    setIsRefreshing(true);
    loadFeed();
  };

  // Toggle like on a feed item
  const toggleLike = async (feedItemId: string) => {
    try {
      if (!feedItems || !feedItems.length) {
        throw new Error('No feed items available');
      }

      // Optimistically update the UI
      setFeedItems(prev =>
        prev.map(item => {
          if (item.id === feedItemId) {
            return {
              ...item,
              content: {
                ...item.content,
                engagement: {
                  ...item.content.engagement,
                  likes: item.content.engagement.likes + 1
                }
              }
            };
          }
          return item;
        })
      );

      // Make the actual API call
      await likeFeedItemService(feedItemId);
    } catch (err) {
      // Revert the optimistic update on error
      console.error('Error liking feed item:', err);
      // In real app, we would revert the UI change here

      // Refresh the feed to ensure UI is in sync with server
      refreshFeed();
    }
  };

  // Add a comment to a feed item
  const addComment = async (feedItemId: string, commentText: string) => {
    if (!commentText || commentText.trim() === '') {
      throw new Error('Comment text cannot be empty');
    }

    try {
      if (!feedItems || !feedItems.length) {
        throw new Error('No feed items available');
      }

      const result = await addCommentService(feedItemId, commentText);

      if (result.success) {
        // Add the new comment to the feed item
        setFeedItems(prev =>
          prev.map(item => {
            if (item.id === feedItemId) {
              return {
                ...item,
                content: {
                  ...item.content,
                  engagement: {
                    ...item.content.engagement,
                    comments: [...item.content.engagement.comments, result.comment]
                  }
                }
              };
            }
            return item;
          })
        );
      }

      return result;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  return {
    feedItems,
    stories,
    isLoading,
    isRefreshing,
    error,
    refreshFeed,
    toggleLike,
    addComment,
    formatTimeDiff
  };
}
