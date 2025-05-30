// src/features/character/service/replicateService.ts
import 'server-only'

import { GeneratedPortrait } from '../types'

interface ReplicateModel {
  name: string
  version: string
  prompt: (
    jobClass: string,
    level: number,
    personaDescription: string
  ) => string
}

export class ReplicateService {
  private static instance: ReplicateService
  private apiToken: string

  // 3 โมเดลสำหรับสร้างภาพ
  private models: ReplicateModel[] = [
    {
      name: 'stable-diffusion',
      version:
        'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
      prompt: (jobClass: string, level: number, personaDescription: string) =>
        `anime style portrait of ${jobClass} professional, level ${level}, ${personaDescription}, high quality, detailed, professional lighting`,
    },
    {
      name: 'sdxl',
      version:
        'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
      prompt: (jobClass: string, level: number, personaDescription: string) =>
        `professional character portrait, ${jobClass}, ${personaDescription}, game character art style, detailed, high resolution`,
    },
    {
      name: 'flux-schnell',
      version:
        'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
      prompt: (jobClass: string, level: number, personaDescription: string) =>
        `professional ${jobClass} character portrait, ${personaDescription}, rpg game style, detailed character design`,
    },
  ]

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
    model: ReplicateModel,
    jobClass: string,
    level: number,
    personaDescription: string,
    faceImage?: string
  ): Promise<string> {
    const prompt = model.prompt(jobClass, level, personaDescription)

    const input: any = {
      prompt,
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 50,
    }

    // ถ้ามี face image ให้ใช้เป็น reference
    if (faceImage) {
      input.image = faceImage
      input.prompt = `${prompt}, face reference from image`
      input.strength = 0.7 // ควบคุมความคล้ายกับภาพต้นฉบับ
    }

    const response = await fetch(
      `https://api.replicate.com/v1/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: model.version,
          input,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to start prediction: ${response.statusText}`)
    }

    const prediction = await response.json()

    // รอผลลัพธ์
    const result = await this.waitForPrediction(prediction.id)

    if (result.error) {
      throw new Error(`Prediction failed: ${result.error}`)
    }

    return result.output[0]
  }

  private async waitForPrediction(predictionId: string): Promise<any> {
    const maxAttempts = 60 // รอสูงสุด 60 วินาที
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
        throw new Error(`Prediction failed: ${prediction.error}`)
      }

      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000)) // รอ 1 วินาที
    }

    throw new Error('Prediction timeout')
  }

  async generatePortraitsForAllLevels(
    jobClass: string,
    jobLevels: any[],
    faceImage?: string
  ): Promise<GeneratedPortrait[]> {
    const portraits: GeneratedPortrait[] = []

    // สร้างภาพเฉพาะ level 1 เท่านั้น
    const level = 1
    const jobLevel = jobLevels[0] // ใช้ job level แรก

    // สุ่มเลือกโมเดล
    const randomModel =
      this.models[Math.floor(Math.random() * this.models.length)]

    try {
      const imageUrl = await this.generatePortraitWithModel(
        randomModel,
        jobClass,
        level,
        jobLevel.personaDescription || '',
        faceImage
      )

      portraits.push({
        id: `portrait_${level}`,
        url: imageUrl,
        prompt: randomModel.prompt(
          jobClass,
          level,
          jobLevel.personaDescription || ''
        ),
        model: randomModel.name,
      })
    } catch (error) {
      console.error(`Failed to generate portrait for level ${level}:`, error)
      // ใช้ placeholder image
      portraits.push({
        id: `portrait_${level}`,
        url: `https://source.unsplash.com/400x400/?portrait,${jobClass},level${level}`,
        prompt: 'Failed to generate',
        model: 'placeholder',
      })
    }

    return portraits
  }

  // สำหรับการ upload และ process face image
  async uploadImage(base64Image: string): Promise<string> {
    // Upload ไปยัง storage service (เช่น S3, Cloudinary, etc.)
    // ตัวอย่างนี้จะ return base64 กลับไปก่อน
    // ในระบบจริงควร upload ไปยัง cloud storage
    return base64Image
  }
}

export const replicateService = ReplicateService.getInstance()
