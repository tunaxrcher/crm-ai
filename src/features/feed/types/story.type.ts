import type { Story, StoryView, User } from '@prisma/client'

export interface StoryWithRelations extends Story {
  user: User
  views: StoryView[]
  hasViewed?: boolean
  viewsCount?: number
}

export type StoryMediaType = 'image' | 'video' | 'text'
