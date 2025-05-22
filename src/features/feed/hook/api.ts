import { useCallback, useEffect, useState } from 'react'

import { feedService } from '../service/client'
import { FeedItemUI, StoryUI } from '../types'

export function useFeed() {
  const [feedItems, setFeedItems] = useState<FeedItemUI[]>([])
  const [stories, setStories] = useState<StoryUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)

      const feedResponse = await feedService.getFeedItems({
        page: page + 1,
        limit: 10,
        userId: 1, // TODO: Get from auth
      })

      const transformedFeed = feedResponse.items.map(transformApiToFeedItem)

      if (transformedFeed.length === 0) {
        setHasMore(false)
      } else {
        setFeedItems((prev) => [...prev, ...transformedFeed])
        setPage((prev) => prev + 1)
      }

      // Check if there are more pages
      setHasMore(
        feedResponse.pagination.page < feedResponse.pagination.totalPages
      )
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, isLoadingMore])

  // Mock data transformer - แปลงข้อมูลจาก API ให้ตรงกับ types ที่ UI ใช้อยู่
  const transformApiToFeedItem = (apiItem: any): FeedItemUI => {
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
    }

    // Base feed item structure
    const baseFeedItem = {
      id: apiItem.id.toString(),
      hasLiked: apiItem.hasLiked || false, // เพิ่ม hasLiked
      user: {
        id: apiItem.user.id,
        name: apiItem.user.name,
        avatar: apiItem.user.avatar,
        level: apiItem.user.level,
        title: apiItem.user.bio,
      },
    }

    // Map API type to UI type
    switch (apiItem.type) {
      case 'quest_completion':
        return {
          ...baseFeedItem,
          type: 'quest_complete',
          content: {
            ...baseContent,
            quest: {
              id: apiItem.questSubmission?.quest.id,
              title: apiItem.questSubmission?.quest.title,
              xpEarned: apiItem.questSubmission?.xpEarned || 0,
            },
            image: apiItem.mediaUrl,
          },
        }

      case 'level_up':
        return {
          ...baseFeedItem,
          type: 'level_up',
          content: {
            ...baseContent,
            previousLevel: apiItem.levelHistory?.levelFrom || 0,
            newLevel: apiItem.levelHistory?.levelTo || 0,
            newTitle: 'New Title',
          },
        }

      case 'achievement':
        return {
          ...baseFeedItem,
          type: 'achievement',
          content: {
            ...baseContent,
            achievement: {
              id: apiItem.achievement?.achievement.id,
              name: apiItem.achievement?.achievement.name,
              description: apiItem.achievement?.achievement.description,
              icon: apiItem.achievement?.achievement.icon,
            },
          },
        }

      case 'post':
      default:
        return {
          ...baseFeedItem,
          type: 'post',
          content: {
            ...baseContent,
            text: apiItem.content,
            image: apiItem.mediaUrl,
          },
        }
    }
  }

  const transformApiToStory = (apiStory: any): StoryUI => {
    return {
      id: apiStory.id.toString(),
      user: {
        id: apiStory.user.id,
        name: apiStory.user.name,
        avatar: apiStory.user.avatar,
        level: apiStory.user.level,
      },
      media: {
        type: apiStory.type as 'image' | 'video',
        url: apiStory.mediaUrl || '',
        thumbnail: apiStory.type === 'video' ? apiStory.mediaUrl : undefined,
      },
      questTitle: apiStory.content,
      viewed: apiStory.hasViewed || false,
      expiresAt: apiStory.expiresAt,
    }
  }

  // Load feed data
  const loadFeedData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        // Call API
        const [feedResponse, storiesResponse] = await Promise.all([
          feedService.getFeedItems({
            page: isRefresh ? 1 : page,
            limit: 10,
            userId: 1, // TODO: Get from auth
          }),
          feedService.getStories(1), // TODO: Get from auth
        ])

        // Transform data
        const transformedFeed = feedResponse.items.map(transformApiToFeedItem)
        const transformedStories = storiesResponse.map(transformApiToStory)

        // Update state
        if (isRefresh) {
          setFeedItems(transformedFeed)
          setPage(1)
        } else {
          setFeedItems((prev) =>
            page === 1 ? transformedFeed : [...prev, ...transformedFeed]
          )
        }

        setStories(transformedStories)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page]
  )

  // Initial load
  useEffect(() => {
    loadFeedData()
  }, [])

  // Refresh function
  const refreshFeed = useCallback(() => {
    loadFeedData(true)
  }, [loadFeedData])

  // Toggle like
  const toggleLike = useCallback(async (feedItemId: string) => {
    try {
      const result = await feedService.toggleLike(feedItemId)

      // Update local state
      setFeedItems((prev) =>
        prev.map((item) => {
          if (item.id === feedItemId) {
            return {
              ...item,
              hasLiked: result.liked, // Update hasLiked status
              content: {
                ...item.content,
                engagement: {
                  ...item.content.engagement,
                  likes: result.liked
                    ? item.content.engagement.likes + 1
                    : Math.max(0, item.content.engagement.likes - 1),
                },
              },
            }
          }
          return item
        })
      )

      return result
    } catch (err) {
      console.error('Toggle like failed:', err)
      throw err
    }
  }, [])

  // Add comment
  const addComment = useCallback(
    async (feedItemId: string, content: string) => {
      try {
        const newComment = await feedService.createComment(feedItemId, content)
        console.log(newComment)

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
              }

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
              }
            }
            return item
          })
        )

        return newComment
      } catch (err) {
        console.error('Add comment failed:', err)
        throw err
      }
    },
    []
  )

  // Format time helper
  const formatTimeDiff = useCallback((date: Date | string | number) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} วันที่แล้ว`
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`
    return 'เมื่อสักครู่'
  }, [])

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
    loadMore,
    hasMore,
    isLoadingMore,
  }
}
