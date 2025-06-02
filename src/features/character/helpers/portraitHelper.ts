// src/features/character/helpers/portraitHelper.ts
import { prisma } from '@src/lib/db'

import { replicateService } from '../service/replicateService'

interface GeneratedPortraits {
  [key: string]: string
}

export class PortraitHelper {
  private static readonly CLASS_LEVELS = [1, 10, 35, 60, 80, 99]

  /**
   * ตรวจสอบว่า character level ปัจจุบันควรมี class level ใหม่หรือไม่
   */
  static shouldUnlockNewClass(
    currentLevel: number,
    previousLevel: number
  ): number | null {
    const newClassLevel = this.CLASS_LEVELS.find(
      (level) => currentLevel >= level && previousLevel < level
    )

    return newClassLevel || null
  }

  /**
   * หา class level ปัจจุบันตาม character level
   */
  static getCurrentClassLevel(characterLevel: number): number {
    for (let i = this.CLASS_LEVELS.length - 1; i >= 0; i--) {
      if (characterLevel >= this.CLASS_LEVELS[i]) {
        return this.CLASS_LEVELS[i]
      }
    }
    return this.CLASS_LEVELS[0]
  }

  /**
   * Generate portrait สำหรับ class level ใหม่
   */
  static async generateNewPortrait(
    characterId: number,
    newClassLevel: number,
    originalFaceImage?: string | null
  ): Promise<string> {
    try {
      // ดึงข้อมูล character และ job levels
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

      if (!character) throw new Error('Character not found')

      // หา job level ที่ตรงกับ class level
      const jobLevel = character.jobClass.levels.find(
        (jl) => jl.requiredCharacterLevel === newClassLevel
      )

      if (!jobLevel) {
        console.error(
          `[PortraitHelper] Job level not found for class level ${newClassLevel}`
        )
        throw new Error('Job level not found')
      }

      console.log(
        `[PortraitHelper] Generating portrait for class level ${newClassLevel}`
      )
      console.log(
        `[PortraitHelper] Using job level: ${jobLevel.level} - ${jobLevel.title}`
      )
      console.log(
        `[PortraitHelper] PersonaDescription: ${jobLevel.personaDescription}`
      )

      // Generate portrait using ReplicateService
      const portraits = await replicateService.generatePortraits(
        character.jobClass.name,
        [jobLevel], // ส่งเฉพาะ job level ที่ต้องการ
        originalFaceImage || undefined,
        character.personaTraits || undefined
      )

      if (!portraits || portraits.length === 0) {
        throw new Error('Failed to generate portrait')
      }

      return portraits[0].url
    } catch (error) {
      console.error(`[PortraitHelper] Error generating portrait:`, error)
      // Return placeholder if generation fails
      return `https://source.unsplash.com/400x400/?portrait,class${newClassLevel}`
    }
  }

  /**
   * อัพเดท generatedPortraits โดยเพิ่ม portrait ใหม่สำหรับ class level ที่ปลดล็อก
   */
  static async updateGeneratedPortraits(
    characterId: number,
    currentPortraits: any,
    newClassLevel: number,
    originalFaceImage?: string | null
  ): Promise<GeneratedPortraits> {
    if (!currentPortraits) {
      currentPortraits = this.initializeEmptyPortraits()
    }

    let portraits: GeneratedPortraits
    if (typeof currentPortraits === 'string') {
      try {
        portraits = JSON.parse(currentPortraits)
        console.log(portraits)
      } catch {
        portraits = this.initializeEmptyPortraits()
      }
    } else {
      portraits = { ...currentPortraits }
    }

    // Generate new portrait for the unlocked class level
    const newPortraitUrl = await this.generateNewPortrait(
      characterId,
      newClassLevel,
      originalFaceImage
    )

    console.log(`[PortraitHelper] Updated portraits:`, portraits)

    return portraits
  }

  /**
   * สร้าง generatedPortraits เริ่มต้นที่มีแต่ level 1
   */
  static initializePortraitsForNewCharacter(
    level1PortraitUrl: string
  ): GeneratedPortraits {
    const portraits: GeneratedPortraits = {}

    this.CLASS_LEVELS.forEach((level) => {
      if (level === 1) {
        portraits[level.toString()] = level1PortraitUrl
      } else {
        portraits[level.toString()] = ''
      }
    })

    return portraits
  }

  /**
   * สร้าง generatedPortraits ว่าง ๆ
   */
  private static initializeEmptyPortraits(): GeneratedPortraits {
    const portraits: GeneratedPortraits = {}

    this.CLASS_LEVELS.forEach((level) => {
      portraits[level.toString()] = ''
    })

    return portraits
  }

  /**
   * หา currentPortraitUrl ล่าสุดตาม character level
   */
  static getCurrentPortraitUrl(
    characterLevel: number,
    generatedPortraits: any
  ): string {
    if (!generatedPortraits) {
      return ''
    }

    let portraits: GeneratedPortraits
    if (typeof generatedPortraits === 'string') {
      try {
        portraits = JSON.parse(generatedPortraits)
      } catch {
        return ''
      }
    } else {
      portraits = generatedPortraits
    }

    const currentClassLevel = this.getCurrentClassLevel(characterLevel)

    // หาภาพล่าสุดที่มีอยู่
    for (let i = this.CLASS_LEVELS.length - 1; i >= 0; i--) {
      const level = this.CLASS_LEVELS[i]
      if (level <= currentClassLevel && portraits[level.toString()]) {
        return portraits[level.toString()]
      }
    }

    return portraits['1'] || ''
  }

  /**
   * หา class level ถัดไปที่จะปลดล็อก
   */
  static getNextClassLevel(characterLevel: number): number | null {
    const nextLevel = this.CLASS_LEVELS.find((level) => level > characterLevel)
    return nextLevel || null
  }
}
