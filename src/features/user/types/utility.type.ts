import {
  CharacterStats,
  GetUserCharacterResponse,
  JobClassData,
} from './character.type'

// ===== API Types =====
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export type UserCharacterApiResponse = ApiResponse<GetUserCharacterResponse>

// ===== Form Types (for future updates) =====
export interface UpdateCharacterStatsInput {
  statAGI?: number
  statSTR?: number
  statDEX?: number
  statVIT?: number
  statINT?: number
}

export interface UpdateCharacterProfileInput {
  name?: string
  bio?: string
  avatar?: string
}

// ===== Filter/Search Types =====
export interface AchievementFilter {
  earned?: boolean
  category?: string
  search?: string
}

export interface CharacterSortOptions {
  field: 'level' | 'totalXP' | 'name'
  direction: 'asc' | 'desc'
}

// ===== Utility Types =====
export type CharacterField = keyof CharacterData
export type JobClassField = keyof JobClassData
export type StatField = keyof CharacterStats

// ===== Error Types =====
export interface CharacterNotFoundError {
  type: 'CHARACTER_NOT_FOUND'
  message: string
}

export interface InvalidStatsError {
  type: 'INVALID_STATS'
  message: string
  field: StatField
}

export type UserCharacterError = CharacterNotFoundError | InvalidStatsError
