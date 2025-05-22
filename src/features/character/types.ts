// Define all types related to Character feature

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

export interface JobLevel {
  level: number // Job class level (1-6)
  requiredCharacterLevel: number // Character level required (1, 10, 35, 60, 80, 100)
  title: string // Title for this job level
  imageUrl?: string // Avatar image URL for this job level
}

export interface JobClass {
  id: string
  name: string // e.g., "นักการตลาด", "นักขาย", "นักบัญชี"
  description?: string
  levels: JobLevel[] // The 6 levels of progression for this job class
}

export interface Character {
  id: string
  name: string
  jobClassId: string // Reference to job class
  jobClassName: string // Name of the job class
  currentJobLevel: number // Current job level (1-6)
  level: number // Character level (1-100)
  currentXP: number
  nextLevelXP: number
  totalXP: number
  title: string // Current title based on job class and level
  stats: Stat
  statPoints: number
  achievements: Achievement[]
  questStats: QuestStats
  portrait?: string // URL to character portrait based on job class and level
}

export interface CharacterResponse {
  character: Character
  portrait: string
  jobClass: JobClass
}

export interface AllocateStatPointsRequest {
  characterId: string
  stats: Stat
}

// Helper type for XP table
export interface LevelRequirement {
  level: number
  requiredXP: number
}
