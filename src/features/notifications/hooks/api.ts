import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@src/features/notifications/services/client'
import { NotificationList, NotificationResponse } from '@src/features/notifications/types'
import { useSmartPolling } from '@src/hooks/useSmartPolling'
import { useNotificationStore, useCacheStore, createCacheAwareMutation } from '@src/stores'
import { useEffect } from 'react'

export function useNotifications(page: number = 1, limit: number = 20) {
  const setNotifications = useNotificationStore((state) => state.setNotifications)
  const setLoading = useNotificationStore((state) => state.setLoading)
  const notificationStoreNotifications = useNotificationStore((state) => state.notifications)
  const isLoading = useNotificationStore((state) => state.isLoading)
  
  // Setup smart polling for notifications
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['notifications'], ['notifications', 'unread-count']],
    fastPollDuration: 12,  // poll เร็ว 12 ครั้งหลัง action (เพิ่มขึ้น)
    fastInterval: 600,     // ทุก 0.6 วินาที (เร็วมาก)
    slowInterval: 15000,   // ทุก 15 วินาที (เร็วขึ้น)
  })

  const query = useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => notificationService.getUserNotifications(page, limit),
    staleTime: 1000, // 1 second (เร็วขึ้น)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // refetch when window gains focus
  })

  // Sync with Zustand store
  useEffect(() => {
    if (query.data?.notifications) {
      // Transform NotificationResponse to NotificationItem
      const transformedNotifications = query.data.notifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt instanceof Date 
          ? notification.createdAt.toISOString()
          : typeof notification.createdAt === 'string'
          ? notification.createdAt
          : new Date(notification.createdAt).toISOString()
      }))
      setNotifications(transformedNotifications)
    }
    setLoading(query.isLoading)
  }, [query.data?.notifications, query.isLoading, setNotifications, setLoading])

  // Return combined data from store and query
  return {
    ...query,
    data: {
      ...query.data,
      notifications: notificationStoreNotifications
    },
    isLoading
  }
}

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  
  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 500, // 0.5 second (เร็วสุด)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // refetch when window gains focus
  })

  // Sync with Zustand store
  useEffect(() => {
    if (query.data?.count !== undefined) {
      setUnreadCount(query.data.count)
    }
  }, [query.data?.count, setUnreadCount])

  return {
    ...query,
    data: { count: unreadCount }
  }
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const invalidateQueriesForAction = useCacheStore((state) => state.invalidateQueriesForAction)
  
  // Create cache-aware mutation
  const markAsReadMutation = createCacheAwareMutation(
    (notificationId: number) => notificationService.markAsRead(notificationId),
    'notification_read',
    (args, result) => ({ notificationId: args[0], result })
  )
  
  return useMutation({
    mutationFn: markAsReadMutation,
    onMutate: async (notificationId) => {
      // Optimistic update in store
      markAsRead(notificationId)
      return { notificationId }
    },
    onSuccess: () => {
      // Cache invalidation is handled by createCacheAwareMutation
      console.log('✅ Notification marked as read successfully')
    },
    onError: (error, notificationId) => {
      console.error('❌ Failed to mark notification as read:', error)
      // Could implement rollback here if needed
    }
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const invalidateQueriesForAction = useCacheStore((state) => state.invalidateQueriesForAction)
  
  // Create cache-aware mutation
  const markAllAsReadMutation = createCacheAwareMutation(
    () => notificationService.markAllAsRead(),
    'notification_read'
  )
  
  return useMutation({
    mutationFn: markAllAsReadMutation,
    onMutate: async () => {
      // Optimistic update in store
      markAllAsRead()
      return { allMarked: true }
    },
    onSuccess: () => {
      // Cache invalidation is handled by createCacheAwareMutation
      console.log('✅ All notifications marked as read successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to mark all notifications as read:', error)
      // Could implement rollback here if needed
    }
  })
} 