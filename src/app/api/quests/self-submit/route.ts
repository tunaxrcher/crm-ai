// src/app/api/quests/self-submit/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { questSubmissionService } from '@src/features/quest/services/server'
import { getServerSession } from '@src/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in' },
        { status: 401 }
      )
    }

    const userId = +session.user.id
    const formData = await req.formData()

    // รับไฟล์และข้อมูลจาก request
    const mediaFile = formData.get('mediaFile') as File | null
    const description = formData.get('description') as string | null

    // ส่งข้อมูลไปยังเซอร์วิส
    const result = await questSubmissionService.selfSubmitQuest(
      userId,
      mediaFile || undefined,
      description || undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in self-submit quest API:', error)

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to process quest submission',
      },
      { status: 500 }
    )
  }
}
