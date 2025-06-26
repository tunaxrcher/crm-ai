import { BaseService } from '@src/lib/services/client/baseService'

import type {
  CheckinCheckout,
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

  constructor() {
    super()
  }

  public static getInstance() {
    if (!CheckinService.instance) {
      CheckinService.instance = new CheckinService()
    }
    return CheckinService.instance
  }

  // ดึงข้อมูลสถานที่ทำงาน
  async getWorkLocations(): Promise<WorkLocation[]> {
    const response = await this.get<{ success: boolean; data: WorkLocation[] }>(
      '/api/checkin/work-locations'
    )
    return response.data
  }

  // ตรวจสอบ location
  async checkLocation(lat: number, lng: number): Promise<LocationCheckResult> {
    const response = await this.post<{
      success: boolean
      data: LocationCheckResult
    }>('/api/checkin/check-location', { lat, lng })
    return response.data
  }

  // ดึงสถานะ checkin ปัจจุบัน
  async getStatus(): Promise<CheckinStatus> {
    const response = await this.get<{ success: boolean; data: CheckinStatus }>(
      '/api/checkin/status'
    )
    return response.data
  }

  // Checkin
  async checkin(request: CheckinRequest): Promise<CheckinResponse> {
    return await this.post<CheckinResponse>('/api/checkin', request)
  }

  // Checkout
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return await this.post<CheckoutResponse>('/api/checkout', request)
  }

  // ดึงประวัติ checkin/checkout
  async getHistory(limit: number = 30): Promise<CheckinCheckout[]> {
    const response = await this.get<{
      success: boolean
      data: CheckinCheckout[]
    }>(`/api/checkin?limit=${limit}`)
    return response.data
  }

  // ดึง checkin/checkout ของวันนี้
  async getTodayCheckins(): Promise<CheckinCheckout[]> {
    const response = await this.get<{
      success: boolean
      data: CheckinCheckout[]
    }>('/api/checkin?today=true')
    return response.data
  }
}

export const checkinService = CheckinService.getInstance()
