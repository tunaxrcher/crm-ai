import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  createdAt: number
  isRead: boolean
}

interface NotificationItem {
  id: number | string
  type: string
  title: string
  message: string
  isRead: boolean
  feedId?: number
  createdAt: string
  data?: any
}

interface NotificationState {
  // Toasts (temporary notifications)
  toasts: Toast[]
  shownNotificationIds: Set<string>
  lastSessionTimestamp: number

  // Persistent notifications
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean

  // UI state
  isNotificationPanelOpen: boolean

  // Settings
  enableToasts: boolean
  maxToasts: number
}

interface NotificationActions {
  // Toast actions
  addToast: (toast: Omit<Toast, 'id' | 'createdAt' | 'isRead'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  markToastAsRead: (id: string) => void

  // Session management
  clearExpiredShownIds: () => void
  markAsShown: (notificationId: string) => void
  hasBeenShown: (notificationId: string) => boolean

  // Persistent notifications
  setNotifications: (notifications: NotificationItem[]) => void
  addNotification: (notification: NotificationItem) => void
  markAsRead: (id: string | number) => void
  markAllAsRead: () => void
  setUnreadCount: (count: number) => void
  setLoading: (loading: boolean) => void

  // UI actions
  toggleNotificationPanel: () => void
  setNotificationPanelOpen: (open: boolean) => void

  // Settings
  setEnableToasts: (enable: boolean) => void
  setMaxToasts: (max: number) => void

  // Optimistic updates
  optimisticLike: (feedId: string, hasLiked: boolean) => void
  optimisticComment: (feedId: string, comment: any) => void

  // Internal
  _initializeStore: () => void

  // Reset
  reset: () => void
}

const initialState: NotificationState = {
  toasts: [],
  shownNotificationIds: new Set(),
  lastSessionTimestamp: Date.now(),
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isNotificationPanelOpen: false,
  enableToasts: true,
  maxToasts: 5,
}

export const useNotificationStore = create<
  NotificationState & NotificationActions
>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Initialize store after rehydration
      _initializeStore: () => {
        const state = get()
        // Convert array back to Set after persistence rehydration
        if (Array.isArray(state.shownNotificationIds)) {
          set((draft) => {
            draft.shownNotificationIds = new Set(
              state.shownNotificationIds as any
            )
          })
        }
        get().clearExpiredShownIds()
      },

      // Toast actions
      addToast: (toastData) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        set((state) => {
          const newToast: Toast = {
            id,
            ...toastData,
            createdAt: Date.now(),
            isRead: false,
          }

          state.toasts.push(newToast)

          // Remove oldest toasts if exceeding max
          if (state.toasts.length > state.maxToasts) {
            state.toasts = state.toasts.slice(-state.maxToasts)
          }
        })

        // Auto remove toast after duration
        if (toastData.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, toastData.duration || 5000)
        }

        return id
      },

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((toast) => toast.id !== id)
        }),

      clearToasts: () =>
        set((state) => {
          state.toasts = []
        }),

      markToastAsRead: (id) =>
        set((state) => {
          const toast = state.toasts.find((t) => t.id === id)
          if (toast) {
            toast.isRead = true
          }
        }),

      // Session management
      clearExpiredShownIds: () =>
        set((state) => {
          const currentTime = Date.now()
          const dayInMs = 24 * 60 * 60 * 1000

          // Clear if more than 24 hours old
          if (currentTime - state.lastSessionTimestamp > dayInMs) {
            state.shownNotificationIds.clear()
            state.lastSessionTimestamp = currentTime
          }
        }),

      markAsShown: (notificationId) =>
        set((state) => {
          state.shownNotificationIds.add(notificationId)
        }),

      hasBeenShown: (notificationId) => {
        const state = get()
        return state.shownNotificationIds.has(notificationId)
      },

      // Persistent notifications
      setNotifications: (notifications) =>
        set((state) => {
          state.notifications = notifications
          state.isLoading = false
        }),

      addNotification: (notification) =>
        set((state) => {
          // Add to beginning (newest first)
          state.notifications.unshift(notification)

          if (!notification.isRead) {
            state.unreadCount += 1
          }
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (notification && !notification.isRead) {
            notification.isRead = true
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach((n) => {
            n.isRead = true
          })
          state.unreadCount = 0
        }),

      setUnreadCount: (count) =>
        set((state) => {
          state.unreadCount = count
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),

      // UI actions
      toggleNotificationPanel: () =>
        set((state) => {
          state.isNotificationPanelOpen = !state.isNotificationPanelOpen
        }),

      setNotificationPanelOpen: (open) =>
        set((state) => {
          state.isNotificationPanelOpen = open
        }),

      // Settings
      setEnableToasts: (enable) =>
        set((state) => {
          state.enableToasts = enable
        }),

      setMaxToasts: (max) =>
        set((state) => {
          state.maxToasts = max
        }),

      // Optimistic updates
      optimisticLike: (feedId, hasLiked) =>
        set((state) => {
          // Create optimistic notification for like
          if (hasLiked) {
            const optimisticNotification: NotificationItem = {
              id: `optimistic-like-${feedId}-${Date.now()}`,
              type: 'like',
              title: 'คุณได้กด Like',
              message: 'กำลังรอการยืนยันจากเซิร์ฟเวอร์...',
              isRead: false,
              feedId: parseInt(feedId),
              createdAt: new Date().toISOString(),
              data: { optimistic: true },
            }

            state.notifications.unshift(optimisticNotification)
          }
        }),

      optimisticComment: (feedId, comment) =>
        set((state) => {
          // Create optimistic notification for comment
          const optimisticNotification: NotificationItem = {
            id: `optimistic-comment-${feedId}-${Date.now()}`,
            type: 'comment',
            title: 'คุณได้แสดงความคิดเห็น',
            message: comment.content || 'กำลังรอการยืนยันจากเซิร์ฟเวอร์...',
            isRead: false,
            feedId: parseInt(feedId),
            createdAt: new Date().toISOString(),
            data: { optimistic: true, comment },
          }

          state.notifications.unshift(optimisticNotification)
        }),

      // Reset
      reset: () => set(initialState),
    })),
    {
      name: 'notification-store',
      partialize: (state) => ({
        // Only persist these fields
        shownNotificationIds: Array.from(state.shownNotificationIds), // Convert Set to Array for persistence
        lastSessionTimestamp: state.lastSessionTimestamp,
        enableToasts: state.enableToasts,
        maxToasts: state.maxToasts,
      }),
    }
  )
)

// Selectors
export const useToasts = () => useNotificationStore((state) => state.toasts)
export const useUnreadCount = () =>
  useNotificationStore((state) => state.unreadCount)
export const useNotifications = () =>
  useNotificationStore((state) => state.notifications)
export const useNotificationPanelOpen = () =>
  useNotificationStore((state) => state.isNotificationPanelOpen)
export const useNotificationLoading = () =>
  useNotificationStore((state) => state.isLoading)
