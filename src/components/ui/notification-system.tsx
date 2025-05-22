'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'
import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import { cn } from '@src/lib/utils'
import {
  AlertTriangle,
  Award,
  Bell,
  Check,
  ChevronRight,
  Gift,
  Info,
  MessageCircle,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
} from 'lucide-react'

// Notification Types
export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'achievement'
  | 'levelUp'
  | 'reward'
  | 'quest'
  | 'message'
  | 'social'
  | 'system'

// Notification Object Structure
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // in milliseconds
  isRead?: boolean
  timestamp?: Date
  avatar?: string
  action?: {
    label: string
    onClick: () => void
  }
  data?: any // Additional data specific to notification type
}

// Context for notification system
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
  ) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

// Hooks for using notification system
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    )
  }
  return context
}

// Main Provider Component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Notification[]>([])

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Add a new notification
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
  ) => {
    // Generate random ID with Math.random
    const id = Math.random().toString(36).substring(2, 11)
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      isRead: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // If it has a duration, also add it to toasts
    if (notification.duration !== undefined) {
      setToasts((prev) => [newNotification, ...prev])

      // Remove toast after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, notification.duration)
    }

    return id
  }

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
    setToasts([])
  }

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        removeToast={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </NotificationContext.Provider>
  )
}

// Helper function to get icon by notification type
const getNotificationIcon = (type: NotificationType, className = 'h-5 w-5') => {
  switch (type) {
    case 'success':
      return <Check className={cn(className, 'text-green-400')} />
    case 'error':
      return <X className={cn(className, 'text-red-400')} />
    case 'warning':
      return <AlertTriangle className={cn(className, 'text-yellow-400')} />
    case 'info':
      return <Info className={cn(className, 'text-blue-400')} />
    case 'achievement':
      return <Trophy className={cn(className, 'text-amber-400')} />
    case 'levelUp':
      return <Zap className={cn(className, 'text-purple-400')} />
    case 'reward':
      return <Gift className={cn(className, 'text-cyan-400')} />
    case 'quest':
      return <Star className={cn(className, 'text-yellow-400')} />
    case 'message':
      return <MessageCircle className={cn(className, 'text-green-400')} />
    case 'social':
      return <Award className={cn(className, 'text-pink-400')} />
    case 'system':
      return <Bell className={cn(className, 'text-blue-400')} />
    default:
      return <Bell className={cn(className, 'text-muted-foreground')} />
  }
}

// Helper function to get background color by notification type
const getNotificationBgColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10'
    case 'error':
      return 'bg-red-500/10'
    case 'warning':
      return 'bg-yellow-500/10'
    case 'info':
      return 'bg-blue-500/10'
    case 'achievement':
      return 'bg-amber-500/10'
    case 'levelUp':
      return 'bg-purple-500/10'
    case 'reward':
      return 'bg-cyan-500/10'
    case 'quest':
      return 'bg-yellow-500/10'
    case 'message':
      return 'bg-green-500/10'
    case 'social':
      return 'bg-pink-500/10'
    case 'system':
      return 'bg-blue-500/10'
    default:
      return 'bg-secondary/10'
  }
}

// Helper function to get badge color by notification type
const getBadgeColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
    case 'error':
      return 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
    case 'info':
      return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
    case 'achievement':
      return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
    case 'levelUp':
      return 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
    case 'reward':
      return 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
    case 'quest':
      return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
    case 'message':
      return 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
    case 'social':
      return 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
    case 'system':
      return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
    default:
      return ''
  }
}

// Format timestamp for display
const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Time differences in milliseconds
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24

  if (diff < minute) {
    return 'Just now'
  } else if (diff < hour) {
    const mins = Math.floor(diff / minute)
    return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (diff < day * 7) {
    const days = Math.floor(diff / day)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Toast Container Component (basic version, no framer-motion)
const ToastContainer: React.FC<{
  toasts: Notification[]
  removeToast: (id: string) => void
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Card className={cn('w-full', getNotificationBgColor(toast.type))}>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getNotificationIcon(toast.type)}
                </div>

                <div className="flex-1 mr-2">
                  <div className="font-medium">{toast.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {toast.message}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeToast(toast.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {toast.action && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      toast.action?.onClick()
                      removeToast(toast.id)
                    }}>
                    {toast.action.label}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

// Individual notification card item
export const NotificationCard: React.FC<{
  notification: Notification
  onRead?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (notification: Notification) => void
  className?: string
}> = ({ notification, onRead, onDelete, onClick, className }) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:bg-secondary/10 cursor-pointer',
        !notification.isRead && 'border-l-4 border-l-blue-500',
        getNotificationBgColor(notification.type),
        className
      )}
      onClick={() => {
        if (onClick) onClick(notification)
        if (onRead) onRead(notification.id)
      }}>
      <CardContent className="p-4">
        <div className="flex">
          {notification.avatar ? (
            <Avatar className="h-9 w-9 mr-3">
              <AvatarImage src={notification.avatar} alt="Avatar" />
              <AvatarFallback>
                {notification.avatar.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center mr-3',
                getNotificationBgColor(notification.type)
              )}>
              {getNotificationIcon(notification.type)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="font-medium flex items-center">
                {notification.title}
                <Badge
                  className={cn(
                    'ml-2 text-xs',
                    getBadgeColor(notification.type)
                  )}>
                  {notification.type}
                </Badge>
              </div>

              {notification.timestamp && (
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(notification.timestamp)}
                </div>
              )}
            </div>

            <div className="text-sm mt-1">{notification.message}</div>

            {notification.action && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    notification.action?.onClick()
                    if (onRead) onRead(notification.id)
                  }}>
                  {notification.action.label}
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-2 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Notification Bell with Counter
export const NotificationBell: React.FC<{
  onClick: () => void
  count?: number
  className?: string
}> = ({ onClick, count = 0, className }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      onClick={onClick}>
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center h-4 min-w-4 px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  )
}

// LevelUp Notification Animation Component
export const LevelUpNotification: React.FC<{
  level: number
  isVisible: boolean
  onClose: () => void
}> = ({ level, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  // Remove framer-motion for this basic version if desired, but keeping as is for now
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="text-center">
        <div className="mb-4">
          <Sparkles className="h-24 w-24 mx-auto text-yellow-400" />
        </div>

        <h2 className="text-4xl font-bold mb-2 ai-gradient-text">Level Up!</h2>

        <div className="text-xl mb-6">You've reached level {level}</div>

        <p className="text-muted-foreground mb-8">
          New quests and rewards are now available!
        </p>

        <div>
          <Button className="ai-gradient-bg" onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

// Achievement Unlocked Animation Component
export const AchievementUnlockedNotification: React.FC<{
  achievement: {
    name: string
    description: string
    icon: React.ReactNode
    reward?: string
  }
  isVisible: boolean
  onClose: () => void
}> = ({ achievement, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  // Remove framer-motion for this basic version if desired, but keeping as is for now
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="text-center bg-card p-8 rounded-xl shadow-lg border border-primary/20 max-w-md">
        <div className="mb-4 w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
          {achievement.icon}
        </div>

        <div className="space-y-2 mb-6">
          <Badge className="bg-amber-500/20 text-amber-400">
            Achievement Unlocked
          </Badge>
          <h2 className="text-2xl font-bold">{achievement.name}</h2>
          <p className="text-muted-foreground">{achievement.description}</p>
        </div>

        {achievement.reward && (
          <div className="mb-6 p-3 bg-secondary/20 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              <Gift className="h-4 w-4 mr-1 text-purple-400" />
              <span className="font-medium">Reward</span>
            </div>
            <div className="text-sm">{achievement.reward}</div>
          </div>
        )}

        <div>
          <Button className="ai-gradient-bg" onClick={onClose}>
            Claim Reward
          </Button>
        </div>
      </div>
    </div>
  )
}

// Demo component to showcase various notification types
export const NotificationDemo: React.FC = () => {
  const {
    addNotification,
    notifications,
    markAsRead,
    removeNotification,
    markAllAsRead,
  } = useNotification()
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)

  const demoAchievement = {
    name: 'Sales Champion',
    description: 'Complete 10 high-value sales deals',
    icon: <Trophy className="h-10 w-10 text-amber-400" />,
    reward: "300 Points + 'The Closer' Title",
  }

  const addDemoNotification = (type: NotificationType) => {
    const notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'> =
      {
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
        message: `This is a sample ${type} notification to demonstrate how it looks.`,
        duration: 5000, // Show as toast for 5 seconds
        action: {
          label: 'View Details',
          onClick: () => console.log(`${type} notification action clicked`),
        },
      }

    // Customize based on type
    switch (type) {
      case 'levelUp':
        notificationData.title = 'Level Up!'
        notificationData.message = "Congratulations! You've reached level 10!"
        break
      case 'achievement':
        notificationData.title = 'Achievement Unlocked'
        notificationData.message =
          'Sales Champion: Complete 10 high-value sales deals'
        break
      case 'quest':
        notificationData.title = 'Quest Completed'
        notificationData.message =
          "You've successfully completed 'Master Negotiator' quest"
        break
      case 'reward':
        notificationData.title = 'Reward Available'
        notificationData.message =
          "You've earned 250 points! Check the reward shop for new items."
        break
      case 'social':
        notificationData.title = 'New Comment'
        notificationData.message =
          'Sarah Kim commented on your recent achievement'
        notificationData.avatar =
          'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah'
        break
      case 'message':
        notificationData.title = 'New Message'
        notificationData.message =
          'Juan Rodriguez: Hey, can you help me with the quarterly report?'
        notificationData.avatar =
          'https://api.dicebear.com/7.x/adventurer/svg?seed=Juan'
        break
    }

    addNotification(notificationData)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Button onClick={() => addDemoNotification('success')}>Success</Button>
        <Button onClick={() => addDemoNotification('error')}>Error</Button>
        <Button onClick={() => addDemoNotification('warning')}>Warning</Button>
        <Button onClick={() => addDemoNotification('info')}>Info</Button>
        <Button onClick={() => addDemoNotification('quest')}>Quest</Button>
        <Button onClick={() => addDemoNotification('reward')}>Reward</Button>
        <Button onClick={() => addDemoNotification('social')}>Social</Button>
        <Button onClick={() => addDemoNotification('message')}>Message</Button>
        <Button onClick={() => addDemoNotification('system')}>System</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => addDemoNotification('achievement')}
          className="bg-amber-500 hover:bg-amber-600 text-white">
          Show Achievement Notification
        </Button>

        <Button
          onClick={() => addDemoNotification('levelUp')}
          className="bg-purple-500 hover:bg-purple-600 text-white">
          Show Level Up Notification
        </Button>

        <Button
          onClick={() => setShowAchievement(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
          Show Achievement Animation
        </Button>

        <Button
          onClick={() => setShowLevelUp(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
          Show Level Up Animation
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Notifications List Demo</h3>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={removeNotification}
              />
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No notifications yet. Create some using the buttons above.
            </div>
          )}
        </div>
      </div>

      {/* Level Up Animation */}
      <LevelUpNotification
        level={10}
        isVisible={showLevelUp}
        onClose={() => setShowLevelUp(false)}
      />

      {/* Achievement Animation */}
      <AchievementUnlockedNotification
        achievement={demoAchievement}
        isVisible={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </div>
  )
}
