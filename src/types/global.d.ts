declare global {
  // เพิ่ม property สำหรับ characterGenerationSessions
  var characterGenerationSessions: {
    [sessionId: string]: {
      jobClassId: number | string
      name: string
      portraits: GeneratedPortrait[]
      originalFaceImage?: string
      personaTraits?: string
      createdAt: Date
    }
  }
}

export {}
