import { prisma } from '@src/lib/db'
import OpenAI from 'openai'
import 'server-only'

interface QuestSubmissionForEvaluation {
  id: number
  submittedAt: Date
  description: string | null
  feedback: string | null
  score: number | null
  xpEarned: number
  tokensEarned: number
  mediaRevisedTranscript: string | null
  quest: {
    title: string
    description: string | null
    type: string
  }
}

interface MonthlyEvaluationResult {
  summary: string
  strengths: string
  weaknesses: string
  improvements: string
  isPassed: boolean
}

export class MonthlyEvaluationService {
  private static instance: MonthlyEvaluationService
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  public static getInstance() {
    if (!MonthlyEvaluationService.instance) {
      MonthlyEvaluationService.instance = new MonthlyEvaluationService()
    }
    return MonthlyEvaluationService.instance
  }

  /**
   * สร้างการประเมินผลรายเดือนสำหรับ character ทั้งหมด
   */
  async createMonthlyEvaluationsForAllCharacters(month: number, year: number) {
    const startTime = Date.now()
    try {
      console.log(`[MonthlyEvaluation] Starting evaluations for ${month}/${year}`)

      // ตรวจสอบว่าเดือนและปีถูกต้อง
      if (month < 1 || month > 12 || year < 2020 || year > new Date().getFullYear()) {
        throw new Error(`Invalid month/year: ${month}/${year}`)
      }

      // ดึง characters ทั้งหมดที่มี quest submissions ในเดือนที่ต้องการ
      const characters = await prisma.character.findMany({
        include: {
          user: true,
          questSubmissions: {
            where: {
              submittedAt: {
                gte: new Date(year, month - 1, 1), // เริ่มต้นเดือน
                lt: new Date(year, month, 1), // เริ่มต้นเดือนถัดไป
              },
            },
            include: {
              quest: {
                select: {
                  title: true,
                  description: true,
                  type: true,
                },
              },
            },
            orderBy: {
              submittedAt: 'asc',
            },
          },
        },
      })

      const results = []

      for (const character of characters) {
        if (character.questSubmissions.length === 0) {
          console.log(`[MonthlyEvaluation] No submissions for character ${character.name}, skipping`)
          continue
        }

        try {
          // ตรวจสอบว่ามีการประเมินแล้วหรือไม่
          const existingEvaluation = await prisma.monthlyEvaluation.findUnique({
            where: {
              characterId_month_year: {
                characterId: character.id,
                month,
                year,
              },
            },
          })

          if (existingEvaluation) {
            console.log(`[MonthlyEvaluation] Evaluation already exists for ${character.name}, skipping`)
            continue
          }

          // สร้างการประเมิน
          const evaluation = await this.createEvaluationForCharacter(
            character.id,
            character.name,
            character.questSubmissions,
            month,
            year
          )

          results.push(evaluation)
        } catch (error) {
          console.error(`[MonthlyEvaluation] Error evaluating ${character.name}:`, error)
          
          // บันทึกการประเมินที่ล้มเหลว
          await prisma.monthlyEvaluation.create({
            data: {
              characterId: character.id,
              month,
              year,
              status: 'failed',
              totalSubmissions: character.questSubmissions.length,
              evaluation: `การประเมินล้มเหลว: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          })
        }
      }

      const duration = Date.now() - startTime
      console.log(`[MonthlyEvaluation] Completed ${results.length} evaluations in ${duration}ms`)
      
      return results
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`[MonthlyEvaluation] Error in createMonthlyEvaluationsForAllCharacters (${duration}ms):`, error)
      throw error
    }
  }

  /**
   * สร้างการประเมินสำหรับ character คนเดียว
   */
  async createEvaluationForCharacter(
    characterId: number,
    characterName: string,
    questSubmissions: QuestSubmissionForEvaluation[],
    month: number,
    year: number
  ) {
    try {
      console.log(`[MonthlyEvaluation] Evaluating ${characterName} with ${questSubmissions.length} submissions`)

      // สร้างรายการข้อมูลสำหรับ AI
      const submissionData = questSubmissions.map((submission, index) => {
        return {
          ลำดับที่: index + 1,
          วันที่ส่ง: submission.submittedAt.toLocaleDateString('th-TH'),
          ชื่องาน: submission.quest.title,
          ประเภทงาน: submission.quest.type,
          คำอธิบาย: submission.description || 'ไม่มีคำอธิบาย',
          ผลงาน: submission.mediaRevisedTranscript || submission.description || 'ไม่มีรายละเอียด',
          คะแนน: submission.score || 0,
          XP: submission.xpEarned,
          Token: submission.tokensEarned,
          ข้อเสนอแนะ: submission.feedback || 'ไม่มีข้อเสนอแนะ',
        }
      })

      // เรียก AI ประเมิน
      const aiEvaluation = await this.evaluateWithAI(characterName, submissionData, month, year)

      // บันทึกลงฐานข้อมูล
      const evaluation = await prisma.monthlyEvaluation.create({
        data: {
          characterId,
          month,
          year,
          status: 'completed',
          evaluation: this.formatEvaluationText(aiEvaluation),
          summary: aiEvaluation.summary,
          strengths: aiEvaluation.strengths,
          weaknesses: aiEvaluation.weaknesses,
          improvements: aiEvaluation.improvements,
          isPassed: aiEvaluation.isPassed,
          totalSubmissions: questSubmissions.length,
          evaluatedAt: new Date(),
        },
      })

      console.log(`[MonthlyEvaluation] Successfully evaluated ${characterName}`)
      return evaluation
    } catch (error) {
      console.error(`[MonthlyEvaluation] Error evaluating character ${characterName}:`, error)
      throw error
    }
  }

  /**
   * ใช้ AI ประเมินผลงาน
   */
  private async evaluateWithAI(
    characterName: string,
    submissionData: any[],
    month: number,
    year: number
  ): Promise<MonthlyEvaluationResult> {
    try {
      const systemPrompt = `คุณคือ HR ผู้ประเมินผลงาน 
ฉันจะส่งข้อมูล Task รายวันของพนักงาน ให้คุณ 
หน้าที่ของคุณคือ:
สรุปเป็นรายงานย่อ (ภาษาบ้าน ๆ ตรงไปตรงมา)
แบ่งเป็น 4 ส่วน: 
1. สรุปการทำงาน
2. จุดดี
3. จุดที่บกพร่อง/ยังไม่ถึงมาตรฐาน
4. สิ่งที่ต้องแก้/ทำต่อไป 
ไม่ต้องอ้อมค้อม ไม่ใช้ภาषาสวยหรู ใช้ภาษาง่าย ๆ ที่พนักงานอ่านแล้วเข้าใจทันที
ถ้าผลงานต่ำกว่ามาตรฐาน ให้ระบุว่า "ไม่ผ่าน" พร้อมเหตุผล
ตอบเป็น JSON format ตามโครงสร้างที่กำหนด`

      const userPrompt = `ประเมินผลงานของ ${characterName} ในเดือน ${month}/${year}

ข้อมูลงานที่ส่ง:
${JSON.stringify(submissionData, null, 2)}

โปรดประเมินและตอบกลับในรูปแบบ JSON:
{
  "summary": "สรุปการทำงานโดยรวม",
  "strengths": "จุดดีที่ทำได้",
  "weaknesses": "จุดที่บกพร่อง/ยังไม่ถึงมาตรฐาน",
  "improvements": "สิ่งที่ต้องแก้/ทำต่อไป",
  "isPassed": true/false
}`

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })

      const result = completion.choices[0]?.message?.content
      if (!result) throw new Error('No response from OpenAI')

      const evaluation = JSON.parse(result) as MonthlyEvaluationResult
      
      // ตรวจสอบโครงสร้าง
      if (!evaluation.summary || !evaluation.strengths || !evaluation.weaknesses || !evaluation.improvements) {
        throw new Error('Invalid evaluation structure from AI')
      }

      return evaluation
    } catch (error) {
      console.error('[MonthlyEvaluation] AI evaluation error:', error)
      
      // Fallback evaluation
      return {
        summary: `ประเมินผลงานของ ${characterName} ในเดือน ${month}/${year} มีการส่งงาน ${submissionData.length} ครั้ง`,
        strengths: 'มีความพยายามในการส่งงาน',
        weaknesses: 'ไม่สามารถประเมินรายละเอียดได้เนื่องจากข้อผิดพลาดของระบบ',
        improvements: 'ควรติดต่อผู้ดูแลระบบเพื่อตรวจสอบการประเมิน',
        isPassed: true, // default ผ่าน
      }
    }
  }

  /**
   * จัดรูปแบบข้อความประเมินให้อ่านง่าย
   */
  private formatEvaluationText(evaluation: MonthlyEvaluationResult): string {
    const status = evaluation.isPassed ? '✅ ผ่านมาตรฐาน' : '❌ ไม่ผ่านมาตรฐาน'
    
    return `สรุปผลการทำงานในเดือนที่ผ่านมา

📋 สรุป
${evaluation.summary}

✅ จุดดี
${evaluation.strengths}

⚠️ จุดบกพร่อง
${evaluation.weaknesses}

🎯 สิ่งที่ต้องแก้ 
${evaluation.improvements}

สถานะ: ${status}`
  }

  /**
   * ดึงการประเมินของ character
   */
  async getCharacterEvaluations(characterId: number, limit = 12) {
    return await prisma.monthlyEvaluation.findMany({
      where: {
        characterId,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      take: limit,
    })
  }

  /**
   * ดึงการประเมินเฉพาะเดือน
   */
  async getEvaluationByMonth(characterId: number, month: number, year: number) {
    return await prisma.monthlyEvaluation.findUnique({
      where: {
        characterId_month_year: {
          characterId,
          month,
          year,
        },
      },
    })
  }
}

export const monthlyEvaluationService = MonthlyEvaluationService.getInstance()
