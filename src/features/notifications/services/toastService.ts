import { useToast } from '@src/components/shared/SimpleToast'

export class NotificationToastService {
  private static instance: NotificationToastService
  private lastUnreadCount = 0
  private lastNotificationId = 0
  private shownNotificationIds = new Set<number>() // Track shown notifications
  private toastContext: ReturnType<typeof useToast> | null = null
  private readonly STORAGE_KEY = 'ai_crm_shown_notifications'
  private readonly STORAGE_TIMESTAMP_KEY = 'ai_crm_last_session_timestamp'

  private constructor() {
    this.loadShownNotificationsFromStorage()
  }

  private loadShownNotificationsFromStorage() {
    try {
      // เช็คว่าเป็น session ใหม่หรือไม่ (ภายใน 5 นาที)
      const lastSessionTimestamp = localStorage.getItem(this.STORAGE_TIMESTAMP_KEY)
      const now = Date.now()
      const fiveMinutesAgo = now - (5 * 60 * 1000)
      
      if (lastSessionTimestamp && parseInt(lastSessionTimestamp) > fiveMinutesAgo) {
        // ยังคือ session เดิม โหลดข้อมูลที่เก็บไว้
        const savedIds = localStorage.getItem(this.STORAGE_KEY)
        if (savedIds) {
          const idsArray = JSON.parse(savedIds) as number[]
          this.shownNotificationIds = new Set(idsArray)
          console.log('🍞 Toast Service - Loaded shown notifications from storage:', idsArray.length, 'items')
        }
      } else {
        // Session ใหม่ เคลียร์ข้อมูลเก่า
        localStorage.removeItem(this.STORAGE_KEY)
        console.log('🍞 Toast Service - New session detected, cleared old shown notifications')
      }
      
      // อัปเดต timestamp ปัจจุบัน
      localStorage.setItem(this.STORAGE_TIMESTAMP_KEY, now.toString())
    } catch (error) {
      console.warn('🍞 Toast Service - Failed to load from localStorage:', error)
    }
  }

  private saveShownNotificationsToStorage() {
    try {
      const idsArray = Array.from(this.shownNotificationIds)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(idsArray))
      localStorage.setItem(this.STORAGE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.warn('🍞 Toast Service - Failed to save to localStorage:', error)
    }
  }

  public static getInstance(): NotificationToastService {
    if (!NotificationToastService.instance) {
      NotificationToastService.instance = new NotificationToastService()
    }
    return NotificationToastService.instance
  }

  public setToastContext(context: ReturnType<typeof useToast>) {
    this.toastContext = context
  }

  public checkForNewNotifications(
    newUnreadCount: number,
    latestNotifications: any[]
  ) {
    console.log('🍞 Toast Service - Checking for new notifications:', {
      newUnreadCount,
      lastUnreadCount: this.lastUnreadCount,
      lastNotificationId: this.lastNotificationId,
      shownNotificationsCount: this.shownNotificationIds.size,
      latestNotifications: latestNotifications.map(n => ({ id: n.id, type: n.type }))
    })
    
    // ตรวจสอบ notification ใหม่ทั้งหมดที่ยังไม่ได้แสดง
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    const newNotifications = latestNotifications
      .filter(notification => {
        // ไม่แสดงถ้าแสดงไปแล้ว
        if (this.shownNotificationIds.has(notification.id)) {
          return false
        }
        
        // ไม่แสดงถ้าเก่าเกิน 5 นาที (เป็น notification เก่าที่ไม่ควรแสดงหลัง refresh)
        const notificationTime = new Date(notification.createdAt).getTime()
        if (notificationTime < fiveMinutesAgo) {
          console.log('🍞 Toast Service - Skipping old notification:', notification.id, 'created:', notification.createdAt)
          return false
        }
        
        return notification.id > this.lastNotificationId
      })
      .sort((a, b) => a.id - b.id) // เรียงจากเก่าไปใหม่ เพื่อแสดงตามลำดับ
    
    console.log('🍞 Toast Service - Found new notifications:', newNotifications.map(n => ({ id: n.id, type: n.type })))
    
    // แสดง toast สำหรับ notification ใหม่ทั้งหมด
    if (newNotifications.length > 0) {
      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          console.log('🍞 Toast Service - Showing toast for:', notification)
          
          // เช็คเฉพาะ like notification
          if (notification.type === 'like') {
            console.log('💖 Toast Service - LIKE notification detected!', {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              userId: notification.userId
            })
          }
          
          this.showToastForNotification(notification)
          this.shownNotificationIds.add(notification.id)
          this.lastNotificationId = Math.max(this.lastNotificationId, notification.id)
          this.saveShownNotificationsToStorage()
        }, index * 1000) // แสดงห่างกัน 1 วินาที
      })
    } else {
      console.log('🍞 Toast Service - No new notifications to show:', {
        unreadCountChanged: newUnreadCount !== this.lastUnreadCount,
        hasNotifications: latestNotifications.length > 0,
        unreadCountComparison: `${newUnreadCount} vs ${this.lastUnreadCount}`
      })
    }
    
    this.lastUnreadCount = newUnreadCount
  }

  private showToastForNotification(notification: any) {
    if (!this.toastContext) {
      console.log('❌ Toast Service - No toast context available')
      return
    }

    console.log('🍞 Toast Service - Showing toast for notification:', notification)

    let toastType: 'success' | 'info' = 'info'
    let toastTitle = ''
    let toastMessage = ''

    switch (notification.type) {
      case 'like':
        console.log('💖 Toast Service - Processing LIKE notification')
        toastType = 'success'
        toastTitle = '💖 มีคนไลค์โพสต์!'
        toastMessage = notification.message
        break
      
      case 'comment':
        toastType = 'info'
        toastTitle = '💬 มีคนคอมเม้นโพสต์!'
        // แสดงข้อความสั้น ๆ สำหรับ toast
        const shortMessage = notification.message.length > 60 
          ? notification.message.substring(0, 60) + '...'
          : notification.message
        toastMessage = shortMessage
        break
      
      case 'reply':
        toastType = 'info'
        toastTitle = '↩️ มีคนตอบกลับ!'
        toastMessage = notification.message
        break
      
      default:
        toastType = 'info'
        toastTitle = '🔔 แจ้งเตือนใหม่'
        toastMessage = notification.message
    }

    console.log('🍞 Toast Service - Adding toast:', {
      type: toastType,
      title: toastTitle,
      message: toastMessage,
      notificationType: notification.type
    })

    this.toastContext.addToast({
      type: toastType,
      title: toastTitle,
      message: toastMessage,
      duration: 5000, // 5 วินาที
    })

    console.log('✅ Toast Service - Toast added successfully!')
  }

  public resetCounters() {
    this.lastUnreadCount = 0
    this.lastNotificationId = 0
    this.shownNotificationIds.clear()
    this.saveShownNotificationsToStorage()
  }
}

export const notificationToastService = NotificationToastService.getInstance() 