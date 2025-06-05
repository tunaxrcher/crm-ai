import { BaseService } from '@src/lib/service/server/baseService'

import { Quest, QuestListResponse } from '../types'
import { QuestSubmissionResponse } from '../types/questsubmission.type'

export class QuestService extends BaseService {
  private static instance: QuestService

  private baseUrl = '/api/quests'

  constructor() {
    super()
  }

  public static getInstance() {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService()
    }
    return QuestService.instance
  }

  // ดึงรายการภารกิจทั้งหมด
  async fetchQuests(userId: number): Promise<QuestListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?userId=${userId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch quests')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching quests:', error)
      throw error
    }
  }

  // ดึงรายละเอียดภารกิจเดียว
  async fetchQuestById(questId: string, userId: number): Promise<Quest> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${questId}?userId=${userId}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch quest details')
      }

      const quest = await response.json()
      return quest
    } catch (error) {
      console.error('Error fetching quest details:', error)
      throw error
    }
  }
}

export const questService = new QuestService()

export class QuestSubmissionService {
  // ส่ง quest submission
  async submitQuest(
    questId: string,
    characterId: number,
    mediaFile?: File,
    description?: string
  ): Promise<QuestSubmissionResponse> {
    try {
      const formData = new FormData()
      formData.append('characterId', characterId.toString())

      if (description) {
        formData.append('description', description)
      }

      if (mediaFile) {
        formData.append('mediaFile', mediaFile)
      }

      const response = await fetch(`/api/quests/${questId}/submit`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit quest')
      }

      return data
    } catch (error) {
      console.error('Error submitting quest:', error)
      throw error
    }
  }

  async fetchQuestSubmission(questId: string, characterId: number) {
    try {
      const response = await fetch(
        `/api/quests/${questId}/submission?characterId=${characterId}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null // ยังไม่มีการส่งงาน
        }

        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch quest submission')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching quest submission:', error)
      throw error
    }
  }

  async updateQuestSubmission(
    questId: string,
    submissionId: number,
    summary: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/quests/${questId}/submission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          summary,
        }),
      })

      const data = await response.json()

      if (!response.ok)
        throw new Error(data.message || 'Failed to update summary')

      return data
    } catch (error) {
      console.error('Error updating summary:', error)
      throw error
    }
  }
}

export const questSubmissionService = new QuestSubmissionService()
