// src/features/feed/hook/api.ts
import { useState, useEffect, useCallback } from "react";
import { feedService } from "../service/client";
import { FeedItem, Story } from "../types";

export function useFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);

  // Mock data transformer - แปลงข้อมูลจาก API ให้ตรงกับ types ที่ UI ใช้อยู่
  const transformApiToFeedItem = (apiItem: any): FeedItem => {
    const baseContent = {
      timestamp: apiItem.createdAt,
      engagement: {
        likes: apiItem.likesCount || 0,
        comments:
          apiItem.comments?.map((comment: any) => ({
            id: comment.id.toString(),
            user: {
              id: comment.user.id,
              name: comment.user.name,
              avatar: comment.user.avatar,
            },
            text: comment.content,
            timestamp: comment.createdAt,
          })) || [],
      },
    };

    // Map API type to UI type
    switch (apiItem.type) {
      case "quest_completion":
        return {
          id: apiItem.id.toString(),
          type: "quest_complete",
          user: {
            id: apiItem.user.id,
            name: apiItem.user.name,
            avatar: apiItem.user.avatar,
            level: apiItem.user.level,
            title: apiItem.user.bio,
          },
          content: {
            ...baseContent,
            quest: {
              id: apiItem.questSubmission?.quest.id,
              title: apiItem.questSubmission?.quest.title,
              xpEarned: apiItem.questSubmission?.xpEarned || 0,
            },
            image: apiItem.mediaUrl,
          },
        };

      case "level_up":
        return {
          id: apiItem.id.toString(),
          type: "level_up",
          user: {
            id: apiItem.user.id,
            name: apiItem.user.name,
            avatar: apiItem.user.avatar,
            level: apiItem.user.level,
            title: apiItem.user.bio,
          },
          content: {
            ...baseContent,
            previousLevel: apiItem.levelHistory?.levelFrom || 0,
            newLevel: apiItem.levelHistory?.levelTo || 0,
            newTitle: "New Title", // TODO: Get from JobLevel
          },
        };

      case "achievement":
        return {
          id: apiItem.id.toString(),
          type: "achievement",
          user: {
            id: apiItem.user.id,
            name: apiItem.user.name,
            avatar: apiItem.user.avatar,
            level: apiItem.user.level,
            title: apiItem.user.bio,
          },
          content: {
            ...baseContent,
            achievement: {
              id: apiItem.achievement?.achievement.id,
              name: apiItem.achievement?.achievement.name,
              description: apiItem.achievement?.achievement.description,
              icon: apiItem.achievement?.achievement.icon,
            },
          },
        };

      case "post":
      default:
        return {
          id: apiItem.id.toString(),
          type: "post",
          user: {
            id: apiItem.user.id,
            name: apiItem.user.name,
            avatar: apiItem.user.avatar,
            level: apiItem.user.level,
            title: apiItem.user.bio,
          },
          content: {
            ...baseContent,
            text: apiItem.content,
            image: apiItem.mediaUrl,
          },
        };
    }
  };

  const transformApiToStory = (apiStory: any): Story => {
    return {
      id: apiStory.id.toString(),
      user: {
        id: apiStory.user.id,
        name: apiStory.user.name,
        avatar: apiStory.user.avatar,
        level: apiStory.user.level,
      },
      media: {
        type: apiStory.type as "image" | "video",
        url: apiStory.mediaUrl || "",
        thumbnail: apiStory.type === "video" ? apiStory.mediaUrl : undefined,
      },
      questTitle: apiStory.content,
      viewed: apiStory.hasViewed || false,
      expiresAt: apiStory.expiresAt,
    };
  };

  // Load feed data
  const loadFeedData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        // Call API
        const [feedResponse, storiesResponse] = await Promise.all([
          feedService.getFeedItems({
            page: isRefresh ? 1 : page,
            limit: 10,
            userId: 1, // TODO: Get from auth
          }),
          feedService.getStories(1), // TODO: Get from auth
        ]);

        // Transform data
        const transformedFeed = feedResponse.items.map(transformApiToFeedItem);
        const transformedStories = storiesResponse.map(transformApiToStory);

        // Update state
        if (isRefresh) {
          setFeedItems(transformedFeed);
          setPage(1);
        } else {
          setFeedItems((prev) =>
            page === 1 ? transformedFeed : [...prev, ...transformedFeed]
          );
        }

        setStories(transformedStories);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page]
  );

  // Initial load
  useEffect(() => {
    loadFeedData();
  }, []);

  // Refresh function
  const refreshFeed = useCallback(() => {
    loadFeedData(true);
  }, [loadFeedData]);

  // Toggle like
  const toggleLike = useCallback(async (feedItemId: string) => {
    try {
      const result = await feedService.toggleLike(feedItemId);

      // Update local state optimistically
      setFeedItems((prev) =>
        prev.map((item) => {
          if (item.id === feedItemId) {
            const currentLikes = item.content.engagement.likes;
            return {
              ...item,
              content: {
                ...item.content,
                engagement: {
                  ...item.content.engagement,
                  likes: result.liked
                    ? currentLikes + 1
                    : Math.max(0, currentLikes - 1),
                },
              },
            };
          }
          return item;
        })
      );

      return result;
    } catch (err) {
      // Revert on error
      console.error("Toggle like failed:", err);
      throw err;
    }
  }, []);

  // Add comment
  const addComment = useCallback(
    async (feedItemId: string, content: string) => {
      try {
        const newComment = await feedService.createComment(feedItemId, content);

        // Update local state
        setFeedItems((prev) =>
          prev.map((item) => {
            if (item.id === feedItemId) {
              const transformedComment = {
                id: newComment.id.toString(),
                user: {
                  id: newComment.user.id,
                  name: newComment.user.name,
                  avatar: newComment.user.avatar,
                },
                text: newComment.content,
                timestamp: newComment.createdAt,
              };

              return {
                ...item,
                content: {
                  ...item.content,
                  engagement: {
                    ...item.content.engagement,
                    comments: [
                      ...item.content.engagement.comments,
                      transformedComment,
                    ],
                  },
                },
              };
            }
            return item;
          })
        );

        return newComment;
      } catch (err) {
        console.error("Add comment failed:", err);
        throw err;
      }
    },
    []
  );

  // Format time helper
  const formatTimeDiff = useCallback((date: Date | string | number) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
    return "เมื่อสักครู่";
  }, []);

  return {
    feedItems,
    stories,
    isLoading,
    isRefreshing,
    error,
    refreshFeed,
    toggleLike,
    addComment,
    formatTimeDiff,
  };
}
