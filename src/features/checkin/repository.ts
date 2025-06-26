import { prisma } from '@src/lib/db'
import type { CheckinCheckout, WorkLocation } from './types'

export class CheckinRepository {
  // ดึงข้อมูล character พร้อมข้อมูลเวลาทำงาน
  static async getCharacterWithWorkTime(userId: number) {
    return await prisma.character.findUnique({
      where: { userId },
    })
  }

  // ดึงข้อมูลสถานที่ทำงานทั้งหมดที่ active
  static async getActiveWorkLocations(): Promise<WorkLocation[]> {
    return await prisma.workLocation.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  // ดึงข้อมูลสถานที่ทำงานตาม ID
  static async getWorkLocationById(id: number): Promise<WorkLocation | null> {
    return await prisma.workLocation.findUnique({
      where: { id },
    })
  }

  // ดึงข้อมูล checkin ที่ยังไม่ได้ checkout ของ user
  static async getActiveCheckin(userId: number): Promise<CheckinCheckout | null> {
    const character = await this.getCharacterWithWorkTime(userId)
    if (!character) return null

    const checkin = await prisma.checkinCheckout.findFirst({
      where: {
        characterId: character.id,
        checkoutAt: null,
      } as any,
      include: {
        workLocation: true,
      },
      orderBy: {
        checkinAt: 'desc',
      },
    })

    return checkin as CheckinCheckout | null
  }

  // สร้าง checkin ใหม่
  static async createCheckin(data: {
    userId: number
    workLocationId?: number
    checkinPhotoUrl: string
    checkinLat: number
    checkinLng: number
    checkinType: 'onsite' | 'offsite'
    notes?: string
  }): Promise<CheckinCheckout> {
    const character = await this.getCharacterWithWorkTime(data.userId)
    if (!character) throw new Error('Character not found')

    const checkin = await prisma.checkinCheckout.create({
      data: {
        characterId: character.id,
        workLocationId: data.workLocationId || null,
        checkinPhotoUrl: data.checkinPhotoUrl,
        checkinLat: data.checkinLat,
        checkinLng: data.checkinLng,
        checkinType: data.checkinType as any,
        notes: data.notes,
      } as any,
      include: {
        workLocation: true,
      },
    })

    return checkin as CheckinCheckout
  }

  // อัพเดท checkout
  static async updateCheckout(
    checkinId: number,
    data: {
      checkoutPhotoUrl: string
      checkoutLat: number
      checkoutLng: number
      totalHours: number
      notes?: string
    }
  ): Promise<CheckinCheckout> {
    const checkout = await prisma.checkinCheckout.update({
      where: { id: checkinId },
      data: {
        checkoutAt: new Date(),
        checkoutPhotoUrl: data.checkoutPhotoUrl,
        checkoutLat: data.checkoutLat,
        checkoutLng: data.checkoutLng,
        totalHours: data.totalHours,
        notes: data.notes,
      },
      include: {
        workLocation: true,
      },
    })

    return checkout as CheckinCheckout
  }

  // ดึงประวัติ checkin/checkout ของ user
  static async getCheckinHistory(
    userId: number,
    limit: number = 30
  ): Promise<CheckinCheckout[]> {
    const character = await this.getCharacterWithWorkTime(userId)
    if (!character) return []

    const history = await prisma.checkinCheckout.findMany({
      where: { characterId: character.id } as any,
      include: {
        workLocation: true,
      },
      orderBy: {
        checkinAt: 'desc',
      },
      take: limit,
    })

    return history as CheckinCheckout[]
  }

  // ดึงข้อมูล checkin/checkout ของวันนี้
  static async getTodayCheckins(userId: number): Promise<CheckinCheckout[]> {
    const character = await this.getCharacterWithWorkTime(userId)
    if (!character) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const checkins = await prisma.checkinCheckout.findMany({
      where: {
        characterId: character.id,
        checkinAt: {
          gte: today,
          lt: tomorrow,
        },
      } as any,
      include: {
        workLocation: true,
      },
      orderBy: {
        checkinAt: 'desc',
      },
    })

    return checkins as CheckinCheckout[]
  }
} 