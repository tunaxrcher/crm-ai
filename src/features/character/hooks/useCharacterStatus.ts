// src/features/character/hooks/useCharacterStatus.ts
import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

export function useCharacterStatus() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const hasCharacter = !!session?.user?.characterId
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  // Redirect logic
  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // ถ้า login แล้วแต่ไม่มี character และไม่ได้อยู่หน้า create
    if (
      isAuthenticated &&
      !hasCharacter &&
      window.location.pathname !== '/create'
    ) {
      router.push('/create')
      return
    }

    // ถ้า login แล้ว มี character แล้ว แต่อยู่หน้า create
    if (
      isAuthenticated &&
      hasCharacter &&
      window.location.pathname === '/create'
    ) {
      router.push('/')
      return
    }
  }, [isAuthenticated, hasCharacter, isLoading, router])

  return {
    hasCharacter,
    isLoading,
    isAuthenticated,
    session,
  }
}
