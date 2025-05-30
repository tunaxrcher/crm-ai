// src/features/character/service/openaiVisionService.ts
import OpenAI from 'openai'
import 'server-only'

interface PersonaTraits {
  eyes: string
  hair: string
  expression: string
  clothing: string
  posture: string
  fullDescription: string
}

export class OpenAIVisionService {
  private static instance: OpenAIVisionService
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  public static getInstance() {
    if (!OpenAIVisionService.instance) {
      OpenAIVisionService.instance = new OpenAIVisionService()
    }
    return OpenAIVisionService.instance
  }

  async analyzePersonaTraits(imageUrl: string): Promise<PersonaTraits> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // ใช้ model ใหม่ที่รองรับ vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this person's appearance and describe their traits for character creation. Focus on:
                1. Eyes (e.g., bright, focused, friendly, intense, calm)
                2. Hair (e.g., styled hair, casual hair, neat, messy, short, long)
                3. Expression (e.g., confident smile, serious expression, friendly face, determined look)
                4. Clothing/Outfit (describe what they're wearing)
                5. Posture/Stance (e.g., confident posture, relaxed stance, energetic pose)
                
                Return the analysis in this exact JSON format:
                {
                  "eyes": "description of eyes",
                  "hair": "description of hair",
                  "expression": "description of facial expression",
                  "clothing": "description of outfit",
                  "posture": "description of posture/stance",
                  "fullDescription": "combine all traits into one flowing description"
                }`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        response_format: { type: 'json_object' },
      })

      const result = response.choices[0].message.content
      if (!result) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(result) as PersonaTraits
    } catch (error) {
      console.error('Error analyzing persona traits:', error)

      // Fallback to default traits
      return {
        eyes: 'bright and focused',
        hair: 'neat and styled',
        expression: 'confident and friendly',
        clothing: 'professional attire',
        posture: 'confident stance',
        fullDescription:
          'bright and focused eyes, neat and styled hair, confident and friendly expression, professional attire, confident stance',
      }
    }
  }

  generateDynamicPrompt(
    profession: string,
    level: number,
    classLevel: number,
    personaTraits: string,
    classDescription: string
  ): string {
    const style = 'Use a 3D cartoon, semi-realistic, Pixar-style illustration.'

    return `Create an avatar of a character, profession: ${profession}, EVX level ${level} (Class ${classLevel}), based on the user's input photo.
${style}
The character should be stylized but believable. The final image must show the entire body from head to toe, in full-body composition with warm lighting and clean background.
Character traits: ${personaTraits}
${classDescription}
Keep the same facial structure, image size, character scale, and overall art style across all class evolutions. Only the expression, pose, outfit, and gear may change to reflect progression.`
  }
}

// Export instance
export const openAIVisionService = OpenAIVisionService.getInstance()