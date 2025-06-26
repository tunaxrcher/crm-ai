import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { checkinService } from '../services/client'
import type { CheckinRequest, CheckoutRequest } from '../types'

// Query keys
export const checkinQueryKeys = {
  all: ['checkin'] as const,
  status: () => [...checkinQueryKeys.all, 'status'] as const,
  workLocations: () => [...checkinQueryKeys.all, 'work-locations'] as const,
  history: (limit?: number) =>
    [...checkinQueryKeys.all, 'history', limit] as const,
  today: () => [...checkinQueryKeys.all, 'today'] as const,
}

// Hook สำหรับดึงสถานที่ทำงาน
export function useWorkLocations() {
  return useQuery({
    queryKey: checkinQueryKeys.workLocations(),
    queryFn: () => checkinService.getWorkLocations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook สำหรับดึงสถานะ checkin
export function useCheckinStatus() {
  return useQuery({
    queryKey: checkinQueryKeys.status(),
    queryFn: () => checkinService.getStatus(),
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

// Hook สำหรับตรวจสอบ location
export function useCheckLocation() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      checkinService.checkLocation(lat, lng),
  })
}

// Hook สำหรับ checkin
export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CheckinRequest) => checkinService.checkin(request),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: checkinQueryKeys.status() })
      queryClient.invalidateQueries({ queryKey: checkinQueryKeys.today() })
      queryClient.invalidateQueries({ queryKey: checkinQueryKeys.history() })
    },
  })
}

// Hook สำหรับ checkout
export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CheckoutRequest) => checkinService.checkout(request),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: checkinQueryKeys.status() })
      queryClient.invalidateQueries({ queryKey: checkinQueryKeys.today() })
      queryClient.invalidateQueries({ queryKey: checkinQueryKeys.history() })
    },
  })
}

// Hook สำหรับดูประวัติ checkin/checkout
export function useCheckinHistory(limit: number = 30) {
  return useQuery({
    queryKey: checkinQueryKeys.history(limit),
    queryFn: () => checkinService.getHistory(limit),
  })
}

// Hook สำหรับดู checkin วันนี้
export function useTodayCheckins() {
  return useQuery({
    queryKey: checkinQueryKeys.today(),
    queryFn: () => checkinService.getTodayCheckins(),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}
