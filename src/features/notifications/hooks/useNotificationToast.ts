import { useEffect, useRef } from 'react'

import { useToast } from '@src/components/shared/SimpleToast'
import { useSession } from 'next-auth/react'

import { notificationToastService } from '../services/toastService'
import { useNotifications, useUnreadCount } from './api'

export function useNotificationToast() {
  const toastContext = useToast()
  const { data: session } = useSession()
  const { data: notificationData } = useNotifications(1, 5) // ดึง 5 notification ล่าสุด
  const { data: unreadCountData } = useUnreadCount()
  const isInitialized = useRef(false)
  const currentUserId = useRef<string | null>(null)

  // ตั้งค่า toast context ใน service
  useEffect(() => {
    notificationToastService.setToastContext(toastContext)
  }, [toastContext])

  // Reset เมื่อเปลี่ยน user
  useEffect(() => {
    const userId = session?.user?.id
    if (userId && userId !== currentUserId.current) {
      console.log('🍞 User changed, resetting toast service counters')
      notificationToastService.resetCounters()
      isInitialized.current = false
      currentUserId.current = userId
    }
  }, [session?.user?.id])

  // ตรวจสอบ notification ใหม่
  useEffect(() => {
    if (!notificationData || !unreadCountData || !session?.user?.id) return

    const notifications = notificationData.notifications || []
    const unreadCount = unreadCountData.count || 0

    console.log('🍞 Notification data received:', {
      unreadCount,
      notificationsCount: notifications.length,
      isInitialized: isInitialized.current,
      latestNotifications: notifications
        .slice(0, 3)
        .map((n) => ({ id: n.id, type: n.type, createdAt: n.createdAt })),
    })

    // รอให้ initialize ครับก่อน
    if (!isInitialized.current) {
      // ตั้งค่า initial values
      console.log('🍞 Initializing toast service...')
      console.log('🍞 Initial notifications check:', {
        unreadCount,
        notifications: notifications.slice(0, 5).map((n) => ({
          id: n.id,
          type: n.type,
          message: n.message.substring(0, 50) + '...',
        })),
      })
      notificationToastService.checkForNewNotifications(
        unreadCount,
        notifications
      )
      isInitialized.current = true
      return
    }

    // เช็คว่ามี notification ใหม่
    console.log('🍞 Checking for new notifications...')
    notificationToastService.checkForNewNotifications(
      unreadCount,
      notifications
    )
  }, [notificationData, unreadCountData, session?.user?.id])

  // Reset เมื่อ component unmount
  useEffect(() => {
    return () => {
      notificationToastService.resetCounters()
    }
  }, [])
}
