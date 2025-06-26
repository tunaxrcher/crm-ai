'use client'

import { Badge } from '@src/components/ui/badge'
import { Card } from '@src/components/ui/card'
import { Skeleton } from '@src/components/ui/skeleton'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { AlertCircle, Calendar, Camera, Clock, MapPin } from 'lucide-react'

import { useCheckinHistory } from '../hooks/api'

export function CheckinHistory() {
  const { data: history, isLoading, error } = useCheckinHistory(30)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดประวัติ</p>
      </Card>
    )
  }

  if (!history || history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          ยังไม่มีประวัติการ Check-in/Check-out
        </p>
      </Card>
    )
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'EEEE d MMMM yyyy', { locale: th })
  }

  const formatTime = (date: string | Date) => {
    return format(new Date(date), 'HH:mm', { locale: th })
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h} ชั่วโมง ${m} นาที`
  }

  const getLateStatusBadge = (
    lateLevel: number | null,
    lateMinutes: number | null
  ) => {
    if (lateLevel === null || lateLevel === 0) {
      return (
        <Badge variant="default" className="bg-green-500">
          ตรงเวลา
        </Badge>
      )
    }

    const variants = [
      'default',
      'secondary',
      'default',
      'destructive',
      'destructive',
    ] as const
    const labels = [
      '',
      `สาย ${lateMinutes} นาที`,
      `สาย ${lateMinutes} นาที`,
      `สาย ${lateMinutes} นาที`,
      `สาย ${lateMinutes} นาที`,
    ]

    return <Badge variant={variants[lateLevel]}>{labels[lateLevel]}</Badge>
  }

  const getLateDescription = (lateLevel: number | null) => {
    if (lateLevel === null || lateLevel === 0) return null

    const descriptions = [
      '',
      'เตือนเบื้องต้น',
      'ถูกตัดคะแนน',
      'ผิดวินัยเบา',
      'ผิดวินัยร้ายแรง',
    ]

    return descriptions[lateLevel]
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <Card key={record.id} className="p-6">
          <div className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatDate(record.checkinAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    record.checkinType === 'onsite' ? 'default' : 'secondary'
                  }>
                  {record.checkinType === 'onsite' ? 'ในสถานที่' : 'นอกสถานที่'}
                </Badge>
                {getLateStatusBadge(record.lateLevel, record.lateMinutes)}
              </div>
            </div>

            {/* Late Warning */}
            {record.lateLevel && record.lateLevel > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">
                    {getLateDescription(record.lateLevel)}
                  </p>
                  {record.lateLevel >= 4 && (
                    <p className="text-orange-700 mt-1">
                      กรุณาชี้แจงเหตุผลการมาสายกับหัวหน้างาน
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Time Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Check-in */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTime(record.checkinAt)}
                </p>
              </div>

              {/* Check-out */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Check-out</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {record.checkoutAt ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatTime(record.checkoutAt)}
                      </span>
                      {record.notes?.includes('[AUTO CHECKOUT]') && (
                        <Badge variant="secondary" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      ลืม Checkout
                    </Badge>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ระยะเวลา</p>
                <p className="font-medium">
                  {record.totalHours ? formatDuration(record.totalHours) : '-'}
                </p>
              </div>
            </div>

            {/* Location */}
            {record.workLocation && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {record.workLocation.name}
                </span>
              </div>
            )}

            {/* Photos */}
            <div className="grid grid-cols-2 gap-4">
              {record.checkinPhotoUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    รูป Check-in
                  </p>
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={record.checkinPhotoUrl}
                      alt="Check-in"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {record.checkoutPhotoUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    รูป Check-out
                  </p>
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={record.checkoutPhotoUrl}
                      alt="Check-out"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                <p className="text-sm mt-1">
                  {record.notes
                    .replace('[AUTO CHECKOUT] ', '')
                    .replace('[AUTO CHECKOUT]', '')}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
