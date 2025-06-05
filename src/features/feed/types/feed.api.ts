import type { FeedItemWithRelations } from './feed.type'

// API Responses
export interface FeedResponse {
  items: FeedItemWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ToggleLikeResponse {
  liked: boolean
}

// API Requests
export interface CreatePostRequest {
  content: string
  mediaType?: 'text' | 'image' | 'video'
  mediaUrl?: string
}

export interface CreateCommentRequest {
  content: string
}

export interface GetFeedRequest {
  page?: number
  limit?: number
  type?: string
}
