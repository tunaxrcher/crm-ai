import { getServerSession } from '@src/lib/auth'
import { s3UploadService } from '@src/lib/services/s3UploadService'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import { CheckinRepository } from '../repository'
import type {
  CheckinRequest,
  CheckinResponse,
  CheckinStatus,
  CheckoutRequest,
  CheckoutResponse,
  LocationCheckResult,
  WorkLocation,
} from '../types'

export class CheckinService extends BaseService {
  private static instance: CheckinService
  private static readonly MINIMUM_WORK_HOURS = 8 // ชั่วโมงขั้นต่ำก่อน checkout
  private static readonly EARTH_RADIUS_METERS = 6371000 // รัศมีโลกเป็นเมตร

  constructor() {
    super()
  }

  public static getInstance() {
    if (!CheckinService.instance) {
      CheckinService.instance = new CheckinService()
    }

    return CheckinService.instance
  }

  // คำนวณระยะทางระหว่าง 2 จุดด้วยสูตร Haversine
  private calculateDistance(
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

    return CheckinService.EARTH_RADIUS_METERS * c
  }

  // Helper method to parse time string "HH:MM" to date
  private parseWorkTime(
    timeStr: string | null | undefined,
    baseDate: Date
  ): Date | null {
    if (!timeStr) return null
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date(baseDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // ตรวจสอบว่าเป็นกะข้ามวัน (Night Shift) หรือไม่
  private isNightShift(
    workStartTime: string | null | undefined,
    workEndTime: string | null | undefined
  ): boolean {
    if (!workStartTime || !workEndTime) return false

    const [startHour] = workStartTime.split(':').map(Number)
    const [endHour] = workEndTime.split(':').map(Number)

    // ถ้าเวลาเลิกงาน < เวลาเข้างาน แสดงว่าข้ามวัน
    return endHour < startHour
  }

  // คำนวณเวลาเข้างานจริงสำหรับกะข้ามวัน
  private getActualWorkStartTime(
    workStartTime: string,
    checkinDate: Date,
    isNightShift: boolean
  ): Date {
    const workStart = this.parseWorkTime(workStartTime, checkinDate)
    if (!workStart) return checkinDate

    if (isNightShift) {
      const checkinHour = checkinDate.getHours()
      const [startHour] = workStartTime.split(':').map(Number)

      // ถ้า checkin หลังเที่ยงคืน แต่ก่อนเวลาเลิกงาน ให้ถือว่าเวลาเข้างานคือเมื่อวาน
      if (checkinHour < 12 && startHour > 12) {
        workStart.setDate(workStart.getDate() - 1)
      }
    }

    return workStart
  }

  // คำนวณเวลาเลิกงานจริงสำหรับกะข้ามวัน
  private getActualWorkEndTime(
    workEndTime: string,
    baseDate: Date,
    isNightShift: boolean
  ): Date {
    const workEnd = this.parseWorkTime(workEndTime, baseDate)
    if (!workEnd) return baseDate

    if (isNightShift) {
      const [endHour] = workEndTime.split(':').map(Number)
      const baseHour = baseDate.getHours()

      // ถ้าเวลาเลิกงานเป็นช่วงเช้า และตอนนี้เป็นช่วงบ่าย/เย็น ให้เลิกงานวันพรุ่งนี้
      if (endHour < 12 && baseHour > 12) {
        workEnd.setDate(workEnd.getDate() + 1)
      }
    }

    return workEnd
  }

  // คำนวณระดับการมาสาย
  private calculateLateLevel(
    checkinTime: Date,
    workStartTime: string | null | undefined,
    workEndTime: string | null | undefined
  ): { level: number; minutes: number } {
    if (!workStartTime) {
      // ถ้าไม่ได้ตั้งเวลาทำงาน ถือว่าไม่สาย
      return { level: 0, minutes: 0 }
    }

    // ตรวจสอบว่าเป็นกะข้ามวันหรือไม่
    const isNightShift = this.isNightShift(workStartTime, workEndTime)

    // คำนวณเวลาเข้างานจริง
    const workStart = this.getActualWorkStartTime(
      workStartTime,
      checkinTime,
      isNightShift
    )

    const diffMs = checkinTime.getTime() - workStart.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    // ถ้ามาก่อนเวลา หรือตรงเวลา
    if (diffMinutes <= 0) {
      return { level: 0, minutes: 0 }
    }

    // คำนวณระดับการมาสาย
    let level = 0
    if (diffMinutes <= 15) {
      level = 1 // สายไม่เกิน 15 นาที
    } else if (diffMinutes <= 30) {
      level = 2 // สาย 16-30 นาที
    } else if (diffMinutes <= 60) {
      level = 3 // สาย 31-60 นาที
    } else {
      level = 4 // สายเกิน 60 นาที
    }

    return { level, minutes: diffMinutes }
  }

  // ตรวจสอบว่าอยู่ในพื้นที่ทำงานหรือไม่
  async checkLocation(
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
  async getCheckinStatus(): Promise<CheckinStatus> {
    const session = await getServerSession()

    const userId = parseInt(session.user.id)

    const activeCheckin = await CheckinRepository.getActiveCheckin(userId)
    const character = await CheckinRepository.getCharacterWithWorkTime(userId)

    let canCheckout = false
    let workingHours: number | null = null
    let minimumHoursRequired = 8 // default

    if (activeCheckin && character) {
      // คำนวณชั่วโมงการทำงาน
      const now = new Date()
      const checkinTime = new Date(activeCheckin.checkinAt)
      const diffMs = now.getTime() - checkinTime.getTime()
      workingHours = diffMs / (1000 * 60 * 60) // แปลงเป็นชั่วโมง

      // ถ้ามีเวลาเข้า-ออกงานที่กำหนด ให้ใช้เวลานั้น
      const char = character as any
      if (char.workStartTime && char.workEndTime) {
        // ตรวจสอบว่าเป็นกะข้ามวันหรือไม่
        const isNightShift = this.isNightShift(
          char.workStartTime,
          char.workEndTime
        )

        // คำนวณเวลาเลิกงานจริง (ใช้เวลา checkin เป็น base)
        const workEnd = this.getActualWorkEndTime(
          char.workEndTime,
          checkinTime,
          isNightShift
        )

        if (workEnd) {
          // ตรวจสอบว่าถึงเวลาออกงานหรือยัง
          if (now >= workEnd) {
            canCheckout = true
          }

          // คำนวณชั่วโมงทำงานที่ต้องการ
          const workStart = this.getActualWorkStartTime(
            char.workStartTime,
            checkinTime,
            isNightShift
          )
          const requiredMs = workEnd.getTime() - workStart.getTime()
          minimumHoursRequired = requiredMs / (1000 * 60 * 60)
        }
      } else {
        // ถ้าไม่มีเวลากำหนด สามารถ checkout ได้ทันที
        canCheckout = true
        minimumHoursRequired = 0
      }
    }

    return {
      hasActiveCheckin: !!activeCheckin,
      currentCheckin: activeCheckin,
      canCheckout,
      workingHours,
      minimumHoursRequired,
    }
  }

  // ตรวจสอบว่าเป็น checkin ของกะเดียวกันหรือไม่ (รองรับกะข้ามวัน)
  private isSameShift(
    existingCheckinTime: Date,
    newCheckinTime: Date,
    workStartTime: string | null | undefined,
    workEndTime: string | null | undefined
  ): boolean {
    // ถ้าไม่มีเวลาทำงานกำหนด ใช้วิธีเช็ควันเดียวกัน
    if (!workStartTime || !workEndTime) {
      return (
        existingCheckinTime.toDateString() === newCheckinTime.toDateString()
      )
    }

    const isNightShift = this.isNightShift(workStartTime, workEndTime)

    if (!isNightShift) {
      // กะปกติ - เช็ควันเดียวกัน
      return (
        existingCheckinTime.toDateString() === newCheckinTime.toDateString()
      )
    }

    // กะข้ามวัน - ต้องคำนวณว่าอยู่ในกะเดียวกันหรือไม่
    // ตัวอย่าง: กะ 17:00 - 08:00
    // - ถ้า checkin ครั้งแรก 26/12 เวลา 17:30
    // - และพยายาม checkin อีกครั้ง 27/12 เวลา 01:00
    // - ถือว่าเป็นกะเดียวกัน (ห่างกันไม่เกิน 24 ชม.)

    const timeDiff = Math.abs(
      newCheckinTime.getTime() - existingCheckinTime.getTime()
    )
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    return hoursDiff < 24
  }

  // Checkin
  async checkin(
    userId: number,
    request: CheckinRequest
  ): Promise<CheckinResponse> {
    try {
      // ดึงข้อมูล character ก่อนเพื่อใช้ตรวจสอบกะการทำงาน
      const character = await CheckinRepository.getCharacterWithWorkTime(userId)
      const char = character as any

      // ตรวจสอบว่ามี active checkin อยู่หรือไม่
      const activeCheckin = await CheckinRepository.getActiveCheckin(userId)
      if (activeCheckin) {
        // ตรวจสอบว่าเป็น checkin ของกะเดียวกันหรือไม่
        const checkinDate = new Date(activeCheckin.checkinAt)
        const today = new Date()

        if (
          this.isSameShift(
            checkinDate,
            today,
            char?.workStartTime,
            char?.workEndTime
          )
        ) {
          return {
            success: false,
            message: 'คุณมีการ check-in ที่ยังไม่ได้ check-out อยู่',
          }
        }
        // ถ้าเป็น checkin ของกะเก่า ให้ผ่านไปได้ (ถือว่าลืม checkout)
      }

      // ตรวจสอบว่า checkin วันนี้แล้วหรือยัง (รวมทั้งที่ checkout แล้ว)
      const todayCheckins = await CheckinRepository.getTodayCheckins(userId)
      if (todayCheckins && todayCheckins.length > 0) {
        // ตรวจสอบว่ามี checkin ที่ checkout แล้วหรือยัง
        const completedCheckin = todayCheckins.find(
          (c: any) => c.checkoutAt !== null
        )
        if (completedCheckin) {
          return {
            success: false,
            message: 'คุณได้ทำการ check-in และ check-out วันนี้แล้ว',
          }
        }
      }

      // คำนวณระดับการมาสาย
      const checkinTime = new Date()
      const lateInfo = this.calculateLateLevel(
        checkinTime,
        char?.workStartTime,
        char?.workEndTime
      )

      // อัพโหลดรูปภาพ
      const photoBuffer = Buffer.from(request.photoBase64, 'base64')
      const photoResult = await s3UploadService.uploadBuffer(
        photoBuffer,
        `${userId}-${Date.now()}.jpg`,
        'image/jpeg',
        'checkin'
      )

      // สร้าง checkin พร้อมข้อมูลการมาสาย
      const checkin = await CheckinRepository.createCheckin({
        userId,
        workLocationId: request.workLocationId,
        checkinPhotoUrl: photoResult.url,
        checkinLat: request.lat,
        checkinLng: request.lng,
        checkinType: request.checkinType,
        notes: request.notes,
        lateLevel: lateInfo.level,
        lateMinutes: lateInfo.minutes,
      })

      // สร้างข้อความตอบกลับตามระดับการมาสาย
      let message = 'Check-in สำเร็จ'
      if (lateInfo.level > 0) {
        const lateMessages = [
          '',
          ` (สาย ${lateInfo.minutes} นาที - เตือนเบื้องต้น)`,
          ` (สาย ${lateInfo.minutes} นาที - ถูกตัดคะแนน)`,
          ` (สาย ${lateInfo.minutes} นาที - ผิดวินัยเบา)`,
          ` (สาย ${lateInfo.minutes} นาที - ผิดวินัยร้ายแรง โปรดชี้แจง)`,
        ]
        message += lateMessages[lateInfo.level]
      }

      return {
        success: true,
        message,
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
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const session = await getServerSession()
      const userId = +session.user.id

      // ตรวจสอบ active checkin
      const activeCheckin = await CheckinRepository.getActiveCheckin(userId)
      if (!activeCheckin) {
        return {
          success: false,
          message: 'ไม่พบการ check-in ที่ยังไม่ได้ check-out',
        }
      }

      // ลบการตรวจสอบ location ออก เพราะจะตรวจสอบใน frontend แทน
      // Frontend จะส่ง notes มาพร้อมเหตุผลถ้า checkout นอกพื้นที่

      const character = await CheckinRepository.getCharacterWithWorkTime(userId)
      if (!character) {
        return {
          success: false,
          message: 'ไม่พบข้อมูล character',
        }
      }

      // คำนวณชั่วโมงการทำงาน
      const now = new Date()
      const checkinTime = new Date(activeCheckin.checkinAt)
      const diffMs = now.getTime() - checkinTime.getTime()
      const workingHours = diffMs / (1000 * 60 * 60)

      // ตรวจสอบเวลาทำงาน
      const char = character as any
      if (char.workStartTime && char.workEndTime) {
        // มีการตั้งเวลาทำงาน - ตรวจสอบว่าถึงเวลาเลิกงานหรือยัง
        const isNightShift = this.isNightShift(
          char.workStartTime,
          char.workEndTime
        )

        // คำนวณเวลาเลิกงานจริง (ใช้เวลา checkin เป็น base)
        const workEnd = this.getActualWorkEndTime(
          char.workEndTime,
          checkinTime,
          isNightShift
        )

        if (workEnd && now < workEnd) {
          const remainingMs = workEnd.getTime() - now.getTime()
          const remainingHours = remainingMs / (1000 * 60 * 60)
          return {
            success: false,
            message: `ยังไม่ถึงเวลาเลิกงาน ต้องรออีก ${remainingHours.toFixed(1)} ชั่วโมง`,
          }
        }
      }
      // ถ้าไม่มีการตั้งเวลาทำงาน - สามารถ checkout ได้ทันที

      // อัพโหลดรูปภาพ
      const photoBuffer = Buffer.from(request.photoBase64, 'base64')
      const photoResult = await s3UploadService.uploadBuffer(
        photoBuffer,
        `${userId}-${Date.now()}.jpg`,
        'image/jpeg',
        'checkout'
      )

      // อัพเดท checkout
      const checkout = await CheckinRepository.updateCheckout(
        activeCheckin.id,
        {
          checkoutPhotoUrl: photoResult.url,
          checkoutLat: request.lat,
          checkoutLng: request.lng,
          totalHours: workingHours,
          notes: request.notes,
        }
      )

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
  async getHistory(userId: number, limit: number = 30) {
    return await CheckinRepository.getCheckinHistory(userId, limit)
  }

  // ดึง checkin/checkout ของวันนี้
  async getTodayCheckins(userId: number) {
    return await CheckinRepository.getTodayCheckins(userId)
  }

  // ดึงสถานที่ทำงานทั้งหมด
  async getWorkLocations() {
    return await CheckinRepository.getActiveWorkLocations()
  }
}

// Export singleton instance
export const checkinService = CheckinService.getInstance()
