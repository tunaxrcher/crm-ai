import { useNotificationStore } from '@src/stores'

export class ZustandNotificationToastService {
  private static instance: ZustandNotificationToastService
  private lastUnreadCount = 0
  private lastNotificationId = 0

  private constructor() {}

  public static getInstance(): ZustandNotificationToastService {
    if (!ZustandNotificationToastService.instance) {
      ZustandNotificationToastService.instance = new ZustandNotificationToastService()
    }
    return ZustandNotificationToastService.instance
  }

  public checkForNewNotifications(
    newUnreadCount: number,
    latestNotifications: any[]
  ) {
    const store = useNotificationStore.getState()
    
    console.log('🍞 Toast Service (Zustand) - Checking for new notifications:', {
      newUnreadCount,
      lastUnreadCount: this.lastUnreadCount,
      lastNotificationId: this.lastNotificationId,
      shownNotificationsCount: store.shownNotificationIds.size,
      latestNotifications: latestNotifications.map(n => ({ id: n.id, type: n.type }))
    })
    
    // Clean expired shown IDs
    store.clearExpiredShownIds()
    
    // ตรวจสอบ notification ใหม่ทั้งหมดที่ยังไม่ได้แสดง
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    const newNotifications = latestNotifications
      .filter(notification => {
        // ไม่แสดงถ้าแสดงไปแล้ว
        if (store.hasBeenShown(notification.id.toString())) {
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
    
    console.log('🍞 Toast Service (Zustand) - Found new notifications:', newNotifications.map(n => ({ id: n.id, type: n.type })))
    
    // แสดง toast สำหรับ notification ใหม่ทั้งหมด
    if (newNotifications.length > 0) {
      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          console.log('🍞 Toast Service (Zustand) - Showing toast for:', notification)
          
          // เช็คเฉพาะ like notification
          if (notification.type === 'like') {
            console.log('💖 Toast Service - LIKE notification detected!', {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              userId: notification.userId
            })
          }
          
          this.showToastForNotification(notification, store)
          store.markAsShown(notification.id.toString())
          this.lastNotificationId = Math.max(this.lastNotificationId, notification.id)
        }, index * 1000) // แสดงห่างกัน 1 วินาที
      })
    } else {
      console.log('🍞 Toast Service (Zustand) - No new notifications to show:', {
        unreadCountChanged: newUnreadCount !== this.lastUnreadCount,
        hasNotifications: latestNotifications.length > 0,
        unreadCountComparison: `${newUnreadCount} vs ${this.lastUnreadCount}`
      })
    }
    
    this.lastUnreadCount = newUnreadCount
  }

  private showToastForNotification(notification: any, store: ReturnType<typeof useNotificationStore.getState>) {
    if (!store.enableToasts) {
      console.log('🍞 Toast Service - Toasts disabled')
      return
    }

    console.log('🍞 Toast Service (Zustand) - Showing toast for notification:', notification)

    let toastType: 'success' | 'info' | 'warning' | 'error' = 'info'
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

    console.log('🍞 Toast Service (Zustand) - Adding toast:', {
      type: toastType,
      title: toastTitle,
      message: toastMessage,
      notificationType: notification.type
    })

    const toastId = store.addToast({
      type: toastType,
      title: toastTitle,
      message: toastMessage,
      duration: 5000, // 5 วินาที
    })

    console.log('✅ Toast Service (Zustand) - Toast added successfully!', { toastId })
  }

  public resetCounters() {
    this.lastUnreadCount = 0
    this.lastNotificationId = 0
    
    const store = useNotificationStore.getState()
    store.clearToasts()
    // Don't clear shownNotificationIds as it's managed by store persistence
  }

  // Additional utility methods
  public markNotificationAsShown(notificationId: string): void {
    const store = useNotificationStore.getState()
    store.markAsShown(notificationId)
  }

  public getShownNotificationsCount(): number {
    const store = useNotificationStore.getState()
    return store.shownNotificationIds.size
  }

  public clearAllShownNotifications(): void {
    const store = useNotificationStore.getState()
    store.clearExpiredShownIds()
  }
}

export const zustandNotificationToastService = ZustandNotificationToastService.getInstance() 