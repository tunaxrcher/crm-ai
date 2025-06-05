import type { Achievement, QuestStats, Stat } from './stat.type'

export interface Character {
  id: string
  name: string
  jobClassId: string
  jobClassName: string
  currentJobLevel: number
  level: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
  title: string
  stats: Stat
  statPoints: number
  achievements: Achievement[]
  questStats: QuestStats
  portrait?: string
}

export interface LevelRequirement {
  level: number
  requiredXP: number
}
