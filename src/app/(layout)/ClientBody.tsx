// src/app/ClientBody.tsx
'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { ImageWithFallback } from '@src/components/shared'
import NotificationSheet from '@src/components/shared/NotificationSheet'
import {
  AchievementUnlockedNotification,
  ClassUnlockNotification,
  JobTitleNotification,
  LevelUpNotification,
  XPGainedNotification,
} from '@src/components/ui/notification-system'
import { useCharacter } from '@src/contexts/CharacterContext'
import { Activity, Gift, ScrollText, Trophy, User } from 'lucide-react'

// src/app/ClientBody.tsx

// src/app/ClientBody.tsx

// src/app/ClientBody.tsx

// src/app/ClientBody.tsx

// src/app/ClientBody.tsx

// src/app/ClientBody.tsx

// src/app/ClientBody.tsx

// Client body wrapper without notification provider
export default function ClientBody({
  children,
}: {
  children: React.ReactNode
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = 'antialiased'
  }, [])

  return <ClientBodyInner>{children}</ClientBodyInner>
}

// Inner component without notification context
function ClientBodyInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // State for special notification animations
  const [showXPGained, setShowXPGained] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showClassUnlock, setShowClassUnlock] = useState(false)
  const [showJobTitle, setShowJobTitle] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)

  // Data for notifications
  const [xpData, setXpData] = useState({ amount: 0, questTitle: '' })
  const [currentLevel, setCurrentLevel] = useState(1)
  const [classData, setClassData] = useState({ level: 0, portraitUrl: '' })
  const [jobData, setJobData] = useState({ title: '', level: 0 })
  const [achievement, setAchievement] = useState({
    name: '',
    description: '',
    icon: <Trophy className="h-10 w-10 text-amber-400" />,
    reward: '',
  })

  // Get character data
  const { character } = useCharacter()

  // Register animation effects
  useEffect(() => {
    // ฟัง quest:xpgained event
    const handleXPGained = (event: any) => {
      const { amount, questTitle } = event.detail || {}
      if (amount && questTitle) {
        setXpData({ amount, questTitle })
        setShowXPGained(true)
      }
    }

    // ฟัง character:levelup event
    const handleLevelUp = (event: any) => {
      const { level } = event.detail || {}
      if (level) {
        setCurrentLevel(level)
        setShowLevelUp(true)
      }
    }

    // ฟัง character:classunlock event
    const handleClassUnlock = (event: any) => {
      const { classLevel, portraitUrl } = event.detail || {}
      if (classLevel) {
        setClassData({ level: classLevel, portraitUrl: portraitUrl || '' })
        setShowClassUnlock(true)
      }
    }

    // ฟัง character:jobtitle event
    const handleJobTitle = (event: any) => {
      const { newTitle, level } = event.detail || {}
      if (newTitle) {
        setJobData({ title: newTitle, level: level || 0 })
        setShowJobTitle(true)
      }
    }

    // ฟัง character:achievement event
    const handleAchievementUnlocked = (event: any) => {
      const achievementData = event.detail || {}
      setAchievement({
        name: achievementData.name || 'Achievement Unlocked',
        description: achievementData.description || 'Congratulations!',
        icon: achievementData.icon || (
          <Trophy className="h-10 w-10 text-amber-400" />
        ),
        reward: achievementData.reward || '',
      })
      setShowAchievement(true)
    }

    // เพิ่ม event listeners
    window.addEventListener('quest:xpgained', handleXPGained)
    window.addEventListener('character:levelup', handleLevelUp)
    window.addEventListener('character:classunlock', handleClassUnlock)
    window.addEventListener('character:jobtitle', handleJobTitle)
    window.addEventListener('character:achievement', handleAchievementUnlocked)

    return () => {
      window.removeEventListener('quest:xpgained', handleXPGained)
      window.removeEventListener('character:levelup', handleLevelUp)
      window.removeEventListener('character:classunlock', handleClassUnlock)
      window.removeEventListener('character:jobtitle', handleJobTitle)
      window.removeEventListener(
        'character:achievement',
        handleAchievementUnlocked
      )
    }
  }, [])

  // Skip footer on character creation page
  const isCharacterCreation = pathname === '/character/create'

  if (!character) return <></>

  return (
    <div className="antialiased">
      {!isCharacterCreation && (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4 max-w-md mx-auto">
          <Link href="/">
            <ImageWithFallback
              src="/auto-import-evx-logo.png"
              alt="Auto Import EVX Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center space-x-2">
            <NotificationSheet />
            <Link href="/character">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-black">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${character.portrait})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center -108px',
                    transform: 'scale(2.5)',
                  }}
                />
              </div>
            </Link>
          </div>
        </header>
      )}

      <main
        className={`mobile-container ${!isCharacterCreation ? 'pt-16' : ''}`}>
        {children}
      </main>

      {!isCharacterCreation && (
        <footer className="mobile-footer z-50">
          <Link
            href="/character"
            className={`footer-icon ${
              pathname === '/character'
                ? 'ai-gradient-text'
                : 'text-muted-foreground'
            }`}>
            <User className="h-6 w-6 mb-1" />
            <span>Character</span>
          </Link>

          <Link
            href="/feed"
            className={`footer-icon ${
              pathname === '/feed'
                ? 'ai-gradient-text'
                : 'text-muted-foreground'
            }`}>
            <Activity className="h-6 w-6 mb-1" />
            <span>Feed</span>
          </Link>

          <Link
            href="/quest"
            className={`footer-icon ${
              pathname === '/quest'
                ? 'ai-gradient-text'
                : 'text-muted-foreground'
            }`}>
            <ScrollText className="h-6 w-6 mb-1" />
            <span>Quest</span>
          </Link>

          <Link
            href="/ranking"
            className={`footer-icon ${
              pathname === '/ranking'
                ? 'ai-gradient-text'
                : 'text-muted-foreground'
            }`}>
            <Trophy className="h-6 w-6 mb-1" />
            <span>Ranking</span>
          </Link>

          <Link
            href="/reward"
            className={`footer-icon ${
              pathname === '/reward'
                ? 'ai-gradient-text'
                : 'text-muted-foreground'
            }`}>
            <Gift className="h-6 w-6 mb-1" />
            <span>Reward</span>
          </Link>
        </footer>
      )}

      {/* Special notification animations */}
      <XPGainedNotification
        xpAmount={xpData.amount}
        questTitle={xpData.questTitle}
        isVisible={showXPGained}
        onClose={() => setShowXPGained(false)}
      />

      <LevelUpNotification
        level={currentLevel}
        isVisible={showLevelUp}
        onClose={() => setShowLevelUp(false)}
      />

      <ClassUnlockNotification
        classLevel={classData.level}
        portraitUrl={classData.portraitUrl}
        isVisible={showClassUnlock}
        onClose={() => setShowClassUnlock(false)}
      />

      <JobTitleNotification
        newTitle={jobData.title}
        jobLevel={jobData.level}
        isVisible={showJobTitle}
        onClose={() => setShowJobTitle(false)}
      />

      <AchievementUnlockedNotification
        achievement={achievement}
        isVisible={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </div>
  )
}
