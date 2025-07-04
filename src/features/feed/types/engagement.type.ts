import { Character } from '@prisma/client'

export interface CommentUI {
  id: string
  user: {
    id: number
    name: string
    character: Character
  }
  text: string
  timestamp: string | Date
}

export interface LikeUserUI {
  id: number
  user: {
    id: number
    name: string
    character?: Character & {
      currentJobLevel?: {
        id: number
        title: string
      }
    }
  }
  createdAt: string | Date
}

export interface UserEngagement {
  likes: number
  comments: CommentUI[]
  likeUsers?: LikeUserUI[]
}
