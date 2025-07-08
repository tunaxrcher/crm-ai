'use client'

import { ReactNode, useEffect } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { initializeStores } from '@src/stores'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

interface ReactQueryProviderProps {
  children: ReactNode
}

const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  // Initialize Zustand stores when component mounts
  useEffect(() => {
    console.log('🚀 ReactQueryProvider - Initializing Zustand stores...')
    const cleanup = initializeStores(queryClient)
    
    return () => {
      console.log('🧹 ReactQueryProvider - Cleaning up stores...')
      cleanup()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}

export default ReactQueryProvider
