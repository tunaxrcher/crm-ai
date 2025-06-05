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

export interface UserEngagement {
  likes: number
  comments: CommentUI[]
}
