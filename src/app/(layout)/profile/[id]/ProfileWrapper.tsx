'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@src/components/ui/button'
import ProfilePage from '@src/features/profile/components/ProfilePage'

interface ProfileWrapperProps {
  userId: string
}

export default function ProfileWrapper({ userId }: ProfileWrapperProps) {
  const router = useRouter()
  const [isValid, setIsValid] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple validation
    if (!userId || userId.trim() === '') {
      console.error('Invalid userId provided:', userId)
      setIsValid(false)
      setIsLoading(false)
      return
    }

    // Simulate checking validity - in real app would check with API
    const validUserIds = [
      'user-1',
      'user-2',
      'user-3',
      'user-4',
      'user-5',
      'user-6',
      'user-7',
      'current-user',
    ]
    const isValidId = validUserIds.includes(userId)

    setIsValid(isValidId)
    setIsLoading(false)

    if (!isValidId) {
      console.error('userId not in valid list:', userId)
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-60">
        <h1 className="text-xl font-bold mb-2">ไม่พบโปรไฟล์</h1>
        <p className="text-muted-foreground mb-4">
          ไม่พบข้อมูลโปรไฟล์ที่คุณต้องการ หรือ URL ไม่ถูกต้อง
        </p>
        <Button
          onClick={() => router.push('/ranking')}
          className="ai-gradient-bg">
          กลับไปหน้าจัดอันดับ
        </Button>
      </div>
    )
  }

  return <ProfilePage />
}
