// src/lib/services/openaiService.ts
import { AIAnalysisResult, OpenAIPrompt } from '@src/features/quest/types/index'
import OpenAI from 'openai'

interface VideoAnalysisResult {
  transcript: string
  summary: string
  actions: string[]
  spokenContent: string[]
  keyPoints: string[]
}

class OpenAIService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  // ฟังก์ชันช่วยสำหรับแปลงไฟล์ video เป็น format ที่ Whisper รองรับ
  private async processVideoForWhisper(videoBlob: Blob): Promise<File> {
    // Whisper รองรับหลายรูปแบบ: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
    // สำหรับวิดีโอ เราสามารถส่งไฟล์ .mp4 ตรงๆ ได้เลย เพราะ Whisper จะแกะเสียงเอง

    const supportedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/ogg',
    ]

    // ตรวจสอบว่า blob type รองรับหรือไม่
    if (supportedTypes.includes(videoBlob.type)) {
      return new File([videoBlob], 'video.mp4', { type: videoBlob.type })
    }

    // หากไม่รองรับ ให้ fallback เป็น mp4
    return new File([videoBlob], 'video.mp4', { type: 'video/mp4' })
  }

  // ใช้ Whisper API แกะเสียงจากวิดีโอ
  async transcribeVideo(videoUrl: string): Promise<string> {
    try {
      console.log('Starting video transcription with Whisper API...', videoUrl)

      // ดาวน์โหลดวิดีโอจาก URL
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`)
      }

      const videoBlob = await response.blob()
      console.log('Video downloaded, size:', videoBlob.size, 'bytes')

      // ตรวจสอบขนาดไฟล์ (Whisper มีขีดจำกัดที่ 25MB)
      const maxSize = 25 * 1024 * 1024 // 25MB
      if (videoBlob.size > maxSize) {
        throw new Error(
          `Video file too large: ${videoBlob.size} bytes. Maximum size is 25MB.`
        )
      }

      // เตรียมไฟล์สำหรับ Whisper API
      const videoFile = await this.processVideoForWhisper(videoBlob)
      console.log(
        'Video file prepared for Whisper:',
        videoFile.name,
        videoFile.type
      )

      // เรียกใช้ Whisper API
      console.log('Calling Whisper API...')
      const transcription = await this.openai.audio.transcriptions.create({
        file: videoFile,
        model: 'whisper-1',
        language: 'th', // รองรับภาษาไทย - ลบออกหากต้องการให้ auto-detect
        response_format: 'text',
        temperature: 0.2, // ลดความคลาดเคลื่อน
        prompt:
          'นี่คือการบันทึกเสียงของการทำงาน การอธิบายงาน หรือการนำเสนอผลงาน', // ให้ context ช่วย
      })

      console.log('Whisper transcription completed successfully')
      console.log(
        'Transcript preview:',
        transcription.substring(0, 100) + '...'
      )

      // ตรวจสอบผลลัพธ์
      if (!transcription || transcription.trim().length === 0) {
        throw new Error('Empty transcription result')
      }

      return transcription.trim()
    } catch (error) {
      console.error('Whisper transcription error:', error)

      // แสดง error message ที่เฉพาะเจาะจง
      if (error instanceof Error) {
        if (error.message.includes('file too large')) {
          throw new Error('ไฟล์วิดีโอใหญ่เกินไป กรุณาใช้ไฟล์ที่เล็กกว่า 25MB')
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('ไม่สามารถดาวน์โหลดไฟล์วิดีโอได้ กรุณาตรวจสอบลิงก์')
        } else if (
          error.message.includes('quota') ||
          error.message.includes('rate limit')
        ) {
          throw new Error('เกิดข้อผิดพลาดจาก API กรุณาลองใหม่ภายหลัง')
        }
      }

      // Fallback สำหรับ error อื่นๆ
      throw new Error(
        'ไม่สามารถแกะเสียงจากวิดีโอได้ กรุณาลองใหม่อีกครั้งหรือใช้ไฟล์วิดีโออื่น'
      )
    }
  }

  // วิเคราะห์ transcript ด้วย GPT
  async analyzeVideoTranscript(
    transcript: string
  ): Promise<VideoAnalysisResult> {
    try {
      const analysisPrompt = `
วิเคราะห์เนื้อหาต่อไปนี้จากการแกะเสียงวิดีโอของผู้ใช้:

"${transcript}"

โปรดวิเคราะห์และสรุปในรูปแบบ JSON ภาษาไทย:
{
  "transcript": "${transcript}",
  "summary": "สรุปสั้นๆ ว่าผู้ใช้ทำอะไรในวิดีโอ (2-3 ประโยค)",
  "actions": ["การกระทำที่ 1", "การกระทำที่ 2", "การกระทำที่ 3"],
  "spokenContent": ["ประเด็นสำคัญที่พูดถึง 1", "ประเด็นสำคัญที่พูดถึง 2"],
  "keyPoints": ["จุดสำคัญ 1", "จุดสำคัญ 2", "จุดสำคัญ 3"]
}

กรุณาระบุเป็นภาษาไทยทั้งหมด และมุ่งเน้นไปที่กิจกรรมหรืองานที่ผู้ใช้ทำ`

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'คุณเป็น AI ที่เชี่ยวชาญในการวิเคราะห์เนื้อหาจากการแกะเสียงวิดีโอ และสรุปกิจกรรมที่ผู้ใช้ทำ ตอบเป็นภาษาไทยเท่านั้น',
          },
          { role: 'user', content: analysisPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const result = completion.choices[0]?.message?.content

      if (!result) {
        throw new Error('No response from GPT analysis')
      }

      return JSON.parse(result) as VideoAnalysisResult
    } catch (error) {
      console.error('Video transcript analysis error:', error)

      // Fallback response
      return {
        transcript: transcript,
        summary: 'ผู้ใช้ได้อัพโหลดวิดีโอและมีการบันทึกเสียงไว้',
        actions: ['อัพโหลดวิดีโอ', 'บันทึกเสียง'],
        spokenContent: ['มีเนื้อหาเสียงในวิดีโอ'],
        keyPoints: ['ส่งงานผ่านวิดีโอ', 'มีการอธิบาย'],
      }
    }
  }

  // วิเคราะห์วิดีโอครบวงจร (Whisper + GPT)
  async analyzeVideo(videoUrl: string): Promise<VideoAnalysisResult> {
    try {
      console.log('Starting complete video analysis for URL:', videoUrl)

      // ขั้นตอนที่ 1: แกะเสียงด้วย Whisper API จริง
      const transcript = await this.transcribeVideo(videoUrl)

      console.log(
        'Transcript obtained, length:',
        transcript.length,
        'characters'
      )
      console.log('Transcript content:', transcript.substring(0, 200) + '...')

      // ขั้นตอนที่ 2: วิเคราะห์ transcript ด้วย GPT
      const analysis = await this.analyzeVideoTranscript(transcript)

      console.log('Complete video analysis finished successfully')
      return analysis
    } catch (error) {
      console.error('Complete video analysis error:', error)

      // Re-throw error แทนการใช้ fallback เพื่อให้ user รู้ว่าเกิดปัญหา
      if (error instanceof Error) {
        throw new Error(`การวิเคราะห์วิดีโอล้มเหลว: ${error.message}`)
      }

      throw new Error('การวิเคราะห์วิดีโอล้มเหลว กรุณาลองใหม่อีกครั้ง')
    }
  }

  // วิเคราะห์ quest submission (รวมกับวิดีโอ)
  async analyzeQuestSubmission(
    prompt: OpenAIPrompt,
    videoAnalysis?: VideoAnalysisResult
  ): Promise<AIAnalysisResult> {
    try {
      const systemPrompt = `คุณเป็น AI ผู้ประเมินภารกิจสำหรับแอปจำลองเกม ที่ช่วยเพิ่มผลิตภาพในการทำงาน
        หลักการประเมิน:
            - ประเมินตามจริงที่สุด
            - การตรวจสอบความต้องการควรสมเหตุสมผล
            - หากผลออกมาแย่ให้บอกตรง ๆ แต่ให้กำลังใจและเป็นบวก
            - มุ่งเน้นความพยายามและความก้าวหน้า
            - ให้คะแนน stats (AGI, STR, DEX, VIT, INT) ตามประเภทงานที่แสดง (1-5 คะแนน)
            - XP ควรอยู่ระหว่าง 80-120% ของ XP พื้นฐานตามคุณภาพงาน
            - Tags ควรเกี่ยวข้องและสร้างแรงบันดาลใจ
            - ให้ข้อเสนะแนะที่สร้างสรรค์
        ตอบเป็นภาษาไทยทั้งหมด
    `

      let analysisContent = `
            ภารกิจ: ${prompt.questTitle}
            คำอธิบายภารกิจ: ${prompt.questDescription}
            ข้อกำหนด: ${prompt.questRequirements.join(', ')}
            ${prompt.userDescription ? `คำอธิบายของผู้ใช้: ${prompt.userDescription}` : ''}
            ${prompt.mediaUrl ? `ลิงก์สื่อ: ${prompt.mediaUrl}` : ''}
        `

      // เพิ่มข้อมูลการวิเคราะห์วิดีโอ
      if (videoAnalysis) {
        analysisContent += `
            การวิเคราะห์วิดีโอ:
            - คำพูดที่แกะได้: "${videoAnalysis.transcript}"
            - สรุปเนื้อหา: ${videoAnalysis.summary}
            - การกระทำที่ทำ: ${videoAnalysis.actions.join(', ')}
            - จุดสำคัญที่กล่าวถึง: ${videoAnalysis.keyPoints.join(', ')}
            - เนื้อหาที่พูด: ${videoAnalysis.spokenContent.join(', ')}
            โปรดให้ความสำคัญกับเนื้อหาในวิดีโอเป็นหลัก เพราะแสดงความพยายามที่ชัดเจน`
      }

      const userPrompt = `${analysisContent}

        โปรดวิเคราะห์การส่งภารกิจนี้และตอบกลับในรูปแบบ JSON ภาษาไทย:
        {
            "summary": "สรุปสั้นๆ ว่าผู้ใช้ทำอะไรสำเร็จ (รวมเนื้อหาวิดีโอหากมี)",
            "score": 85,
            "xpEarned": 120,
            "requirements": {
                "ข้อกำหนดที่ 1": true,
                "ข้อกำหนดที่ 2": false
            },
            "feedback": "ข้อเสนะแนะเชิงสร้างสรรค์โดยละเอียด (กล่าวถึงเนื้อหาวิดีโอหากมี)",
            "tags": ["แท็กภาษาไทย1", "แท็กภาษาไทย2", "แท็กภาษาไทย3"],
            "ratings": {
                "agi": 3,
                "str": 2,
                "dex": 4,
                "vit": 2,
                "int": 5
            }
        }

        หากมีเนื้อหาวิดีโอ กรุณาพิจารณาในการประเมินและกล่าวถึงรายละเอียดเฉพาะจากวิดีโอในข้อเสนะแนะ
    `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      })

      const result = completion.choices[0]?.message?.content

      if (!result) throw new Error('ไม่ได้รับการตอบสนองจาก OpenAI')

      const analysis = JSON.parse(result) as AIAnalysisResult

      // ตรวจสอบโครงสร้างการตอบกลับ
      if (
        !analysis.summary ||
        !analysis.feedback ||
        !analysis.tags ||
        !analysis.ratings
      ) {
        throw new Error('โครงสร้างการตอบกลับจาก AI ไม่ถูกต้อง')
      }

      return analysis
    } catch (error) {
      console.error('OpenAI Analysis Error:', error)

      // Fallback analysis หาก OpenAI ล้มเหลว
      return this.getFallbackAnalysis(prompt, videoAnalysis)
    }
  }

  private getFallbackAnalysis(
    prompt: OpenAIPrompt,
    videoAnalysis?: VideoAnalysisResult
  ): AIAnalysisResult {
    let summary = `ทำภารกิจ: ${prompt.questTitle} เสร็จเรียบร้อย แสดงความพยายามดี!`
    let feedback =
      'ทำงานได้ดีมาก! การส่งงานแสดงให้เห็นถึงความมุ่งมั่นและความพยายาม ขอให้รักษาความก้าวหน้านี้ไว้!'

    if (videoAnalysis) {
      summary += ` วิเคราะห์เนื้อหาวิดีโอ: ${videoAnalysis.summary}`
      feedback += ` การสาธิตผ่านวิดีโอแสดงให้เห็นความเข้าใจที่ดีต่อความต้องการของภารกิจ`
    }

    return {
      summary,
      score: 85,
      xpEarned: 100,
      requirements: prompt.questRequirements.reduce(
        (acc, req, index) => {
          acc[`ข้อกำหนดที่ ${index + 1}`] = true
          return acc
        },
        {} as Record<string, boolean>
      ),
      feedback,
      tags: videoAnalysis
        ? ['วิดีโอ', 'สาธิต', 'ความพยายาม']
        : ['มุ่งมั่น', 'ความพยายาม', 'ก้าวหน้า'],
      ratings: {
        agi: 3,
        str: 3,
        dex: 3,
        vit: 3,
        int: 3,
      },
    }
  }
}

export const openaiService = new OpenAIService()
