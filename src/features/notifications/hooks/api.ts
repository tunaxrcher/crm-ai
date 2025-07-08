import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@src/features/notifications/services/client'
import { NotificationList, NotificationResponse } from '@src/features/notifications/types'

export function useNotifications(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => notificationService.getUserNotifications(page, limit),
    staleTime: 3 * 1000, // 3 seconds (shorter for faster updates)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // refetch when window gains focus
    refetchInterval: 10 * 1000, // refetch every 10 seconds (aligned with unread count)
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 3 * 1000, // 3 seconds (shorter for faster updates)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 1000, // refetch every 10 seconds (aligned with notifications)
    refetchOnWindowFocus: true, // refetch when window gains focus
    refetchIntervalInBackground: true, // refetch even when tab is not active
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (notificationId: number) => 
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
} 