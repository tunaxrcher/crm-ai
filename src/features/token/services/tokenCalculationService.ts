// src/features/token/services/tokenCalculationService.ts
import { Character, Quest, TokenMultiplierEvent } from '@prisma/client'
import { prisma } from '@src/lib/db'

interface TokenCalculationParams {
  quest: any
  character: any
  aiScore: number // 0-100
  ratings: {
    agi: number
    str: number
    dex: number
    vit: number
    int: number
  }
}

interface TokenCalculationResult {
  baseTokens: number
  performanceMultiplier: number
  characterBoostMultiplier: number
  eventMultiplier: number
  bonusTokens: number
  finalTokens: number
  appliedBonuses: string[]
}

export class TokenCalculationService {
  private static instance: TokenCalculationService

  public static getInstance() {
    if (!TokenCalculationService.instance) {
      TokenCalculationService.instance = new TokenCalculationService()
    }
    return TokenCalculationService.instance
  }

  async calculateTokenReward(
    params: TokenCalculationParams
  ): Promise<TokenCalculationResult> {
    const { quest, character, aiScore, ratings } = params
    const appliedBonuses: string[] = []

    // 1. Base tokens from quest
    const baseTokens = quest.baseTokenReward

    // 2. Performance multiplier (0.5 - 2.0 based on AI score)
    const performanceMultiplier = this.calculatePerformanceMultiplier(aiScore)

    // 3. Character boost multiplier
    const characterBoostMultiplier = await this.getCharacterBoostMultiplier(
      character.id
    )
    if (characterBoostMultiplier > 1)
      appliedBonuses.push(`Character Boost x${characterBoostMultiplier}`)

    // 4. Event multiplier
    const eventMultiplier = await this.getActiveEventMultiplier(quest.type)
    if (eventMultiplier > 1)
      appliedBonuses.push(`Event Bonus x${eventMultiplier}`)

    // 5. Calculate bonus tokens
    let bonusTokens = 0

    // Perfect score bonus (all ratings are 5)
    if (this.isPerfectScore(ratings)) {
      bonusTokens += Math.floor(baseTokens * 0.3) // 30% bonus
      appliedBonuses.push('Perfect Score Bonus +30%')
    }

    // First quest of the day bonus
    const isFirstQuest = await this.isFirstQuestToday(character.userId)
    if (isFirstQuest) {
      bonusTokens += Math.floor(baseTokens * 0.2) // 20% bonus
      appliedBonuses.push('First Quest Bonus +20%')
    }

    // Streak bonus
    const streakBonus = await this.calculateStreakBonus(
      character.userId,
      baseTokens
    )
    if (streakBonus > 0) {
      bonusTokens += streakBonus
      appliedBonuses.push(`Streak Bonus +${streakBonus} tokens`)
    }

    // Job class match bonus
    const jobClassBonus = await this.calculateJobClassBonus(
      quest,
      character,
      baseTokens
    )
    if (jobClassBonus > 0) {
      bonusTokens += jobClassBonus
      appliedBonuses.push(`Job Class Match +${jobClassBonus} tokens`)
    }

    // 6. Calculate final tokens
    const finalTokens = Math.floor(
      baseTokens *
        performanceMultiplier *
        characterBoostMultiplier *
        eventMultiplier +
        bonusTokens
    )

    return {
      baseTokens,
      performanceMultiplier,
      characterBoostMultiplier,
      eventMultiplier,
      bonusTokens,
      finalTokens,
      appliedBonuses,
    }
  }

  private calculatePerformanceMultiplier(aiScore: number): number {
    // AI score is 0-100, convert to multiplier 0.5-2.0
    // Score 50 = 1x, Score 0 = 0.5x, Score 100 = 2x
    return 0.5 + (aiScore / 100) * 1.5
  }

  private async getCharacterBoostMultiplier(
    characterId: number
  ): Promise<number> {
    const activeBoost = await prisma.tokenPurchase.findFirst({
      where: {
        characterId,
        shopItem: {
          itemType: 'token_boost',
        },
        status: 'completed',
        appliedAt: {
          not: null,
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        shopItem: true,
      },
    })

    if (activeBoost && activeBoost.shopItem.metadata) {
      const metadata = activeBoost.shopItem.metadata as any
      return metadata.multiplier || 1
    }

    return 1
  }

  private async getActiveEventMultiplier(questType: string): Promise<number> {
    const now = new Date()
    const activeEvents = await prisma.tokenMultiplierEvent.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })

    let highestMultiplier = 1
    for (const event of activeEvents) {
      const questTypes = event.questTypes as string[]
      if (
        questTypes.includes(questType) &&
        event.multiplier > highestMultiplier
      ) {
        highestMultiplier = event.multiplier
      }
    }

    return highestMultiplier
  }

  private isPerfectScore(ratings: any): boolean {
    return (
      ratings.agi === 5 &&
      ratings.str === 5 &&
      ratings.dex === 5 &&
      ratings.vit === 5 &&
      ratings.int === 5
    )
  }

  private async isFirstQuestToday(userId: number): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySubmissions = await prisma.questSubmission.findFirst({
      where: {
        character: {
          userId,
        },
        submittedAt: {
          gte: today,
        },
      },
    })

    return !todaySubmissions
  }

  private async calculateStreakBonus(
    userId: number,
    baseTokens: number
  ): Promise<number> {
    const questStreak = await prisma.questStreak.findUnique({
      where: { userId },
    })

    if (!questStreak || questStreak.currentStreak < 3) return 0

    // 3-day streak: 10 tokens
    // 7-day streak: 50 tokens
    // 14-day streak: 100 tokens
    // 30-day streak: 200 tokens
    if (questStreak.currentStreak >= 30) return 200
    if (questStreak.currentStreak >= 14) return 100
    if (questStreak.currentStreak >= 7) return 50
    if (questStreak.currentStreak >= 3) return 10

    return 0
  }

  private async calculateJobClassBonus(
    quest: Quest,
    character: Character,
    baseTokens: number
  ): Promise<number> {
    // ถ้า quest มี metadata ที่ระบุ jobClass ที่เหมาะสม
    // if (quest.metadata) {
    //   const metadata = quest.metadata as any
    //   if (metadata.preferredJobClass === character.jobClassId) {
    //     return Math.floor(baseTokens * 0.1) // 10% bonus
    //   }
    // }

    return 0
  }

  async updateQuestStreak(userId: number): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let questStreak = await prisma.questStreak.findUnique({
      where: { userId },
    })

    if (!questStreak) {
      // Create new streak record
      await prisma.questStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: today,
          weeklyQuests: 1,
          monthlyQuests: 1,
        },
      })
      return
    }

    const lastCompleted = questStreak.lastCompletedDate
      ? new Date(questStreak.lastCompletedDate)
      : null

    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0)
      const daysDiff = Math.floor(
        (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 0) {
        // Already completed today, just increment counters
        await prisma.questStreak.update({
          where: { userId },
          data: {
            weeklyQuests: { increment: 1 },
            monthlyQuests: { increment: 1 },
          },
        })
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        const newStreak = questStreak.currentStreak + 1
        await prisma.questStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, questStreak.longestStreak),
            lastCompletedDate: today,
            weeklyQuests: { increment: 1 },
            monthlyQuests: { increment: 1 },
          },
        })
      } else {
        // Streak broken, reset to 1
        await prisma.questStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastCompletedDate: today,
            weeklyQuests: 1,
            monthlyQuests: 1,
          },
        })
      }
    }
  }
}

export const tokenCalculationService = TokenCalculationService.getInstance()
