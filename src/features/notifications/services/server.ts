import { BaseService } from '@src/lib/services/server/baseService'
import { notificationRepository } from '@src/features/notifications/repository'
import { 
  CreateNotificationData, 
  NotificationTypes, 
  NotificationTemplates 
} from '@src/features/notifications/types'
import { getServerSession } from '@src/lib/auth'

export class NotificationService extends BaseService {
  private static instance: NotificationService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async createNotification(data: CreateNotificationData) {
    console.log(`[SERVER] Creating notification: ${data.type}`)
    console.log('📝 Full notification data:', data)
    
    const notificationRecord = {
      type: data.type,
      title: data.title,
      message: data.message,
      userId: data.userId,
      isRead: false,
    }
    
    console.log('💾 Saving to database:', notificationRecord)
    
    const result = await notificationRepository.create(notificationRecord)
    
    console.log('✅ Notification saved to database:', result)
    
    return result
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    
    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.findByUserId(userId, {
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      notificationRepository.getUnreadCount(userId),
    ])

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        hasMore: notifications.length === limit,
      },
    }
  }

  async markAsRead(notificationId: number) {
    return notificationRepository.markAsRead(notificationId)
  }

  async markAllAsRead(userId: number) {
    return notificationRepository.markAllAsRead(userId)
  }

  async getUnreadCount(userId: number) {
    return notificationRepository.getUnreadCount(userId)
  }

  // Helper methods for creating specific types of notifications
  async createLikeNotification(data: { 
    feedOwnerId: number, 
    likerName: string 
  }) {
    console.log('🔔 Creating like notification:', data)
    
    const template = NotificationTemplates.LIKE
    const message = template.message.replace('{userName}', data.likerName)

    const notificationData = {
      type: template.type,
      title: template.title,
      message,
      userId: data.feedOwnerId,
    }
    
    console.log('📝 Like notification data to create:', notificationData)

    const result = await this.createNotification(notificationData)
    
    console.log('✅ Like notification created with ID:', result.id)
    
    // เพิ่ม delay เล็กน้อยเพื่อให้แน่ใจว่า database commit แล้ว
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('💾 Like notification committed to database')
    
    return result
  }

  async createCommentNotification(data: { 
    feedOwnerId: number, 
    commenterName: string, 
    comment: string 
  }) {
    console.log('🔔 Creating comment notification:', data)
    
    const template = NotificationTemplates.COMMENT
    const shortComment = data.comment.length > 50 
      ? data.comment.substring(0, 50) + '...' 
      : data.comment
    
    const message = template.message
      .replace('{userName}', data.commenterName)
      .replace('{comment}', shortComment)

    const notificationData = {
      type: template.type,
      title: template.title,
      message,
      userId: data.feedOwnerId,
    }
    
    console.log('📝 Comment notification data to create:', notificationData)

    const result = await this.createNotification(notificationData)
    
    console.log('✅ Comment notification created:', result)
    
    return result
  }

  async createReplyNotification(data: { 
    originalCommenterId: number, 
    replierName: string, 
    reply: string 
  }) {
    const template = NotificationTemplates.REPLY
    const shortReply = data.reply.length > 50 
      ? data.reply.substring(0, 50) + '...' 
      : data.reply
    
    const message = template.message
      .replace('{userName}', data.replierName)
      .replace('{reply}', shortReply)

    return this.createNotification({
      type: template.type,
      title: template.title,
      message,
      userId: data.originalCommenterId,
    })
  }
}

export const notificationService = NotificationService.getInstance() 