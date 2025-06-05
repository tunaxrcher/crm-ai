import type { Character, Stat } from '.'
import type { JobClass } from './job.type'

// API Responses
export interface CharacterResponse {
  character: Character
  portrait: string
  jobClass: JobClass
}

export interface CharacterGenerateResponse {
  portraits: GeneratedPortrait[]
  sessionId: string
}

export interface CharacterConfirmResponse {
  success: boolean
  character: any
  userId: number
  message: string
  credentials?: {
    username: string
    password: string
  }
}

// API Requests
export interface AllocateStatPointsRequest {
  characterId: string
  stats: Stat
}

export interface CharacterCreatePayload {
  jobClassId: string
  name: string
  portraitType: 'upload' | 'generate'
  file?: File
}

export interface CharacterConfirmPayload {
  jobClassId: number
  name: string
  portraitUrl: string
  originalFaceImage?: string
  generatedPortraits: Record<string, string>
}

// Supporting Types
export interface GeneratedPortrait {
  id: string
  url: string
  prompt: string
  model: string
}
