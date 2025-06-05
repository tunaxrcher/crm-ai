export interface CommentUI {
  id: string
  user: {
    id: number
    name: string
    avatar: string
  }
  text: string
  timestamp: string | Date
}

export interface UserEngagement {
  likes: number
  comments: CommentUI[]
}
