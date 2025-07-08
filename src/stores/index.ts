// Store initialization utility
import { QueryClient } from '@tanstack/react-query'

import { useAppStore } from './appStore'
import { integrateCacheStore, useCacheStore } from './cacheStore'
import { useFeedStore } from './feedStore'
import { useNotificationStore } from './notificationStore'

// Core stores
export * from './appStore'
export * from './notificationStore'
export * from './feedStore'
export * from './cacheStore'

/**
 * Initialize all stores with proper connections
 */
export function initializeStores(queryClient: QueryClient) {
  console.log('🏪 Initializing Zustand stores...')

  // Initialize notification store
  const notificationStore = useNotificationStore.getState()
  notificationStore._initializeStore()

  // Connect cache store with QueryClient
  const cleanupCacheStore = integrateCacheStore(queryClient)

  // Start background sync
  const cacheStore = useCacheStore.getState()
  cacheStore.startBackgroundSync()

  // Setup online/offline listeners
  const appStore = useAppStore.getState()

  const handleOnline = () => {
    appStore.setOnlineStatus(true)
    appStore.updateSyncTime()
    console.log('🌐 App back online - triggering cache sync')
    cacheStore.triggerBackgroundSync()
  }

  const handleOffline = () => {
    appStore.setOnlineStatus(false)
    console.log('📴 App offline')
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    appStore.setOnlineStatus(navigator.onLine)
  }

  // Periodic cache optimization
  const optimizationInterval = setInterval(
    () => {
      cacheStore.optimizeCache()
    },
    10 * 60 * 1000
  ) // Every 10 minutes

  console.log('✅ Stores initialized successfully')

  // Return cleanup function
  return () => {
    console.log('🧹 Cleaning up stores...')

    cleanupCacheStore()
    cacheStore.stopBackgroundSync()
    clearInterval(optimizationInterval)

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

/**
 * Reset all stores (useful for logout)
 */
export function resetAllStores() {
  console.log('🔄 Resetting all stores...')

  useAppStore.getState().reset()
  useNotificationStore.getState().reset()
  useFeedStore.getState().reset()
  useCacheStore.getState().reset()

  console.log('✅ All stores reset')
}

/**
 * Get app-wide state for debugging
 */
export function getAppState() {
  return {
    app: useAppStore.getState(),
    notifications: useNotificationStore.getState(),
    feed: useFeedStore.getState(),
    cache: useCacheStore.getState(),
  }
}
