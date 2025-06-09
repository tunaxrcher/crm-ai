// src/features/character/services/portraitGenerationService.ts
import { prisma } from '@src/lib/db'
import { fluxService } from '@src/lib/services/fluxService'

export interface GeneratePortraitRequest {
  characterId: number
  targetClassLevel: number
  referenceImageUrl: string
  jobClassName: string
  personaDescription: string
  personaTraits?: string
}

export interface GeneratePortraitResult {
  success: boolean
  portraitUrl?: string
  error?: string
}

export interface PreGenerateCheckResult {
  shouldPreGenerate: boolean
  targetClassLevel: number
}

class PortraitGenerationService {
  private readonly CLASS_LEVELS = [1, 10, 35, 60, 80, 99]
  private readonly PRE_GENERATE_THRESHOLDS = [8, 33, 58, 78, 97]

  /**
   * ตรวจสอบว่าควร pre-generate หรือไม่
   */
  checkPreGenerateCondition(currentLevel: number): PreGenerateCheckResult {
    console.log('debug aaaaa')
    // หา threshold ที่ใกล้ที่สุด
    const nextThreshold = this.PRE_GENERATE_THRESHOLDS.find(
      (threshold) => currentLevel === threshold
    )

    if (!nextThreshold) {
      return { shouldPreGenerate: false, targetClassLevel: 0 }
    }

    // หา class level ที่จะ unlock
    const targetClassLevel = this.CLASS_LEVELS.find(
      (level) => level > currentLevel && level <= nextThreshold + 2
    )

    return {
      shouldPreGenerate: !!targetClassLevel,
      targetClassLevel: targetClassLevel || 0,
    }
  }

  /**
   * ตรวจสอบว่า portrait นี้ generate แล้วหรือยัง
   */
  async isPortraitGenerated(
    characterId: number,
    classLevel: number
  ): Promise<boolean> {
    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { generatedPortraits: true },
      })

      if (!character?.generatedPortraits) return false

      let portraits: Record<string, string> = {}

      if (typeof character.generatedPortraits === 'string') {
        portraits = JSON.parse(character.generatedPortraits)
      } else {
        portraits = character.generatedPortraits as Record<string, string>
      }

      const portraitUrl = portraits[classLevel.toString()]
      return !!(portraitUrl && portraitUrl.trim() !== '')
    } catch (error) {
      console.error('[PortraitGeneration] Check portrait error:', error)
      return false
    }
  }

  /**
   * Generate portrait สำหรับ class level ใหม่
   */
  async generatePortrait(
    request: GeneratePortraitRequest
  ): Promise<GeneratePortraitResult> {
    try {
      console.log(
        `[PortraitGeneration] Starting generation for character ${request.characterId}, class ${request.targetClassLevel}`
      )

      // ตรวจสอบว่า generate แล้วหรือยัง
      const alreadyGenerated = await this.isPortraitGenerated(
        request.characterId,
        request.targetClassLevel
      )

      if (alreadyGenerated) {
        console.log(
          `[PortraitGeneration] Portrait already exists for class ${request.targetClassLevel}`
        )
        return { success: true }
      }

      // แปลงรูป reference เป็น base64
      const referenceBase64 = await fluxService.imageToBase64(
        request.referenceImageUrl
      )

      // สร้าง prompt โดยระบุว่าเป็น class แรกหรือไม่
      const isFirstClass = request.targetClassLevel === 1
      const prompt = fluxService.createPrompt(
        request.jobClassName,
        request.personaDescription,
        request.targetClassLevel,
        request.personaTraits,
        isFirstClass // ส่งค่าบอกว่าเป็น class แรกหรือไม่
      )

      console.log(`[PortraitGeneration] Generated prompt for class ${request.targetClassLevel}:`, prompt)
      console.log(`[PortraitGeneration] Is first class: ${isFirstClass}`)

      // เริ่ม generation
      const generateResponse = await fluxService.generatePortrait({
        prompt,
        input_image: referenceBase64,
        output_format: 'png',
        aspect_ratio: '1:1',
        safety_tolerance: 2,
        prompt_upsampling: true,
      })

      console.log(
        `[PortraitGeneration] Generation started with ID: ${generateResponse.id}`
      )

      // รอผลลัพธ์
      const resultImageUrl = await fluxService.waitForResult(
        generateResponse.id
      )

      // Download และอัพโหลดไป S3
      //   const finalPortraitUrl = await fluxService.downloadAndUploadToS3(
      //     resultImageUrl,
      //     request.characterId,
      //     request.targetClassLevel
      //   )
      // Download, ลบพื้นหลัง และอัพโหลดไป S3
      const finalPortraitUrl = await fluxService.downloadRemoveBgAndUploadToS3(
        resultImageUrl,
        request.characterId,
        request.targetClassLevel
      )

      // บันทึกลงฐานข้อมูล
      await this.updateCharacterPortraits(
        request.characterId,
        request.targetClassLevel,
        finalPortraitUrl
      )

      console.log(
        `[PortraitGeneration] Generation completed: ${finalPortraitUrl}`
      )

      return {
        success: true,
        portraitUrl: finalPortraitUrl,
      }
    } catch (error) {
      console.error('[PortraitGeneration] Generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
  /**
   * อัพเดท generatedPortraits ในฐานข้อมูล
   */
  async updateCharacterPortraits(
    characterId: number,
    classLevel: number,
    portraitUrl: string
  ): Promise<void> {
    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { generatedPortraits: true },
      })

      if (!character) {
        throw new Error('Character not found')
      }

      let portraits: Record<string, string> = {}

      // แปลงข้อมูลเดิม
      if (character.generatedPortraits) {
        if (typeof character.generatedPortraits === 'string') {
          portraits = JSON.parse(character.generatedPortraits)
        } else {
          portraits = character.generatedPortraits as Record<string, string>
        }
      }

      // เพิ่มรูปใหม่
      portraits[classLevel.toString()] = portraitUrl

      // บันทึกกลับฐานข้อมูล
      await prisma.character.update({
        where: { id: characterId },
        data: {
          generatedPortraits: portraits,
        },
      })

      console.log(
        `[PortraitGeneration] Updated character ${characterId} portraits:`,
        portraits
      )
    } catch (error) {
      console.error('[PortraitGeneration] Update portraits error:', error)
      throw error
    }
  }

  /**
   * ดึงรูป reference (class level 1) สำหรับการ generate
   */
  async getReferencePortrait(characterId: number): Promise<string> {
    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { generatedPortraits: true, currentPortraitUrl: true },
      })

      if (!character) {
        throw new Error('Character not found')
      }

      let portraits: Record<string, string> = {}

      if (character.generatedPortraits) {
        if (typeof character.generatedPortraits === 'string') {
          portraits = JSON.parse(character.generatedPortraits)
        } else {
          portraits = character.generatedPortraits as Record<string, string>
        }
      }

      // ใช้รูป class level 1 เป็น reference
      const referenceUrl = portraits['1']

      if (!referenceUrl) {
        throw new Error('Reference portrait not found')
      }

      return referenceUrl
    } catch (error) {
      console.error('[PortraitGeneration] Get reference portrait error:', error)
      throw error
    }
  }

  /**
   * Pre-generate portrait สำหรับ level ที่กำลังจะถึง
   */
  async preGeneratePortrait(characterId: number): Promise<void> {
    try {
      // ดึงข้อมูล character
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          jobClass: {
            include: {
              levels: {
                orderBy: { level: 'asc' },
              },
            },
          },
        },
      })

      if (!character) {
        throw new Error('Character not found')
      }

      // ตรวจสอบว่าควร pre-generate หรือไม่
      const preGenerateCheck = this.checkPreGenerateCondition(character.level)

      if (!preGenerateCheck.shouldPreGenerate) {
        console.log(
          `[PortraitGeneration] No pre-generation needed for level ${character.level}`
        )
        return
      }

      // หา job level ที่ตรงกับ target class level
      const targetJobLevel = character.jobClass.levels.find(
        (jl) => jl.requiredCharacterLevel === preGenerateCheck.targetClassLevel
      )

      if (!targetJobLevel) {
        console.log(
          `[PortraitGeneration] Job level not found for class ${preGenerateCheck.targetClassLevel}`
        )
        return
      }

      // ดึงรูป reference
      const referenceUrl = await this.getReferencePortrait(characterId)

      // Generate portrait ใหม่
      await this.generatePortrait({
        characterId,
        targetClassLevel: preGenerateCheck.targetClassLevel,
        referenceImageUrl: referenceUrl,
        jobClassName: character.jobClass.name,
        personaDescription: targetJobLevel.personaDescription || '',
        personaTraits: character.personaTraits || undefined,
      })

      console.log(
        `[PortraitGeneration] Pre-generated portrait for character ${characterId}, class ${preGenerateCheck.targetClassLevel}`
      )
    } catch (error) {
      console.error('[PortraitGeneration] Pre-generate error:', error)
      // ไม่ throw error เพื่อไม่ให้กระทบต่อ main flow
    }
  }

  /**
   * Generate portrait เมื่อถึง milestone จริง
   */
  async generateOnLevelUp(
    characterId: number,
    newLevel: number
  ): Promise<string | null> {
    try {
      // ตรวจสอบว่าเป็น milestone หรือไม่
      const isClassLevel = this.CLASS_LEVELS.includes(newLevel)

      if (!isClassLevel) {
        return null
      }

      // ตรวจสอบว่ามีรูปอยู่แล้วหรือไม่
      const alreadyGenerated = await this.isPortraitGenerated(
        characterId,
        newLevel
      )

      if (alreadyGenerated) {
        // ดึงรูปที่มีอยู่แล้ว
        const character = await prisma.character.findUnique({
          where: { id: characterId },
          select: { generatedPortraits: true },
        })

        if (character?.generatedPortraits) {
          let portraits: Record<string, string> = {}

          if (typeof character.generatedPortraits === 'string') {
            portraits = JSON.parse(character.generatedPortraits)
          } else {
            portraits = character.generatedPortraits as Record<string, string>
          }

          return portraits[newLevel.toString()] || null
        }
      }

      // ถ้ายังไม่มี ให้ generate ใหม่
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: {
          jobClass: {
            include: {
              levels: {
                orderBy: { level: 'asc' },
              },
            },
          },
        },
      })

      if (!character) {
        throw new Error('Character not found')
      }

      const targetJobLevel = character.jobClass.levels.find(
        (jl) => jl.requiredCharacterLevel === newLevel
      )

      if (!targetJobLevel) {
        console.log(
          `[PortraitGeneration] Job level not found for class ${newLevel}`
        )
        return null
      }

      const referenceUrl = await this.getReferencePortrait(characterId)

      const result = await this.generatePortrait({
        characterId,
        targetClassLevel: newLevel,
        referenceImageUrl: referenceUrl,
        jobClassName: character.jobClass.name,
        personaDescription: targetJobLevel.personaDescription || '',
        personaTraits: character.personaTraits || undefined,
      })

      return result.portraitUrl || null
    } catch (error) {
      console.error('[PortraitGeneration] Generate on level up error:', error)
      return null
    }
  }
}

export const portraitGenerationService = new PortraitGenerationService()
