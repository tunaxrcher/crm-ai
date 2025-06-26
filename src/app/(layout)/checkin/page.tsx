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
import { CheckinHistory } from '@src/features/checkin/components/CheckinHistory'
import { CheckinSection } from '@src/features/checkin/components/CheckinSection'
import { CheckoutSection } from '@src/features/checkin/components/CheckoutSection'
import { useCheckinStatus } from '@src/features/checkin/hooks/api'
import { CheckCircle2, Clock, LogOut, MapPin } from 'lucide-react'

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

      <div className="mb-6">
        <h1 className="text-2xl font-bold ai-gradient-text">
          ระบบ เช็คอิน/เช็คเอ้าท์
        </h1>
        <p className="text-muted-foreground">บันทึกเวลาเข้า-ออกงานของคุณ</p>
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

      {/* Status Card */}
      {status && status.hasActiveCheckin && status.currentCheckin && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">สถานะปัจจุบัน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">เวลา Check-in</p>
                <p className="font-medium">
                  {new Date(status.currentCheckin.checkinAt).toLocaleTimeString(
                    'th-TH'
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ระยะเวลาทำงาน</p>
                <p className="font-medium">
                  {status.workingHours
                    ? `${status.workingHours.toFixed(1)} ชั่วโมง`
                    : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">สถานที่</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {status.currentCheckin.checkinType === 'onsite'
                    ? status.currentCheckin.workLocation?.name ||
                      'ในสถานที่ทำงาน'
                    : 'นอกสถานที่ทำงาน'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="checkin" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkin">
            <CheckCircle2 className="h-4 w-4 mr-2" /> เช็คอิน
          </TabsTrigger>
          <TabsTrigger value="checkout">
            <LogOut className="h-4 w-4 mr-2" /> เช็คเอ้าท์
          </TabsTrigger>
          <TabsTrigger value="history">ประวัติ</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <CheckinSection status={status} />
        </TabsContent>

        <TabsContent value="checkout">
          <CheckoutSection status={status} />
        </TabsContent>

        <TabsContent value="history">
          <CheckinHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
