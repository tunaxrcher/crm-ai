import { StatAnalysisService } from '@src/lib/ai/statAnalysisService'

import { CharacterRepository, characterRepository } from '../repository'

interface StatGains {
  agiGained: number
  strGained: number
  dexGained: number
  vitGained: number
  intGained: number
  reasoning: string
}

export class StatsAllocationService {
  /**
   * คำนวณการจ่าย stats สำหรับการเลเวลอัพด้วย AI structured output
   */
  static async calculateStatGains(
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
}
