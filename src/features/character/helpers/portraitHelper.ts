interface GeneratedPortraits {
  [key: string]: string
}

export class PortraitHelper {
  private static readonly CLASS_LEVELS = [1, 10, 35, 60, 80, 99]
  private static readonly BUCKET =
    process.env.DO_SPACES_BUCKET || 'tawnychatai2'
  private static readonly REGION = process.env.DO_SPACES_REGION || 'sgp1'
  private static readonly BASE_URL = `https://${this.BUCKET}.${this.REGION}.digitaloceanspaces.com`

  /**
   * สร้าง URL สำหรับ portrait ของ class level ที่กำหนด
   */
  private static generatePortraitUrl(classLevel: number): string {
    return `${this.BASE_URL}/${classLevel}.png`
  }

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
   * อัพเดท generatedPortraits โดยเพิ่ม portrait ใหม่สำหรับ class level ที่ปลดล็อก
   */
  static updateGeneratedPortraits(
    currentPortraits: GeneratedPortraits | null,
    newClassLevel: number
  ): GeneratedPortraits {
    if (!currentPortraits) {
      currentPortraits = this.initializeEmptyPortraits()
    }

    let portraits: GeneratedPortraits
    if (typeof currentPortraits === 'string') {
      try {
        portraits = JSON.parse(currentPortraits)
      } catch {
        portraits = this.initializeEmptyPortraits()
      }
    } else {
      portraits = { ...currentPortraits }
    }

    portraits[newClassLevel.toString()] =
      this.generatePortraitUrl(newClassLevel)
    return portraits
  }

  /**
   * สร้าง generatedPortraits เริ่มต้นที่มีแต่ level 1
   */
  static initializePortraitsForNewCharacter(): GeneratedPortraits {
    const portraits: GeneratedPortraits = {}

    this.CLASS_LEVELS.forEach((level) => {
      if (level === 1) {
        portraits[level.toString()] = this.generatePortraitUrl(level)
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
    generatedPortraits: GeneratedPortraits | null
  ): string {
    if (!generatedPortraits) {
      return this.generatePortraitUrl(1)
    }

    let portraits: GeneratedPortraits
    if (typeof generatedPortraits === 'string') {
      try {
        portraits = JSON.parse(generatedPortraits)
      } catch {
        return this.generatePortraitUrl(1)
      }
    } else {
      portraits = generatedPortraits
    }

    const currentClassLevel = this.getCurrentClassLevel(characterLevel)

    for (let i = this.CLASS_LEVELS.length - 1; i >= 0; i--) {
      const level = this.CLASS_LEVELS[i]
      if (level <= currentClassLevel && portraits[level.toString()]) {
        return portraits[level.toString()]
      }
    }

    return this.generatePortraitUrl(1)
  }

  /**
   * หา class level ถัดไปที่จะปลดล็อก
   */
  static getNextClassLevel(characterLevel: number): number | null {
    const nextLevel = this.CLASS_LEVELS.find((level) => level > characterLevel)
    return nextLevel || null
  }
}
