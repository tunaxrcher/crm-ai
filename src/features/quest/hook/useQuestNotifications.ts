// src/features/quest/hooks/useQuestNotifications.ts
import { notificationQueue } from '@src/lib/notificationQueue'

export const useQuestNotifications = () => {
  // ฟังก์ชันหลักสำหรับจัดการ notification หลังส่งเควส
  const handleQuestSubmissionNotifications = async (questResult: {
    xpEarned: number
    questTitle: string
    characterUpdate?: {
      leveledUp: boolean
      levelsGained?: number
      character: any
      unlockedClassLevels?: number[]
      newJobLevel?: any
    }
  }) => {
    try {
      console.log('[Quest] Adding notifications to queue...')

      // 1. เพิ่ม XP notification เข้า queue (priority สูงสุด)
      notificationQueue.enqueue({
        type: 'xp',
        data: {
          amount: questResult.xpEarned,
          questTitle: questResult.questTitle,
        },
        priority: 0, // แสดงก่อนทุกอย่าง
      })

      // 2. ถ้ามีการเลเวลอัพ ให้เพิ่ม notification อื่นๆ เข้า queue
      if (questResult.characterUpdate?.leveledUp) {
        const { character, unlockedClassLevels, newJobLevel } =
          questResult.characterUpdate

        // Level Up notification
        notificationQueue.enqueue({
          type: 'levelup',
          data: { level: character.level },
          priority: 1,
        })

        // Class Unlock notifications
        if (unlockedClassLevels && unlockedClassLevels.length > 0) {
          unlockedClassLevels.forEach((classLevel: number, index: number) => {
            notificationQueue.enqueue({
              type: 'classunlock',
              data: {
                classLevel: classLevel,
                portraitUrl: character.currentPortraitUrl,
              },
              priority: 2 + index,
            })
          })
        }

        // Job Title notification
        if (newJobLevel) {
          notificationQueue.enqueue({
            type: 'jobtitle',
            data: {
              newTitle: newJobLevel.title,
              level: newJobLevel.level,
            },
            priority: 10,
          })
        }
      }

      console.log(
        '[Quest] Notifications queued:',
        notificationQueue.getStatus()
      )
    } catch (error) {
      console.error('Error queueing quest notifications:', error)
    }
  }

  return {
    handleQuestSubmissionNotifications,
  }
}
