// src/features/feed/hooks/api.ts
import { useCallback, useEffect, useState } from 'react'

import { useCharacter } from '@src/contexts/CharacterContext'
import { useSmartPolling } from '@src/hooks/useSmartPolling'
import {
  createCacheAwareMutation,
  useCacheStore,
  useFeedStore,
} from '@src/stores'
import { useQueryClient } from '@tanstack/react-query'

import { feedService } from '../services/client'
import { FeedItemUI, StoryUI } from '../types'

export function useFeed() {
  const queryClient = useQueryClient()
  const { character } = useCharacter()

  // Use Zustand store instead of local state
  const {
    feedItems,
    stories,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    page,
    hasMore,
    setFeedItems,
    setStories,
    setLoading,
    setRefreshing,
    setLoadingMore,
    setError,
    setPage,
    setHasMore,
    addFeedItems,
    incrementPage,
    optimisticToggleLike,
    confirmLike,
    rollbackLike,
    optimisticAddComment,
    confirmComment,
    rollbackComment,
  } = useFeedStore()

  // Setup smart polling for feed and notifications (ULTRA FAST MODE)
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['notifications'], ['notifications', 'unread-count']],
    fastPollDuration: 20, // poll เร็ว 20 ครั้งหลัง action (สูงสุด)
    fastInterval: 400, // ทุก 0.4 วินาที (เร็วมาก)
    slowInterval: 10000, // ทุก 10 วินาที (เร็วสุด)
    ultraFastMode: true, // 🚀⚡ ULTRA FAST MODE สำหรับ feed actions
  })

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setLoadingMore(true)

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

      // Use store method for adding items
      addFeedItems(transformedFeed)
      incrementPage()

      const isLastPage =
        feedResponse.pagination.page >= feedResponse.pagination.totalPages

      setHasMore(!isLastPage)
    } catch (err) {
      console.error('Load more failed:', err)
      setError(err as Error)
    } finally {
      setLoadingMore(false)
    }
  }, [
    page,
    hasMore,
    isLoadingMore,
    setLoadingMore,
    addFeedItems,
    incrementPage,
    setHasMore,
    setError,
  ])

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
          setRefreshing(true)
        } else {
          setLoading(true)
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

        // Update state using store methods
        if (isRefresh) {
          setFeedItems(transformedFeed)
          setPage(1)
        } else {
          if (page === 1) {
            setFeedItems(transformedFeed)
          } else {
            addFeedItems(transformedFeed)
          }
        }

        setStories(transformedStories)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [
      page,
      setRefreshing,
      setLoading,
      setFeedItems,
      setPage,
      addFeedItems,
      setStories,
      setError,
    ]
  )

  // Initial load
  useEffect(() => {
    loadFeedData()
  }, [])

  // Refresh function
  const refreshFeed = useCallback(() => {
    loadFeedData(true)
  }, [loadFeedData])

  // Toggle like with optimistic updates
  const toggleLike = useCallback(
    async (feedItemId: string) => {
      // Find current item to determine hasLiked status
      const currentItem = feedItems.find((item) => item.id === feedItemId)
      if (!currentItem) return

      const newHasLiked = !currentItem.hasLiked

      try {
        // Optimistic update
        optimisticToggleLike(feedItemId, newHasLiked)

        // Trigger cache invalidation
        useCacheStore.getState().invalidateQueriesForAction('like', {
          feedItemId,
          hasLiked: newHasLiked,
        })

        const result = await feedService.toggleLike(feedItemId)

        // Confirm optimistic update with server response
        confirmLike(feedItemId, {
          liked: result.liked,
          likesCount: result.likesCount,
        })

        console.log('👍 Like action - success')
        return result
      } catch (err) {
        console.error('Toggle like failed:', err)
        // Rollback optimistic update
        rollbackLike(feedItemId)
        throw err
      }
    },
    [feedItems, optimisticToggleLike, confirmLike, rollbackLike]
  )

  // Add comment with optimistic updates
  const addComment = useCallback(
    async (feedItemId: string, content: string) => {
      const optimisticCommentId = `optimistic-${Date.now()}`

      try {
        // Create optimistic comment data with current user character
        const optimisticComment = {
          user: {
            id: character?.id || 0,
            name: character?.name || 'You',
            character: character
              ? {
                  id: character.id,
                  name: character.name,
                  portrait: character.portrait,
                  level: character.level,
                }
              : null,
          },
          text: content,
        }

        // Optimistic update
        optimisticAddComment(feedItemId, optimisticComment)

        // Trigger cache invalidation
        useCacheStore
          .getState()
          .invalidateQueriesForAction('comment', { feedItemId, content })

        const newComment = await feedService.createComment(feedItemId, content)

        console.log('💬 Comment created:', newComment)

        // Confirm optimistic update with server response
        confirmComment(feedItemId, {
          id: newComment.id,
          user: newComment.user,
          content: newComment.content,
          createdAt: newComment.createdAt,
        })

        console.log('💬 Comment action - success')
        return newComment
      } catch (err) {
        console.error('Add comment failed:', err)
        // Rollback optimistic update
        rollbackComment(feedItemId, optimisticCommentId)
        throw err
      }
    },
    [optimisticAddComment, confirmComment, rollbackComment]
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
