'use client'

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { characterService } from '@src/features/character/services/client'
import {
  CharacterData as Character,
  JobClassData as JobClass,
} from '@src/features/user/types'
import { notificationQueue } from '@src/lib/notificationQueue'
import { signOut } from 'next-auth/react'

interface Achievement {
  id: number
  name: string
  description: string
  icon: string // เปลี่ยนเป็น string เพราะข้อมูลจาก API เป็น emoji
  earned: boolean
  earnedOn?: string | null
}

interface CharacterContextType {
  character: Character | null
  jobClass: JobClass | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addXp: (amount: number) => void
  unlockAchievement: (achievementId: number) => void
  showLevelUpAnimation: () => void
  showAchievementAnimation: (achievement: Achievement) => void
  addXpFromAPI: (amount: number) => Promise<void>
  levelUpFromAPI: () => Promise<void>
}

// Create context
const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
)

// Helper to dispatch character events
const dispatchCharacterEvent = (eventName: string, detail?: any) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

// Context provider
export const CharacterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [character, setCharacter] = useState<Character | null>(null)
  const [jobClass, setJobClass] = useState<JobClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch character data from API
  const fetchCharacterData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/me/character')
      if (!response.ok) {
        signOut({ callbackUrl: '/' })
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Transform achievements ให้มี icon component
      const transformedCharacter = {
        ...data.character,
        achievements: data.character.achievements.map((achievement: any) => ({
          ...achievement,
          // เก็บ icon เป็น string ไว้ก่อน จะแปลงเป็น React component ตอน render
        })),
      }
      setCharacter(transformedCharacter)
      setJobClass(data.jobClass)
    } catch (err) {
      console.error('Error fetching character data:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Load character data on mount
  useEffect(() => {
    fetchCharacterData()
  }, [])

  // Update job level when character level changes
  useEffect(() => {
    if (character && jobClass) {
      const newJobLevel = getJobLevelForCharacter(jobClass, character.level)
      const newTitle = getJobTitleForLevel(jobClass, character.level)

      if (newJobLevel !== character.currentJobLevel) {
        setCharacter({
          ...character,
          currentJobLevel: newJobLevel,
          title: newTitle,
        })

        // Dispatch job level up event if it increased
        if (newJobLevel > character.currentJobLevel) {
          dispatchCharacterEvent('character:joblevelup', {
            level: newJobLevel,
            title: newTitle,
          })
        }
      }
    }
  }, [character?.level, jobClass])

  // Helper to get job level based on character level
  const getJobLevelForCharacter = (
    jobClass: JobClass,
    characterLevel: number
  ): number => {
    if (!jobClass || !jobClass.levels || jobClass.levels.length === 0) {
      return 1
    }

    for (let i = jobClass.levels.length - 1; i >= 0; i--) {
      if (characterLevel >= jobClass.levels[i].requiredCharacterLevel) {
        return jobClass.levels[i].level
      }
    }
    return jobClass.levels[0]?.level || 1 // Default to first level
  }

  // Helper to get job title based on character level
  const getJobTitleForLevel = (
    jobClass: JobClass,
    characterLevel: number
  ): string => {
    if (!jobClass || !jobClass.levels || jobClass.levels.length === 0) {
      return 'Unknown Title'
    }

    for (let i = jobClass.levels.length - 1; i >= 0; i--) {
      if (characterLevel >= jobClass.levels[i].requiredCharacterLevel) {
        return jobClass.levels[i].title
      }
    }
    return jobClass.levels[0]?.title || 'Unknown Title'
  }

  // Add XP and handle level up
  const addXp = (amount: number) => {
    if (!character) return

    let newXp = character.currentXP + amount
    let newLevel = character.level
    let leveledUp = false
    let newNextLevelXp = character.nextLevelXP

    // Check for level up
    while (newXp >= newNextLevelXp) {
      newXp -= newNextLevelXp
      newLevel++
      leveledUp = true
      // Next level requires more XP (ปรับตาม logic ที่คุณต้องการ)
      newNextLevelXp = Math.floor(newNextLevelXp * 1.2)
    }

    // Update character
    setCharacter({
      ...character,
      currentXP: newXp,
      level: newLevel,
      nextLevelXP: newNextLevelXp,
      totalXP: character.totalXP + amount,
    })

    // Handle level up event
    if (leveledUp) {
      dispatchCharacterEvent('character:levelup', { level: newLevel })
    }
  }

  // Unlock achievement
  const unlockAchievement = (achievementId: number) => {
    if (!character) return

    const achievement = character.achievements.find(
      (a: any) => a.id === achievementId
    )
    if (!achievement || achievement.earned) return

    // Update achievement
    const updatedAchievements = character.achievements.map((a: any) =>
      a.id === achievementId
        ? { ...a, earned: true, earnedOn: new Date().toISOString() }
        : a
    )

    // Update character
    setCharacter({
      ...character,
      achievements: updatedAchievements,
    })

    // Dispatch achievement event
    dispatchCharacterEvent('character:achievement', achievement)
  }

  // Animation helpers
  const showLevelUpAnimation = () => {
    dispatchCharacterEvent('character:levelup', {
      level: character?.level || 1,
    })
  }

  const showAchievementAnimation = (achievement: Achievement) => {
    dispatchCharacterEvent('character:achievement', achievement)
  }

  // Refetch function for error recovery
  const refetch = async () => {
    await fetchCharacterData()
  }

  const addXpFromAPI = async (amount: number) => {
    try {
      const result = await characterService.addXP(amount)

      if (result.success) {
        setCharacter(result.data.character)

        // เพิ่ม notifications เข้า queue โดยไม่ต้องรอ
        if (result.data.leveledUp) {
          notificationQueue.enqueue({
            type: 'levelup',
            data: {
              level: result.data.character.level,
            },
            priority: 1,
          })
        }

        // Class Unlock notifications
        if (result.data.unlockedClassLevel) {
          notificationQueue.enqueue({
            type: 'classunlock',
            data: {
              classLevel: result.data.unlockedClassLevel,
              portraitUrl: result.data.character.portrait,
            },
            priority: 2,
          })
        }

        // Job Title notification
        if (result.data.newJobLevel) {
          notificationQueue.enqueue({
            type: 'jobtitle',
            data: {
              newTitle: result.data.newJobLevel.title,
              level: result.data.newJobLevel.level,
            },
            priority: 10,
          })
        }
      }
    } catch (error) {
      console.error('Error adding XP:', error)
    }
  }

  const levelUpFromAPI = async () => {
    try {
      const result = await characterService.levelUp()

      if (result.success) {
        setCharacter(result.data.character)

        // เพิ่ม notifications เข้า queue
        notificationQueue.enqueue({
          type: 'levelup',
          data: {
            level: result.data.character.level,
          },
          priority: 1,
        })

        if (result.data.unlockedClassLevel) {
          notificationQueue.enqueue({
            type: 'classunlock',
            data: {
              classLevel: result.data.unlockedClassLevel,
              portraitUrl: result.data.character.portrait,
            },
            priority: 2,
          })
        }

        // Job Title notification
        if (result.data.newJobLevel) {
          notificationQueue.enqueue({
            type: 'jobtitle',
            data: {
              newTitle: result.data.newJobLevel.title,
              level: result.data.newJobLevel.level,
            },
            priority: 10,
          })
        }
      }
    } catch (error) {
      console.error('Error leveling up:', error)
    }
  }

  const value = {
    character,
    jobClass,
    loading,
    error,
    refetch,
    addXp,
    unlockAchievement,
    showLevelUpAnimation,
    showAchievementAnimation,
    addXpFromAPI,
    levelUpFromAPI,
    // submitDailyQuestFromAPI,
  }

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  )
}

// Hook for using the context
export const useCharacter = () => {
  const context = useContext(CharacterContext)

  if (context === undefined)
    throw new Error('useCharacter must be used within a CharacterProvider')

  return context
}
