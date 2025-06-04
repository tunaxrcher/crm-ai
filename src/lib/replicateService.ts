// src/features/character/service/replicateService.ts
import { GeneratedPortrait } from '@src/features/character/types'
import { getStoragePublicUrl } from '@src/lib/utils'
import 'server-only'

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
    owner: 'tuannha',
    name: 'instant-character',
    version: 'df5eed34fa9c812acf62d3ca79874daf9b5e78c2bee11f4ada182a55dd5c1712',
    type: 'character-generator',
    supportsFaceImage: true,
    description: 'Instant Character Generator with face reference',
    inputMapper: (params) => ({
      lora: params.style || 'ghibli_style',
      seed: params.seed || -1,
      width: params.width || 768,
      height: params.height || 1344,
      prompt: params.prompt,
      subject_image: params.faceImage,
      guidance_scale: params.guidanceScale || 3.5,
      num_inference_steps: params.numInferenceSteps || 28,
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
export function getModelById(id: number): ReplicateModelConfig | undefined {
  return replicateModels.find((m, k) => k === id)
}

export class ReplicateService {
  private static instance: ReplicateService
  private apiToken: string

  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN || ''
    if (!this.apiToken) {
      throw new Error('REPLICATE_API_TOKEN is not set')
    }
  }

  public static getInstance() {
    if (!ReplicateService.instance) {
      ReplicateService.instance = new ReplicateService()
    }
    return ReplicateService.instance
  }

  async generatePortraitWithModel(
    model: ReplicateModelConfig,
    prompt: string,
    faceImage?: string,
    additionalParams?: Partial<ModelInputParams>
  ): Promise<string> {
    // เตรียม input params

    const inputParams: ModelInputParams = {
      prompt,
      faceImage,
      width: 768,
      height: 1344,
      seed: -1,
      guidanceScale: model.type === 'character-generator' ? 3.5 : 7.5,
      numInferenceSteps: model.type === 'text-to-image' ? 30 : 50,
      ...additionalParams,
    }

    // แปลง params ตาม model ที่เลือก
    const input = model.inputMapper(inputParams)

    console.log(`[Replicate] Using model: ${model.owner}/${model.name}`)
    console.log(`[Replicate] Input:`, JSON.stringify(input, null, 2))

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model.version,
        input,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Replicate API Error:', errorData)
      throw new Error(
        `Failed to start prediction: ${JSON.stringify(errorData)}`
      )
    }

    const prediction = await response.json()
    console.log(`[Replicate] Prediction started:`, prediction.id)

    // รอผลลัพธ์
    const result = await this.waitForPrediction(prediction.id)

    if (result.error) throw new Error(`Prediction failed: ${result.error}`)

    // ดึง output ตาม model
    const imageUrl = model.outputExtractor(result.output)
    console.log(`[Replicate] Generated image:`, imageUrl)

    return imageUrl
  }

  private async waitForPrediction(predictionId: string): Promise<any> {
    const maxAttempts = 300 // รอสูงสุด 2 นาที
    let attempts = 0

    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to get prediction status: ${response.statusText}`
        )
      }

      const prediction = await response.json()

      if (prediction.status === 'succeeded') {
        return prediction
      } else if (prediction.status === 'failed') {
        console.error('Prediction failed:', prediction)
        throw new Error(
          `Prediction failed: ${prediction.error || 'Unknown error'}`
        )
      }

      // Log progress
      if (attempts % 10 === 0) {
        console.log(
          `[Replicate] Waiting for prediction... (${prediction.status})`
        )
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000)) // รอ 1 วินาที
    }

    throw new Error('Prediction timeout')
  }

  // async generatePortraits(
  //   jobClassName: string,
  //   jobLevel: any,
  //   faceImage?: string,
  //   personaTraits?: string
  // ): Promise<GeneratedPortrait[]> {
  //   const portraits: GeneratedPortrait[] = []

  //   // เลือก model
  //   let model: ReplicateModelConfig | undefined

  //   const preferredModelId = 2
  //   if (preferredModelId) model = getModelById(preferredModelId)
  //   console.log('Debug preferredModelId', model)

  //   if (!model) model = selectBestModel(!!faceImage)
  //   console.log('Debug model', model)

  //   console.log(`[Replicate] Selected model: ${model.id}`)

  //   const style = 'Use a 3D cartoon, semi-realistic, Pixar-style illustration.'

  //   const prompt = `
  //       Create an avatar of a character, profession: ${jobClassName} EVX based on the user's input photo.

  //       ${style}
  //       full-body shot, from head to toe, full length, standing pose, full figure, complete legs and feet, no cropping, centered composition, camera view from distance, see all limbs

  //       The character should be stylized but believable. The final image must show the entire body from head to toe, in full-body composition with warm lighting and clean background.

  //       Character traits: ${personaTraits}

  //       ${jobLevel.personaDescription}

  //       Keep the same facial structure, image size, character scale, and overall art style across all class evolutions. Only the expression, pose, outfit, and gear may change to reflect progression.
  //   `

  //   console.log(prompt)

  //   try {
  //     const imageUrl = await this.generatePortraitWithModel(
  //       model,
  //       prompt,
  //       faceImage
  //     )

  //     portraits.push({
  //       id: `portrait_${jobLevel.level}`,
  //       url: imageUrl,
  //       prompt: prompt,
  //       model: model.id,
  //     })
  //   } catch (error) {
  //     console.error(
  //       `Failed to generate portrait for level ${jobLevel.level}:`,
  //       error
  //     )
  //   }

  //   return portraits
  // }

  async generatePortraits(
    jobClassName: string,
    jobLevel: any,
    faceImage?: string,
    personaTraits?: string
  ): Promise<GeneratedPortrait[]> {
    const portraits: GeneratedPortrait[] = []

    portraits.push({
      id: `portrait_${jobLevel.level}`,
      url: `${getStoragePublicUrl()}/1.png`,
      prompt: 'Mocked prompt for testing',
      model: 'ทดสอบ',
    })

    return portraits
  }
}
// Export instance
export const replicateService = ReplicateService.getInstance()
