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
  ): Promise<StatGains> {
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

      console.log(`[StatAllocation] Found ${questSubmissions.length} quest submissions`)

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
      return this.getBasicStatGains(jobClassName)
    }
  }

  /**
   * Fallback การจ่าย stats แบบพื้นฐาน
   */
  private static getBasicStatGains(jobClassName: string): StatGains {
    const basicAllocations: Record<string, StatGains> = {
      นักการตลาด: {
        agiGained: 2,
        strGained: 0,
        dexGained: 0,
        vitGained: 0,
        intGained: 1,
        reasoning:
          'Basic allocation for marketers: Agility for quick thinking and intelligence for analysis.',
      },
      นักบัญชี: {
        agiGained: 0,
        strGained: 0,
        dexGained: 1,
        vitGained: 0,
        intGained: 2,
        reasoning:
          'Basic allocation for accountants: Intelligence for calculations and dexterity for precision.',
      },
      นักขาย: {
        agiGained: 2,
        strGained: 1,
        dexGained: 0,
        vitGained: 0,
        intGained: 0,
        reasoning:
          'Basic allocation for sales: Agility for quick responses and strength for persistence.',
      },
      ดีไซน์เนอร์: {
        agiGained: 0,
        strGained: 0,
        dexGained: 2,
        vitGained: 0,
        intGained: 1,
        reasoning:
          'Basic allocation for designers: Dexterity for creativity and intelligence for innovation.',
      },
      โปรแกรมเมอร์: {
        agiGained: 0,
        strGained: 0,
        dexGained: 1,
        vitGained: 0,
        intGained: 2,
        reasoning:
          'Basic allocation for programmers: Intelligence for problem-solving and dexterity for coding.',
      },
      ช่าง: {
        agiGained: 0,
        strGained: 2,
        dexGained: 1,
        vitGained: 0,
        intGained: 0,
        reasoning:
          'Basic allocation for mechanics: Strength for physical work and dexterity for precision.',
      },
    }

    const result = basicAllocations[jobClassName] || {
      agiGained: 1,
      strGained: 1,
      dexGained: 0,
      vitGained: 0,
      intGained: 1,
      reasoning: 'Balanced basic allocation for unknown job class.',
    }

    console.log(
      `[StatAllocation] Using fallback allocation for ${jobClassName}:`,
      result
    )
    return result
  }

  /**
   * ทดสอบระบบ AI Stat Allocation
   */
  static async testStatAllocation(
    jobClassName: string = 'โปรแกรมเมอร์'
  ): Promise<StatGains> {
    console.log('[StatAllocation] Testing AI stat allocation...')

    try {
      const mockQuestData = [
        {
          questTitle: 'พัฒนา API ใหม่',
          questType: 'weekly',
          description:
            'สร้าง REST API สำหรับระบบจัดการผู้ใช้ พร้อม authentication และ authorization',
          ratingAGI: 3,
          ratingSTR: 2,
          ratingDEX: 4,
          ratingVIT: 3,
          ratingINT: 5,
          submittedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          questTitle: 'แก้บั๊กระบบ',
          questType: 'daily',
          description:
            'แก้ไขปัญหาการโหลดช้าในหน้า dashboard และ optimize database queries',
          ratingAGI: 4,
          ratingSTR: 2,
          ratingDEX: 3,
          ratingVIT: 2,
          ratingINT: 4,
          submittedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]

      const result = await StatAnalysisService.analyzeStatsAllocation(
        mockQuestData,
        jobClassName,
        9,
        10
      )

      return {
        agiGained: result.AGI,
        strGained: result.STR,
        dexGained: result.DEX,
        vitGained: result.VIT,
        intGained: result.INT,
        reasoning: result.reasoning,
      }
    } catch (error) {
      console.error('[StatAllocation] Test failed:', error)
      return this.getBasicStatGains(jobClassName)
    }
  }
}
