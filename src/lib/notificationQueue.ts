// src/lib/notificationQueue.ts
type QueuedNotification = {
  id: string
  type: 'xp' | 'levelup' | 'classunlock' | 'jobtitle' | 'achievement'
  data: any
  priority: number // เลขน้อย = priority สูง
}

class NotificationQueueManager {
  private queue: QueuedNotification[] = []
  private isProcessing = false
  private currentNotification: QueuedNotification | null = null

  // เพิ่ม notification เข้า queue
  enqueue(notification: Omit<QueuedNotification, 'id'>) {
    const id = Math.random().toString(36).substring(2, 11)
    const queuedNotification = { ...notification, id }

    // เพิ่มเข้า queue และเรียงตาม priority
    this.queue.push(queuedNotification)
    this.queue.sort((a, b) => a.priority - b.priority)

    console.log(
      `[Queue] Added notification: ${notification.type}`,
      this.queue.length
    )

    // เริ่มประมวลผลถ้ายังไม่ได้ทำ
    if (!this.isProcessing) this.processQueue()
  }

  // ประมวลผล queue
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const notification = this.queue.shift()!
      this.currentNotification = notification

      console.log(`[Queue] Processing: ${notification.type}`)

      try {
        await this.showNotification(notification)
      } catch (error) {
        console.error(`[Queue] Error showing notification:`, error)
      }

      this.currentNotification = null

      // เว้นช่วงเล็กน้อยระหว่าง notification
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    this.isProcessing = false
    console.log(`[Queue] Queue completed`)
  }

  // แสดง notification แต่ละประเภท
  private async showNotification(
    notification: QueuedNotification
  ): Promise<void> {
    return new Promise((resolve) => {
      let eventName = ''
      let closeEventName = ''

      switch (notification.type) {
        case 'xp':
          eventName = 'quest:xpgained'
          closeEventName = 'xp:closed'
          break
        case 'levelup':
          eventName = 'character:levelup'
          closeEventName = 'levelup:closed'
          break
        case 'classunlock':
          eventName = 'character:classunlock'
          closeEventName = 'classunlock:closed'
          break
        case 'jobtitle':
          eventName = 'character:jobtitle'
          closeEventName = 'jobtitle:closed'
          break
        case 'achievement':
          eventName = 'character:achievement'
          closeEventName = 'achievement:closed'
          break
      }

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: notification.data,
        })
      )

      // รอให้ notification ปิด
      const handleClose = () => {
        window.removeEventListener(closeEventName, handleClose)
        resolve()
      }

      window.addEventListener(closeEventName, handleClose)

      // Auto resolve หลังจาก 8 วินาที (เผื่อผู้ใช้ไม่กดปิด)
      setTimeout(() => {
        window.removeEventListener(closeEventName, handleClose)
        resolve()
      }, 8000)
    })
  }

  // ดูสถานะปัจจุบัน
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentNotification: this.currentNotification?.type || null,
    }
  }

  // ล้าง queue (สำหรับกรณีฉุกเฉิน)
  clear() {
    this.queue = []
    this.isProcessing = false
    this.currentNotification = null
  }
}

// Singleton instance
export const notificationQueue = new NotificationQueueManager()
