# Zustand State Management System

## Overview

เปลี่ยนจาก localStorage overuse และ complex useState patterns มาใช้ **Zustand** เป็น central state management พร้อม **Optimistic Updates** และ **Smart Cache Management**

## Store Architecture

### 1. App Store (`src/stores/appStore.ts`)
จัดการ global app state:

```typescript
// Core app state
const {
  user,                    // User information
  isAuthenticated,         // Auth status
  isLoading,              // Global loading
  errors,                 // Error management
  notifications,          // Notification UI state
  theme,                  // UI theme
  isOnline,              // Connection status
  lastSyncTime           // Sync metadata
} = useAppStore()

// Convenience selectors
const user = useUser()
const isAuth = useIsAuthenticated()
const notificationCount = useNotificationCount()
const isOnline = useConnectionStatus()
```

### 2. Notification Store (`src/stores/notificationStore.ts`)
แทนที่ localStorage ด้วย persistent store:

```typescript
const {
  // Toast management
  toasts,                 // Active toasts
  addToast,              // Add new toast
  removeToast,           // Remove toast
  
  // Persistent notifications  
  notifications,         // All notifications
  unreadCount,          // Unread count
  markAsRead,           // Mark single as read
  markAllAsRead,        // Mark all as read
  
  // Session management (replaces localStorage)
  shownNotificationIds, // Prevents duplicate toasts
  hasBeenShown,         // Check if shown
  markAsShown,          // Mark as shown
  
  // Optimistic updates
  optimisticLike,       // Optimistic like notification
  optimisticComment     // Optimistic comment notification
} = useNotificationStore()
```

### 3. Feed Store (`src/stores/feedStore.ts`)
แทนที่ multiple useState ด้วย unified state:

```typescript
const {
  // Data state
  feedItems,              // Feed items
  stories,               // Stories
  
  // Loading states
  isLoading,             // Initial load
  isRefreshing,          // Pull to refresh
  isLoadingMore,         // Infinite scroll
  
  // Pagination
  page,                  // Current page
  hasMore,              // Has more items
  
  // Optimistic updates
  optimisticToggleLike,  // Immediate like UI
  confirmLike,           // Confirm with server
  rollbackLike,          // Rollback on error
  
  optimisticAddComment,  // Immediate comment UI
  confirmComment,        // Confirm with server
  rollbackComment,       // Rollback on error
  
  // Cache management
  isCacheValid,          // Check cache validity
  invalidateCache        // Force refresh
} = useFeedStore()
```

### 4. Cache Store (`src/stores/cacheStore.ts`)
Smart React Query cache management:

```typescript
const {
  // Smart invalidation
  invalidateQueriesForAction,  // Rule-based invalidation
  batchInvalidate,            // Batched invalidation
  
  // Rule management
  addInvalidationRule,        // Add new rule
  
  // Background sync
  startBackgroundSync,        // Start sync
  triggerBackgroundSync,      // Manual trigger
  
  // Cache optimization
  optimizeCache,              // Clean old data
  removeStaleQueries          // Remove stale
} = useCacheStore()
```

## Key Features

### 1. Optimistic Updates

#### Like Optimistic Update:
```typescript
// 1. Immediate UI update
optimisticToggleLike(feedItemId, true)

// 2. API call
const result = await feedService.toggleLike(feedItemId)

// 3. Confirm or rollback
if (success) {
  confirmLike(feedItemId, result)
} else {
  rollbackLike(feedItemId)
}
```

#### Comment Optimistic Update:
```typescript
// 1. Show comment immediately
optimisticAddComment(feedItemId, {
  user: { name: 'You' },
  text: content
})

// 2. API call
const newComment = await feedService.addComment(feedItemId, content)

// 3. Replace optimistic with real data
confirmComment(feedItemId, newComment)
```

### 2. Smart Cache Invalidation

#### Rule-Based System:
```typescript
// Pre-configured rules
const rules = {
  'like': [
    { queryKeys: [['notifications'], ['notifications', 'unread-count']] },
    { queryKeys: [['feed']], delay: 100 }
  ],
  'comment': [
    { queryKeys: [['notifications']] },
    { queryKeys: [['feed']], delay: 100 }
  ]
}

// Automatic invalidation
useCacheStore.getState().invalidateQueriesForAction('like', data)
```

#### Cache-Aware Mutations:
```typescript
const likeMutation = createCacheAwareMutation(
  (args) => feedService.toggleLike(args.feedItemId, args.hasLiked),
  'like',  // Action type for rules
  (args, result) => ({ feedItemId: args.feedItemId, result })
)
```

### 3. Persistent Storage

#### Notification Store Persistence:
```typescript
// Automatically persists:
- shownNotificationIds (prevents duplicate toasts)
- lastSessionTimestamp (expires old data)
- enableToasts (user preference)
- maxToasts (configuration)

// Handles rehydration:
- Converts arrays back to Sets
- Cleans expired data
- Maintains type safety
```

### 4. Background Sync

#### Connection-Aware Sync:
```typescript
// Online/offline detection
window.addEventListener('online', () => {
  appStore.setOnlineStatus(true)
  cacheStore.triggerBackgroundSync()
})

// Periodic sync (5 minutes)
setInterval(() => {
  cacheStore.triggerBackgroundSync()
}, 5 * 60 * 1000)
```

## Migration Benefits

### Before (localStorage + useState):
```typescript
// Scattered state management
const [feedItems, setFeedItems] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)

// Manual localStorage
localStorage.setItem('shown-notifications', JSON.stringify(ids))
const savedIds = JSON.parse(localStorage.getItem('shown-notifications'))

// Manual cache invalidation
queryClient.invalidateQueries(['notifications'])
queryClient.invalidateQueries(['feed'])
```

### After (Zustand):
```typescript
// Unified state management
const { feedItems, isLoading, error, setFeedItems } = useFeedStore()

// Automatic persistence
const { hasBeenShown, markAsShown } = useNotificationStore()

// Smart cache invalidation
const { invalidateQueriesForAction } = useCacheStore()
invalidateQueriesForAction('like', data)
```

## Store Integration

### 1. Hooks Integration

#### Before:
```typescript
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getUserNotifications()
  })
}
```

#### After:
```typescript
export function useNotifications() {
  const setNotifications = useNotificationStore(state => state.setNotifications)
  
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getUserNotifications()
  })

  // Sync with store
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data.notifications)
    }
  }, [query.data, setNotifications])

  return {
    ...query,
    data: { notifications: useNotificationStore(state => state.notifications) }
  }
}
```

### 2. Service Integration

#### Toast Service:
```typescript
// Before: localStorage-based
class ToastService {
  private static loadFromStorage(): Set<string> {
    const saved = localStorage.getItem('shown-notifications')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  }
}

// After: Zustand store-based
class ZustandToastService {
  public checkForNewNotifications(notifications: any[]) {
    const store = useNotificationStore.getState()
    
    notifications.forEach(notification => {
      if (!store.hasBeenShown(notification.id)) {
        store.addToast({
          type: 'info',
          title: notification.title,
          message: notification.message
        })
        store.markAsShown(notification.id)
      }
    })
  }
}
```

## Performance Optimizations

### 1. Selector Patterns
```typescript
// Bad: Re-renders on any store change
const store = useNotificationStore()

// Good: Only re-renders when toasts change
const toasts = useNotificationStore(state => state.toasts)

// Even better: Pre-built selectors
const toasts = useToasts()
```

### 2. Batched Updates
```typescript
// Batches multiple invalidations
const batchInvalidate = useCacheStore(state => state.batchInvalidate)
batchInvalidate([
  [['notifications']],
  [['feed']],
  [['user']]
])
```

### 3. Cache Optimization
```typescript
// Automatic cleanup every 10 minutes
setInterval(() => {
  cacheStore.optimizeCache()  // Removes old operations
  cacheStore.removeStaleQueries()  // Removes stale queries
}, 10 * 60 * 1000)
```

## Debugging & Monitoring

### 1. Store State Inspection
```typescript
// Get all store states for debugging
import { getAppState } from '@src/stores'

console.log('📊 App State:', getAppState())
```

### 2. Operation Tracking
```typescript
// Monitor cache operations
const operations = useCacheOperations()
const pendingCount = usePendingOperations()

console.log('🔄 Cache Operations:', operations)
console.log('⏳ Pending Operations:', pendingCount)
```

### 3. Performance Monitoring
```typescript
// Background sync status
const { isActive, lastSync } = useBackgroundSyncStatus()

console.log('🔄 Background Sync:', {
  isActive,
  lastSync: new Date(lastSync)
})
```

## Best Practices

### 1. Store Organization
- **Single Responsibility**: แต่ละ store มีหน้าที่เฉพาะ
- **Type Safety**: ใช้ TypeScript interfaces ครบ
- **Immutable Updates**: ใช้ Immer middleware

### 2. Performance
- **Selective Subscriptions**: ใช้ selectors แทน whole store
- **Batch Operations**: รวม operations ที่เกี่ยวข้อง
- **Cache Management**: ใช้ smart invalidation rules

### 3. Error Handling
- **Optimistic Rollback**: Rollback เมื่อ API ล้มเหลว
- **Graceful Degradation**: แสดง cached data เมื่อ offline
- **Error Boundaries**: จัดการ errors ใน store level

### 4. Testing
- **Store Testing**: Test store logic แยกจาก components
- **Mock Stores**: ใช้ mock stores ใน tests
- **State Snapshots**: เปรียบเทียบ state changes

## Summary

การเปลี่ยนไปใช้ Zustand State Management ช่วยแก้ไขปัญหา:

✅ **localStorage Overuse** → Persistent Zustand stores  
✅ **Complex useState** → Unified state management  
✅ **Cache Confusion** → Smart invalidation rules  
✅ **State Sync Issues** → Optimistic updates  
✅ **Manual Error Handling** → Automatic rollback  

ผลลัพธ์: **เร็วขึ้น**, **ปลอดภัยขึ้น**, **ง่ายต่อการดูแล** 