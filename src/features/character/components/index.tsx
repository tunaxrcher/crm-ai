'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import NotificationQueueDebug from '@src/components/NotificationQueueDebug'
import { ErrorDisplay, SkeletonLoading } from '@src/components/shared'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import { useNotification } from '@src/components/ui/notification-system'
import { useCharacter } from '@src/contexts/CharacterContext'
import { AlertCircle } from 'lucide-react'

import AchievementSection from './AchievementSection'
import CharacterInfoSection from './CharacterInfoSection'
import CharacterProfile from './CharacterProfile'
import CharacterRadarChart from './CharacterRadarChart'
import JobProgressionDialog from './JobProgressionDialog'
import QuestStatistics from './QuestStatistics'

export default function CharacterPageComponent() {
  // 🧠 ─── Context & Hook Data ───────────────────────────
  const {
    character,
    jobClass,
    loading,
    error,
    refetch,
    addXp,
    showLevelUpAnimation,
    addXpFromAPI,
    levelUpFromAPI,
    // submitDailyQuestFromAPI,
  } = useCharacter()

  // 📦 ─── State ───────────────────────────────────────────────
  const [showProgressionDialog, setShowProgressionDialog] = useState(false)
  const [radarAnimation, setRadarAnimation] = useState(0)
  const [statHighlight, setStatHighlight] = useState(0)
  const { addNotification } = useNotification()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  // 🛠 ─── Handlers ────────────────────────────────────────────
  const testNotifications = () => {
    addNotification({
      type: 'reward',
      title: 'Development Test',
      message: 'Testing XP notification system',
      duration: 3000,
    })

    // setTimeout(() => {
    //   showLevelUpAnimation()
    // }, 1500)
  }

  const handleAddXp = async () => {
    setLoadingAction('addXp')
    try {
      await addXpFromAPI(100)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleLevelUp = async () => {
    setLoadingAction('levelUp')
    try {
      await levelUpFromAPI()
    } finally {
      setLoadingAction(null)
    }
  }

  // 🔄 ─── Effects ────────────────────────────────────────
  // Animate the radar chart
  useEffect(() => {
    const radarInterval = setInterval(() => {
      setRadarAnimation((prev) => (prev + 1) % 100)
    }, 50)

    const highlightInterval = setInterval(() => {
      setStatHighlight((prev) => (prev + 1) % 8) // 5 stats + 3 padding
    }, 2000)

    return () => {
      clearInterval(radarInterval)
      clearInterval(highlightInterval)
    }
  }, [])

  // Loading และ Error states
  if (loading || !character) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="character" text="กำลังโหลดข้อมูลตัวละคร..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 pb-20">
        <ErrorDisplay
          title="ไม่สามารถโหลดข้อมูลตัวละครได้"
          message="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง"
          severity="error"
          onRetry={refetch}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    )
  }

  // 🧮 ─── Derived Values ────────────────────────────────
  // Calculations
  const xpPercentage = Math.round(
    (character.currentXP / character.nextLevelXP) * 100
  )

  // สร้าง stats object สำหรับ radar chart (เพิ่ม LUK เพื่อให้ chart ทำงานได้)
  const radarStats = {
    STR: character.stats.STR,
    VIT: character.stats.VIT,
    LUK: Math.floor((character.stats.AGI + character.stats.DEX) / 2), // คำนวณจาก AGI+DEX
    INT: character.stats.INT,
    DEX: character.stats.DEX,
    AGI: character.stats.AGI,
  }

  return (
    <>
      <div className="flex flex-col min-h-screen relative">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/tech-background.jpg"
            alt="Background"
            fill
            className="object-cover brightness-[0.8] blur-[2px]"
            priority
          />
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        {/* Header */}
        <div className="relative z-10 flex justify-center pt-6 mb-2">
          <h1 className="text-2xl font-bold ai-gradient-text">
            {character.jobClassName} (Job Class)
          </h1>
        </div>

        {/* Character Display with Radar Chart */}
        <div className="relative z-10 flex justify-center items-center h-[50vh] pt-4">
          <div className="relative w-[400px] h-[400px] flex items-center justify-center">
            <CharacterRadarChart
              radarAnimation={radarAnimation}
              statHighlight={statHighlight}
              stats={radarStats}
            />
            <CharacterProfile character={character} />
          </div>
        </div>

        {/* Character Info */}
        <div className="relative z-10 flex-1 px-8 pb-10">
          <CharacterInfoSection
            character={character}
            xpPercentage={xpPercentage}
            // onAllocateStats={handleAllocateStats}
          />

          <AchievementSection achievements={character.achievements} />

          {process.env.NODE_ENV === 'development' && (
          // {true && (
            <>
              <hr className="mt-5" />
              <Card className="mb-4 mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                    Development Testing ไว้เทสเฉย ๆ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={testNotifications}
                    className="w-full">
                    🔔 ทดสอบ Notification
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddXp}
                    disabled={loadingAction === 'addXp'}
                    className="w-full">
                    {loadingAction === 'addXp'
                      ? '⏳ กำลังเพิ่ม XP...'
                      : '➕ เพิ่ม 100 XP'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLevelUp}
                    disabled={loadingAction === 'levelUp'}
                    className="w-full">
                    {loadingAction === 'levelUp'
                      ? '⏳ กำลังเลเวลอัพ...'
                      : '⬆️ เลเวลอัพ'}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          <hr />

          <QuestStatistics questStats={character.questStats} />

          <JobProgressionDialog
            open={showProgressionDialog}
            onOpenChange={setShowProgressionDialog}
            character={character}
            jobClass={jobClass}
          />
        </div>

        <NotificationQueueDebug />

        {/* Styles */}
        <style jsx global>{`
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0px);
            }
          }

          @keyframes pulse-purple {
            0% {
              box-shadow: 0 0 0 0 rgba(192, 132, 252, 0.4);
            }
            70% {
              box-shadow: 0 0 0 5px rgba(192, 132, 252, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(192, 132, 252, 0);
            }
          }

          @keyframes pulse-blue {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            }
            70% {
              box-shadow: 0 0 0 5px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }

          @keyframes pulse-cyan {
            0% {
              box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4);
            }
            70% {
              box-shadow: 0 0 0 5px rgba(34, 211, 238, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
            }
          }
        `}</style>
      </div>
    </>
  )
}
