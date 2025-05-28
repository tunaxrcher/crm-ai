// src/features/quest/utils/index.ts
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns'
import { th } from 'date-fns/locale'

export const formatDeadline = (date: Date | null | string | number): string => {
  if (!date) {
    return 'ไม่มีกำหนดเวลา'
  }

  const deadlineDate = new Date(date)

  // ตรวจสอบว่าเป็น Date object ที่ถูกต้องหรือไม่
  if (isNaN(deadlineDate.getTime())) {
    return 'ไม่มีกำหนดเวลา'
  }

  const now = new Date()

  // ถ้าเวลาผ่านไปแล้ว
  if (deadlineDate < now) {
    return 'หมดเวลาแล้ว'
  }

  // ถ้าเป็นวันนี้
  if (isToday(deadlineDate)) {
    return `วันนี้ ${format(deadlineDate, 'HH:mm', { locale: th })}`
  }

  // ถ้าเป็นพรุ่งนี้
  if (isTomorrow(deadlineDate)) {
    return `พรุ่งนี้ ${format(deadlineDate, 'HH:mm', { locale: th })}`
  }

  // ถ้าอยู่ในช่วง 7 วันข้างหน้า
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilDeadline <= 7) {
    return `อีก ${daysUntilDeadline} วัน`
  }

  // ถ้าเกิน 7 วัน แสดงเป็นวันที่เต็ม
  return format(deadlineDate, 'dd/MM/yyyy', { locale: th })
}

export const getQuestStatusColor = (
  completed: boolean,
  deadline: Date | null
): string => {
  if (completed) {
    return 'text-green-400'
  }

  if (!deadline) {
    return 'text-muted-foreground'
  }

  const now = new Date()
  const deadlineDate = new Date(deadline)

  if (deadlineDate < now) {
    return 'text-red-400' // หมดเวลาแล้ว
  }

  const timeUntilDeadline = deadlineDate.getTime() - now.getTime()
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

  if (hoursUntilDeadline <= 2) {
    return 'text-red-400' // เหลือเวลาน้อยกว่า 2 ชั่วโมง
  }

  if (hoursUntilDeadline <= 24) {
    return 'text-yellow-400' // เหลือเวลาน้อยกว่า 24 ชั่วโมง
  }

  return 'text-muted-foreground' // ปกติ
}

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export const getQuestTypeLabel = (type: string): string => {
  switch (type) {
    case 'daily':
      return 'ประจำวัน'
    case 'weekly':
      return 'ประจำสัปดาห์'
    case 'no-deadline':
      return 'ทั่วไป'
    default:
      return 'ภารกิจ'
  }
}

export const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'ง่าย'
    case 'medium':
      return 'ปานกลาง'
    case 'hard':
      return 'ยาก'
    default:
      return difficulty
  }
}
