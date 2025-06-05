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

export interface OpenAIPrompt {
  questTitle: string
  questDescription: string
  questRequirements: string[]
  mediaUrl?: string
  userDescription?: string
}
