import { FeedItemUI, StoryUI } from '@src/features/feed/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface FeedState {
  // Feed data
  feedItems: FeedItemUI[]
  stories: StoryUI[]

  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  isLoadingMore: boolean

  // Pagination
  page: number
  hasMore: boolean

  // Error state
  error: Error | null

  // Optimistic updates tracking
  optimisticUpdates: Record<
    string,
    {
      type: 'like' | 'comment'
      timestamp: number
      data: any
    }
  >

  // Cache metadata
  lastFetchTime: number
  cacheValidUntil: number
}

interface FeedActions {
  // Data actions
  setFeedItems: (items: FeedItemUI[]) => void
  addFeedItems: (items: FeedItemUI[]) => void
  setStories: (stories: StoryUI[]) => void

  // Loading actions
  setLoading: (loading: boolean) => void
  setRefreshing: (refreshing: boolean) => void
  setLoadingMore: (loading: boolean) => void

  // Pagination actions
  setPage: (page: number) => void
  incrementPage: () => void
  setHasMore: (hasMore: boolean) => void

  // Error actions
  setError: (error: Error | null) => void

  // Feed item actions
  updateFeedItem: (id: string, updates: Partial<FeedItemUI>) => void
  removeFeedItem: (id: string) => void

  // Like actions (with optimistic updates)
  optimisticToggleLike: (feedItemId: string, hasLiked: boolean) => void
  confirmLike: (
    feedItemId: string,
    result: { liked: boolean; likesCount: number }
  ) => void
  rollbackLike: (feedItemId: string) => void

  // Comment actions (with optimistic updates)
  optimisticAddComment: (feedItemId: string, comment: any) => void
  confirmComment: (feedItemId: string, comment: any) => void
  rollbackComment: (feedItemId: string, optimisticCommentId: string) => void

  // Cache actions
  updateCacheTime: () => void
  isCacheValid: () => boolean
  invalidateCache: () => void

  // Reset actions
  reset: () => void
  resetPagination: () => void
}

const initialState: FeedState = {
  feedItems: [],
  stories: [],
  isLoading: true,
  isRefreshing: false,
  isLoadingMore: false,
  page: 1,
  hasMore: true,
  error: null,
  optimisticUpdates: {},
  lastFetchTime: 0,
  cacheValidUntil: 0,
}

export const useFeedStore = create<FeedState & FeedActions>()(
  immer((set, get) => ({
    ...initialState,

    // Data actions
    setFeedItems: (items) =>
      set((state) => {
        state.feedItems = items
        state.isLoading = false
        state.isRefreshing = false
        state.updateCacheTime()
      }),

    addFeedItems: (items) =>
      set((state) => {
        // Avoid duplicates
        const existingIds = new Set(state.feedItems.map((item) => item.id))
        const newItems = items.filter((item) => !existingIds.has(item.id))

        state.feedItems.push(...newItems)
        state.isLoadingMore = false

        // Update hasMore based on received items
        if (items.length === 0) {
          state.hasMore = false
        }

        state.updateCacheTime()
      }),

    setStories: (stories) =>
      set((state) => {
        state.stories = stories
      }),

    // Loading actions
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    setRefreshing: (refreshing) =>
      set((state) => {
        state.isRefreshing = refreshing
      }),

    setLoadingMore: (loading) =>
      set((state) => {
        state.isLoadingMore = loading
      }),

    // Pagination actions
    setPage: (page) =>
      set((state) => {
        state.page = page
      }),

    incrementPage: () =>
      set((state) => {
        state.page += 1
      }),

    setHasMore: (hasMore) =>
      set((state) => {
        state.hasMore = hasMore
      }),

    // Error actions
    setError: (error) =>
      set((state) => {
        state.error = error
        state.isLoading = false
        state.isRefreshing = false
        state.isLoadingMore = false
      }),

    // Feed item actions
    updateFeedItem: (id, updates) =>
      set((state) => {
        const itemIndex = state.feedItems.findIndex((item) => item.id === id)
        if (itemIndex !== -1) {
          Object.assign(state.feedItems[itemIndex], updates)
        }
      }),

    removeFeedItem: (id) =>
      set((state) => {
        state.feedItems = state.feedItems.filter((item) => item.id !== id)
      }),

    // Like actions with optimistic updates
    optimisticToggleLike: (feedItemId, hasLiked) =>
      set((state) => {
        const item = state.feedItems.find((item) => item.id === feedItemId)
        if (!item) return

        // Store original state for rollback
        const originalState = {
          hasLiked: item.hasLiked,
          likes: item.content.engagement.likes,
        }

        state.optimisticUpdates[`like-${feedItemId}`] = {
          type: 'like',
          timestamp: Date.now(),
          data: originalState,
        }

        // Apply optimistic update
        item.hasLiked = hasLiked
        item.content.engagement.likes = hasLiked
          ? item.content.engagement.likes + 1
          : Math.max(0, item.content.engagement.likes - 1)
      }),

    confirmLike: (feedItemId, result) =>
      set((state) => {
        const item = state.feedItems.find((item) => item.id === feedItemId)
        if (!item) return

        // Remove optimistic update tracking
        delete state.optimisticUpdates[`like-${feedItemId}`]

        // Update with server response
        item.hasLiked = result.liked
        item.content.engagement.likes = result.likesCount
      }),

    rollbackLike: (feedItemId) =>
      set((state) => {
        const optimisticUpdate = state.optimisticUpdates[`like-${feedItemId}`]
        const item = state.feedItems.find((item) => item.id === feedItemId)

        if (!optimisticUpdate || !item) return

        // Restore original state
        const { hasLiked, likes } = optimisticUpdate.data
        item.hasLiked = hasLiked
        item.content.engagement.likes = likes

        // Remove tracking
        delete state.optimisticUpdates[`like-${feedItemId}`]
      }),

    // Comment actions with optimistic updates
    optimisticAddComment: (feedItemId, comment) =>
      set((state) => {
        const item = state.feedItems.find((item) => item.id === feedItemId)
        if (!item) return

        const optimisticComment = {
          id: `optimistic-${Date.now()}`,
          user: comment.user,
          text: comment.text,
          timestamp: new Date().toISOString(),
        }

        // Add optimistic comment
        item.content.engagement.comments.push(optimisticComment)

        // Track for potential rollback
        state.optimisticUpdates[
          `comment-${feedItemId}-${optimisticComment.id}`
        ] = {
          type: 'comment',
          timestamp: Date.now(),
          data: optimisticComment,
        }
      }),

    confirmComment: (feedItemId, comment) =>
      set((state) => {
        const item = state.feedItems.find((item) => item.id === feedItemId)
        if (!item) return

        // Find and replace optimistic comment with real one
        const commentIndex = item.content.engagement.comments.findIndex(
          (c) => c.id.startsWith('optimistic-') && c.text === comment.text
        )

        if (commentIndex !== -1) {
          // Remove optimistic comment
          const optimisticComment =
            item.content.engagement.comments[commentIndex]
          item.content.engagement.comments.splice(commentIndex, 1)

          // Add real comment
          item.content.engagement.comments.push({
            id: comment.id.toString(),
            user: comment.user,
            text: comment.content,
            timestamp: comment.createdAt,
          })

          // Clean up tracking
          delete state.optimisticUpdates[
            `comment-${feedItemId}-${optimisticComment.id}`
          ]
        }
      }),

    rollbackComment: (feedItemId, optimisticCommentId) =>
      set((state) => {
        const item = state.feedItems.find((item) => item.id === feedItemId)
        if (!item) return

        // Remove optimistic comment
        item.content.engagement.comments =
          item.content.engagement.comments.filter(
            (c) => c.id !== optimisticCommentId
          )

        // Clean up tracking
        delete state.optimisticUpdates[
          `comment-${feedItemId}-${optimisticCommentId}`
        ]
      }),

    // Cache actions
    updateCacheTime: () =>
      set((state) => {
        const now = Date.now()
        state.lastFetchTime = now
        state.cacheValidUntil = now + 5 * 60 * 1000 // 5 minutes cache
      }),

    isCacheValid: () => {
      const state = get()
      return Date.now() < state.cacheValidUntil
    },

    invalidateCache: () =>
      set((state) => {
        state.cacheValidUntil = 0
      }),

    // Reset actions
    reset: () => set(initialState),

    resetPagination: () =>
      set((state) => {
        state.page = 1
        state.hasMore = true
        state.feedItems = []
      }),
  }))
)

// Selectors for performance
export const useFeedItems = () => useFeedStore((state) => state.feedItems)
export const useFeedStories = () => useFeedStore((state) => state.stories)
export const useFeedLoading = () => useFeedStore((state) => state.isLoading)
export const useFeedRefreshing = () =>
  useFeedStore((state) => state.isRefreshing)
export const useFeedLoadingMore = () =>
  useFeedStore((state) => state.isLoadingMore)
export const useFeedPagination = () =>
  useFeedStore((state) => ({
    page: state.page,
    hasMore: state.hasMore,
  }))
export const useFeedError = () => useFeedStore((state) => state.error)
export const useFeedCacheStatus = () =>
  useFeedStore((state) => ({
    isValid: state.isCacheValid(),
    lastFetch: state.lastFetchTime,
  }))
