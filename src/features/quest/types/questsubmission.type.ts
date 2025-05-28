export interface QuestSubmissionRequest {
  questId: string
  characterId: number
  mediaFile?: File
  description?: string
}

export interface AIAnalysisResult {
  summary: string
  score: number
  xpEarned: number
  requirements: Record<string, boolean>
  feedback: string
  tags: string[]
  ratings: {
    agi: number
    str: number
    dex: number
    vit: number
    int: number
  }
}

// export interface QuestSubmissionResponse {
//   success: boolean
//   submissionId: number
//   aiAnalysis: AIAnalysisResult
//   message?: string
//   mediaType: string
//   submission: any
// }

export interface QuestSubmissionResponse {
  success: boolean
  message: number
  mediaType: string
  aiAnalysis: AIAnalysisResult
  submission: any
}

export interface QuestSubmissionResponse {
  success: boolean
  message: number
  data: any
}

export interface UploadResponse {
  success: boolean
  url: string
  key: string
}

export interface OpenAIPrompt {
  questTitle: string
  questDescription: string
  questRequirements: string[]
  mediaUrl?: string
  userDescription?: string
}