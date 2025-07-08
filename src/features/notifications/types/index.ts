export interface NotificationBase {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  userId: number
}

export interface CreateNotificationData {
  type: string
  title: string
  message: string
  userId: number
}

export interface NotificationResponse extends NotificationBase {
  user?: {
    id: number
    name: string
  }
}

export interface NotificationList {
  notifications: NotificationResponse[]
  unreadCount: number
}

// Notification types for different events
export const NotificationTypes = {
  LIKE: 'like',
  COMMENT: 'comment',
  REPLY: 'reply',
  FOLLOW: 'follow',
  MENTION: 'mention',
  SYSTEM: 'system',
} as const

export type NotificationTypeValue = typeof NotificationTypes[keyof typeof NotificationTypes]

// Notification templates
export const NotificationTemplates = {
  LIKE: {
    type: NotificationTypes.LIKE,
    title: 'มีคนกดไลค์โพสต์ของคุณ',
    message: '{userName} กดไลค์โพสต์ของคุณ',
  },
  COMMENT: {
    type: NotificationTypes.COMMENT,
    title: 'มีคนแสดงความคิดเห็นโพสต์ของคุณ',
    message: '{userName} แสดงความคิดเห็นในโพสต์ของคุณ: "{comment}"',
  },
  REPLY: {
    type: NotificationTypes.REPLY,
    title: 'มีคนตอบกลับความคิดเห็นของคุณ',
    message: '{userName} ตอบกลับความคิดเห็นของคุณ: "{reply}"',
  },
} as const 