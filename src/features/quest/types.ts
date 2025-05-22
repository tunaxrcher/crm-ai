// Define all types related to Quest feature
import type { ReactElement } from 'react'
export type QuestType = 'daily' | 'weekly' | 'no-deadline'
export type QuestDifficulty = 'easy' | 'medium' | 'hard'

export interface QuestRewards {
  xp: number
  stats: {
    AGI?: number
    STR?: number
    DEX?: number
    VIT?: number
    INT?: number
  }
}

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  rewards: QuestRewards
  deadline: Date | null
  difficulty: QuestDifficulty
  completed: boolean
}

export interface CompletedQuest {
  id: string
  title: string
  description: string
  type: QuestType
  completedOn: Date
  xpEarned: number
  statsGained: {
    AGI?: number
    STR?: number
    DEX?: number
    VIT?: number
    INT?: number
  }
}

export interface QuestTypeInfo {
  label: string
  description: string
  icon: ReactElement
}

export interface GroupedQuests {
  daily: Quest[]
  weekly: Quest[]
  'no-deadline': Quest[]
}

export interface QuestsResponse {
  activeQuests: Quest[]
  completedQuests: CompletedQuest[]
}

export interface CompleteQuestRequest {
  questId: string
}

export interface CompleteQuestResponse {
  success: boolean
  quest: CompletedQuest
  xpGained: number
  statsGained: {
    AGI?: number
    STR?: number
    DEX?: number
    VIT?: number
    INT?: number
  }
}
