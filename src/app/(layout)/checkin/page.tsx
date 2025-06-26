'use client'

import { useEffect, useState } from 'react'

import { Card } from '@src/components/ui/card'
import { Skeleton } from '@src/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@src/components/ui/tabs'
import { WorkSettingsDialog } from '@src/features/character/components/WorkSettingsDialog'
import { AutoCheckoutDevTools } from '@src/features/checkin/components/AutoCheckoutDevTools'
import { CheckinHistory } from '@src/features/checkin/components/CheckinHistory'
import { CheckinSection } from '@src/features/checkin/components/CheckinSection'
import { CheckoutSection } from '@src/features/checkin/components/CheckoutSection'
import { useCheckinStatus } from '@src/features/checkin/hooks/api'
import { CheckCircle2, Clock, History, LogOut, Settings } from 'lucide-react'

export default function CheckinPage() {
  const { data: status, isLoading, error } = useCheckinStatus()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 text-center">
          <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold ai-gradient-text">
            ระบบ เช็คอิน/เช็คเอ้าท์
          </h1>
          <p className="text-muted-foreground">บันทึกเวลาเข้า-ออกงานของคุณ</p>
        </div>
        <WorkSettingsDialog>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </WorkSettingsDialog>
      </div>

      {/* Current Time */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">เวลาปัจจุบัน</span>
          </div>
          <span className="text-2xl font-mono font-semibold">
            {currentTime.toLocaleTimeString('th-TH')}
          </span>
        </div>
      </Card>

      {/* Dev Tools - แสดงเฉพาะ dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4">
          <AutoCheckoutDevTools />
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            เช็คอิน
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center gap-2">
            <LogOut className="h-4 w-4 mr-2" /> เช็คเอ้าท์
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            ประวัติ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <CheckinSection status={status} />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <CheckoutSection status={status} />
        </TabsContent>

        <TabsContent value="history">
          <CheckinHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
