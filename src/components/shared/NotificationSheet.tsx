'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@src/components/ui/sheet'
import { Bell, Info, X, Heart, MessageCircle } from 'lucide-react'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@src/features/notifications/hooks/api'

export default function NotificationSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const router = useRouter()
  
  const { data: notificationData, isLoading, refetch, error } = useNotifications(page, 20)
  const { data: unreadCountData, refetch: refetchUnreadCount, error: unreadError } = useUnreadCount()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()

  const notifications = notificationData?.notifications || []
  const unreadCount = unreadCountData?.count || 0

  // Debug logs
  console.log('🔔 NotificationSheet Debug:', {
    isLoading,
    notificationData,
    unreadCountData,
    error,
    unreadError,
    notifications: notifications.length,
    unreadCount
  })

  // Helper to format notification time
  const formatTime = (date: Date | string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffMs = now.getTime() - notificationDate.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'นาที' : 'นาที'} ที่แล้ว`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'ชั่วโมง' : 'ชั่วโมง'} ที่แล้ว`
    } else {
      return `${diffDays} ${diffDays === 1 ? 'วัน' : 'วัน'} ที่แล้ว`
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId)
      // Smart polling จะ handle refetch ให้เอง
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
      // Smart polling จะ handle refetch ให้เอง
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    console.log('🔔 Notification clicked:', notification)
    console.log('📝 Notification data:', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      feedId: notification.feedId,
      isRead: notification.isRead
    })
    
    try {
      // Mark notification as read
      if (!notification.isRead) {
        console.log('📖 Marking notification as read...')
        await handleMarkAsRead(notification.id)
      }

      // Close the notification sheet
      console.log('❌ Closing notification sheet...')
      setIsOpen(false)

      // Redirect to the related feed if feedId exists
      if (notification.feedId) {
        console.log('🔄 Redirecting to feed:', notification.feedId)
        router.push(`/feed/${notification.feedId}`)
      } else {
        console.log('ℹ️ No feedId found in notification, staying on current page')
        console.log('🔍 Available notification fields:', Object.keys(notification))
      }
    } catch (error) {
      console.error('❌ Error handling notification click:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-400" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-400" />
      case 'reply':
        return <MessageCircle className="h-5 w-5 text-green-400" />
      default:
        return <Info className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[90vw] sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between pr-8">
          <SheetTitle>การแจ้งเตือน</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}>
              {markAllAsReadMutation.isPending ? 'กำลังอ่าน...' : 'อ่านทั้งหมด'}
            </Button>
          )}
        </SheetHeader>

        <div className="mt-4 space-y-2 pb-16 max-h-[calc(100vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">กำลังโหลด...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-3 rounded-lg border ${
                  notification.isRead
                    ? 'bg-background border-border'
                    : 'bg-secondary/5 border-primary/10'
                } hover:bg-secondary/10 transition-colors cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>ยังไม่มีการแจ้งเตือน</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
