'use client'

import { Card } from '@src/components/ui/card'
import { Badge } from '@src/components/ui/badge'
import { Skeleton } from '@src/components/ui/skeleton'
import { useCheckinHistory } from '../hooks/api'
import { Calendar, Clock, MapPin, Camera } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

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
        <p className="text-muted-foreground">ยังไม่มีประวัติการ Check-in/Check-out</p>
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
              <Badge variant={record.checkinType === 'onsite' ? 'default' : 'secondary'}>
                {record.checkinType === 'onsite' ? 'ในสถานที่' : 'นอกสถานที่'}
              </Badge>
            </div>

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
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {record.checkoutAt ? formatTime(record.checkoutAt) : '-'}
                </p>
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
                <p className="text-sm mt-1">{record.notes}</p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
} 