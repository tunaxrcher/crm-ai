import { CheckinRepository } from '../repository'
import { s3UploadService } from '@src/lib/services/s3UploadService'
import type {
  CheckinRequest,
  CheckoutRequest,
  CheckinResponse,
  CheckoutResponse,
  CheckinStatus,
  LocationCheckResult,
  WorkLocation,
} from '../types'

export class CheckinService {
  private static readonly MINIMUM_WORK_HOURS = 8 // ชั่วโมงขั้นต่ำก่อน checkout
  private static readonly EARTH_RADIUS_METERS = 6371000 // รัศมีโลกเป็นเมตร

  // คำนวณระยะทางระหว่าง 2 จุดด้วยสูตร Haversine
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return this.EARTH_RADIUS_METERS * c
  }

  // ตรวจสอบว่าอยู่ในพื้นที่ทำงานหรือไม่
  static async checkLocation(
    userLat: number,
    userLng: number
  ): Promise<LocationCheckResult> {
    const workLocations = await CheckinRepository.getActiveWorkLocations()
    
    let nearestLocation: WorkLocation | null = null
    let minDistance: number | null = null
    let isInWorkLocation = false

    for (const location of workLocations) {
      const distance = this.calculateDistance(
        userLat,
        userLng,
        location.latitude,
        location.longitude
      )

      // ตรวจสอบว่าอยู่ในรัศมีของสถานที่ทำงานหรือไม่
      if (distance <= location.radius) {
        isInWorkLocation = true
        nearestLocation = location
        minDistance = distance
        break
      }

      // หาสถานที่ที่ใกล้ที่สุด
      if (minDistance === null || distance < minDistance) {
        minDistance = distance
        nearestLocation = location
      }
    }

    return {
      isInWorkLocation,
      nearestLocation,
      distance: minDistance,
      userLat,
      userLng,
    }
  }

  // ดึงสถานะ checkin ปัจจุบัน
  static async getCheckinStatus(userId: number): Promise<CheckinStatus> {
    const activeCheckin = await CheckinRepository.getActiveCheckin(userId)
    
    let canCheckout = false
    let workingHours: number | null = null

    if (activeCheckin) {
      // คำนวณชั่วโมงการทำงาน
      const now = new Date()
      const checkinTime = new Date(activeCheckin.checkinAt)
      const diffMs = now.getTime() - checkinTime.getTime()
      workingHours = diffMs / (1000 * 60 * 60) // แปลงเป็นชั่วโมง

      // ตรวจสอบว่าทำงานครบ 8 ชั่วโมงหรือยัง
      canCheckout = workingHours >= this.MINIMUM_WORK_HOURS
    }

    return {
      hasActiveCheckin: !!activeCheckin,
      currentCheckin: activeCheckin,
      canCheckout,
      workingHours,
      minimumHoursRequired: this.MINIMUM_WORK_HOURS,
    }
  }

  // Checkin
  static async checkin(
    userId: number,
    request: CheckinRequest
  ): Promise<CheckinResponse> {
    try {
      // ตรวจสอบว่ามี active checkin อยู่หรือไม่
      const activeCheckin = await CheckinRepository.getActiveCheckin(userId)
      if (activeCheckin) {
        return {
          success: false,
          message: 'คุณมีการ check-in ที่ยังไม่ได้ check-out อยู่',
        }
      }

      // อัพโหลดรูปภาพ
      const photoBuffer = Buffer.from(request.photoBase64, 'base64')
      const photoResult = await s3UploadService.uploadBuffer(
        photoBuffer,
        `${userId}-${Date.now()}.jpg`,
        'image/jpeg',
        'checkin'
      )

      // สร้าง checkin
      const checkin = await CheckinRepository.createCheckin({
        userId,
        workLocationId: request.workLocationId,
        checkinPhotoUrl: photoResult.url,
        checkinLat: request.lat,
        checkinLng: request.lng,
        checkinType: request.checkinType,
        notes: request.notes,
      })

      return {
        success: true,
        message: 'Check-in สำเร็จ',
        data: checkin,
      }
    } catch (error) {
      console.error('Checkin error:', error)
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการ check-in',
      }
    }
  }

  // Checkout
  static async checkout(
    userId: number,
    request: CheckoutRequest
  ): Promise<CheckoutResponse> {
    try {
      // ตรวจสอบ active checkin
      const activeCheckin = await CheckinRepository.getActiveCheckin(userId)
      if (!activeCheckin) {
        return {
          success: false,
          message: 'ไม่พบการ check-in ที่ยังไม่ได้ check-out',
        }
      }

      // คำนวณชั่วโมงการทำงาน
      const now = new Date()
      const checkinTime = new Date(activeCheckin.checkinAt)
      const diffMs = now.getTime() - checkinTime.getTime()
      const workingHours = diffMs / (1000 * 60 * 60)

      // ตรวจสอบชั่วโมงขั้นต่ำ
      if (workingHours < this.MINIMUM_WORK_HOURS) {
        const remainingHours = this.MINIMUM_WORK_HOURS - workingHours
        return {
          success: false,
          message: `ยังไม่สามารถ check-out ได้ ต้องทำงานอีก ${remainingHours.toFixed(
            1
          )} ชั่วโมง`,
        }
      }

      // อัพโหลดรูปภาพ
      const photoBuffer = Buffer.from(request.photoBase64, 'base64')
      const photoResult = await s3UploadService.uploadBuffer(
        photoBuffer,
        `${userId}-${Date.now()}.jpg`,
        'image/jpeg',
        'checkout'
      )

      // อัพเดท checkout
      const checkout = await CheckinRepository.updateCheckout(activeCheckin.id, {
        checkoutPhotoUrl: photoResult.url,
        checkoutLat: request.lat,
        checkoutLng: request.lng,
        totalHours: workingHours,
        notes: request.notes,
      })

      return {
        success: true,
        message: `Check-out สำเร็จ (ทำงาน ${workingHours.toFixed(1)} ชั่วโมง)`,
        data: checkout,
      }
    } catch (error) {
      console.error('Checkout error:', error)
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการ check-out',
      }
    }
  }

  // ดึงประวัติ checkin/checkout
  static async getHistory(userId: number, limit: number = 30) {
    return await CheckinRepository.getCheckinHistory(userId, limit)
  }

  // ดึง checkin/checkout ของวันนี้
  static async getTodayCheckins(userId: number) {
    return await CheckinRepository.getTodayCheckins(userId)
  }

  // ดึงสถานที่ทำงานทั้งหมด
  static async getWorkLocations() {
    return await CheckinRepository.getActiveWorkLocations()
  }
} 