// src/features/character/service/replicateService.ts
import 'server-only'

import {
  ModelInputParams,
  ReplicateModelConfig,
  getModelById,
  replicateModels,
  selectBestModel,
} from '../config/replicateModels'
import { openAIVisionService } from './openaiVisionService'
import { GeneratedPortrait } from '../types'

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

    if (result.error) {
      throw new Error(`Prediction failed: ${result.error}`)
    }

    // ดึง output ตาม model
    const imageUrl = model.outputExtractor(result.output)
    console.log(`[Replicate] Generated image:`, imageUrl)

    return imageUrl
  }

  private async waitForPrediction(predictionId: string): Promise<any> {
    const maxAttempts = 120 // รอสูงสุด 2 นาที
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

  async generatePortraitsForAllLevels(
    jobClass: string,
    jobLevels: any[],
    faceImage?: string,
    personaTraits?: string,
    preferredModelId?: string
  ): Promise<GeneratedPortrait[]> {
    const portraits: GeneratedPortrait[] = []

    // สร้างภาพเฉพาะ level 1 เท่านั้น
    const level = 1
    const classLevel = 1
    const jobLevel = jobLevels[0] // ใช้ job level แรก

    // เลือก model
    let model: ReplicateModelConfig | undefined

    if (preferredModelId) {
      model = getModelById(preferredModelId)
    }

    if (!model) {
      // เลือก model อัตโนมัติตามเงื่อนไข
      model = selectBestModel(!!faceImage)
    }

    console.log(`[Replicate] Selected model: ${model.id}`)

    // สร้าง dynamic prompt
    const prompt = openAIVisionService.generateDynamicPrompt(
      jobClass,
      level,
      classLevel,
      personaTraits || 'professional appearance with confident demeanor',
      jobLevel.personaDescription ||
        'Looks weak, torn clothes, mismatched outfit, flip-flops, useless tools'
    )

    try {
      const imageUrl = await this.generatePortraitWithModel(
        model,
        prompt,
        faceImage,
        {
          style: 'ghibli_style', // สำหรับ instant-character
          negativePrompt: 'nsfw, ugly, deformed, blurry, low quality',
        }
      )

      portraits.push({
        id: `portrait_${level}`,
        url: imageUrl,
        prompt: prompt,
        model: model.id,
      })
    } catch (error) {
      console.error(`Failed to generate portrait for level ${level}:`, error)

      // ลองใช้ model อื่น
      const fallbackModels = replicateModels.filter((m) => m.id !== model!.id)

      for (const fallbackModel of fallbackModels) {
        try {
          console.log(`[Replicate] Trying fallback model: ${fallbackModel.id}`)

          const imageUrl = await this.generatePortraitWithModel(
            fallbackModel,
            prompt,
            faceImage
          )

          portraits.push({
            id: `portrait_${level}`,
            url: imageUrl,
            prompt: prompt,
            model: fallbackModel.id,
          })

          break // สำเร็จแล้ว ออกจาก loop
        } catch (fallbackError) {
          console.error(
            `Fallback model ${fallbackModel.id} also failed:`,
            fallbackError
          )
        }
      }

      // ถ้าทุก model ล้มเหลว ใช้ placeholder
      if (portraits.length === 0) {
        portraits.push({
          id: `portrait_${level}`,
          url: `https://source.unsplash.com/400x400/?portrait,${jobClass},level${level}`,
          prompt: 'Failed to generate',
          model: 'placeholder',
        })
      }
    }

    return portraits
  }
}
// Export instance
export const replicateService = ReplicateService.getInstance()