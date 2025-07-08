// src/features/feed/hooks/api.ts
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { feedService } from '../services/client'
import { FeedItemUI, StoryUI } from '../types'
import { useSmartPolling } from '@src/hooks/useSmartPolling'

export function useFeed() {
  const queryClient = useQueryClient()
  const [feedItems, setFeedItems] = useState<FeedItemUI[]>([])
  const [stories, setStories] = useState<StoryUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Setup smart polling for feed and notifications (ULTRA FAST MODE)
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['notifications'], ['notifications', 'unread-count']],
    fastPollDuration: 20,  // poll เร็ว 20 ครั้งหลัง action (สูงสุด)
    fastInterval: 400,     // ทุก 0.4 วินาที (เร็วมาก)
    slowInterval: 10000,   // ทุก 10 วินาที (เร็วสุด)
    ultraFastMode: true,   // 🚀⚡ ULTRA FAST MODE สำหรับ feed actions
  })

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)

      const feedResponse = await feedService.getFeedItems({
        page: page + 1,
        limit: 10,
      })

      const transformedFeed = feedResponse.items.map(transformApiToFeedItem)

      if (transformedFeed.length === 0) {
        console.log('[Feed] No more items. Stopping load.')
        setHasMore(false)
        return
      }

      setFeedItems((prev) => [...prev, ...transformedFeed])
      setPage((prev) => prev + 1)

      const isLastPage =
        feedResponse.pagination.page >= feedResponse.pagination.totalPages

      setHasMore(!isLastPage)
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
              character: comment.user.character,
            },
            text: comment.content,
            timestamp: comment.createdAt,
          })) || [],
        likeUsers:
          apiItem.likes?.map((like: any) => ({
            id: like.id,
            user: {
              id: like.user.id,
              name: like.user.name,
              character: like.user.character,
            },
            createdAt: like.createdAt,
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
        title: apiItem.user.bio,
        character: apiItem.user.character,
      },
      // คัดลอกฟิลด์ post, mediaType และ mediaUrl จาก API
      post: apiItem.post,
      mediaType: apiItem.mediaType,
      mediaUrl: apiItem.mediaUrl,
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
            newTitle: '',
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
        character: apiStory.user.character,
      },
      media: {
        type: apiStory.type as 'image' | 'video' | 'text',
        url: apiStory.mediaUrl || '',
        // ใช้ thumbnailUrl ถ้ามี หรือใช้ mediaUrl ถ้าเป็นรูปภาพ
        thumbnail:
          apiStory.thumbnailUrl ||
          (apiStory.type === 'image' ? apiStory.mediaUrl : undefined),
      },
      questTitle: apiStory.content,
      text: apiStory.text,
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
          }),
          feedService.getStories(),
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
                  // Note: likeUsers will be updated when the feed is refreshed
                  // For now, we'll just update the count
                },
              },
            }
          }
          return item
        })
      )

      // Trigger smart polling for fast updates
      console.log('👍 Like action - triggering smart polling for notifications')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      triggerFastPolling()

      return result
    } catch (err) {
      console.error('Toggle like failed:', err)
      throw err
    }
  }, [queryClient])

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
                  character: newComment.user.character,
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

        // Trigger smart polling for fast updates
        console.log('💬 Comment action - triggering smart polling for notifications')
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        triggerFastPolling()

        return newComment
      } catch (err) {
        console.error('Add comment failed:', err)
        throw err
      }
    },
    [queryClient]
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
