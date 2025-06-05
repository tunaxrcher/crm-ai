export interface Stat {
  AGI: number
  STR: number
  DEX: number
  VIT: number
  INT: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedOn?: Date
}

export interface QuestStats {
  totalCompleted: number
  dailyCompleted: number
  weeklyCompleted: number
  averageRating: number
}
