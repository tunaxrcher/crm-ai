import type { FeedItemType, StoryMediaType } from '.'
import type { CommentUI, UserEngagement } from './engagement.type'

export interface FeedItemUI {
  id: string
  type: FeedItemType
  hasLiked?: boolean
  user: {
    id: number
    name: string
    avatar: string
    level?: number
    title?: string
  }
  content: {
    timestamp: string | Date
    engagement: UserEngagement
    // Type-specific content
    quest?: {
      id: number
      title: string
      xpEarned: number
    }
    image?: string
    previousLevel?: number
    newLevel?: number
    newTitle?: string
    achievement?: {
      id: number
      name: string
      description: string
      icon: string
    }
    text?: string
  }
  // Additional fields for API compatibility
  post?: string
  mediaType?: string
  mediaUrl?: string
}

export interface StoryUI {
  id: string
  user: {
    id: number
    name: string
    avatar: string
    level?: number
  }
  media: {
    type: StoryMediaType
    url: string
    thumbnail?: string
  }
  questTitle?: string
  text?: string
  viewed: boolean
  expiresAt: string | Date
}
