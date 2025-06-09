// src/features/character/service/characterLevelService.ts
import { userService } from '@src/features/user/services/server'
import { StatAnalysisService } from '@src/lib/ai/statAnalysisService'
import { prisma } from '@src/lib/db'
import { replicateService } from '@src/lib/services/replicateService'
import { getStoragePublicUrl } from '@src/lib/utils'

import { characterRepository } from '../repository'
import { portraitGenerationService } from '@src/lib/services/portraitGenerationService'

interface LevelUpResult {
  character: any
  levelHistory: any
  statGains: StatGains
  unlockedClassLevel?: number
  newJobLevel?: any
  portraitUpdated: boolean
  aiReasoning: string
}

interface StatGains {
  agiGained: number
  strGained: number
  dexGained: number
  vitGained: number
  intGained: number
  reasoning: string
}

interface PortraitUpdateResult {
  updatedPortraits: any
  newPortraitUrl: string
  unlockedClassLevel?: number
}

interface JobLevelUpdateResult {
  shouldUpdate: boolean
  newJobLevel: any | null
}

// =============== PortraitHelper Class ===============
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
  // static async updateGeneratedPortraits(
  //   characterId: number,
  //   currentPortraits: any,
  //   newClassLevel: number,
  //   originalFaceImage?: string | null
  // ): Promise<GeneratedPortraits> {
  //   if (!currentPortraits) {
  //     currentPortraits = this.initializeEmptyPortraits()
  //   }

  //   let portraits: GeneratedPortraits
  //   if (typeof currentPortraits === 'string') {
  //     try {
  //       portraits = JSON.parse(currentPortraits)
  //       console.log(portraits)
  //     } catch {
  //       portraits = this.initializeEmptyPortraits()
  //     }
  //   } else {
  //     portraits = { ...currentPortraits }
  //   }

  //   // Generate new portrait for the unlocked class level
  //   const newPortraitUrl = await this.generateNewPortrait(
  //     characterId,
  //     newClassLevel,
  //     originalFaceImage
  //   )

  //   console.log(`[PortraitHelper] Updated portraits:`, portraits)

  //   return portraits
  // }

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
        console.log('[PortraitHelper] Parsed portraits:', portraits)
      } catch {
        portraits = this.initializeEmptyPortraits()
      }
    } else {
      portraits = { ...currentPortraits }
    }

    // ดึงภาพสำหรับ class level ที่ปลดล็อกจากฐานข้อมูล
    const portraitUrl = await this.getPortraitForClassLevel(
      characterId,
      newClassLevel
    )

    // อัพเดทข้อมูล portraits
    portraits[newClassLevel.toString()] = portraitUrl

    console.log(`[PortraitHelper] Updated portraits:`, portraits)

    return portraits
  }

  /**
   * ดึงภาพ portrait สำหรับ class level จากฐานข้อมูล
   * แทนการเจนภาพใหม่ด้วย replicateService
   */
  static async getPortraitForClassLevel(
    characterId: number,
    classLevel: number
  ): Promise<string> {
    try {
      // ดึงข้อมูล character และ generatedPortraits
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: {
          generatedPortraits: true,
          jobClassId: true,
        },
      })

      if (!character) {
        throw new Error('Character not found')
      }

      let portraits: GeneratedPortraits = {}

      // แปลงค่า generatedPortraits เป็น object
      if (typeof character.generatedPortraits === 'string') {
        try {
          portraits = JSON.parse(character.generatedPortraits)
        } catch {
          console.error('[PortraitHelper] Failed to parse generatedPortraits')
          portraits = {}
        }
      } else if (character.generatedPortraits) {
        portraits = character.generatedPortraits as GeneratedPortraits
      }

      // ตรวจสอบว่ามีภาพสำหรับ classLevel ที่ต้องการหรือไม่
      const portraitUrl = portraits[classLevel.toString()]

      if (portraitUrl) {
        console.log(
          `[PortraitHelper] Found portrait for class level ${classLevel}: ${portraitUrl}`
        )
        return portraitUrl
      }

      // ถ้าไม่มีภาพสำหรับ classLevel ที่ต้องการ ให้ใช้ภาพจากฐานข้อมูลกลาง
      console.log(
        `[PortraitHelper] Portrait for class level ${classLevel} not found in character data, using default`
      )

      // ดึงภาพ default จากฐานข้อมูลตาม jobClassId และ level
      const defaultPortrait = await this.getDefaultPortraitByJobClassAndLevel(
        character.jobClassId,
        classLevel
      )

      return defaultPortrait || `${getStoragePublicUrl()}/${classLevel}.png`
    } catch (error) {
      console.error(`[PortraitHelper] Error getting portrait:`, error)
      // Return default placeholder if retrieval fails
      return `${getStoragePublicUrl()}/${classLevel}.png`
    }
  }

  /**
   * ดึงภาพ default จากฐานข้อมูลตาม jobClassId และ level
   */
  private static async getDefaultPortraitByJobClassAndLevel(
    jobClassId: number,
    classLevel: number
  ): Promise<string | null> {
    // ตรวจสอบว่ามีภาพ default ในฐานข้อมูลหรือไม่
    // คุณอาจต้องปรับปรุงโค้ดส่วนนี้ตามโครงสร้างฐานข้อมูลของคุณ
    try {
      return `https://tawnychatai2.sgp1.digitaloceanspaces.com/${classLevel}.png`
    } catch (error) {
      console.error(`[PortraitHelper] Error getting default portrait:`, error)
      return null
    }
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

// =============== JobClassHelper Class ===============
export class JobClassHelper {
  /**
   * หา job level ที่เหมาะสมตาม character level
   */
  static getJobLevelForCharacter(
    jobLevels: any[],
    characterLevel: number
  ): any {
    if (!jobLevels || jobLevels.length === 0) return null

    console.log('Debug getJobLevelForCharacter:', {
      jobLevelsCount: jobLevels.length,
      characterLevel: characterLevel,
    })

    // Sort จากน้อยไปมาก
    const sortedLevels = [...jobLevels].sort(
      (a, b) => a.requiredCharacterLevel - b.requiredCharacterLevel
    )

    // หา job level ที่สูงสุดที่ character level ถึงแล้ว
    for (let i = sortedLevels.length - 1; i >= 0; i--) {
      if (characterLevel >= sortedLevels[i].requiredCharacterLevel) {
        return sortedLevels[i]
      }
    }

    return sortedLevels[0]
  }

  /**
   * ตรวจสอบว่าควรอัพเดท job level หรือไม่
   * ใช้การเปรียบเทียบ ID แทน level เพื่อความแม่นยำ
   */
  static shouldUpdateJobLevel(
    currentJobLevel: any,
    jobLevels: any[],
    newCharacterLevel: number
  ): { shouldUpdate: boolean; newJobLevel: any | null } {
    // หา job level ที่เหมาะสมสำหรับ character level ใหม่
    const newJobLevel = this.getJobLevelForCharacter(
      jobLevels,
      newCharacterLevel
    )

    if (!newJobLevel || !currentJobLevel) {
      return { shouldUpdate: !!newJobLevel, newJobLevel }
    }

    // ใช้ ID ในการเปรียบเทียบแทน level number
    const shouldUpdate = newJobLevel.id !== currentJobLevel.id

    // Logging สำหรับ debug
    console.log('Debug shouldUpdateJobLevel:', {
      current: {
        id: currentJobLevel.id,
        title: currentJobLevel.title,
        requiredLevel: currentJobLevel.requiredCharacterLevel,
      },
      new: {
        id: newJobLevel.id,
        title: newJobLevel.title,
        requiredLevel: newJobLevel.requiredCharacterLevel,
      },
      characterLevel: newCharacterLevel,
      shouldUpdate,
    })

    return {
      shouldUpdate,
      newJobLevel: shouldUpdate ? newJobLevel : null,
    }
  }

  /**
   * คำนวณ XP ที่ต้องการสำหรับ level ถัดไป
   * ใช้สูตร exponential growth
   */
  static calculateNextLevelXP(
    currentLevel: number,
    baseXP: number = 1000
  ): number {
    return Math.floor(baseXP * Math.pow(1.2, currentLevel - 1))
  }
}

// =============== Main CharacterLevelService Class ===============
export class CharacterLevelService {
  private static IMPORTANT_THRESHOLDS = [10, 35, 60, 80, 99]

  /**
   * Process character level up with all related updates
   */
  async processLevelUp(
    characterId: number,
    oldLevel: number,
    newLevel: number,
    shouldUpdateLevel: boolean = true
  ) {
    // 1. Fetch character data
    const character = await this.fetchCharacterData(characterId)

    console.log(
      `[ProcessLevelUp] Processing level up: ${oldLevel} → ${newLevel}`
    )

    // 2. Calculate stat gains using AI
    const statGains = await this.calculateStatGains(
      character,
      oldLevel,
      newLevel
    )

    // 3. Handle portrait updates if needed
    const portraitUpdate = await this.handlePortraitUpdate(
      character,
      oldLevel,
      newLevel
    )

    // 4. Handle job level updates
    const jobLevelUpdate = this.handleJobLevelUpdate(
      character,
      oldLevel,
      newLevel
    )

    // 5. Create level history record
    const levelHistory = await this.createLevelHistory(
      characterId,
      oldLevel,
      newLevel,
      statGains,
      portraitUpdate.unlockedClassLevel
    )

    // 6. Update character data
    const updatedCharacter = await this.updateCharacterData(
      character,
      statGains,
      portraitUpdate,
      jobLevelUpdate,
      shouldUpdateLevel,
      newLevel
    )

    console.log('say hiiii')
    console.log('newLevel ', newLevel)
    console.log('characterId ', characterId)

        // 7. ตรวจสอบ pre-generation สำหรับ level ถัดไป
    await this.handlePreGeneration(characterId, newLevel)

    // 8. Generate portrait ถ้าถึง milestone
    const newPortraitUrl = await this.handleMilestonePortraitGeneration(
      characterId,
      newLevel
    )

    // 7. Create feed notification
    await this.createFeedNotification(
      updatedCharacter,
      levelHistory,
      statGains,
      portraitUpdate.unlockedClassLevel,
      jobLevelUpdate
    )

    // 8. Return complete result
    const getUserCharacters = await userService.getUserCharacters()

    return {
      character: getUserCharacters.character,
      levelHistory,
      statGains,
      unlockedClassLevel: portraitUpdate.unlockedClassLevel,
      newJobLevel: jobLevelUpdate.newJobLevel,
      portraitUpdated: !!portraitUpdate.unlockedClassLevel,
      aiReasoning: statGains.reasoning,
    }
  }

  /**
   * จัดการ pre-generation
   */
  private async handlePreGeneration(characterId: number, currentLevel: number): Promise<void> {
    try {
      
      // ตรวจสอบว่าควร pre-generate หรือไม่
      const preGenerateCheck = portraitGenerationService.checkPreGenerateCondition(currentLevel)
      
      if (preGenerateCheck.shouldPreGenerate) {
        console.log(`[LevelUp] Triggering pre-generation for character ${characterId}, target class ${preGenerateCheck.targetClassLevel}`)
        
        // รัน async โดยไม่รอ
        portraitGenerationService.preGeneratePortrait(characterId).catch(error => {
          console.error('[LevelUp] Pre-generation error:', error)
        })
      }
    } catch (error) {
      console.error('[LevelUp] Handle pre-generation error:', error)
    }
  }

   /**
   * Generate portrait เมื่อถึง milestone
   */
  private async handleMilestonePortraitGeneration(
    characterId: number,
    newLevel: number
  ): Promise<string | null> {
    try {
      const newPortraitUrl = await portraitGenerationService.generateOnLevelUp(
        characterId,
        newLevel
      )

      if (newPortraitUrl) {
        // อัพเดท currentPortraitUrl ในฐานข้อมูล
        await characterRepository.updateCharacterWithPortraitAndJob(characterId, {
          currentPortraitUrl: newPortraitUrl
        })

        console.log(`[LevelUp] Updated current portrait for character ${characterId}: ${newPortraitUrl}`)
      }

      return newPortraitUrl
    } catch (error) {
      console.error('[LevelUp] Handle milestone portrait generation error:', error)
      return null
    }
  }

  /**
   * Fetch character with all required relations
   */
  private async fetchCharacterData(characterId: number) {
    const character =
      await characterRepository.findByIdWithJobLevels(characterId)
    if (!character) {
      throw new Error('Character not found')
    }
    return character
  }

  /**
   * Calculate stat gains using AI service
   */
  private async calculateStatGains(
    character: any,
    oldLevel: number,
    newLevel: number
  ): Promise<StatGains> {
    const statGains = await this.statsAllocationServiceCalculateStatGains(
      character.id,
      oldLevel,
      newLevel,
      character.jobClass.name
    )

    if (!statGains || statGains instanceof Error) {
      throw new Error('Failed to calculate stat gains')
    }
    console.log(`[ProcessLevelUp] AI stat gains:`, statGains)
    return statGains
  }

  /**
   * คำนวณการจ่าย stats สำหรับการเลเวลอัพด้วย AI structured output
   */
  async statsAllocationServiceCalculateStatGains(
    characterId: number,
    currentLevel: number,
    newLevel: number,
    jobClassName: string
  ) {
    try {
      console.log(
        `[StatAllocation] Starting AI analysis for character ${characterId}`
      )

      // ดึง quest submissions ย้อนหลัง
      const questSubmissions =
        await characterRepository.getQuestSubmissionsBetweenLevels(
          characterId,
          Math.max(1, currentLevel - 3),
          currentLevel
        )

      console.log(
        `[StatAllocation] Found ${questSubmissions.length} quest submissions`
      )

      // แปลงข้อมูลให้เหมาะสำหรับ AI
      const questData = questSubmissions.map((submission) => ({
        questTitle: submission.quest.title,
        questType: submission.quest.type,
        description: submission.description || submission.quest.description,
        ratingAGI: submission.ratingAGI || 0,
        ratingSTR: submission.ratingSTR || 0,
        ratingDEX: submission.ratingDEX || 0,
        ratingVIT: submission.ratingVIT || 0,
        ratingINT: submission.ratingINT || 0,
        submittedAt: submission.submittedAt.toISOString(),
      }))

      // ส่งไป AI วิเคราะห์ stats allocation
      const statAllocation = await StatAnalysisService.analyzeStatsAllocation(
        questData,
        jobClassName,
        currentLevel,
        newLevel
      )

      if (!statAllocation) return new Error('FailedstatAllocatione')

      console.log(`[StatAllocation] AI allocation result:`, statAllocation)

      return {
        agiGained: statAllocation.AGI,
        strGained: statAllocation.STR,
        dexGained: statAllocation.DEX,
        vitGained: statAllocation.VIT,
        intGained: statAllocation.INT,
        reasoning: statAllocation.reasoning,
      }
    } catch (error) {
      console.error('[StatAllocation] Error calculating stat gains:', error)
    }
  }

  /**
   * Handle portrait updates when unlocking new class levels
   */
  private async handlePortraitUpdate(
    character: any,
    oldLevel: number,
    newLevel: number
  ): Promise<PortraitUpdateResult> {
    const unlockedClassLevel = PortraitHelper.shouldUnlockNewClass(
      newLevel,
      oldLevel
    )

    if (!unlockedClassLevel) {
      return {
        updatedPortraits: character.generatedPortraits,
        newPortraitUrl: character.currentPortraitUrl,
      }
    }

    console.log(
      `[ProcessLevelUp] Unlocking new class level: ${unlockedClassLevel}`
    )

    // Generate new portrait
    const updatedPortraits = await PortraitHelper.updateGeneratedPortraits(
      character.id,
      character.generatedPortraits,
      unlockedClassLevel,
      character.originalFaceImage
    )

    const newPortraitUrl = PortraitHelper.getCurrentPortraitUrl(
      newLevel,
      updatedPortraits
    )

    console.log(`[ProcessLevelUp] New portrait URL: ${newPortraitUrl}`)

    return {
      updatedPortraits,
      newPortraitUrl,
      unlockedClassLevel,
    }
  }

  /**
   * Handle job level updates including threshold checks
   */
  private handleJobLevelUpdate(
    character: any,
    oldLevel: number,
    newLevel: number
  ): JobLevelUpdateResult {
    // Check if we're at an important threshold
    if (this.isImportantThreshold(oldLevel, newLevel)) {
      const targetJobLevel = this.findJobLevelForThreshold(
        character.jobClass.levels,
        newLevel
      )

      if (targetJobLevel) {
        console.log(
          `[ProcessLevelUp] Force updating job level at threshold ${newLevel}`,
          `Current: ${character.currentJobLevel.title}, Target: ${targetJobLevel.title}`
        )

        return {
          shouldUpdate: true,
          newJobLevel: targetJobLevel,
        }
      }
    }

    // Normal job level check
    return JobClassHelper.shouldUpdateJobLevel(
      character.currentJobLevel,
      character.jobClass.levels,
      newLevel
    )
  }

  /**
   * Check if level is at important threshold
   */
  private isImportantThreshold(oldLevel: number, newLevel: number): boolean {
    return (
      CharacterLevelService.IMPORTANT_THRESHOLDS.includes(newLevel) &&
      oldLevel < newLevel
    )
  }

  /**
   * Find job level matching the threshold
   */
  private findJobLevelForThreshold(jobLevels: any[], threshold: number) {
    return jobLevels.find((jl) => jl.requiredCharacterLevel === threshold)
  }

  /**
   * Create level history record
   */
  private async createLevelHistory(
    characterId: number,
    levelFrom: number,
    levelTo: number,
    statGains: StatGains,
    unlockedClassLevel?: number
  ) {
    const reasoning = `AI Analysis: ${statGains.reasoning}${
      unlockedClassLevel ? ` | Unlocked class level ${unlockedClassLevel}` : ''
    }`

    return await characterRepository.createLevelHistory({
      characterId,
      levelFrom,
      levelTo,
      agiGained: statGains.agiGained,
      strGained: statGains.strGained,
      dexGained: statGains.dexGained,
      vitGained: statGains.vitGained,
      intGained: statGains.intGained,
      reasoning,
    })
  }

  /**
   * Update character with all changes
   */
  private async updateCharacterData(
    character: any,
    statGains: StatGains,
    portraitUpdate: PortraitUpdateResult,
    jobLevelUpdate: JobLevelUpdateResult,
    shouldUpdateLevel: boolean,
    newLevel: number
  ) {
    const updateData: any = {
      // Update stats
      statAGI: character.statAGI + statGains.agiGained,
      statSTR: character.statSTR + statGains.strGained,
      statDEX: character.statDEX + statGains.dexGained,
      statVIT: character.statVIT + statGains.vitGained,
      statINT: character.statINT + statGains.intGained,
      statPoints: character.statPoints + 5,
    }

    // Add level updates if needed
    if (shouldUpdateLevel) {
      updateData.level = newLevel
      updateData.currentXP = 0
      updateData.nextLevelXP = JobClassHelper.calculateNextLevelXP(newLevel)
    }

    // Add portrait updates if changed
    if (portraitUpdate.unlockedClassLevel) {
      updateData.generatedPortraits = portraitUpdate.updatedPortraits
      updateData.currentPortraitUrl = portraitUpdate.newPortraitUrl
    }

    // Add job level updates if changed
    if (jobLevelUpdate.shouldUpdate && jobLevelUpdate.newJobLevel) {
      updateData.jobLevelId = jobLevelUpdate.newJobLevel.id
    }

    return await characterRepository.updateCharacterWithPortraitAndJob(
      character.id,
      updateData
    )
  }

  /**
   * Create feed notification for level up
   */
  private async createFeedNotification(
    character: any,
    levelHistory: any,
    statGains: StatGains,
    unlockedClassLevel?: number,
    jobLevelUpdate?: JobLevelUpdateResult
  ) {
    const feedContent = this.buildFeedContent(
      character,
      levelHistory,
      statGains,
      unlockedClassLevel,
      jobLevelUpdate
    )

    await characterRepository.createFeedItem({
      content: feedContent,
      type: 'level_up',
      mediaType: 'text',
      userId: character.userId,
      levelHistoryId: levelHistory.id,
    })
  }

  /**
   * Build feed content message
   */
  private buildFeedContent(
    character: any,
    levelHistory: any,
    statGains: StatGains,
    unlockedClassLevel?: number,
    jobLevelUpdate?: JobLevelUpdateResult
  ): string {
    const parts: string[] = [
      `🎉 ${character.user.name} (${character.jobClass.name}) ได้เลเวลอัพจาก Lv.${levelHistory.levelFrom} เป็น Lv.${levelHistory.levelTo}!`,
    ]

    if (unlockedClassLevel) {
      parts.push(`🌟 ปลดล็อกคลาสใหม่ Level ${unlockedClassLevel}!`)
    }

    if (jobLevelUpdate?.shouldUpdate && jobLevelUpdate.newJobLevel) {
      parts.push(`👑 เลื่อนตำแหน่งเป็น "${jobLevelUpdate.newJobLevel.title}"!`)
    }

    parts.push(
      `💪 STR +${statGains.strGained} 🧠 INT +${statGains.intGained} ` +
        `🏃 AGI +${statGains.agiGained} 🎯 DEX +${statGains.dexGained} ` +
        `❤️ VIT +${statGains.vitGained}`
    )

    // Add shortened AI reasoning
    const shortReasoning = this.truncateReasoning(statGains.reasoning, 100)
    parts.push(`🤖 ${shortReasoning}`)

    return parts.join(' ')
  }

  /**
   * Truncate reasoning text if too long
   */
  private truncateReasoning(reasoning: string, maxLength: number): string {
    return reasoning.length > maxLength
      ? reasoning.substring(0, maxLength) + '...'
      : reasoning
  }
}
