'use client'

import { useState, useRef } from 'react'
import { Card } from '@src/components/ui/card'
import { Button } from '@src/components/ui/button'
import { Alert, AlertDescription } from '@src/components/ui/alert'
import { Textarea } from '@src/components/ui/textarea'
import { useCheckout } from '../hooks/api'
import type { CheckinStatus } from '../types'
import { 
  LogOut,
  Camera, 
  Loader2, 
  AlertCircle,
  Clock,
  MapPin
} from 'lucide-react'

interface CheckoutSectionProps {
  status: CheckinStatus | undefined
}

export function CheckoutSection({ status }: CheckoutSectionProps) {
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  const checkout = useCheckout()

  // ตรวจสอบว่ายังไม่ได้ checkin
  if (!status?.hasActiveCheckin || !status.currentCheckin) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            คุณยังไม่ได้ Check-in กรุณา Check-in ก่อน
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  // ตรวจสอบว่าทำงานครบ 8 ชั่วโมงหรือยัง
  const canCheckout = status.canCheckout
  const workingHours = status.workingHours || 0
  const remainingHours = status.minimumHoursRequired - workingHours

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      
      setStream(mediaStream)
      setIsCameraActive(true)
    } catch (error) {
      console.error('Camera error:', error)
      alert('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  // Take photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setPhotoData(dataUrl)
        stopCamera()
      }
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setPhotoData(null)
    startCamera()
  }

  // Get current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (!photoData) {
      alert('กรุณาถ่ายรูปก่อน Check-out')
      return
    }

    try {
      // Get current location
      const location = await getCurrentLocation()
      
      const result = await checkout.mutateAsync({
        lat: location.lat,
        lng: location.lng,
        photoBase64: photoData.split(',')[1], // Remove data:image/jpeg;base64,
        notes: notes || undefined
      })

      if (result.success) {
        alert('Check-out สำเร็จ!')
        // Reset form
        setPhotoData(null)
        setNotes('')
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการ Check-out')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('เกิดข้อผิดพลาดในการ Check-out')
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">ข้อมูลการ Check-in</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                เวลา Check-in
              </p>
              <p className="font-medium">
                {new Date(status.currentCheckin.checkinAt).toLocaleTimeString('th-TH')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                สถานที่
              </p>
              <p className="font-medium">
                {status.currentCheckin.checkinType === 'onsite' 
                  ? status.currentCheckin.workLocation?.name || 'ในสถานที่ทำงาน'
                  : 'นอกสถานที่ทำงาน'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Working Hours Alert */}
      {!canCheckout && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            คุณทำงานมาแล้ว {workingHours.toFixed(1)} ชั่วโมง
            <br />
            ต้องทำงานอีก {remainingHours.toFixed(1)} ชั่วโมง จึงจะสามารถ Check-out ได้
          </AlertDescription>
        </Alert>
      )}

      {canCheckout && (
        <Alert className="border-green-200 bg-green-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            คุณทำงานครบ {status.minimumHoursRequired} ชั่วโมงแล้ว สามารถ Check-out ได้
          </AlertDescription>
        </Alert>
      )}

      {/* Take Photo */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" />
            ถ่ายรูปก่อน Check-out
          </h3>

          {!photoData && !isCameraActive && (
            <Button 
              onClick={startCamera} 
              className="w-full"
              disabled={!canCheckout}
            >
              <Camera className="mr-2 h-4 w-4" />
              เปิดกล้อง
            </Button>
          )}

          {/* Camera View */}
          {isCameraActive && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={takePhoto} className="flex-1">
                  ถ่ายรูป
                </Button>
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  ยกเลิก
                </Button>
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {photoData && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={photoData} 
                  alt="Check-out photo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button onClick={retakePhoto} variant="outline" className="w-full">
                ถ่ายใหม่
              </Button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold">หมายเหตุ (ไม่บังคับ)</h3>
          <Textarea
            placeholder="เพิ่มหมายเหตุ..."
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            rows={3}
            disabled={!canCheckout}
          />
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleCheckout}
        disabled={!canCheckout || !photoData || checkout.isPending}
        size="lg"
        className="w-full"
      >
        {checkout.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลัง Check-out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Check-out
          </>
        )}
      </Button>
    </div>
  )
} 