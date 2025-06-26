// WorkLocation Types
export interface WorkLocation {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// CheckinCheckout Types
export interface CheckinCheckout {
  id: number
  userId: number
  workLocationId: number | null
  checkinAt: Date
  checkinPhotoUrl: string | null
  checkinLat: number | null
  checkinLng: number | null
  checkinType: 'onsite' | 'offsite'
  checkoutAt: Date | null
  checkoutPhotoUrl: string | null
  checkoutLat: number | null
  checkoutLng: number | null
  totalHours: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  workLocation?: WorkLocation | null
}

// Location Check Result
export interface LocationCheckResult {
  isInWorkLocation: boolean
  nearestLocation: WorkLocation | null
  distance: number | null // ระยะห่างจากสถานที่ทำงานที่ใกล้ที่สุด (เมตร)
  userLat: number
  userLng: number
}

// Checkin Request
export interface CheckinRequest {
  lat: number
  lng: number
  photoBase64: string
  checkinType: 'onsite' | 'offsite'
  workLocationId?: number
  notes?: string
}

// Checkout Request
export interface CheckoutRequest {
  lat: number
  lng: number
  photoBase64: string
  notes?: string
}

// Current Status Response
export interface CheckinStatus {
  hasActiveCheckin: boolean
  currentCheckin: CheckinCheckout | null
  canCheckout: boolean
  workingHours: number | null
  minimumHoursRequired: number
}

// API Responses
export interface CheckinResponse {
  success: boolean
  message: string
  data?: CheckinCheckout
}

export interface CheckoutResponse {
  success: boolean
  message: string
  data?: CheckinCheckout
} 