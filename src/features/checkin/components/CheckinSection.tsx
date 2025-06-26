'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription } from '@src/components/ui/alert'
import { Button } from '@src/components/ui/button'
import { Card } from '@src/components/ui/card'
import { Textarea } from '@src/components/ui/textarea'
import {
  AlertCircle,
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Navigation,
} from 'lucide-react'

import {
  useCheckLocation,
  useCheckin,
  useTodayCheckins,
  useWorkLocations,
} from '../hooks/api'
import type { CheckinStatus } from '../types'

interface CheckinSectionProps {
  status: CheckinStatus | undefined
}

export function CheckinSection({ status }: CheckinSectionProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [offsiteReason, setOffsiteReason] = useState('')
  const [hasProvidedReason, setHasProvidedReason] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const offsiteReasonRef = useRef<HTMLTextAreaElement>(null)

  const { data: workLocations } = useWorkLocations()
  const checkLocation = useCheckLocation()
  const checkin = useCheckin()
  const { data: todayCheckins } = useTodayCheckins()

  // Check if in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'

  // คำนวณ step ที่จะแสดง
  const isLocationChecked = location && checkLocation.data
  const isOffsite = checkLocation.data && !checkLocation.data.isInWorkLocation
  const canShowPhotoStep =
    isLocationChecked && (!isOffsite || hasProvidedReason)

  useEffect(() => {
    if (isOffsite && !hasProvidedReason && offsiteReasonRef.current) {
      offsiteReasonRef.current.focus()
    }
  }, [isOffsite, hasProvidedReason])

  // ตรวจสอบว่า checkin และ checkout วันนี้แล้วหรือยัง
  const completedToday = todayCheckins?.find((c) => c.checkoutAt !== null)
  if (completedToday) {
    return (
      <Card className="p-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                คุณได้ทำการ Check-in และ Check-out วันนี้แล้ว
              </p>
              <div className="text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Check-in:{' '}
                  {new Date(completedToday.checkinAt).toLocaleTimeString(
                    'th-TH'
                  )}
                  {completedToday.checkinType === 'offsite' && ' (นอกสถานที่)'}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Check-out:{' '}
                  {completedToday.checkoutAt &&
                    new Date(completedToday.checkoutAt).toLocaleTimeString(
                      'th-TH'
                    )}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  ระยะเวลาทำงาน: {completedToday.totalHours?.toFixed(1)} ชั่วโมง
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  // ตรวจสอบว่า checkin แล้วหรือยัง
  if (status?.hasActiveCheckin) {
    return (
      <Card className="p-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            คุณได้ Check-in แล้วเมื่อเวลา{' '}
            {status.currentCheckin &&
              new Date(status.currentCheckin.checkinAt).toLocaleTimeString(
                'th-TH'
              )}
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  // Get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })

        // Check location
        await checkLocation.mutateAsync({ lat: latitude, lng: longitude })
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Location error:', error)
        alert(
          'ไม่สามารถระบุตำแหน่งได้ กรุณาเปิด GPS และอนุญาตการเข้าถึงตำแหน่ง'
        )
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
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
      stream.getTracks().forEach((track) => track.stop())
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

  // Handle checkin
  const handleCheckin = async () => {
    if (!location || !photoData) {
      alert('กรุณาระบุตำแหน่งและถ่ายรูปก่อน Check-in')
      return
    }

    if (!checkLocation.data) {
      alert('กรุณาตรวจสอบตำแหน่งก่อน Check-in')
      return
    }

    try {
      // รวม notes จากการอยู่นอกสถานที่กับ notes ทั่วไป
      const finalNotes = isOffsite
        ? `เหตุผลที่อยู่นอกสถานที่: ${offsiteReason}${notes ? `\n\nหมายเหตุเพิ่มเติม: ${notes}` : ''}`
        : notes

      const result = await checkin.mutateAsync({
        lat: location.lat,
        lng: location.lng,
        photoBase64: photoData.split(',')[1], // Remove data:image/jpeg;base64,
        checkinType: checkLocation.data.isInWorkLocation ? 'onsite' : 'offsite',
        workLocationId: checkLocation.data.nearestLocation?.id,
        notes: finalNotes || undefined,
      })

      if (result.success) {
        alert('Check-in สำเร็จ!')
        // Reset form
        setLocation(null)
        setPhotoData(null)
        setNotes('')
        setOffsiteReason('')
        setHasProvidedReason(false)
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการ Check-in')
      }
    } catch (error) {
      console.error('Checkin error:', error)
      alert('เกิดข้อผิดพลาดในการ Check-in')
    }
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Location */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              ขั้นตอนที่ 1: ตรวจสอบตำแหน่ง
            </h3>
            {location && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>

          <Button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full">
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังระบุตำแหน่ง...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                ระบุตำแหน่งปัจจุบัน
              </>
            )}
          </Button>

          {/* Location Result */}
          {checkLocation.data && (
            <Alert className={checkLocation.data.isInWorkLocation ? '' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {checkLocation.data.isInWorkLocation ? (
                  <>
                    คุณอยู่ในพื้นที่ทำงาน:{' '}
                    {checkLocation.data.nearestLocation?.name}
                    <br />
                    ระยะห่าง: {checkLocation.data.distance?.toFixed(0)} เมตร
                  </>
                ) : (
                  <>
                    คุณอยู่นอกพื้นที่ทำงาน
                    <br />
                    สถานที่ทำงานที่ใกล้ที่สุด:{' '}
                    {checkLocation.data.nearestLocation?.name}
                    <br />
                    ระยะห่าง: {checkLocation.data.distance?.toFixed(0)} เมตร
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Offsite Reason - แสดงเฉพาะเมื่อตรวจสอบตำแหน่งแล้วและอยู่นอกสถานที่ */}
      {isOffsite && !hasProvidedReason && (
        <Card className="p-6 ">
          <div className="space-y-4">
            <h3 className="font-semibold text-orange-700">
              กรุณาระบุเหตุผลที่เช็คอินนอกสถานที่
            </h3>
            <Textarea
              ref={offsiteReasonRef}
              placeholder="ระบุเหตุผล เช่น ทำงานที่บ้าน, ไปพบลูกค้า, ติดภารกิจ..."
              value={offsiteReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setOffsiteReason(e.target.value)
              }
              rows={3}
              className=" focus:border-warning-400"
            />
            <Button
              onClick={() => setHasProvidedReason(true)}
              disabled={!offsiteReason.trim()}
              className="w-full">
              ถัดไป
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Take Photo - แสดงเมื่อผ่านขั้นตอนแรกแล้ว */}
      {canShowPhotoStep && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                ขั้นตอนที่ 2: ถ่ายรูป
              </h3>
              {photoData && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>

            {!photoData && !isCameraActive && (
              <Button onClick={startCamera} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                เปิดกล้อง
              </Button>
            )}

            {/* Dev mode: Skip photo button */}
            {isDevelopment && !photoData && !isCameraActive && (
              <div className="mt-2 space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Development Mode
                </div>
                <Button
                  onClick={() => {
                    // Use placeholder image for development
                    const placeholderDataUrl =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjY2NjYyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkRldiAtIFBsYWNlaG9sZGVyIEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                    setPhotoData(placeholderDataUrl)
                  }}
                  variant="outline"
                  className="w-full">
                  ข้ามการถ่ายรูป (Dev Mode)
                </Button>
              </div>
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
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1">
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
                    alt="Check-in photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="w-full">
                  ถ่ายใหม่
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </Card>
      )}

      {/* Step 3: Notes (Optional) - แสดงเมื่อถ่ายรูปแล้ว */}
      {/* {photoData && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold">หมายเหตุเพิ่มเติม (ไม่บังคับ)</h3>
            <Textarea
              placeholder="เพิ่มหมายเหตุ..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
              rows={3}
            />
          </div>
        </Card>
      )} */}

      {/* Submit Button - แสดงเมื่อทำครบทุกขั้นตอนแล้ว */}
      {photoData && (
        <Button
          onClick={handleCheckin}
          disabled={!location || !photoData || checkin.isPending}
          size="lg"
          className="w-full">
          {checkin.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังเช็คอิน...
            </>
          ) : (
            'ยืนยันเช็คอิน'
          )}
        </Button>
      )}
    </div>
  )
}
