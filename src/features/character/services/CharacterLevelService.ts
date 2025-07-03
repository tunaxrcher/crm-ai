// src/features/character/service/characterLevelService.ts
import { userService } from '@src/features/user/services/server'
import { StatAnalysisService } from '@src/lib/ai/statAnalysisService'
import { prisma } from '@src/lib/db'
import { portraitGenerationService } from '@src/lib/services/portraitGenerationService'
import { getStoragePublicUrl } from '@src/lib/utils'

import { characterRepository } from '../repository'

// =============== Constants ===============
const LEVEL_CONFIG = {
  CLASS_UNLOCK_LEVELS: [1, 10, 35, 60, 80, 99],
  IMPORTANT_THRESHOLDS: [10, 35, 60, 80, 99],
  BASE_XP: 1000,
  XP_GROWTH_RATE: 1.2,
  STAT_POINTS_PER_LEVEL: 3,
  MAX_REASONING_LENGTH: 100,
  PRE_GENERATE_OFFSET: 3,
} as const

// =============== Types ===============
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

interface GeneratedPortraits {
  [key: string]: string
}

interface ProcessLevelUpResult {
  character: any
  levelHistory: any
  statGains: StatGains
  unlockedClassLevel?: number
  newJobLevel: any | null
  portraitUpdated: boolean
  aiReasoning: string
}

// =============== Portrait Helper Class ===============
export class PortraitHelper {
  private static readonly CLASS_LEVELS = LEVEL_CONFIG.CLASS_UNLOCK_LEVELS

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
   * Parse portraits data safely
   */
  private static parsePortraits(data: any): GeneratedPortraits {
    if (!data) return this.initializeEmptyPortraits()

    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return typeof parsed === 'object'
          ? parsed
          : this.initializeEmptyPortraits()
      } catch (error) {
        console.error('[PortraitHelper] Failed to parse portraits:', error)
        return this.initializeEmptyPortraits()
      }
    }

    return data as GeneratedPortraits
  }

  /**
   * อัพเดท generatedPortraits โดยเพิ่ม portrait ใหม่สำหรับ class level ที่ปลดล็อค
   */
  static async updateGeneratedPortraits(
    characterId: number,
    currentPortraits: any,
    newClassLevel: number,
    originalFaceImage?: string | null
  ): Promise<GeneratedPortraits> {
    const portraits = this.parsePortraits(currentPortraits)
    const portraitUrl = await this.getPortraitForClassLevel(
      characterId,
      newClassLevel
    )

    portraits[newClassLevel.toString()] = portraitUrl
    console.log(`[PortraitHelper] Updated portraits:`, portraits)

    return portraits
  }

  /**
   * ดึงภาพ portrait สำหรับ class level จากฐานข้อมูล
   */
  static async getPortraitForClassLevel(
    characterId: number,
    classLevel: number
  ): Promise<string> {
    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: {
          generatedPortraits: true,
          jobClassId: true,
        },
      })

      if (!character) throw new Error('Character not found')

      const portraits = this.parsePortraits(character.generatedPortraits)
      const portraitUrl = portraits[classLevel.toString()]

      if (portraitUrl) {
        console.log(
          `[PortraitHelper] Found portrait for class level ${classLevel}: ${portraitUrl}`
        )
        return portraitUrl
      }

      console.log(
        `[PortraitHelper] Portrait for class level ${classLevel} not found, using default`
      )

      return this.getDefaultPortraitByJobClassAndLevel(
        character.jobClassId,
        classLevel
      )
    } catch (error) {
      console.error(`[PortraitHelper] Error getting portrait:`, error)
      return `${getStoragePublicUrl()}/${classLevel}.png`
    }
  }

  /**
   * ดึงภาพ default จากฐานข้อมูลตาม jobClassId และ level
   */
  private static getDefaultPortraitByJobClassAndLevel(
    jobClassId: number,
    classLevel: number
  ): string {
    return `https://tawnychatai2.sgp1.digitaloceanspaces.com/${classLevel}.png`
  }

  /**
   * สร้าง generatedPortraits เริ่มต้นที่มีแต่ level 1
   */
  static initializePortraitsForNewCharacter(
    level1PortraitUrl: string
  ): GeneratedPortraits {
    const portraits: GeneratedPortraits = {}

    this.CLASS_LEVELS.forEach((level) => {
      portraits[level.toString()] = level === 1 ? level1PortraitUrl : ''
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
    const portraits = this.parsePortraits(generatedPortraits)
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
   * หา class level ถัดไปที่จะปลดล็อค
   */
  static getNextClassLevel(characterLevel: number): number | null {
    const nextLevel = this.CLASS_LEVELS.find((level) => level > characterLevel)

    return nextLevel || null
  }
}

// =============== JobClass Helper Class ===============
export class JobClassHelper {
  /**
   * หา job level ที่เหมาะสมตาม character level
   */
  static getJobLevelForCharacter(
    jobLevels: any[],
    characterLevel: number
  ): any {
    if (!jobLevels || jobLevels.length === 0) return null

    const sortedLevels = [...jobLevels].sort(
      (a, b) => a.requiredCharacterLevel - b.requiredCharacterLevel
    )

    for (let i = sortedLevels.length - 1; i >= 0; i--) {
      if (characterLevel >= sortedLevels[i].requiredCharacterLevel) {
        return sortedLevels[i]
      }
    }

    return sortedLevels[0]
  }

  /**
   * ตรวจสอบว่าควรอัพเดท job level หรือไม่
   */
  static shouldUpdateJobLevel(
    currentJobLevel: any,
    jobLevels: any[],
    newCharacterLevel: number
  ): JobLevelUpdateResult {
    const newJobLevel = this.getJobLevelForCharacter(
      jobLevels,
      newCharacterLevel
    )

    if (!newJobLevel || !currentJobLevel) {
      return { shouldUpdate: !!newJobLevel, newJobLevel }
    }

    const shouldUpdate = newJobLevel.id !== currentJobLevel.id

    return {
      shouldUpdate,
      newJobLevel: shouldUpdate ? newJobLevel : null,
    }
  }

  /**
   * คำนวณ XP ที่ต้องการสำหรับ level ถัดไป
   */
  static calculateNextLevelXP(currentLevel: number): number {
    return Math.floor(
      LEVEL_CONFIG.BASE_XP *
        Math.pow(LEVEL_CONFIG.XP_GROWTH_RATE, currentLevel - 1)
    )
  }
}

// =============== Main CharacterLevelService Class ===============
export class CharacterLevelService {
  private static IMPORTANT_THRESHOLDS = LEVEL_CONFIG.IMPORTANT_THRESHOLDS

  /**
   * Process character level up with all related updates
   */
  async processLevelUp(
    character: any,
    oldLevel: number,
    newLevel: number,
    shouldUpdateLevel: boolean = true
  ): Promise<ProcessLevelUpResult> {
    console.log(
      `[ProcessLevelUp] Processing level up: ${oldLevel} → ${newLevel}`
    )

    try {
      // Run parallel operations where possible
      const [statGains, portraitUpdate] = await Promise.all([
        this.calculateStatGains(character, oldLevel, newLevel),
        this.handlePortraitUpdate(character, oldLevel, newLevel),
      ])

      // Sequential operations that depend on previous results
      const jobLevelUpdate = this.handleJobLevelUpdate(
        character,
        oldLevel,
        newLevel
      )

      const levelHistory = await this.createLevelHistory(
        character.id,
        oldLevel,
        newLevel,
        statGains,
        portraitUpdate.unlockedClassLevel
      )

      const updatedCharacter = await this.updateCharacterData(
        character,
        statGains,
        portraitUpdate,
        jobLevelUpdate,
        shouldUpdateLevel,
        newLevel
      )

      // Async operations that don't block the main flow
      await Promise.all([
        this.handlePreGeneration(character.id, newLevel),
        this.handleMilestonePortraitGeneration(character.id, newLevel),
        this.createFeedNotification(
          updatedCharacter,
          levelHistory,
          statGains,
          portraitUpdate.unlockedClassLevel,
          jobLevelUpdate
        ),
      ])

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
    } catch (error) {
      console.error('[ProcessLevelUp] Error during level up:', error)
      throw error
    }
  }

  /**
   * จัดการ pre-generation
   */
  private async handlePreGeneration(
    characterId: number,
    currentLevel: number
  ): Promise<void> {
    try {
      const preGenerateCheck =
        portraitGenerationService.checkPreGenerateCondition(currentLevel)

      if (preGenerateCheck.shouldPreGenerate) {
        console.log(
          `[LevelUp] Triggering pre-generation for character ${characterId}, target class ${preGenerateCheck.targetClassLevel}`
        )

        portraitGenerationService
          .preGeneratePortrait(characterId)
          .catch((error) => {
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
        await characterRepository.updateCharacterWithPortraitAndJob(
          characterId,
          { currentPortraitUrl: newPortraitUrl }
        )

        console.log(
          `[LevelUp] Updated current portrait for character ${characterId}: ${newPortraitUrl}`
        )
      }

      return newPortraitUrl
    } catch (error) {
      console.error(
        '[LevelUp] Handle milestone portrait generation error:',
        error
      )
      return null
    }
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

    if (!statGains) {
      // Fallback: Use default stat distribution based on job class
      console.warn(
        '[ProcessLevelUp] AI calculation failed, using fallback stats'
      )
      return this.getFallbackStatGains(character.jobClass.name)
    }

    console.log(`[ProcessLevelUp] AI stat gains:`, statGains)
    return statGains
  }

  /**
   * Fallback stat distribution when AI calculation fails
   */
  private getFallbackStatGains(jobClassName: string): StatGains {
    const baseFallback = {
      agiGained: 1,
      strGained: 1,
      dexGained: 0,
      vitGained: 1,
      intGained: 0,
      reasoning: 'AI calculation unavailable, used balanced stat distribution',
    }

    // Job-specific fallback distributions
    switch (jobClassName) {
      case 'โปรแกรมเมอร์':
        return {
          ...baseFallback,
          intGained: 2,
          dexGained: 1,
          agiGained: 0,
          reasoning: 'Fallback: Focused on INT and DEX for programming tasks',
        }
      case 'นักการตลาด':
        return {
          ...baseFallback,
          agiGained: 2,
          intGained: 1,
          vitGained: 0,
          reasoning: 'Fallback: Focused on AGI and INT for marketing agility',
        }
      case 'นักขาย':
        return {
          ...baseFallback,
          agiGained: 2,
          strGained: 1,
          vitGained: 0,
          reasoning: 'Fallback: Focused on AGI and STR for sales persistence',
        }
      case 'ดีไซน์เนอร์':
        return {
          ...baseFallback,
          dexGained: 2,
          intGained: 1,
          strGained: 0,
          reasoning: 'Fallback: Focused on DEX and INT for creative work',
        }
      case 'นักบัญชี':
        return {
          ...baseFallback,
          intGained: 2,
          dexGained: 1,
          strGained: 0,
          reasoning: 'Fallback: Focused on INT and DEX for precision work',
        }
      case 'ช่าง':
        return {
          ...baseFallback,
          strGained: 2,
          dexGained: 1,
          agiGained: 0,
          reasoning: 'Fallback: Focused on STR and DEX for manual work',
        }
      default:
        return baseFallback
    }
  }

  /**
   * คำนวณการจ่าย stats สำหรับการเลเวลอัพด้วย AI structured output
   */
  async statsAllocationServiceCalculateStatGains(
    characterId: number,
    currentLevel: number,
    newLevel: number,
    jobClassName: string
  ): Promise<StatGains | null> {
    try {
      console.log(
        `[StatAllocation] Starting AI analysis for character ${characterId}`
      )

      const questSubmissions =
        await characterRepository.getQuestSubmissionsBetweenLevels(
          characterId,
          Math.max(1, currentLevel - LEVEL_CONFIG.PRE_GENERATE_OFFSET),
          currentLevel
        )

      console.log(
        `[StatAllocation] Found ${questSubmissions.length} quest submissions`
      )

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

      const statAllocation = await StatAnalysisService.analyzeStatsAllocation(
        questData,
        jobClassName,
        currentLevel,
        newLevel
      )

      if (!statAllocation) return null

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
      return null
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
      CharacterLevelService.IMPORTANT_THRESHOLDS.includes(newLevel as any) &&
      oldLevel < newLevel
    )
  }

  /**
   * Find job level matching the threshold
   */
  private findJobLevelForThreshold(jobLevels: any[], threshold: number): any {
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
  ): Promise<any> {
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
  ): Promise<any> {
    const updateData: any = {
      statAGI: character.statAGI + statGains.agiGained,
      statSTR: character.statSTR + statGains.strGained,
      statDEX: character.statDEX + statGains.dexGained,
      statVIT: character.statVIT + statGains.vitGained,
      statINT: character.statINT + statGains.intGained,
      statPoints: character.statPoints + LEVEL_CONFIG.STAT_POINTS_PER_LEVEL,
    }

    if (shouldUpdateLevel) {
      updateData.level = newLevel
      updateData.currentXP = 0
      updateData.nextLevelXP = JobClassHelper.calculateNextLevelXP(newLevel)
    }

    if (portraitUpdate.unlockedClassLevel) {
      updateData.generatedPortraits = portraitUpdate.updatedPortraits
      updateData.currentPortraitUrl = portraitUpdate.newPortraitUrl
    }

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
  ): Promise<void> {
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

    if (unlockedClassLevel) {
      await characterRepository.createFeedItem({
        content: 'ได้รับภาพ Portrait ใหม่',
        type: 'new_portrait',
        mediaType: 'image',
        userId: character.userId,
        mediaUrl: character.currentPortraitUrl,
      })
    }
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

    const shortReasoning = this.truncateReasoning(
      statGains.reasoning,
      LEVEL_CONFIG.MAX_REASONING_LENGTH
    )
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
