'use client'

import { useEffect, useState } from 'react'

import { GoogleLoginForm } from '@src/features/auth/login/google-login-form'
import { Preloader } from '@src/features/auth/login/preloader'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500) // แสดง preloader 2.5 วินาที

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <Preloader />

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-500">
      <div className="flex-grow flex items-center justify-center p-4">
        <GoogleLoginForm />
      </div>
    </div>
  )
}
