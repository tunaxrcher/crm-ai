import 'server-only'

import { prisma } from '@src/lib/db'
import { BaseService } from '@src/lib/services/server/baseService'

import { CheckinRepository } from '../repository'

export class AutoCheckoutService extends BaseService {
  private static instance: AutoCheckoutService
  
  // Config สำหรับ auto checkout
  private static readonly AUTO_CHECKOUT_CONFIG = {
    bufferHours: 2, // checkout หลังเวลาเลิกงาน 2 ชั่วโมง
    maxWorkHours: 12, // ทำงานได้สูงสุด 12 ชั่วโมง
    fallbackTime: '00:00', // ถ้าไม่มีเวลาเลิกงาน ให้ checkout เที่ยงคืน
  }

  constructor() {
    super()
  }

  public static getInstance() {
    if (!AutoCheckoutService.instance) {
      AutoCheckoutService.instance = new AutoCheckoutService()
    }

    return AutoCheckoutService.instance
  }

  // Process auto checkout สำหรับ checkin ที่ค้างอยู่
  async processAutoCheckouts(): Promise<number> {
    try {
      console.log('[AutoCheckout] Starting auto checkout process...')
      
      const now = new Date()
      
      // ดึง checkin ที่ยังไม่ได้ checkout
      const activeCheckins = await prisma.checkinCheckout.findMany({
        where: {
          checkoutAt: null,
          // checkin มาแล้วอย่างน้อย 1 ชั่วโมง
          checkinAt: {
            lte: new Date(now.getTime() - 60 * 60 * 1000)
          }
        },
        include: {
          character: true,
          workLocation: true
        }
      })

      console.log(`[AutoCheckout] Found ${activeCheckins.length} active checkins`)

      let processedCount = 0

      for (const checkin of activeCheckins) {
        const shouldCheckout = await this.shouldAutoCheckout(checkin, checkin.character)
        
        if (shouldCheckout) {
          await this.performAutoCheckout(checkin)
          processedCount++
        }
      }

      console.log(`[AutoCheckout] Processed ${processedCount} auto checkouts`)
      return processedCount

    } catch (error) {
      console.error('[AutoCheckout] Error:', error)
      throw error
    }
  }

  // ตรวจสอบว่าควร auto checkout หรือไม่
  private shouldAutoCheckout(checkin: any, character: any): boolean {
    const now = new Date()
    const checkinTime = new Date(checkin.checkinAt)
    
    // คำนวณชั่วโมงที่ทำงานแล้ว
    const hoursWorked = (now.getTime() - checkinTime.getTime()) / (1000 * 60 * 60)
    
    // เช็คว่าทำงานเกิน max hours หรือไม่
    if (hoursWorked >= AutoCheckoutService.AUTO_CHECKOUT_CONFIG.maxWorkHours) {
      console.log(`[AutoCheckout] Character ${character.id} worked ${hoursWorked.toFixed(2)} hours (max: ${AutoCheckoutService.AUTO_CHECKOUT_CONFIG.maxWorkHours})`)
      return true
    }

    // ถ้ามีเวลาเลิกงาน ให้เช็คว่าเลยเวลา + buffer หรือยัง
    if (character.workStartTime && character.workEndTime) {
      const checkoutTime = this.calculateAutoCheckoutTime(checkin, character)
      
      if (now >= checkoutTime) {
        console.log(`[AutoCheckout] Character ${character.id} passed auto checkout time`)
        return true
      }
    } else {
      // ถ้าไม่มีเวลาทำงาน ให้ checkout เที่ยงคืน
      const midnight = new Date(checkinTime)
      midnight.setDate(midnight.getDate() + 1)
      midnight.setHours(0, 0, 0, 0)
      
      if (now >= midnight) {
        console.log(`[AutoCheckout] Character ${character.id} no work schedule, checkout at midnight`)
        return true
      }
    }

    return false
  }

  // คำนวณเวลาที่ควร auto checkout
  private calculateAutoCheckoutTime(checkin: any, character: any): Date {
    const checkinTime = new Date(checkin.checkinAt)
    
    // ถ้ามีเวลาเลิกงาน
    if (character.workEndTime) {
      const [endHour, endMinute] = character.workEndTime.split(':').map(Number)
      const checkoutTime = new Date(checkinTime)
      checkoutTime.setHours(endHour, endMinute, 0, 0)
      
      // ถ้าเป็นกะข้ามวัน (เวลาเลิก < เวลาเข้า)
      if (character.workStartTime && character.workEndTime < character.workStartTime) {
        checkoutTime.setDate(checkoutTime.getDate() + 1)
      }
      
      // เพิ่ม buffer hours
      checkoutTime.setHours(checkoutTime.getHours() + AutoCheckoutService.AUTO_CHECKOUT_CONFIG.bufferHours)
      
      return checkoutTime
    }
    
    // ถ้าไม่มีเวลาเลิกงาน ให้ใช้เที่ยงคืน
    const midnight = new Date(checkinTime)
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)
    
    return midnight
  }

  // ทำการ auto checkout
  private async performAutoCheckout(checkin: any): Promise<void> {
    const checkoutTime = this.calculateCheckoutTime(checkin, checkin.character)
    const totalHours = (checkoutTime.getTime() - new Date(checkin.checkinAt).getTime()) / (1000 * 60 * 60)
    
    // อัพเดท checkout
    await prisma.checkinCheckout.update({
      where: { id: checkin.id },
      data: {
        checkoutAt: checkoutTime,
        checkoutLat: checkin.checkinLat, // ใช้ location เดิม
        checkoutLng: checkin.checkinLng,
        totalHours: totalHours,
        // ใช้ notes field เพื่อระบุว่าเป็น auto checkout
        notes: `[AUTO CHECKOUT] ${this.generateAutoCheckoutNote(checkin, checkin.character)}${checkin.notes ? `\n\nOriginal notes: ${checkin.notes}` : ''}`,
      }
    })

    console.log(`[AutoCheckout] Auto checked out character ${checkin.character.id} at ${checkoutTime.toISOString()}`)
    
    // TODO: ส่งการแจ้งเตือนให้ผู้ใช้
    // await NotificationService.send(checkin.character.userId, {
    //   title: 'Auto Checkout',
    //   message: `ระบบได้ทำการ checkout อัตโนมัติให้คุณเมื่อเวลา ${checkoutTime.toLocaleTimeString('th-TH')}`
    // })
  }

  // คำนวณเวลา checkout จริง
  private calculateCheckoutTime(checkin: any, character: any): Date {
    const now = new Date()
    const checkinTime = new Date(checkin.checkinAt)
    
    // ถ้ามีเวลาเลิกงาน
    if (character.workEndTime) {
      const autoCheckoutTime = this.calculateAutoCheckoutTime(checkin, character)
      
      // ใช้เวลาที่น้อยกว่าระหว่าง "ตอนนี้" กับ "เวลา auto checkout"
      return now < autoCheckoutTime ? now : autoCheckoutTime
    }
    
    // ถ้าไม่มีเวลาเลิกงาน ใช้เวลาปัจจุบัน
    return now
  }

  // สร้างข้อความอธิบาย auto checkout
  private generateAutoCheckoutNote(checkin: any, character: any): string {
    const hoursWorked = (new Date().getTime() - new Date(checkin.checkinAt).getTime()) / (1000 * 60 * 60)
    
    if (hoursWorked >= AutoCheckoutService.AUTO_CHECKOUT_CONFIG.maxWorkHours) {
      return `Auto checkout: ทำงานครบ ${AutoCheckoutService.AUTO_CHECKOUT_CONFIG.maxWorkHours} ชั่วโมง`
    }
    
    if (character.workEndTime) {
      return `Auto checkout: เลยเวลาเลิกงาน ${AutoCheckoutService.AUTO_CHECKOUT_CONFIG.bufferHours} ชั่วโมง`
    }
    
    return 'Auto checkout: ไม่มีการ checkout ภายในเวลาที่กำหนด'
  }

  // ตรวจสอบและแจ้งเตือนก่อน auto checkout
  async checkAndNotifyPendingAutoCheckouts(): Promise<void> {
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)
    
    const pendingCheckins = await prisma.checkinCheckout.findMany({
      where: {
        checkoutAt: null,
        // ไม่รวม checkin ที่เป็น auto checkout แล้ว (เช็คจาก notes)
        NOT: {
          notes: {
            contains: '[AUTO CHECKOUT]'
          }
        }
      },
      include: {
        character: true
      }
    })

    for (const checkin of pendingCheckins) {
      const autoCheckoutTime = this.calculateAutoCheckoutTime(checkin, checkin.character)
      
      // ถ้าจะ auto checkout ใน 30 นาที
      if (autoCheckoutTime >= now && autoCheckoutTime <= thirtyMinutesFromNow) {
        console.log(`[AutoCheckout] Character ${checkin.character.id} will be auto checked out in 30 minutes`)
        
        // TODO: ส่งการแจ้งเตือน
        // await NotificationService.send(checkin.character.userId, {
        //   title: 'เตือน: Auto Checkout ใน 30 นาที',
        //   message: 'คุณจะถูก checkout อัตโนมัติใน 30 นาที กรุณา checkout ด้วยตนเองหากต้องการ'
        // })
      }
    }
  }
}

// Export singleton instance
export const autoCheckoutService = AutoCheckoutService.getInstance() 