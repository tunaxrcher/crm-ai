// src/components/NotificationQueueDebug.tsx
'use client'

import { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import { notificationQueue } from '@src/lib/notificationQueue'

// src/components/NotificationQueueDebug.tsx

// src/components/NotificationQueueDebug.tsx

// src/components/NotificationQueueDebug.tsx

// src/components/NotificationQueueDebug.tsx

// src/components/NotificationQueueDebug.tsx

export default function NotificationQueueDebug() {
  const [status, setStatus] = useState(notificationQueue.getStatus())

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(notificationQueue.getStatus())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Notification Queue Status</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <div>Queue Length: {status.queueLength}</div>
        <div>Processing: {status.isProcessing ? 'Yes' : 'No'}</div>
        <div>Current: {status.currentNotification || 'None'}</div>
      </CardContent>
    </Card>
  )
}
