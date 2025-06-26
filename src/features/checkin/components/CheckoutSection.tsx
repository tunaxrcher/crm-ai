'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@src/components/ui/card'
import { Button } from '@src/components/ui/button'
import { Alert, AlertDescription } from '@src/components/ui/alert'
import { Textarea } from '@src/components/ui/textarea'
import { useCheckout, useCheckLocation } from '../hooks/api'
import type { CheckinStatus } from '../types'
import { 
  LogOut,
  Camera, 
  Loader2, 
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Navigation
} from 'lucide-react'

interface CheckoutSectionProps {
  status: CheckinStatus | undefined
}

type CheckoutStep = 'location' | 'reason' | 'photo' | 'confirm'

export function CheckoutSection({ status }: CheckoutSectionProps) {
  const [step, setStep] = useState<CheckoutStep>('location')
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [offSiteReason, setOffSiteReason] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isInWorkLocation, setIsInWorkLocation] = useState<boolean | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  const checkout = useCheckout()
  const checkLocation = useCheckLocation()

  const isDev = process.env.NODE_ENV === 'development'

  // ตรวจสอบว่ายังไม่ได้ checkin
  if (!status?.hasActiveCheckin || !status.currentCheckin) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            คุณยังไม่ได้ เช็คอิน กรุณา เช็คอิน ก่อน
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  // ตรวจสอบว่าทำงานครบเวลาหรือยัง
  const canCheckout = status.canCheckout
  const workingHours = status.workingHours || 0
  const remainingHours = status.minimumHoursRequired - workingHours

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

  // Check location step
  const handleCheckLocation = async () => {
    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      
      // Check if in work location
      const result = await checkLocation.mutateAsync({
        lat: location.lat,
        lng: location.lng
      })

      setIsInWorkLocation(result.isInWorkLocation)
      
      if (result.isInWorkLocation) {
        // ถ้าอยู่ในพื้นที่ ไปขั้นตอนถ่ายรูปเลย
        setStep('photo')
      } else {
        // ถ้าไม่อยู่ในพื้นที่ ให้ระบุเหตุผล
        setStep('reason')
      }
    } catch (error) {
      console.error('Location error:', error)
      alert('ไม่สามารถตรวจสอบตำแหน่งได้ กรุณาเปิด GPS')
    }
  }

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
        setStep('confirm')
      }
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setPhotoData(null)
    startCamera()
  }

  // Skip photo (dev only)
  const skipPhoto = () => {
    // สร้าง dummy photo data
    setPhotoData('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABUP/9k=')
    setStep('confirm')
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (!userLocation) {
      alert('ไม่พบข้อมูลตำแหน่ง')
      return
    }

    if (!isDev && !photoData) {
      alert('กรุณาถ่ายรูปก่อน Check-out')
      return
    }

    try {
      // รวม notes กับ offSiteReason ถ้ามี
      const finalNotes = !isInWorkLocation && offSiteReason 
        ? `[นอกพื้นที่] ${offSiteReason}${notes ? '\n' + notes : ''}`
        : notes

      const result = await checkout.mutateAsync({
        lat: userLocation.lat,
        lng: userLocation.lng,
        photoBase64: photoData ? photoData.split(',')[1] : '', // Remove data:image/jpeg;base64,
        notes: finalNotes || undefined
      })

      if (result.success) {
        alert('Check-out สำเร็จ!')
        // Reset form
        setPhotoData(null)
        setNotes('')
        setOffSiteReason('')
        setStep('location')
        setUserLocation(null)
        setIsInWorkLocation(null)
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการ Check-out')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('เกิดข้อผิดพลาดในการ Check-out')
    }
  }

  // Step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'location', label: 'ตรวจสอบตำแหน่ง' },
      { key: 'photo', label: 'ถ่ายรูป' },
      { key: 'confirm', label: 'ยืนยัน' }
    ]

    return (
      <div className="flex justify-between mb-6">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === s.key || (step === 'reason' && s.key === 'location') 
                ? 'bg-primary text-primary-foreground' 
                : index < steps.findIndex(st => st.key === step)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {index < steps.findIndex(st => st.key === step) ? '✓' : index + 1}
            </div>
            <span className="ml-2 text-sm hidden sm:inline">{s.label}</span>
            {index < steps.length - 1 && (
              <div className="w-8 sm:w-16 h-0.5 bg-gray-200 mx-2" />
            )}
          </div>
        ))}
      </div>
    )
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
        <>
          <Alert className="border-green-200 bg-green-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              คุณทำงานครบ {status.minimumHoursRequired} ชั่วโมงแล้ว สามารถ Check-out ได้
            </AlertDescription>
          </Alert>

          {/* Step Indicator */}
          <Card className="p-6">
            {renderStepIndicator()}

            {/* Step 1: Check Location */}
            {step === 'location' && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  ขั้นตอนที่ 1: ตรวจสอบตำแหน่ง
                </h3>
                <p className="text-sm text-muted-foreground">
                  ระบบจะตรวจสอบว่าคุณอยู่ในพื้นที่ทำงานหรือไม่
                </p>
                <Button 
                  onClick={handleCheckLocation} 
                  className="w-full"
                  disabled={checkLocation.isPending}
                >
                  {checkLocation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังตรวจสอบตำแหน่ง...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      ตรวจสอบตำแหน่ง
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 1.5: Off-site Reason */}
            {step === 'reason' && (
              <div className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    คุณไม่ได้อยู่ในพื้นที่ทำงาน กรุณาระบุเหตุผล
                  </AlertDescription>
                </Alert>
                <h3 className="font-semibold">ระบุเหตุผลที่ Check-out นอกสถานที่</h3>
                <Textarea
                  placeholder="กรุณาระบุเหตุผล เช่น ทำงานนอกสถานที่, ไปประชุมข้างนอก..."
                  value={offSiteReason}
                  onChange={(e) => setOffSiteReason(e.target.value)}
                  rows={3}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep('photo')}
                    disabled={!offSiteReason.trim()}
                    className="flex-1"
                  >
                    ถัดไป
                  </Button>
                  <Button
                    onClick={() => setStep('location')}
                    variant="outline"
                    className="flex-1"
                  >
                    ย้อนกลับ
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Take Photo */}
            {step === 'photo' && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  ขั้นตอนที่ 2: ถ่ายรูป
                </h3>
                
                {isInWorkLocation !== null && (
                  <Alert className={isInWorkLocation ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                    {isInWorkLocation ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <AlertDescription>
                      {isInWorkLocation 
                        ? "คุณอยู่ในพื้นที่ทำงาน"
                        : "คุณอยู่นอกพื้นที่ทำงาน (ได้ระบุเหตุผลแล้ว)"}
                    </AlertDescription>
                  </Alert>
                )}

                {!photoData && !isCameraActive && (
                  <div className="space-y-2">
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="mr-2 h-4 w-4" />
                      เปิดกล้อง
                    </Button>
                    {isDev && (
                      <Button onClick={skipPhoto} variant="outline" className="w-full">
                        ข้ามการถ่ายรูป (Dev Mode)
                      </Button>
                    )}
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
                      <Button onClick={stopCamera} variant="outline" className="flex-1">
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  ขั้นตอนที่ 3: ยืนยันการ Check-out
                </h3>

                {/* Location Status */}
                <Alert className={isInWorkLocation ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    {isInWorkLocation 
                      ? "Check-out ในพื้นที่ทำงาน"
                      : `Check-out นอกพื้นที่: ${offSiteReason}`}
                  </AlertDescription>
                </Alert>

                {/* Photo Preview */}
                {photoData && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">รูปถ่าย Check-out</p>
                    <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photoData} 
                        alt="Check-out photo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button onClick={() => { setStep('photo'); retakePhoto(); }} variant="outline" size="sm" className="w-full">
                      ถ่ายใหม่
                    </Button>
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">หมายเหตุเพิ่มเติม (ไม่บังคับ)</h4>
                  <Textarea
                    placeholder="เพิ่มหมายเหตุ..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={checkout.isPending}
                    className="flex-1"
                  >
                    {checkout.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลัง Check-out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        ยืนยัน Check-out
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setStep('photo')}
                    variant="outline"
                    className="flex-1"
                    disabled={checkout.isPending}
                  >
                    ย้อนกลับ
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
} 