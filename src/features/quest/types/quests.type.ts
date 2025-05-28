export type QuestType = 'daily' | 'weekly' | 'no-deadline'
export type QuestDifficulty = 'easy' | 'medium' | 'hard'
export type QuestStatus = 'active' | 'completed' | 'failed' | 'expired'

export interface QuestRewards {
  xp: number
  tokens: number
}

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  difficulty: QuestDifficulty
  rewards: QuestRewards
  deadline: Date | null
  completed: boolean
  status: QuestStatus
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CompletedQuest {
  id: string
  title: string
  xpEarned: number
  completedOn: Date
}

export interface GroupedQuests {
  daily: Quest[]
  weekly: Quest[]
  'no-deadline': Quest[]
}

export interface QuestListResponse {
  activeQuests: Quest[]
  completedQuests: CompletedQuest[]
}

export interface AssignedQuestWithDetails {
  id: number
  assignedAt: Date
  expiresAt: Date | null
  status: 'active' | 'completed' | 'failed' | 'expired'
  quest: {
    id: number
    title: string
    description: string
    type: string
    difficultyLevel: number
    xpReward: number
    imageUrl: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    baseTokenReward: number
    maxTokenReward: number | null
    tokenMultiplier: number
  }
  questSubmissions?: Array<{
    id: number
    xpEarned: number
    submittedAt: Date
  }>
}
