// src/lib/services/removeBgService.ts
export interface RemoveBgResponse {
  success: boolean
  imageBuffer?: Buffer
  error?: string
}

class RemoveBgService {
  private readonly API_KEY = process.env.REMOVE_BG_API_KEY!
  private readonly API_URL = 'https://api.remove.bg/v1.0/removebg'

  /**
   * ลบพื้นหลังจากรูปภาพ
   */
  async removeBackground(imageBuffer: Buffer): Promise<RemoveBgResponse> {
    try {
      console.log('[RemoveBg] Starting background removal...')

      const formData = new FormData()
      formData.append('image_file', new Blob([imageBuffer]), 'image.png')
      formData.append('size', 'auto')
      formData.append('format', 'png')

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.API_KEY,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[RemoveBg] API error:', response.status, errorText)
        return {
          success: false,
          error: `Remove.bg API error: ${response.status} - ${errorText}`,
        }
      }

      const resultBuffer = Buffer.from(await response.arrayBuffer())
      console.log('[RemoveBg] Background removal successful')

      return {
        success: true,
        imageBuffer: resultBuffer,
      }
    } catch (error) {
      console.error('[RemoveBg] Remove background error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * ลบพื้นหลังจาก URL
   */
  async removeBackgroundFromUrl(imageUrl: string): Promise<RemoveBgResponse> {
    try {
      console.log('[RemoveBg] Downloading image from URL:', imageUrl)

      // Download รูปจาก URL
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer())

      // ลบพื้นหลัง
      return await this.removeBackground(imageBuffer)
    } catch (error) {
      console.error('[RemoveBg] Remove background from URL error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const removeBgService = new RemoveBgService()
