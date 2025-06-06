// src/features/ranking/types.ts
export type RankingPeriod = 'all-time' | 'weekly'
export type CharacterClass = 'all' | string

export interface JobClassInfo {
  id: number
  name: string
  description?: string
  imageUrl?: string
}

export interface UserRanking {
  userId: number
  characterId: number
  userName: string // ชื่อจาก character
  currentPortraitUrl: string | null // รูปจาก character
  level: number
  totalXP: number
  jobClassName: string
  jobClassImage?: string
  jobLevelTitle: string
  position?: number
  change?: number
}

export interface RankingUser {
  id: string
  name: string // ชื่อจาก character
  avatar: string // รูปจาก character.currentPortraitUrl
  level: number
  xp: number
  title: string
  class: string
  classImage?: string
  position: number
  change: number
}

export interface RankingData {
  [period: string]: {
    [characterClass: string]: RankingUser[]
  }
}

export interface GetRankingsParams {
  period: RankingPeriod
  characterClass: CharacterClass
}

export interface GetRankingsResponse {
  rankings: RankingUser[]
  currentUser?: RankingUser
  topUser?: RankingUser
}
