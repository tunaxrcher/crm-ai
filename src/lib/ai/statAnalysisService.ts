import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Define schema for stat allocation using Zod
const statAllocationSchema = z
  .object({
    AGI: z.number().int().min(0).max(3),
    STR: z.number().int().min(0).max(3),
    DEX: z.number().int().min(0).max(3),
    VIT: z.number().int().min(0).max(3),
    INT: z.number().int().min(0).max(3),
    reasoning: z.string().min(20).max(1000),
  })
  .refine(
    (data) => {
      const total = data.AGI + data.STR + data.DEX + data.VIT + data.INT
      return total === 3
    },
    {
      message: 'Total stat points must equal exactly 3',
    }
  )

type StatAllocation = z.infer<typeof statAllocationSchema>

interface QuestSubmissionData {
  questTitle: string
  questType: string
  description: string
  ratingAGI: number
  ratingSTR: number
  ratingDEX: number
  ratingVIT: number
  ratingINT: number
  submittedAt: string
}

export class StatAnalysisService {
  private static readonly STAT_POINTS_PER_LEVEL = 3

  /**
   * วิเคราะห์ quest submissions และแนะนำการจ่าย stats ด้วย structured output
   */
  static async analyzeStatsAllocation(
    questSubmissions: any, // QuestSubmissionData[],
    jobClassName: string,
    currentLevel: number,
    newLevel: number
  ) {
    try {
      const prompt = this.createAnalysisPrompt(
        questSubmissions,
        jobClassName,
        currentLevel,
        newLevel
      )

      console.log(
        `[AI] Analyzing stats for ${jobClassName} level ${currentLevel} → ${newLevel}`
      )

      const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: statAllocationSchema,
        prompt,
        temperature: 0.3,
      })

      console.log(`[AI] Structured allocation:`, object)
      return object
    } catch (error) {
      console.error('Error analyzing stats allocation:', error)
    }
  }

  /**
   * สร้าง prompt สำหรับ AI
   */
  private static createAnalysisPrompt(
    questSubmissions: QuestSubmissionData[],
    jobClassName: string,
    currentLevel: number,
    newLevel: number
  ): string {
    const questSummary =
      questSubmissions.length > 0
        ? questSubmissions
            .map((q) => {
              return `
                Quest: "${q.questTitle}" (${q.questType})
                Description: ${q.description}
                Performance Ratings: AGI:${q.ratingAGI}/5, STR:${q.ratingSTR}/5, DEX:${q.ratingDEX}/5, VIT:${q.ratingVIT}/5, INT:${q.ratingINT}/5
                Date: ${q.submittedAt}
              `
            })
            .join('\n\n')
        : 'No quest submissions in this level period.'

    return `
      You are an expert RPG character development advisor. Analyze quest performance and recommend optimal stat allocation.

      Character Information:
      - Job Class: ${jobClassName}
      - Level Up: ${currentLevel} → ${newLevel}
      - Available Stat Points: ${this.STAT_POINTS_PER_LEVEL}

      Quest Performance History:
      ${questSummary}

      Task: Analyze the character's quest performance and recommend how to allocate exactly ${this.STAT_POINTS_PER_LEVEL} stat points among AGI, STR, DEX, VIT, and INT.

      Consider:
      1. Quest performance ratings show which stats the player performed well/poorly in:
        - Low ratings (1-2): Character struggled, might need improvement
        - High ratings (4-5): Character excelled, strength to maintain or leverage
      2. Job class tendencies:
        - Programmers: INT (problem-solving), DEX (precision coding)
        - Marketers: AGI (quick thinking), INT (analysis)
        - Sales: AGI (quick responses), STR (persistence)
        - Designers: DEX (creativity), INT (innovation)
        - Accountants: INT (calculations), DEX (precision)
        - Mechanics: STR (physical work), DEX (precision)
      3. Quest types and their stat requirements
      4. Character development balance and growth patterns

      Provide a stat allocation that totals exactly ${this.STAT_POINTS_PER_LEVEL} points with detailed reasoning.
    `
  }
}
