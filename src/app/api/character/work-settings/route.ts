import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { withErrorHandling } from '@src/lib/withErrorHandling'
import { getServerSession } from 'next-auth'

// GET - ดึงข้อมูลการตั้งค่าเวลาทำงาน
export const GET = withErrorHandling(async (req: NextRequest) => {
  console.log('[API] GET Work Settings')

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const character = await prisma.character.findUnique({
    where: { userId: parseInt(session.user.id) },
    select: {
      workStartTime: true,
      workEndTime: true,
      salary: true,
    },
  })

  if (!character) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: character,
  })
})

// PUT - อัพเดทการตั้งค่าเวลาทำงาน
export const PUT = withErrorHandling(async (req: NextRequest) => {
  console.log('[API] PUT Work Settings')

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { workStartTime, workEndTime, salary } = body

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (workStartTime && !timeRegex.test(workStartTime)) {
    return NextResponse.json(
      { error: 'Invalid workStartTime format. Use HH:MM' },
      { status: 400 }
    )
  }
  if (workEndTime && !timeRegex.test(workEndTime)) {
    return NextResponse.json(
      { error: 'Invalid workEndTime format. Use HH:MM' },
      { status: 400 }
    )
  }

  // Validate salary
  if (salary !== undefined && salary !== null && salary < 0) {
    return NextResponse.json(
      { error: 'Salary must be positive number' },
      { status: 400 }
    )
  }

  const character = await prisma.character.update({
    where: { userId: parseInt(session.user.id) },
    data: {
      ...(workStartTime !== undefined && { workStartTime }),
      ...(workEndTime !== undefined && { workEndTime }),
      ...(salary !== undefined && { salary }),
    },
  })

  return NextResponse.json({
    success: true,
    message: 'อัพเดทการตั้งค่าเวลาทำงานสำเร็จ',
    data: {
      workStartTime: character.workStartTime,
      workEndTime: character.workEndTime,
      salary: character.salary,
    },
  })
})
