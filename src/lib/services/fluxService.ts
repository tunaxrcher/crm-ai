// src/lib/services/fluxService.ts (แก้ไขทั้งไฟล์)
import { removeBgService } from './removeBgService'
import { s3UploadService } from './s3UploadService'

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

class FluxService {
  private readonly API_BASE = 'https://api.bfl.ai/v1'
  private readonly API_KEY = process.env.FLUX_API_KEY!

  /**
   * เริ่มต้นการ generate รูป
   */
  async generatePortrait(
    request: FluxGenerateRequest
  ): Promise<FluxGenerateResponse> {
    try {
      console.log('[FluxService] Starting portrait generation...')
      console.log('[FluxService] Request payload:', {
        prompt: request.prompt.substring(0, 100) + '...',
        hasInputImage: !!request.input_image,
        aspect_ratio: request.aspect_ratio,
        output_format: request.output_format,
      })

      const response = await fetch(`${this.API_BASE}/flux-kontext-pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-key': this.API_KEY,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          input_image: request.input_image,
          seed: Math.floor(Math.random() * 1000000000),
          aspect_ratio: request.aspect_ratio || '1:1',
          output_format: request.output_format || 'png',
          safety_tolerance: 2,
          prompt_upsampling: false,
          webhook_url: request.webhook_url,
        }),
      })

      console.log({
        prompt: request.prompt,
        input_image: request.input_image,
        seed: Math.floor(Math.random() * 1000000000),
        aspect_ratio: request.aspect_ratio || '1:1',
        output_format: request.output_format || 'png',
        safety_tolerance: 2,
        prompt_upsampling: true,
        webhook_url: request.webhook_url,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          '[FluxService] Generate API error:',
          response.status,
          errorText
        )
        throw new Error(`Flux API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('[FluxService] Generation started:', result)

      return result
    } catch (error) {
      console.error('[FluxService] Generate error:', error)
      throw error
    }
  }

  /**
   * ตรวจสอบผลลัพธ์การ generate (แก้ไข URL)
   */
  async getResult(taskId: string): Promise<FluxResultResponse> {
    try {
      // ใช้ taskId ใน URL path แทนการใส่ใน query parameter
      const response = await fetch(`${this.API_BASE}/get_result?id=${taskId}`, {
        method: 'GET',
        headers: {
          'x-key': this.API_KEY,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          '[FluxService] Get result API error:',
          response.status,
          errorText
        )
        throw new Error(`Get result error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('[FluxService] Get result response:', result)
      return result
    } catch (error) {
      console.error('[FluxService] Get result error:', error)
      throw error
    }
  }

  /**
   * รอผลลัพธ์จนเสร็จสิ้น (polling) - เพิ่ม error handling
   */
  async waitForResult(
    taskId: string,
    maxWaitTime: number = 300000
  ): Promise<string> {
    const startTime = Date.now()
    const pollInterval = 5000 // 5 วินาที
    let retryCount = 0
    const maxRetries = 3

    console.log(`[FluxService] Starting to wait for result: ${taskId}`)

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.getResult(taskId)

        console.log(
          `[FluxService] Polling result: ${result.status} (${result.progress || 0}%)`
        )

        if (result.status === 'Ready' && result.result?.sample) {
          console.log(
            `[FluxService] Generation completed: ${result.result.sample}`
          )
          return result.result.sample
        }

        if (
          result.status === 'Request Moderated' ||
          result.status === 'Content Moderated'
        ) {
          throw new Error(`Generation was moderated: ${result.status}`)
        }

        if (result.status === 'Task not found') {
          retryCount++
          if (retryCount >= maxRetries) {
            throw new Error('Task not found after multiple retries')
          }
          console.log(
            `[FluxService] Task not found, retry ${retryCount}/${maxRetries}`
          )
          await new Promise((resolve) => setTimeout(resolve, pollInterval * 2))
          continue
        }

        // Reset retry count if we get a valid response
        retryCount = 0

        // รอก่อน poll ครั้งถัดไป
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
      } catch (error) {
        console.error('[FluxService] Polling error:', error)

        retryCount++
        if (retryCount >= maxRetries) {
          throw error
        }

        console.log(`[FluxService] Retry polling ${retryCount}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, pollInterval * 2))
      }
    }

    throw new Error('Generation timeout')
  }

  /**
   * Download รูปจาก URL และอัพโหลดไป S3
   */
  async downloadAndUploadToS3(
    imageUrl: string,
    characterId: number,
    classLevel: number
  ): Promise<string> {
    try {
      console.log('[FluxService] Downloading image from:', imageUrl)

      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      const fileName = `character-${characterId}-class-${classLevel}.png`

      console.log('[FluxService] Uploading to S3...')
      const uploadResult = await s3UploadService.uploadBuffer(
        buffer,
        fileName,
        'image/png',
        'character-portraits'
      )

      console.log('[FluxService] Upload successful:', uploadResult.url)
      return uploadResult.url
    } catch (error) {
      console.error('[FluxService] Download/Upload error:', error)
      throw error
    }
  }

  /**
   * Download รูป, ลบพื้นหลัง และอัพโหลดไป S3
   */
  async downloadRemoveBgAndUploadToS3(
    imageUrl: string,
    characterId: number,
    classLevel: number
  ): Promise<string> {
    try {
      console.log(
        '[FluxService] Starting download, remove background, and upload process...'
      )

      // Step 1: Download รูปจาก Flux
      console.log('[FluxService] Downloading image from Flux:', imageUrl)
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }

      const originalBuffer = Buffer.from(await response.arrayBuffer())
      console.log(
        '[FluxService] Original image downloaded, size:',
        originalBuffer.length
      )

      // Step 2: ลบพื้นหลังด้วย Remove.bg
      console.log('[FluxService] Removing background...')
      const removeBgResult =
        await removeBgService.removeBackground(originalBuffer)

      if (!removeBgResult.success || !removeBgResult.imageBuffer) {
        console.warn(
          '[FluxService] Background removal failed, using original image'
        )
        console.warn('[FluxService] Remove.bg error:', removeBgResult.error)

        // ถ้าลบพื้นหลังไม่ได้ ใช้รูปเดิม
        const fileName = `character-${characterId}-class-${classLevel}.png`
        const uploadResult = await s3UploadService.uploadBuffer(
          originalBuffer,
          fileName,
          'image/png',
          'character-portraits'
        )
        return uploadResult.url
      }

      // Step 3: อัพโหลดรูปที่ลบพื้นหลังแล้วไป S3
      console.log('[FluxService] Uploading transparent image to S3...')
      const fileName = `character-${characterId}-class-${classLevel}-transparent.png`
      const uploadResult = await s3UploadService.uploadBuffer(
        removeBgResult.imageBuffer,
        fileName,
        'image/png',
        'character-portraits'
      )

      console.log(
        '[FluxService] Upload successful with transparent background:',
        uploadResult.url
      )
      return uploadResult.url
    } catch (error) {
      console.error('[FluxService] Download/RemoveBg/Upload error:', error)
      throw error
    }
  }

  /**
   * แปลงรูปเป็น base64
   */
  async imageToBase64(imageUrl: string): Promise<string> {
    try {
      console.log('[FluxService] Converting image to base64:', imageUrl)

      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      const base64 = buffer.toString('base64')

      console.log(
        '[FluxService] Base64 conversion successful, length:',
        base64.length
      )
      return base64
    } catch (error) {
      console.error('[FluxService] Image to base64 error:', error)
      throw error
    }
  }

  /**
   * สร้าง prompt แบบ dynamic ตาม format ที่กำหนด
   */
  _createPrompt(
    jobClassName: string,
    personaDescription: string,
    classLevel: number,
    personaTraits?: string
  ): string {
    // รวม personaTraits เข้ากับ personaDescription ถ้ามี
    // const fullPersonaDescription = personaTraits
    //   ? `${personaDescription}, ${personaTraits}`
    //   : personaDescription

    const fullPersonaDescription = personaDescription

    const prompt = `
        Image Type: Full-body character (head to toe)
        Style: 3D caricature-style anime character
        Exaggeration Style: Big head, large eyes, rosy cheeks, clear expressions, charming and exaggerated features
        Lighting: Cinematic lighting to add depth
        Outline: No hard outlines, use soft and smooth edges

        Background: only white (PNG)
        Composition: Full-body view, standing in the center of the frame. No part of the body is cropped or touching the edges. Ensure the entire character from head to toe is clearly visible with ample white space around.

        **${fullPersonaDescription}**
    `.trim()

    return prompt
  }

  createPrompt(
    jobClassName: string,
    personaDescription: string,
    classLevel: number,
    personaTraits?: string,
    isFirstClass: boolean = false
  ): string {
    // รวม personaTraits เข้ากับ personaDescription ถ้ามี
    const fullPersonaDescription = personaDescription

    // ถ้าเป็น class แรก ใช้ full prompt
    if (isFirstClass || classLevel === 1) {
      const prompt = `
        Image Type: Full-body character (head to toe)
        Style: 3D caricature-style anime character
        Exaggeration Style: Big head, large eyes, rosy cheeks, clear expressions, charming and exaggerated features
        Lighting: Cinematic lighting to add depth
        Outline: No hard outlines, use soft and smooth edges

        Background: only white (PNG)
        Composition: Full-body view, standing in the center of the frame. No part of the body is cropped or touching the edges. Ensure the entire character from head to toe is clearly visible with ample white space around.

        Outfit: Wearing a white shirt with a clearly visible "EVX" logo printed on the chest.

        ${fullPersonaDescription}
        `.trim()

      return prompt
    }

    // สำหรับ class อื่นๆ ใช้แค่ personaDescription
    const prompt = `
        Full-body character (head to toe)
        ${fullPersonaDescription}
        `.trim()

    return prompt
  }
}

export const fluxService = new FluxService()
