import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { QueryClient } from '@tanstack/react-query'

interface InvalidationRule {
  queryKeys: (string | number)[][]
  condition?: (data: any) => boolean
  delay?: number
}

interface CacheOperation {
  id: string
  type: 'invalidate' | 'refetch' | 'setData' | 'removeQueries'
  queryKeys: (string | number)[][]
  data?: any
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
}

interface CacheState {
  // Operation tracking
  operations: CacheOperation[]
  pendingOperations: Set<string>
  
  // Invalidation rules
  invalidationRules: Map<string, InvalidationRule[]>
  
  // Query status tracking
  queryStates: Map<string, {
    lastFetched: number
    isStale: boolean
    errorCount: number
  }>
  
  // Background sync status
  isBackgroundSyncing: boolean
  lastBackgroundSync: number
  backgroundSyncInterval: number
  
  // Settings
  enableBatchInvalidation: boolean
  batchDelay: number
  maxOperationsHistory: number
}

interface CacheActions {
  // Operation management
  addOperation: (operation: Omit<CacheOperation, 'id' | 'timestamp' | 'status'>) => string
  completeOperation: (id: string) => void
  failOperation: (id: string) => void
  clearOperationsHistory: () => void
  
  // Smart invalidation
  invalidateQueriesForAction: (actionType: string, data?: any) => void
  batchInvalidate: (queryKeys: (string | number)[][][]) => void
  
  // Rule management
  addInvalidationRule: (actionType: string, rule: InvalidationRule) => void
  removeInvalidationRule: (actionType: string, ruleIndex: number) => void
  
  // Query state tracking
  updateQueryState: (queryKey: string, state: Partial<{
    lastFetched: number
    isStale: boolean
    errorCount: number
  }>) => void
  
  // Background sync
  startBackgroundSync: () => void
  stopBackgroundSync: () => void
  triggerBackgroundSync: () => void
  setBackgroundSyncInterval: (interval: number) => void
  
  // Cache optimization
  optimizeCache: () => void
  removeStaleQueries: () => void
  
  // Settings
  setEnableBatchInvalidation: (enable: boolean) => void
  setBatchDelay: (delay: number) => void
  
  // Reset
  reset: () => void
}

const initialState: CacheState = {
  operations: [],
  pendingOperations: new Set(),
  invalidationRules: new Map([
    // Default rules
    ['like', [
      { queryKeys: [['notifications'], ['notifications', 'unread-count']] },
      { queryKeys: [['feed']], delay: 100 }
    ]],
    ['comment', [
      { queryKeys: [['notifications'], ['notifications', 'unread-count']] },
      { queryKeys: [['feed']], delay: 100 }
    ]],
    ['notification_read', [
      { queryKeys: [['notifications'], ['notifications', 'unread-count']] }
    ]],
    ['quest_submit', [
      { queryKeys: [['quests'], ['character'], ['feed']], delay: 200 }
    ]],
    ['checkin', [
      { queryKeys: [['checkin'], ['character']], delay: 100 }
    ]]
  ]),
  queryStates: new Map(),
  isBackgroundSyncing: false,
  lastBackgroundSync: 0,
  backgroundSyncInterval: 5 * 60 * 1000, // 5 minutes
  enableBatchInvalidation: true,
  batchDelay: 300, // 300ms
  maxOperationsHistory: 100,
}

let batchTimeout: NodeJS.Timeout | null = null
let batchedInvalidations: (string | number)[][][] = []

export const useCacheStore = create<CacheState & CacheActions>()(
  immer((set, get) => ({
    ...initialState,

    // Operation management
    addOperation: (operationData) => {
      const id = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      set((state) => {
        const operation: CacheOperation = {
          id,
          ...operationData,
          timestamp: Date.now(),
          status: 'pending'
        }
        
        state.operations.push(operation)
        state.pendingOperations.add(id)
        
        // Maintain history limit
        if (state.operations.length > state.maxOperationsHistory) {
          const removed = state.operations.shift()
          if (removed) {
            state.pendingOperations.delete(removed.id)
          }
        }
      })
      
      return id
    },

    completeOperation: (id) =>
      set((state) => {
        const operation = state.operations.find(op => op.id === id)
        if (operation) {
          operation.status = 'completed'
          state.pendingOperations.delete(id)
        }
      }),

    failOperation: (id) =>
      set((state) => {
        const operation = state.operations.find(op => op.id === id)
        if (operation) {
          operation.status = 'failed'
          state.pendingOperations.delete(id)
        }
      }),

    clearOperationsHistory: () =>
      set((state) => {
        state.operations = []
        state.pendingOperations.clear()
      }),

    // Smart invalidation
    invalidateQueriesForAction: (actionType, data) => {
      const state = get()
      const rules = state.invalidationRules.get(actionType)
      
      if (!rules) return

      rules.forEach(rule => {
        const shouldInvalidate = !rule.condition || rule.condition(data)
        if (!shouldInvalidate) return

        if (rule.delay) {
          setTimeout(() => {
            get().batchInvalidate([rule.queryKeys])
          }, rule.delay)
        } else {
          get().batchInvalidate([rule.queryKeys])
        }
      })
    },

    batchInvalidate: (queryKeys) => {
      const state = get()
      
      if (!state.enableBatchInvalidation) {
        // Immediate invalidation
        const operationId = get().addOperation({
          type: 'invalidate',
          queryKeys: queryKeys.flat()
        })
        
        // This would be called with actual QueryClient instance
        console.log('🔄 Cache - Immediate invalidation:', queryKeys)
        get().completeOperation(operationId)
        return
      }

      // Add to batch
      batchedInvalidations.push(...queryKeys)

      if (batchTimeout) {
        clearTimeout(batchTimeout)
      }

      batchTimeout = setTimeout(() => {
        const toInvalidate = [...batchedInvalidations]
        batchedInvalidations = []

        const operationId = get().addOperation({
          type: 'invalidate',
          queryKeys: toInvalidate.flat()
        })

        console.log('🔄 Cache - Batched invalidation:', toInvalidate)
        get().completeOperation(operationId)
        
        batchTimeout = null
      }, state.batchDelay)
    },

    // Rule management
    addInvalidationRule: (actionType, rule) =>
      set((state) => {
        if (!state.invalidationRules.has(actionType)) {
          state.invalidationRules.set(actionType, [])
        }
        state.invalidationRules.get(actionType)!.push(rule)
      }),

    removeInvalidationRule: (actionType, ruleIndex) =>
      set((state) => {
        const rules = state.invalidationRules.get(actionType)
        if (rules && rules[ruleIndex]) {
          rules.splice(ruleIndex, 1)
        }
      }),

    // Query state tracking
    updateQueryState: (queryKey, stateUpdate) =>
      set((state) => {
        const currentState = state.queryStates.get(queryKey) || {
          lastFetched: 0,
          isStale: false,
          errorCount: 0
        }
        
        state.queryStates.set(queryKey, {
          ...currentState,
          ...stateUpdate
        })
      }),

    // Background sync
    startBackgroundSync: () =>
      set((state) => {
        state.isBackgroundSyncing = true
        
        // Start interval
        const interval = setInterval(() => {
          get().triggerBackgroundSync()
        }, state.backgroundSyncInterval)
        
        // Store interval ID (in real implementation)
        console.log('🔄 Cache - Background sync started')
      }),

    stopBackgroundSync: () =>
      set((state) => {
        state.isBackgroundSyncing = false
        console.log('⏹️ Cache - Background sync stopped')
      }),

    triggerBackgroundSync: () =>
      set((state) => {
        state.lastBackgroundSync = Date.now()
        
        // Sync critical queries
        const criticalQueries = [
          [['notifications', 'unread-count']],
          [['user', 'character']]
        ]
        
        console.log('🔄 Cache - Background sync triggered')
        get().batchInvalidate(criticalQueries)
      }),

    setBackgroundSyncInterval: (interval) =>
      set((state) => {
        state.backgroundSyncInterval = interval
      }),

    // Cache optimization
    optimizeCache: () => {
      console.log('🧹 Cache - Optimizing cache...')
      
      set((state) => {
        // Remove old operations
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        state.operations = state.operations.filter(op => op.timestamp > oneHourAgo)
        
        // Remove old query states
        const queryStatesToRemove: string[] = []
        state.queryStates.forEach((queryState, key) => {
          if (queryState.lastFetched < oneHourAgo) {
            queryStatesToRemove.push(key)
          }
        })
        
        queryStatesToRemove.forEach(key => {
          state.queryStates.delete(key)
        })
      })
    },

    removeStaleQueries: () => {
      const state = get()
      const staleQueries: string[] = []
      
      state.queryStates.forEach((queryState, key) => {
        if (queryState.isStale) {
          staleQueries.push(key)
        }
      })
      
      if (staleQueries.length > 0) {
        const operationId = get().addOperation({
          type: 'removeQueries',
          queryKeys: staleQueries.map(key => [key])
        })
        
        console.log('🗑️ Cache - Removing stale queries:', staleQueries)
        get().completeOperation(operationId)
      }
    },

    // Settings
    setEnableBatchInvalidation: (enable) =>
      set((state) => {
        state.enableBatchInvalidation = enable
      }),

    setBatchDelay: (delay) =>
      set((state) => {
        state.batchDelay = delay
      }),

    // Reset
    reset: () => set(initialState),
  }))
)

// Higher-order function to create cache-aware mutations
export function createCacheAwareMutation<T extends any[], R>(
  mutationFn: (...args: T) => Promise<R>,
  actionType: string,
  extractData?: (args: T, result: R) => any
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await mutationFn(...args)
      
      // Trigger smart invalidation
      const data = extractData ? extractData(args, result) : { args, result }
      useCacheStore.getState().invalidateQueriesForAction(actionType, data)
      
      return result
    } catch (error) {
      console.error(`Cache-aware mutation failed for ${actionType}:`, error)
      throw error
    }
  }
}

// Utility to integrate with QueryClient
export function integrateCacheStore(queryClient: QueryClient) {
  const store = useCacheStore.getState()
  
  // Override batch invalidation to use actual QueryClient
  const originalBatchInvalidate = store.batchInvalidate
  
  store.batchInvalidate = (queryKeys) => {
    const operationId = store.addOperation({
      type: 'invalidate',
      queryKeys: queryKeys.flat()
    })
    
    try {
      queryKeys.flat().forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
      store.completeOperation(operationId)
    } catch (error) {
      console.error('Cache invalidation failed:', error)
      store.failOperation(operationId)
    }
  }
  
  return () => {
    // Cleanup function
    store.batchInvalidate = originalBatchInvalidate
  }
}

// Selectors
export const useCacheOperations = () => useCacheStore((state) => state.operations)
export const usePendingOperations = () => useCacheStore((state) => state.pendingOperations.size)
export const useBackgroundSyncStatus = () => useCacheStore((state) => ({
  isActive: state.isBackgroundSyncing,
  lastSync: state.lastBackgroundSync
})) 