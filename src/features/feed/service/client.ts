// src/features/feed/service/client.ts
import { BaseService } from '@src/lib/service/client/baseService'

export class FeedService extends BaseService {
  private static instance: FeedService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService()
    }
    return FeedService.instance
  }

  // Feed methods
  async getFeedItems(params: {
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await fetch(`/api/feed?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch feed')
    return response.json()
  }

  async createPost(data: {
    content: string
    mediaType?: 'text' | 'image' | 'video'
    mediaUrl?: string
  }) {
    const response = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'post',
        ...data,
      }),
    })
    if (!response.ok) throw new Error('Failed to create post')
    return response.json()
  }

  // Story methods
  async getStories(userId?: number) {
    const params = userId ? `?userId=${userId}` : ''
    const response = await fetch(`/api/stories${params}`)
    if (!response.ok) throw new Error('Failed to fetch stories')
    return response.json()
  }

  async markStoryAsViewed(storyId: string) {
    const response = await fetch(`/api/stories/${storyId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1, // TODO: Get from auth
      }),
    })
    if (!response.ok) throw new Error('Failed to mark story as viewed')
    return response.json()
  }

  // Like methods
  async toggleLike(feedItemId: string) {
    const response = await fetch(`/api/feed/${feedItemId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Failed to toggle like')
    return response.json()
  }

  // Comment methods
  async createComment(feedItemId: string, content: string) {
    const response = await fetch(`/api/feed/${feedItemId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
      }),
    })
    if (!response.ok) throw new Error('Failed to create comment')
    return response.json()
  }

  async createReplyComment(commentId: string, content: string) {
    const response = await fetch(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
      }),
    })
    if (!response.ok) throw new Error('Failed to create reply')
    return response.json()
  }
}

export const feedService = FeedService.getInstance()
