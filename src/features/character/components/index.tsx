'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { ErrorDisplay, SkeletonLoading } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import { useNotification } from '@src/components/ui/notification-system'
import useErrorHandler from '@src/hooks/useErrorHandler'
import {
  AlertCircle,
  BadgePercent,
  Clock,
  Shield,
  Swords,
  Zap,
} from 'lucide-react'

import { useCharacter } from '../context/CharacterContext'
import {
  useCharacter as useCharacterAPI,
  useStatAllocation,
  useXPTable,
} from '../hook/api'
import { Stat } from '../types'
import AchievementSection from './AchievementSection'
import CharacterInfoSection from './CharacterInfoSection'
import CharacterRadarChart from './CharacterRadarChart'
import JobProgressionDialog from './JobProgressionDialog'
import QuestStatistics from './QuestStatistics'
import StatAllocationDialog from './StatAllocationDialog'

export default function CharacterPageComponent() {
  const [radarAnimation, setRadarAnimation] = useState(0) // For radar animation
  const [statHighlight, setStatHighlight] = useState(-1) // For stat highlight animation

  // Character stats - ใช้ข้อมูลจริงจาก API
  // (ยังต้องเก็บ structure เดิมไว้เพื่อไม่กระทบ radar chart)
  const stats = {
    STR: 75, // จะต้องเปลี่ยนเป็น character.stats.STR เมื่อโหลดเสร็จ
    VIT: 60,
    LUK: 45, // เก็บไว้เพื่อ radar chart ยังทำงานได้
    INT: 85,
    DEX: 70,
    AGI: 65,
  }

  // Animate the radar chart
  useEffect(() => {
    const radarInterval = setInterval(() => {
      setRadarAnimation((prev) => (prev + 1) % 100)
    }, 50)

    const highlightInterval = setInterval(() => {
      setStatHighlight((prev) => (prev + 1) % (Object.keys(stats).length + 3))
    }, 2000)

    return () => {
      clearInterval(radarInterval)
      clearInterval(highlightInterval)
    }
  }, [])

  // API และ context hooks
  const {
    character: apiCharacter,
    jobClass,
    isLoading: apiLoading,
    error,
    refetchCharacter,
  } = useCharacterAPI()
  const { allocateStats, isAllocating } = useStatAllocation()
  const { xpTable, isLoading: xpTableLoading } = useXPTable()
  const { showError } = useError()
  const { handleAsyncOperation } = useErrorHandler()

  const { addXp, showLevelUpAnimation } = useCharacter()

  const { addNotification } = useNotification()

  // State
  const [showLevelDialog, setShowLevelDialog] = useState(false)
  const [tempStats, setTempStats] = useState<Stat | null>(null)
  const [statPoints, setStatPoints] = useState(0)
  const [showProgressionDialog, setShowProgressionDialog] = useState(false)

  const character = apiCharacter
  const isLoading = apiLoading || xpTableLoading

  // Effects
  useEffect(() => {
    if (character && !tempStats) {
      setTempStats({ ...character.stats })
      setStatPoints(character.statPoints)
    }
  }, [character])

  // Loading และ Error states
  if (isLoading || !character || !tempStats) {
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
          onRetry={refetchCharacter}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    )
  }

  // Calculations
  const xpPercentage = Math.round(
    (character.currentXP / character.nextLevelXP) * 100
  )

  // Functions
  const getStatDescription = (stat: string) => {
    switch (stat) {
      case 'AGI':
        return 'ความเร็ว, การตอบสนอง'
      case 'STR':
        return 'ความสามารถในการรับมือกับงานหนัก'
      case 'DEX':
        return 'ความแม่นยำ, ความถูกต้อง'
      case 'VIT':
        return 'ความสม่ำเสมอ, ความอดทน'
      case 'INT':
        return 'การวางแผน, การวิเคราะห์'
      default:
        return ''
    }
  }

  const allocatePoint = (stat: keyof typeof tempStats) => {
    if (statPoints > 0) {
      setTempStats((prev) => ({
        ...prev!,
        [stat]: prev![stat] + 1,
      }))
      setStatPoints((prev) => prev - 1)
    }
  }

  const deallocatePoint = (stat: keyof typeof tempStats) => {
    if (tempStats[stat] > character.stats[stat]) {
      setTempStats((prev) => ({
        ...prev!,
        [stat]: prev![stat] - 1,
      }))
      setStatPoints((prev) => prev + 1)
    }
  }

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'AGI':
        return <Zap className="h-5 w-5" />
      case 'STR':
        return <Swords className="h-5 w-5" />
      case 'DEX':
        return <BadgePercent className="h-5 w-5" />
      case 'VIT':
        return <Clock className="h-5 w-5" />
      case 'INT':
        return <Shield className="h-5 w-5" />
      default:
        return null
    }
  }

  const confirmStatAllocation = async () => {
    const result = await handleAsyncOperation(async () => {
      return await allocateStats(character.id, tempStats)
    })

    if (result) {
      setShowLevelDialog(false)
      showError('อัพเดทสถิติตัวละครสำเร็จ', {
        severity: 'info',
        autoHideAfter: 3000,
      })
    } else {
      showError('ไม่สามารถอัปเดตสถิติได้', {
        severity: 'error',
        message: 'โปรดลองอีกครั้งในภายหลัง',
      })
    }
  }

  const handleAllocateStats = () => {
    setTempStats({ ...character.stats })
    setStatPoints(character.statPoints)
    setShowLevelDialog(true)
  }

  const testNotifications = () => {
    addNotification({
      type: 'reward',
      title: 'Development Test',
      message: 'Testing XP notification system',
      duration: 3000,
    })

    addXp(50)

    setTimeout(() => {
      showLevelUpAnimation()
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen relative ">
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
          นักขายมืออาชีพ (Job Class)
        </h1>
      </div>

      {/* Character Display with Radar Chart */}
      <div className="relative z-10 flex justify-center items-center h-[50vh] pt-4">
        <CharacterRadarChart
          radarAnimation={radarAnimation}
          statHighlight={statHighlight}
          stats={stats}
        />
      </div>

      {/* Character Info */}
      <div className="relative z-10 flex-1 px-8 pb-10">
        <CharacterInfoSection
          character={character}
          xpPercentage={xpPercentage}
        />

        <AchievementSection />

        <QuestStatistics questStats={character.questStats} />

        {/* Development testing button */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                Development Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={testNotifications}
                className="w-full">
                Test Notifications
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <StatAllocationDialog
          open={showLevelDialog}
          onOpenChange={setShowLevelDialog}
          tempStats={tempStats}
          statPoints={statPoints}
          character={character}
          isAllocating={isAllocating}
          getStatDescription={getStatDescription}
          getStatIcon={getStatIcon}
          allocatePoint={allocatePoint}
          deallocatePoint={deallocatePoint}
          confirmStatAllocation={confirmStatAllocation}
          setTempStats={setTempStats}
          setStatPoints={setStatPoints}
          setShowLevelDialog={setShowLevelDialog}
        />

        <JobProgressionDialog
          open={showProgressionDialog}
          onOpenChange={setShowProgressionDialog}
          character={character}
          jobClass={jobClass}
        />
      </div>

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
  )
}
