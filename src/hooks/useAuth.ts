import { redirect } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user

  const logout = async () => {
    await signOut({ callbackUrl: '/login/auth' })
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
  }
}
