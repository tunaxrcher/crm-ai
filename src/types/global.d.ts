declare global {
  // เพิ่ม property สำหรับ characterGenerationSessions
  var characterGenerationSessions: {
    [sessionId: string]: {
      jobClassId: number | string
      name: string
      portraits: GeneratedPortrait[]
      originalFaceImage?: string
      createdAt: Date
    }
  }
}

export {}
