// src/features/character/types/portrait.types.ts
export interface FluxGenerateRequest {
  prompt: string
  input_image?: string
  seed?: number
  aspect_ratio?: string
  output_format?: 'png' | 'jpeg'
  safety_tolerance?: number
  prompt_upsampling?: boolean
  webhook_url?: string
}

export interface FluxGenerateResponse {
  id: string
  polling_url: string
}

export interface FluxResultResponse {
  id: string
  status:
    | 'Task not found'
    | 'Pending'
    | 'Request Moderated'
    | 'Content Moderated'
    | 'Ready'
  result?: {
    sample: string
  }
  progress?: number
  details?: any
}

export interface GeneratedPortraitResult {
  url: string
  classLevel: number
  jobClass: string
  prompt: string
}

export interface PreGenerateCondition {
  shouldPreGenerate: boolean
  targetClassLevel: number
}
