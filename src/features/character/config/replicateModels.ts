// src/features/character/config/replicateModels.ts

export interface ReplicateModelConfig {
  id: string
  owner: string
  name: string
  version: string
  type: 'text-to-image' | 'image-to-image' | 'character-generator'
  inputMapper: (params: ModelInputParams) => any
  outputExtractor: (output: any) => string
  supportsFaceImage: boolean
  description: string
}

export interface ModelInputParams {
  prompt: string
  faceImage?: string
  width?: number
  height?: number
  seed?: number
  guidanceScale?: number
  numInferenceSteps?: number
  strength?: number
  style?: string
  negativePrompt?: string
}

export const replicateModels: ReplicateModelConfig[] = [
  {
    id: 'sdxl',
    owner: 'stability-ai',
    name: 'sdxl',
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    type: 'text-to-image',
    supportsFaceImage: false,
    description: 'Stable Diffusion XL',
    inputMapper: (params) => ({
      prompt: params.prompt,
      negative_prompt:
        params.negativePrompt || 'ugly, deformed, blurry, low quality',
      width: params.width || 768,
      height: params.height || 1344,
      num_inference_steps: params.numInferenceSteps || 30,
      guidance_scale: params.guidanceScale || 7.5,
      seed: params.seed || -1,
    }),
    outputExtractor: (output) => {
      if (Array.isArray(output)) return output[0]
      return output
    },
  },
  {
    id: 'sdxl-lightning',
    owner: 'bytedance',
    name: 'sdxl-lightning-4step',
    version: '5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',
    type: 'text-to-image',
    supportsFaceImage: false,
    description: 'SDXL Lightning - Fast 4-step generation',
    inputMapper: (params) => ({
      prompt: params.prompt,
      width: params.width || 768,
      height: params.height || 1344,
      num_inference_steps: 4,
      guidance_scale: 0,
      seed: params.seed || -1,
    }),
    outputExtractor: (output) => {
      if (Array.isArray(output)) return output[0]
      return output
    },
  },
  {
    id: 'instant-character',
    owner: 'zlnrt',
    name: 'instant-character',
    version: 'f8281de30234f6de8eb3a34c0b97ba7b96c3f5284b5f2ad27f5b1e97cfc9b00f',
    type: 'character-generator',
    supportsFaceImage: true,
    description: 'Instant Character Generator with face reference',
    inputMapper: (params) => ({
      prompt: params.prompt,
      subject_image: params.faceImage,
      lora: params.style || 'ghibli_style',
      width: params.width || 768,
      height: params.height || 1344,
      guidance_scale: params.guidanceScale || 3.5,
      num_inference_steps: params.numInferenceSteps || 28,
      seed: params.seed || -1,
    }),
    outputExtractor: (output) => {
      if (Array.isArray(output)) return output[0]
      return output
    },
  },
  {
    id: 'fooocus',
    owner: 'konieshadow',
    name: 'fooocus-api',
    version: 'fda927242b1db6affa1ece4f54c37f19b964666bf23b4d5c890c46b9b475d919',
    type: 'image-to-image',
    supportsFaceImage: true,
    description: 'Fooocus - Advanced image generation',
    inputMapper: (params) => ({
      prompt: params.prompt,
      negative_prompt: params.negativePrompt || '',
      image_url: params.faceImage,
      style_selections: [params.style || 'Fooocus V2', 'Fooocus Enhance'],
      aspect_ratios_selection: '768*1344',
      performance_selection: 'Speed',
      image_number: 1,
      guidance_scale: params.guidanceScale || 4,
      sharpness: 2,
    }),
    outputExtractor: (output) => {
      if (Array.isArray(output)) return output[0]
      return output
    },
  },
  {
    id: 'photomaker',
    owner: 'tencentarc',
    name: 'photomaker',
    version: 'ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4',
    type: 'character-generator',
    supportsFaceImage: true,
    description: 'PhotoMaker - Customized realistic photo generation',
    inputMapper: (params) => ({
      prompt: `${params.prompt} img`,
      num_steps: params.numInferenceSteps || 50,
      style_name: params.style || 'Photographic',
      input_image: params.faceImage,
      num_outputs: 1,
      guidance_scale: params.guidanceScale || 5,
      negative_prompt:
        params.negativePrompt || 'nsfw, lowres, bad anatomy, bad hands',
    }),
    outputExtractor: (output) => {
      if (Array.isArray(output)) return output[0]
      return output
    },
  },
  {
    id: 'playground-v2.5',
    owner: 'playgroundai',
    name: 'playground-v2.5-1024px-aesthetic',
    version: 'a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d5c4cfc8fc95c99b7c4ac5',
    type: 'text-to-image',
    supportsFaceImage: false,
    description: 'Playground v2.5 - High quality aesthetic images',
    inputMapper: (params) => ({
      prompt: params.prompt,
      negative_prompt: params.negativePrompt || '',
      width: params.width || 768,
      height: params.height || 1344,
      num_inference_steps: params.numInferenceSteps || 25,
      guidance_scale: params.guidanceScale || 3,
      seed: params.seed || -1,
    }),
    outputExtractor: (output) => {
      if (Array.isArray(output)) return output[0]
      return output
    },
  },
]

// Helper function เพื่อเลือก model ที่เหมาะสม
export function selectBestModel(
  hasFaceImage: boolean,
  preferredStyle?: string
): ReplicateModelConfig {
  if (hasFaceImage) {
    // ถ้ามีรูปหน้า ให้ใช้ model ที่รองรับ face image
    const faceModels = replicateModels.filter((m) => m.supportsFaceImage)

    // ถ้าต้องการ style เฉพาะ
    if (preferredStyle === 'ghibli') {
      return (
        faceModels.find((m) => m.id === 'instant-character') || faceModels[0]
      )
    } else if (preferredStyle === 'realistic') {
      return faceModels.find((m) => m.id === 'photomaker') || faceModels[0]
    }

    // สุ่มเลือก
    return faceModels[Math.floor(Math.random() * faceModels.length)]
  } else {
    // ถ้าไม่มีรูปหน้า ใช้ text-to-image models
    const textModels = replicateModels.filter((m) => m.type === 'text-to-image')
    return textModels[Math.floor(Math.random() * textModels.length)]
  }
}

// Get model by ID
export function getModelById(id: string): ReplicateModelConfig | undefined {
  return replicateModels.find((m) => m.id === id)
}
