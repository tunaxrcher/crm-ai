import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@src/features/notifications/services/client'
import { NotificationList, NotificationResponse } from '@src/features/notifications/types'
import { useSmartPolling } from '@src/hooks/useSmartPolling'

export function useNotifications(page: number = 1, limit: number = 20) {
  // Setup smart polling for notifications
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['notifications'], ['notifications', 'unread-count']],
    fastPollDuration: 12,  // poll เร็ว 12 ครั้งหลัง action (เพิ่มขึ้น)
    fastInterval: 600,     // ทุก 0.6 วินาที (เร็วมาก)
    slowInterval: 15000,   // ทุก 15 วินาที (เร็วขึ้น)
  })

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => notificationService.getUserNotifications(page, limit),
    staleTime: 1000, // 1 second (เร็วขึ้น)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // refetch when window gains focus
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 500, // 0.5 second (เร็วสุด)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // refetch when window gains focus
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['notifications'], ['notifications', 'unread-count']]
  })
  
  return useMutation({
    mutationFn: (notificationId: number) => 
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      // Trigger fast polling for immediate updates
      triggerFastPolling()
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const { triggerFastPolling } = useSmartPolling({
    queryKeys: [['notifications'], ['notifications', 'unread-count']]
  })
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      // Trigger fast polling for immediate updates
      triggerFastPolling()
    },
  })
} 