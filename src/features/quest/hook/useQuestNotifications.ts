// src/features/quest/hooks/useQuestNotifications.ts
import { useEffect } from 'react'

export const useQuestNotifications = () => {
  // ฟังก์ชันสำหรับแสดง XP notification (เต็มจอ)
  const showXPNotification = (xpEarned: number, questTitle: string) => {
    return new Promise<void>((resolve) => {
      // Dispatch event เพื่อแสดง XPGainedNotification เต็มจอ
      window.dispatchEvent(
        new CustomEvent('quest:xpgained', {
          detail: { amount: xpEarned, questTitle },
        })
      )

      // ฟัง event เมื่อผู้ใช้ปิด notification
      const handleXPClose = () => {
        window.removeEventListener('xp:closed', handleXPClose)
        resolve()
      }

      window.addEventListener('xp:closed', handleXPClose)

      // Auto resolve หลังจาก 5 วินาที
      setTimeout(() => {
        window.removeEventListener('xp:closed', handleXPClose)
        resolve()
      }, 5000)
    })
  }

  // ฟังก์ชันสำหรับแสดง Level Up notification (เต็มจอ)
  const showLevelUpNotification = (level: number) => {
    return new Promise<void>((resolve) => {
      // Dispatch event เพื่อแสดง LevelUpNotification เต็มจอ
      window.dispatchEvent(
        new CustomEvent('character:levelup', {
          detail: { level },
        })
      )

      // ฟัง event เมื่อผู้ใช้ปิด notification
      const handleLevelUpClose = () => {
        window.removeEventListener('levelup:closed', handleLevelUpClose)
        resolve()
      }

      window.addEventListener('levelup:closed', handleLevelUpClose)

      // Auto resolve หลังจาก 8 วินาที
      setTimeout(() => {
        window.removeEventListener('levelup:closed', handleLevelUpClose)
        resolve()
      }, 8000)
    })
  }

  // ฟังก์ชันสำหรับแสดง Class Unlock notification (เต็มจอ)
  const showClassUnlockNotification = (
    classLevel: number,
    portraitUrl?: string
  ) => {
    return new Promise<void>((resolve) => {
      // Dispatch event เพื่อแสดง ClassUnlockNotification เต็มจอ
      window.dispatchEvent(
        new CustomEvent('character:classunlock', {
          detail: { classLevel, portraitUrl },
        })
      )

      // ฟัง event เมื่อผู้ใช้ปิด notification
      const handleClassUnlockClose = () => {
        window.removeEventListener('classunlock:closed', handleClassUnlockClose)
        resolve()
      }

      window.addEventListener('classunlock:closed', handleClassUnlockClose)

      // Auto resolve หลังจาก 8 วินาที
      setTimeout(() => {
        window.removeEventListener('classunlock:closed', handleClassUnlockClose)
        resolve()
      }, 8000)
    })
  }

  // ฟังก์ชันสำหรับแสดง Job Title notification (เต็มจอ)
  const showJobTitleNotification = (newTitle: string, level: number) => {
    return new Promise<void>((resolve) => {
      // Dispatch event เพื่อแสดง JobTitleNotification เต็มจอ
      window.dispatchEvent(
        new CustomEvent('character:jobtitle', {
          detail: { newTitle, level },
        })
      )

      // ฟัง event เมื่อผู้ใช้ปิด notification
      const handleJobTitleClose = () => {
        window.removeEventListener('jobtitle:closed', handleJobTitleClose)
        resolve()
      }

      window.addEventListener('jobtitle:closed', handleJobTitleClose)

      // Auto resolve หลังจาก 8 วินาที
      setTimeout(() => {
        window.removeEventListener('jobtitle:closed', handleJobTitleClose)
        resolve()
      }, 8000)
    })
  }

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
      // 1. แสดง XP notification ก่อน (เต็มจอ)
      await showXPNotification(questResult.xpEarned, questResult.questTitle)

      // 2. ถ้ามีการเลเวลอัพ ให้แสดง notification เต็มจอตามลำดับ
      if (questResult.characterUpdate?.leveledUp) {
        const { character, levelsGained, unlockedClassLevels, newJobLevel } =
          questResult.characterUpdate

        // แสดง Level Up notification เต็มจอ
        await showLevelUpNotification(character.level)

        // ถ้ามีการปลดล็อกคลาสใหม่ แสดง class unlock notification
        if (unlockedClassLevels && unlockedClassLevels.length > 0) {
          for (const classLevel of unlockedClassLevels) {
            await showClassUnlockNotification(
              classLevel,
              character.currentPortraitUrl
            )
          }
        }

        // ถ้ามีการเลื่อนตำแหน่งงาน
        if (newJobLevel) {
          await showJobTitleNotification(newJobLevel.title, newJobLevel.level)
        }
      }
    } catch (error) {
      console.error('Error showing quest notifications:', error)
    }
  }

  return {
    showXPNotification,
    showLevelUpNotification,
    showClassUnlockNotification,
    showJobTitleNotification,
    handleQuestSubmissionNotifications,
  }
}
