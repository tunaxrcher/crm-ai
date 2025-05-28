import { useMutation, useQueryClient } from '@tanstack/react-query'

import { questSubmissionService } from '../service/client'
import { QuestSubmissionResponse } from '../types/index'

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
    }): Promise<QuestSubmissionResponse> => {
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

      // Invalidate character data since XP might have changed
      queryClient.invalidateQueries({
        queryKey: ['character'],
      })

      console.log('Quest submitted successfully:', data)
    },
    onError: (error) => {
      console.error('Quest submission failed:', error)
    },
  })
}

// Hook สำหรับอัพเดท summary
export const useUpdateSubmissionSummary = () => {
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
      return await questSubmissionService.updateSubmissionSummary(
        questId,
        submissionId,
        summary
      )
    },
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['submissions'],
      })
    },
    onError: (error) => {
      console.error('Summary update failed:', error)
    },
  })
}
