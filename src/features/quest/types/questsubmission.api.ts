import { AIAnalysisResult } from './questsubmission.type'

export interface QuestSubmissionRequest {
  questId: string
  characterId: number
  mediaFile?: File
  description?: string
}

// export interface QuestSubmissionResponse {
//   success: boolean
//   message: number
//   mediaType: string
//   aiAnalysis: AIAnalysisResult
//   submission: any
//   characterUpdate?: any
// }

export interface QuestSubmissionResponse {
  success: boolean
  message: number
  data: any
}

export interface QuestSubmissionResponse {
  success: boolean
  message: number
  mediaType: string
  aiAnalysis: AIAnalysisResult
  submission: any
  characterUpdate?: any
  tokenReward?: {
    baseTokens: number
    performanceMultiplier: number
    characterBoostMultiplier: number
    eventMultiplier: number
    bonusTokens: number
    finalTokens: number
    appliedBonuses: string[]
  }
  userToken?: {
    currentTokens: number
    tokensEarned: number
  }
}
