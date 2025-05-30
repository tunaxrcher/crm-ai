'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Layout from './(layout)/layout'
import HomePage from './(layout)/page'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [router])
  return (
    <main>
      <Layout>
        <HomePage />
      </Layout>
    </main>
  )
}
