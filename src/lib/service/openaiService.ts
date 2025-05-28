import { AIAnalysisResult, OpenAIPrompt } from '@src/features/quest/types/index'
import OpenAI from 'openai'

interface VideoAnalysisResult {
  transcript: string
  revised_transcript: string
  summary: string
  actions: string[]
  spokenContent: string[]
  keyPoints: string[]
}

interface ImageAnalysisResult {
  description: string
  summary: string
  actions: string[]
  visibleContent: string[]
  keyPoints: string[]
  workQuality: string
}

class OpenAIService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

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
      if (!response.ok)
        throw new Error(`Failed to fetch video: ${response.statusText}`)

      const videoBlob = await response.blob()
      console.log('Video downloaded, size:', videoBlob.size, 'bytes')

      // ตรวจสอบขนาดไฟล์ (Whisper มีขีดจำกัดที่ 25MB)
      const maxSize = 25 * 1024 * 1024 // 25MB
      if (videoBlob.size > maxSize)
        throw new Error(
          `Video file too large: ${videoBlob.size} bytes. Maximum size is 25MB.`
        )

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

  // วิเคราะห์สื่อ (รูปภาพหรือวิดีโอ)
  async analyzeMedia(
    mediaUrl: string,
    mediaType: 'image' | 'video'
  ): Promise<VideoAnalysisResult | ImageAnalysisResult> {
    try {
      console.log(`Starting ${mediaType} analysis for URL:`, mediaUrl)

      if (mediaType === 'video') {
        return await this.analyzeVideo(mediaUrl)
      } else {
        return await this.analyzeImage(mediaUrl)
      }
    } catch (error) {
      console.error(`${mediaType} analysis error:`, error)

      if (error instanceof Error) {
        throw new Error(
          `การวิเคราะห์${mediaType === 'video' ? 'วิดีโอ' : 'รูปภาพ'}ล้มเหลว: ${error.message}`
        )
      }

      throw new Error(
        `การวิเคราะห์${mediaType === 'video' ? 'วิดีโอ' : 'รูปภาพ'}ล้มเหลว กรุณาลองใหม่อีกครั้ง`
      )
    }
  }

  // วิเคราะห์รูปภาพด้วย GPT-4 Vision
  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      console.log('Starting image analysis with GPT-4 Vision...', imageUrl)

      const analysisPrompt = `
        วิเคราะห์รูปภาพนี้ที่ผู้ใช้ส่งมาเป็นหลักฐานการทำงาน:

        โปรดวิเคราะห์และอธิบายในรูปแบบ JSON ภาษาไทย:
        {
          "description": "อธิบายรายละเอียดสิ่งที่เห็นในรูปภาพ",
          "summary": "สรุปสั้นๆ ว่าผู้ใช้ทำอะไรหรือแสดงผลงานอะไร (2-3 ประโยค)",
          "actions": ["การกระทำที่ 1", "การกระทำที่ 2", "การกระทำที่ 3"],
          "visibleContent": ["สิ่งที่เห็นในรูป 1", "สิ่งที่เห็นในรูป 2"],
          "keyPoints": ["จุดสำคัญ 1", "จุดสำคัญ 2", "จุดสำคัญ 3"],
          "workQuality": "ประเมินคุณภาพงานที่เห็นในรูป (ดี/ปานกลาง/ต้องปรับปรุง)"
        }

        กรุณาระบุเป็นภาษาไทยทั้งหมด และมุ่งเน้นไปที่ผลงาน กิจกรรม หรือสิ่งที่ผู้ใช้ทำที่เห็นในรูป
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o', // ใช้ gpt-4o สำหรับ vision
        messages: [
          {
            role: 'system',
            content:
              'คุณเป็น AI ที่เชี่ยวชาญในการวิเคราะห์รูปภาพและประเมินผลงาน ตอบเป็นภาษาไทยเท่านั้น',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high', // ใช้ความละเอียดสูงสำหรับการวิเคราะห์ที่แม่นยำ
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      })

      const result = completion.choices[0]?.message?.content

      if (!result) throw new Error('No response from GPT Vision analysis')

      const analysis = JSON.parse(result) as ImageAnalysisResult
      console.log('Image analysis completed successfully')

      return analysis
    } catch (error) {
      console.error('Image analysis error:', error)

      // Fallback response สำหรับรูปภาพ
      return {
        description: 'ไม่สามารถวิเคราะห์รูปภาพได้',
        summary: 'ผู้ใช้ได้อัพโหลดรูปภาพเป็นหลักฐานการทำงาน',
        actions: ['อัพโหลดรูปภาพ', 'ส่งหลักฐาน'],
        visibleContent: ['รูปภาพมีเนื้อหา'],
        keyPoints: ['ส่งงานผ่านรูปภาพ'],
        workQuality: 'ปานกลาง',
      }
    }
  }

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
          "revised_transcript ": "นำ ${transcript} มาเรียบเรียงให้เป็นประโยคที่กระซับและเข้าใจง่าย ต่อผู้อ่าน",
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

      console.log(result)

      if (!result) throw new Error('No response from GPT analysis')

      return JSON.parse(result) as VideoAnalysisResult
    } catch (error) {
      console.error('Video transcript analysis error:', error)

      // Fallback response
      return {
        transcript: transcript,
        revised_transcript: transcript,
        summary: 'ผู้ใช้ได้อัพโหลดวิดีโอและมีการบันทึกเสียงไว้',
        actions: ['อัพโหลดวิดีโอ', 'บันทึกเสียง'],
        spokenContent: ['มีเนื้อหาเสียงในวิดีโอ'],
        keyPoints: ['ส่งงานผ่านวิดีโอ', 'มีการอธิบาย'],
      }
    }
  }

  // วิเคราะห์ quest submission (รวมกับสื่อประกอบ)
  async analyzeQuestSubmission(
    prompt: OpenAIPrompt,
    mediaAnalysis?: VideoAnalysisResult | ImageAnalysisResult
  ): Promise<AIAnalysisResult> {
    try {
      // const systemPrompt = `
      //   คุณเป็น AI ผู้ประเมินภารกิจสำหรับแอปจำลองเกม ที่ช่วยเพิ่มผลิตภาพในการทำงาน

      //   หลักการประเมิน:
      //   - วิเคราะห์เนื้อหาที่ผู้เล่นส่งมา พร้อมสื่อประกอบ (ถ้ามี)
      //   - หากผลงานไม่ดีหรือไม่ครบ ให้ข้อเสนอแนะที่สร้างสรรค์และมุ่งเน้นการพัฒนา
      //   - ให้คะแนนความสามารถ (AGI, STR, DEX, VIT, INT) ตามประเภทงาน (1–5 คะแนน)
      //   - XP ควรอยู่ระหว่าง 80–120% ของพื้นฐาน ตามคุณภาพงาน
      //   - Tags ควรมีความเกี่ยวข้องและสร้างแรงบันดาลใจ
      //   - พิจารณา “ข้อกำหนดของภารกิจ” และแสดงว่าได้ทำครบหรือไม่
      //   - หากแนบวิดีโอหรือภาพมา โปรดอ้างอิงสิ่งที่เห็นและได้ยินจากสื่อนั้นในการประเมิน

      //   ข้อควรระวัง:
      //   - หลีกเลี่ยงการชมเกินจริง เช่น “เก่งที่สุด” หากไม่มีหลักฐาน
      //   - ตอบเป็นภาษาไทยทั้งหมด
      // `

      const systemPrompt = `
        คุณเป็น AI ผู้ประเมินภารกิจสำหรับแอปจำลองเกม ที่ช่วยเพิ่มผลิตภาพในการทำงาน

        หลักการประเมิน:
        - วิเคราะห์เนื้อหาที่ผู้เล่นส่งมา พร้อมสื่อประกอบ (ถ้ามี)
        - หากผลงานไม่ดีหรือไม่ครบ ให้ข้อเสนอแนะที่สร้างสรรค์และมุ่งเน้นการพัฒนา
        - ให้คะแนนความสามารถ (AGI, STR, DEX, VIT, INT) ตามประเภทงาน (1–5 คะแนน)
        - Tags ควรมีความเกี่ยวข้องและสร้างแรงบันดาลใจ
        - พิจารณา “ข้อกำหนดของภารกิจ” และแสดงว่าได้ทำครบหรือไม่
        - หากแนบวิดีโอหรือภาพมา โปรดอ้างอิงสิ่งที่เห็นและได้ยินจากสื่อนั้นในการประเมิน

        ข้อควรระวัง:
        - หลีกเลี่ยงการชมเกินจริง เช่น “เก่งที่สุด” หากไม่มีหลักฐาน
        - ตอบเป็นภาษาไทยทั้งหมด
      `

      let analysisContent = `
        ภารกิจ: ${prompt.questTitle}
        คำอธิบายภารกิจ: ${prompt.questDescription}
        ข้อกำหนด: ${prompt.questRequirements.join(', ')}
        ${prompt.userDescription ? `คำอธิบายของผู้ใช้: ${prompt.userDescription}` : ''}
        ${prompt.mediaUrl ? `ลิงก์สื่อ: ${prompt.mediaUrl}` : ''}
      `

      // เพิ่มข้อมูลการวิเคราะห์สื่อ (วิดีโอหรือรูปภาพ)
      if (mediaAnalysis) {
        if ('transcript' in mediaAnalysis) {
          // วิดีโอ
          analysisContent += `
            การวิเคราะห์วิดีโอ:
            - คำพูดที่แกะได้: "${mediaAnalysis.transcript}"
            - สรุปเนื้อหา: ${mediaAnalysis.summary}
            - การกระทำที่ทำ: ${mediaAnalysis.actions.join(', ')}
            - จุดสำคัญที่กล่าวถึง: ${mediaAnalysis.keyPoints.join(', ')}
            - เนื้อหาที่พูด: ${mediaAnalysis.spokenContent.join(', ')}

            โปรดให้ความสำคัญกับเนื้อหาในวิดีโอเป็นหลัก เพราะแสดงความพยายามที่ชัดเจน
          `
        } else {
          // รูปภาพ
          analysisContent += `
            การวิเคราะห์รูปภาพ:
              - รายละเอียดที่เห็น: "${mediaAnalysis.description}"
              - สรุปเนื้อหา: ${mediaAnalysis.summary}
              - การกระทำที่เห็น: ${mediaAnalysis.actions.join(', ')}
              - จุดสำคัญ: ${mediaAnalysis.keyPoints.join(', ')}
              - สิ่งที่เห็นในรูป: ${mediaAnalysis.visibleContent.join(', ')}
              - คุณภาพงาน: ${mediaAnalysis.workQuality}

              โปรดให้ความสำคัญกับสิ่งที่เห็นในรูปภาพเป็นหลัก เพราะแสดงผลงานที่ชัดเจน
            `
        }
      }

      const userPrompt = `${analysisContent}

        โปรดวิเคราะห์การส่งภารกิจนี้และตอบกลับในรูปแบบ JSON ภาษาไทย:
        {
          "summary": "สรุปสั้นๆ ว่าผู้ใช้ทำอะไรสำเร็จ (รวมเนื้อหาสื่อหากมี)",
          "score": 85,
          "xpEarned": 120,
          "requirements": {
            "ข้อกำหนดที่ 1": true,
            "ข้อกำหนดที่ 2": false
          },
          "feedback": "ข้อเสนะแนะเชิงสร้างสรรค์โดยละเอียด (กล่าวถึงเนื้อหาสื่อหากมี)",
          "tags": ["แท็กภาษาไทย1", "แท็กภาษาไทย2", "แท็กภาษาไทย3"],
          "ratings": {
            "agi": 3,
            "str": 2,
            "dex": 4,
            "vit": 2,
            "int": 5
          }
        }

        หากมีเนื้อหาสื่อ กรุณาพิจารณาในการประเมินและกล่าวถึงรายละเอียดเฉพาะจากสื่อในข้อเสนะแนะ
      `

      console.log('debug userPrompt: ', userPrompt)

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

      console.log('debug result: ', result)

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
      return this.getFallbackAnalysis(prompt, mediaAnalysis)
    }
  }

  private getFallbackAnalysis(
    prompt: OpenAIPrompt,
    mediaAnalysis?: VideoAnalysisResult | ImageAnalysisResult
  ): AIAnalysisResult {
    let summary = `ทำภารกิจ: ${prompt.questTitle} เสร็จเรียบร้อย แสดงความพยายามดี!`
    let feedback =
      'ทำงานได้ดีมาก! การส่งงานแสดงให้เห็นถึงความมุ่งมั่นและความพยายาม ขอให้รักษาความก้าวหน้านี้ไว้!'
    let tags = ['มุ่งมั่น', 'ความพยายาม', 'ก้าวหน้า']

    if (mediaAnalysis) {
      if ('transcript' in mediaAnalysis) {
        // วิดีโอ
        summary += ` วิเคราะห์เนื้อหาวิดีโอ: ${mediaAnalysis.summary}`
        feedback += ` การสาธิตผ่านวิดีโอแสดงให้เห็นความเข้าใจที่ดีต่อความต้องการของภารกิจ`
        tags = ['วิดีโอ', 'สาธิต', 'ความพยายาม']
      } else {
        // รูปภาพ
        summary += ` วิเคราะห์เนื้อหารูปภาพ: ${mediaAnalysis.summary}`
        feedback += ` การแสดงผลงานผ่านรูปภาพแสดงให้เห็นความตั้งใจและคุณภาพงาน`
        tags = ['รูปภาพ', 'ผลงาน', 'คุณภาพ']
      }
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
      tags,
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
