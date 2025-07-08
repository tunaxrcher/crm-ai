import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email?: string
  character?: any
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // UI state
  isLoading: boolean
  errors: Record<string, string>
  notifications: {
    show: boolean
    count: number
  }
  
  // App settings
  theme: 'light' | 'dark'
  language: 'th' | 'en'
  
  // Connection state
  isOnline: boolean
  lastSyncTime: number | null
}

interface AppActions {
  // User actions
  setUser: (user: User | null) => void
  setAuthenticated: (isAuth: boolean) => void
  
  // UI actions
  setLoading: (loading: boolean) => void
  setError: (key: string, error: string) => void
  clearError: (key: string) => void
  clearAllErrors: () => void
  
  // Notification actions
  setNotificationCount: (count: number) => void
  toggleNotificationPanel: () => void
  
  // App settings
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: 'th' | 'en') => void
  
  // Connection actions
  setOnlineStatus: (online: boolean) => void
  updateSyncTime: () => void
  
  // Reset actions
  reset: () => void
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  errors: {},
  notifications: {
    show: false,
    count: 0,
  },
  theme: 'light',
  language: 'th',
  isOnline: true,
  lastSyncTime: null,
}

export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // User actions
      setUser: (user) =>
        set((state) => {
          state.user = user
          state.isAuthenticated = user !== null
        }),

      setAuthenticated: (isAuth) =>
        set((state) => {
          state.isAuthenticated = isAuth
          if (!isAuth) {
            state.user = null
          }
        }),

      // UI actions
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (key, error) =>
        set((state) => {
          state.errors[key] = error
        }),

      clearError: (key) =>
        set((state) => {
          delete state.errors[key]
        }),

      clearAllErrors: () =>
        set((state) => {
          state.errors = {}
        }),

      // Notification actions
      setNotificationCount: (count) =>
        set((state) => {
          state.notifications.count = count
        }),

      toggleNotificationPanel: () =>
        set((state) => {
          state.notifications.show = !state.notifications.show
        }),

      // App settings actions
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
        }),

      setLanguage: (lang) =>
        set((state) => {
          state.language = lang
        }),

      // Connection actions
      setOnlineStatus: (online) =>
        set((state) => {
          state.isOnline = online
        }),

      updateSyncTime: () =>
        set((state) => {
          state.lastSyncTime = Date.now()
        }),

      // Reset
      reset: () => set(initialState),
    }))
  )
)

// Selectors สำหรับ performance optimization
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useNotificationCount = () => useAppStore((state) => state.notifications.count)
export const useAppLoading = () => useAppStore((state) => state.isLoading)
export const useAppErrors = () => useAppStore((state) => state.errors)
export const useAppTheme = () => useAppStore((state) => state.theme)
export const useConnectionStatus = () => useAppStore((state) => state.isOnline) 