import { useCallback } from 'react'
import { useSmartPolling } from './useSmartPolling'

/**
 * Hook รวมสำหรับจัดการ Smart Polling ของ App ทั้งหมด
 * ใช้ในส่วนที่ต้องการให้เกิด fast polling หลังจาก user actions
 */
export function useAppPolling() {
  // Setup smart polling สำหรับ queries หลักของ app
  const { triggerFastPolling, pausePolling, resumePolling, isActive } = useSmartPolling({
    queryKeys: [
      ['notifications'],           // notifications list
      ['notifications', 'unread-count'], // unread count
      ['feed'],                   // feed items
    ],
    fastPollDuration: 15,       // poll เร็ว 15 ครั้ง (เพิ่มขึ้น)
    fastInterval: 500,          // ทุก 0.5 วินาที (เร็วมาก)
    slowInterval: 12000,        // ทุก 12 วินาที (เร็วขึ้น)
    ultraFastMode: true,        // 🚀⚡ ULTRA FAST MODE
  })

  // Trigger fast polling หลังจาก user interactions
  const triggerAfterLike = useCallback(() => {
    console.log('👍 User liked - triggering fast polling')
    triggerFastPolling()
  }, [triggerFastPolling])

  const triggerAfterComment = useCallback(() => {
    console.log('💬 User commented - triggering fast polling') 
    triggerFastPolling()
  }, [triggerFastPolling])

  const triggerAfterNotificationRead = useCallback(() => {
    console.log('📖 Notification read - triggering fast polling')
    triggerFastPolling()
  }, [triggerFastPolling])

  const triggerAfterPost = useCallback(() => {
    console.log('📝 User posted - triggering fast polling')
    triggerFastPolling()
  }, [triggerFastPolling])

  const triggerAfterQuest = useCallback(() => {
    console.log('🎯 Quest action - triggering fast polling')
    triggerFastPolling()
  }, [triggerFastPolling])

  return {
    // Specific triggers for different actions
    triggerAfterLike,
    triggerAfterComment, 
    triggerAfterNotificationRead,
    triggerAfterPost,
    triggerAfterQuest,
    
    // General controls
    triggerFastPolling,
    pausePolling,
    resumePolling,
    isActive
  }
} 