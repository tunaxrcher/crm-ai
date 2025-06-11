// src/lib/hooks/useSessionRefresh.ts
import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

export function useSessionRefresh() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const refreshSession = async () => {
    try {
      // อัพเดท session โดยดึงข้อมูลใหม่จาก database
      await update()

      // รอสักครู่ให้ session อัพเดท
      setTimeout(() => {
        router.push('/')
        router.refresh() // refresh page เพื่อให้ middleware ทำงานใหม่
      }, 500)
    } catch (error) {
      console.error('Failed to refresh session:', error)
      // fallback: redirect ไป home ตรงๆ
      router.push('/')
    }
  }

  return { refreshSession }
}
