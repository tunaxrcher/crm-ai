// src/features/quest/hook/api.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { questService, questSubmissionService } from '../service/client'
import {
  CompletedQuest,
  GroupedQuests,
  QuestSubmissionResponse,
} from '../types/index'

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

// Hook สำหรับ submit quest
export const useQuestSubmission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questId,
      characterId,
      mediaFile,
      description,
    }: {
      questId: string
      characterId: number
      mediaFile?: File
      description?: string
    }): Promise<QuestSubmissionResponse & { 
      characterUpdate?: any 
    }> => {
      return await questSubmissionService.submitQuest(
        questId,
        characterId,
        mediaFile,
        description
      )
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch quests data
      queryClient.invalidateQueries({
        queryKey: ['quests'],
      })

      // Invalidate specific quest if we're tracking it
      queryClient.invalidateQueries({
        queryKey: ['quest', variables.questId],
      })

      // Invalidate quest submission data
      queryClient.invalidateQueries({
        queryKey: ['questSubmission', variables.questId, variables.characterId],
      })

      // Invalidate character data since XP might have changed
      queryClient.invalidateQueries({
        queryKey: ['character'],
      })

      // Invalidate user data for character context
      queryClient.invalidateQueries({
        queryKey: ['me', 'character'],
      })

      console.log('Quest submitted successfully:', data)
    },
    onError: (error) => {
      console.error('Quest submission failed:', error)
    },
  })
}

// Hook สำหรับอัปเดต summary พร้อมอัปเดต feed item
export const useUpdateQuestSubmission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questId,
      submissionId,
      summary,
    }: {
      questId: string
      submissionId: number
      summary: string
    }) => {
      return await questSubmissionService.updateQuestSubmission(
        questId,
        submissionId,
        summary
      )
    },
    onSuccess: (data, variables) => {
      // Invalidate quest submission data
      queryClient.invalidateQueries({
        queryKey: ['questSubmission', variables.questId],
      })

      // Invalidate feed data since the post content changed
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      })

      console.log('Summary updated successfully:', data)
    },
    onError: (error) => {
      console.error('Summary update failed:', error)
    },
  })
}

export const useQuestSubmissionQuery = (
  questId?: string,
  characterId?: number
) => {
  return useQuery({
    queryKey: ['questSubmission', questId, characterId],
    queryFn: async () => {
      if (!questId || !characterId) {
        throw new Error('Quest ID and Character ID are required')
      }
      return await questSubmissionService.fetchQuestSubmission(
        questId,
        characterId
      )
    },
    enabled: !!(questId && characterId),
    staleTime: 5 * 60 * 1000, // 5 นาที
    gcTime: 10 * 60 * 1000, // 10 นาที
  })
}
