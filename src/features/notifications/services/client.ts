import { BaseService } from '@src/lib/services/client/baseService'
import { NotificationList, NotificationResponse } from '@src/features/notifications/types'

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

  async getUserNotifications(page: number = 1, limit: number = 20): Promise<NotificationList> {
    console.log('🔍 Fetching notifications:', { page, limit })
    
    const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    console.log('📡 Notification API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Notification API Error:', errorText)
      throw new Error(`Failed to fetch notifications: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Notification API Success:', data)
    return data
  }

  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }

    return response.json()
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read')
    }

    return response.json()
  }

  async getUnreadCount(): Promise<{ count: number }> {
    console.log('🔍 Fetching unread count...')
    
    const response = await fetch('/api/notifications/unread-count', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    console.log('📡 Unread Count API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Unread Count API Error:', errorText)
      throw new Error(`Failed to get unread count: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Unread Count API Success:', data)
    return data
  }
}

export const notificationService = NotificationService.getInstance() 