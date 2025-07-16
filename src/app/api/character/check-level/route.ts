import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@src/lib/db'
import OpenAI from 'openai'

// API สำหรับ cron job ที่จะรันทุก 30 นาที
export async function POST(request: NextRequest) {
  try {
    // หา Character ที่ level > 9
    const highLevelCharacters = await prisma.character.findMany({
      where: {
        level: {
          gt: 9
        }
      },
      include: {
        user: true,
        jobClass: true,
        questSubmissions: {
          orderBy: {
            submittedAt: 'desc'
          },
          // ดึงทั้งหมด ไม่จำกัดจำนวน
          include: {
            quest: true
          }
        }
      }
    })

    // กรองเฉพาะ characters ที่ยังไม่มี personal quests
    const eligibleCharacters = []
    for (const character of highLevelCharacters) {
      const personalQuestCount = await prisma.quest.count({
        where: {
          characterId: character.id
        }
      })

      if (personalQuestCount === 0) {
        eligibleCharacters.push(character)
      }
    }

    console.log(`Found ${eligibleCharacters.length} characters eligible for personal quests`)

    const results = []

    // สร้าง OpenAI instance
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    for (const character of eligibleCharacters) {
      try {
        // เตรียมข้อมูล quest submissions สำหรับส่งให้ AI วิเคราะห์
        const submissionData = character.questSubmissions.map((sub: any) => ({
          questTitle: sub.quest.title,
          questDescription: sub.quest.description,
          score: sub.score,
          feedback: sub.feedback,
          submittedAt: sub.submittedAt,
          xpEarned: sub.xpEarned
        }))

        console.log(submissionData)

        // สร้าง prompt สำหรับ AI
        const prompt = `
วิเคราะห์ประวัติการทำเควสของผู้ใช้และสร้างเควสที่เหมาะสมกับสายงาน

ข้อมูลผู้ใช้:
- ชื่อ: ${character.name}
- Level: ${character.level}
- สายงาน: ${character.jobClass.name}

ประวัติการทำเควส:
${JSON.stringify(submissionData, null, 2)}

โปรดวิเคราะห์และสร้างเควสที่:
1. สอดคล้องกับสายงานและประสบการณ์ของผู้ใช้
2. เป็นเควสจริงที่สามารถทำได้ในชีวิตจริง
3. มีความท้าทายที่เหมาะสมกับระดับของผู้ใช้
4. หลากหลายและไม่ซ้ำกันมากเกินไป

ตอบในรูปแบบ JSON ที่มี key "quests" ซึ่งเป็น array:
{
  "quests": [
    {
      "title": "ชื่อเควส",
      "description": "คำอธิบายเควส",
      "type": "daily",
      "difficultyLevel": 1-5,
      "xpReward": 100-500,
      "baseTokenReward": 10-50,
      "reasoning": "เหตุผลที่เลือกเควสนี้"
    }
  ]
}

สร้างเควสรายวัน (daily) อย่างน้อย 10-15 เควส ที่หลากหลาย
`

        // ส่งให้ ChatGPT วิเคราะห์
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'คุณเป็น AI ที่ช่วยสร้างเควสสำหรับแอปจำลองเกม RPG ที่ช่วยเพิ่มประสิทธิภาพการทำงาน'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (!aiResponse) {
          throw new Error('No response from OpenAI')
        }

        const suggestedQuests = JSON.parse(aiResponse)
        const questsArray = suggestedQuests.quests || []

        // บันทึกเควสลงในฐานข้อมูล
        const createdQuests = []
        for (const questData of questsArray) {
          // ไม่บันทึก reasoning
          const { reasoning, ...questInfo } = questData
          
          const createdQuest = await prisma.quest.create({
            data: {
              ...questInfo,
              characterId: character.id,
              jobClassId: character.jobClassId,
              isActive: true,
              tokenMultiplier: 1
            }
          })
          
          createdQuests.push(createdQuest)
        }

        results.push({
          characterId: character.id,
          characterName: character.name,
          questsCreated: createdQuests.length
        })

        console.log(`Created ${createdQuests.length} personal quests for character ${character.name}`)

      } catch (error) {
        console.error(`Error processing character ${character.id}:`, error)
        results.push({
          characterId: character.id,
          characterName: character.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${eligibleCharacters.length} characters`,
      results
    })

  } catch (error) {
    console.error('Error in check-level API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 