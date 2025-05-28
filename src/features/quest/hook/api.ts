// src/features/quest/hook/api.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { questService } from '../service/client'
import { CompletedQuest, GroupedQuests, Quest } from '../types/index'

// Hook สำหรับดึงข้อมูลภารกิจทั้งหมด
export const useQuests = (userId?: number) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quests', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }
      return await questService.fetchQuests(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 นาที
    gcTime: 10 * 60 * 1000, // 10 นาที (เปลี่ยนจาก cacheTime)
  })

  // จัดกลุ่มภารกิจตามประเภท
  const groupedQuests: GroupedQuests | undefined = data?.activeQuests
    ? {
        daily: data.activeQuests.filter((quest) => quest.type === 'daily'),
        weekly: data.activeQuests.filter((quest) => quest.type === 'weekly'),
        'no-deadline': data.activeQuests.filter(
          (quest) => quest.type === 'no-deadline'
        ),
      }
    : undefined

  const completedQuests: CompletedQuest[] | undefined = data?.completedQuests

  // ฟังก์ชันสำหรับ refresh ข้อมูล
  const refreshQuests = async () => {
    await queryClient.invalidateQueries({ queryKey: ['quests', userId] })
    return refetch()
  }

  return {
    groupedQuests,
    completedQuests,
    isLoading,
    error,
    refreshQuests,
    rawData: data,
  }
}

// Hook สำหรับดึงรายละเอียดภารกิจเดียว
export const useQuestDetail = (questId?: string, userId?: number) => {
  return useQuery({
    queryKey: ['quest', questId, userId],
    queryFn: async () => {
      if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required')
      }
      return await questService.fetchQuestById(questId, userId)
    },
    enabled: !!(questId && userId),
    staleTime: 5 * 60 * 1000, // 5 นาที
    gcTime: 10 * 60 * 1000, // 10 นาที
  })
}

// Hook สำหรับ prefetch ข้อมูลภารกิจ (ใช้เมื่อต้องการโหลดข้อมูลล่วงหน้า)
export const usePrefetchQuests = () => {
  const queryClient = useQueryClient()

  const prefetchQuests = async (userId: number) => {
    await queryClient.prefetchQuery({
      queryKey: ['quests', userId],
      queryFn: () => questService.fetchQuests(userId),
      staleTime: 5 * 60 * 1000,
    })
  }

  return { prefetchQuests }
}
