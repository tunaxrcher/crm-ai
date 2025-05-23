import { userRepository } from '../repository'
import { userService } from '../service/server'

export type UserWithCharacter = NonNullable<
  Awaited<ReturnType<typeof userRepository.findUserWithCharacterById>>
>

// ===== Extracted Types from Complex Objects =====

export type Character = NonNullable<UserWithCharacter['character']>

export type JobClass = Character['jobClass']

export type JobLevel = JobClass['levels'][number]

export type CharacterAchievement = Character['achievements'][number]

export type GetUserCharacterResponse = Awaited<
  ReturnType<typeof userService.getUserCharacters>
>

// ===== Frontend Specific Types =====
export type CharacterStats = {
  AGI: number
  STR: number
  DEX: number
  VIT: number
  INT: number
}

export type CharacterData = GetUserCharacterResponse['character']
export type JobClassData = GetUserCharacterResponse['jobClass']

// ===== Component Props Types =====
export interface UserCharacterCardProps {
  character?: CharacterData
  jobClass?: JobClassData
}

export interface CharacterStatsProps {
  stats: CharacterStats
  statPoints: number
  onStatUpdate?: (stat: keyof CharacterStats, value: number) => void
}

// ===== State Management Types =====
export interface UserCharacterState {
  data: GetUserCharacterResponse | null
  loading: boolean
  error: string | null
}

export interface UserCharacterActions {
  fetchCharacter: () => Promise<void>
  updateStats: (stats: Partial<CharacterStats>) => void
  clearError: () => void
  reset: () => void
}

export type UserCharacterStore = UserCharacterState & UserCharacterActions
