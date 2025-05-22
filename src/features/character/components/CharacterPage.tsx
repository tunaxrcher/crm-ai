'use client'

import { useEffect, useState } from 'react'

import { ErrorDisplay, SkeletonLoading } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { useNotification } from '@src/components/ui/notification-system'
import { withErrorHandling } from '@src/hooks'
import useErrorHandler from '@src/hooks/useErrorHandler'
import {
  AlertCircle,
  Award,
  BadgePercent,
  Briefcase,
  Clock,
  Info,
  Shield,
  Swords,
  Zap,
} from 'lucide-react'

import { useCharacter } from '../context/CharacterContext'
import {
  useCharacter as useCharacterAPI,
  useJobClasses,
  useStatAllocation,
  useXPTable,
} from '../hook/api'
import { Stat } from '../types'
import AchievementList from './AchievementList'
import CharacterProfile from './CharacterProfile'
import QuestStatistics from './QuestStatistics'
import StatDisplay from './StatDisplay'

function CharacterPageComponent() {
  // API character hook
  const {
    character: apiCharacter,
    portrait,
    jobClass,
    isLoading: apiLoading,
    error,
    refetchCharacter,
  } = useCharacterAPI()
  const { allocateStats, isAllocating } = useStatAllocation()
  const { xpTable, isLoading: xpTableLoading } = useXPTable()
  const { jobClasses, isLoading: jobClassesLoading } = useJobClasses()
  const { showError } = useError()
  const { handleAsyncOperation } = useErrorHandler()

  // Character context
  const {
    character: contextCharacter,
    addXp,
    showLevelUpAnimation,
  } = useCharacter()

  // Notification system
  const { addNotification } = useNotification()

  // State for stat allocation dialog
  const [showLevelDialog, setShowLevelDialog] = useState(false)
  const [tempStats, setTempStats] = useState<Stat | null>(null)
  const [statPoints, setStatPoints] = useState(0)

  // State for progression modal
  const [showProgressionDialog, setShowProgressionDialog] = useState(false)

  // Use the API character as the source of truth for display and stat allocation
  const character = apiCharacter
  const isLoading = apiLoading || xpTableLoading || jobClassesLoading

  // Set initial values once character is loaded
  useEffect(() => {
    if (character && !tempStats) {
      setTempStats({ ...character.stats })
      setStatPoints(character.statPoints)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character])

  // Show loading state
  if (isLoading || !character || !tempStats) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="character" text="กำลังโหลดข้อมูลตัวละคร..." />
      </div>
    )
  }

  // Show error state with improved error component
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

  // XP percentage calculation
  const xpPercentage = Math.round(
    (character.currentXP / character.nextLevelXP) * 100
  )

  // Get stat abbreviation description
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

  // Handle stat point allocation
  const allocatePoint = (stat: keyof typeof tempStats) => {
    if (statPoints > 0) {
      setTempStats((prev) => ({
        ...prev!,
        [stat]: prev![stat] + 1,
      }))
      setStatPoints((prev) => prev - 1)
    }
  }

  // Handle stat point deallocation
  const deallocatePoint = (stat: keyof typeof tempStats) => {
    if (tempStats[stat] > character.stats[stat]) {
      setTempStats((prev) => ({
        ...prev!,
        [stat]: prev![stat] - 1,
      }))
      setStatPoints((prev) => prev + 1)
    }
  }

  // Get stat icon
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
    // Reset the temporary stats to current character stats before showing dialog
    setTempStats({ ...character.stats })
    setStatPoints(character.statPoints)
    setShowLevelDialog(true)
  }

  // Show job progression info
  const openProgressionDialog = () => {
    setShowProgressionDialog(true)
  }

  // Add a button to test notifications in development
  const testNotifications = () => {
    // Add XP notification
    addNotification({
      type: 'reward',
      title: 'Development Test',
      message: 'Testing XP notification system',
      duration: 3000,
    })

    // Add XP to character which will trigger level up if enough
    addXp(50)

    // Show level up animation
    setTimeout(() => {
      showLevelUpAnimation()
    }, 1500)
  }

  // Find next job level if not max already
  const nextJobLevel =
    jobClass && character.currentJobLevel < 6
      ? jobClass.levels[character.currentJobLevel]
      : null

  // Calculate XP progress to next job level
  const calculateProgressToNextJobLevel = () => {
    if (!nextJobLevel || !xpTable.length)
      return { xpNeeded: 0, percentage: 100 }

    const currentLevelXP =
      xpTable.find((x) => x.level === character.level)?.requiredXP || 0
    const nextLevelXP =
      xpTable.find((x) => x.level === nextJobLevel.requiredCharacterLevel)
        ?.requiredXP || 0

    const xpNeeded = nextLevelXP - currentLevelXP
    const currentProgress = character.totalXP - currentLevelXP
    const percentage = Math.min(
      100,
      Math.round((currentProgress / xpNeeded) * 100)
    )

    return { xpNeeded, percentage }
  }

  const { xpNeeded, percentage } = calculateProgressToNextJobLevel()

  return (
    <div className="p-4 pb-20">
      <CharacterProfile
        character={character}
        portrait={portrait}
        jobClass={jobClass}
        xpPercentage={xpPercentage}
        onAllocateStats={handleAllocateStats}
      />

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-400" />
            สถิติตัวละคร
          </CardTitle>
          <CardDescription>
            ความสามารถและความเชี่ยวชาญของตัวละคร
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatDisplay stats={character.stats} getStatIcon={getStatIcon} />

          <div className="text-xs text-muted-foreground mt-2 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>สถิติจะพัฒนาขึ้นเมื่อคุณทำภารกิจสำเร็จ</span>
          </div>
        </CardContent>
      </Card>

      {/* Job Progression Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
            อาชีพและความก้าวหน้า
          </CardTitle>
          <CardDescription>
            {jobClass?.description || 'อาชีพและความเชี่ยวชาญของคุณ'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">{character.jobClassName}</h3>
              <p className="text-sm text-muted-foreground">{character.title}</p>
            </div>
            <Badge className="bg-blue-500 hover:bg-blue-600">
              Class {character.currentJobLevel}
            </Badge>
          </div>

          {nextJobLevel ? (
            <>
              <div className="w-full bg-secondary/50 h-2 rounded-lg mb-1 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-lg transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Level {character.level}
                </span>
                <span className="text-muted-foreground">
                  Level {nextJobLevel.requiredCharacterLevel} (
                  {nextJobLevel.title})
                </span>
              </div>
            </>
          ) : (
            <div className="text-center bg-blue-500/10 rounded-md p-2 text-sm">
              <Award className="inline-block h-4 w-4 mr-1 text-blue-500" />
              <span>คุณได้ถึงระดับสูงสุดของอาชีพแล้ว</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={openProgressionDialog}>
            <Info className="h-4 w-4 mr-2" />
            ดูรายละเอียดอาชีพทั้งหมด
          </Button>
        </CardContent>
      </Card>

      <AchievementList achievements={character.achievements} />

      <QuestStatistics questStats={character.questStats} />

      {/* Development testing button - remove in production */}
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

      {/* Stat Allocation Dialog */}
      <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>จัดสรรคะแนนสถิติ</DialogTitle>
            <DialogDescription>
              คุณมีคะแนนสถิติ {statPoints} คะแนนที่สามารถจัดสรรได้
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {Object.entries(tempStats).map(([stat, value]) => (
              <div key={stat} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                    {getStatIcon(stat)}
                  </div>
                  <div>
                    <div className="font-medium">{stat}</div>
                    <div className="text-xs text-muted-foreground">
                      {getStatDescription(stat)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={
                      tempStats[stat as keyof Stat] <=
                      character.stats[stat as keyof Stat]
                    }
                    onClick={() => deallocatePoint(stat as keyof Stat)}>
                    -
                  </Button>

                  <div className="w-10 text-center font-bold">
                    {value}
                    {value > character.stats[stat as keyof Stat] && (
                      <span className="text-green-500 text-xs ml-1">
                        +{value - character.stats[stat as keyof Stat]}
                      </span>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={statPoints <= 0}
                    onClick={() => allocatePoint(stat as keyof Stat)}>
                    +
                  </Button>
                </div>
              </div>
            ))}

            <div className="bg-secondary/20 p-3 rounded-lg mt-4">
              <div className="text-sm font-medium mb-1">คำแนะนำจาก AI</div>
              <div className="text-sm text-muted-foreground">
                จากภารกิจล่าสุดของคุณ ควรพิจารณาลงทุนใน{' '}
                <span className="text-blue-400">INT</span> และ{' '}
                <span className="text-blue-400">DEX</span>{' '}
                เพื่อเพิ่มทักษะด้านการตลาดของคุณ
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTempStats({ ...character.stats })
                setStatPoints(character.statPoints)
                setShowLevelDialog(false)
              }}>
              ยกเลิก
            </Button>
            <Button
              className="ai-gradient-bg"
              disabled={statPoints === character.statPoints || isAllocating}
              onClick={confirmStatAllocation}>
              {isAllocating ? 'กำลังบันทึก...' : 'ยืนยันการจัดสรร'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Progression Dialog */}
      <Dialog
        open={showProgressionDialog}
        onOpenChange={setShowProgressionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ระบบอาชีพ</DialogTitle>
            <DialogDescription>
              การพัฒนาอาชีพและระดับความเชี่ยวชาญ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <h3 className="font-semibold flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
              {jobClass?.name || 'อาชีพปัจจุบัน'}
            </h3>

            <div className="text-sm text-muted-foreground mb-4">
              {jobClass?.description || 'รายละเอียดอาชีพ'}
            </div>

            <div className="space-y-3">
              {jobClass?.levels.map((level, index) => {
                const isCurrentLevel = character.currentJobLevel === level.level
                const isLocked = character.level < level.requiredCharacterLevel

                return (
                  <div
                    key={level.level}
                    className={`relative border rounded-md p-3 ${
                      isCurrentLevel
                        ? 'border-blue-500 bg-blue-500/10'
                        : isLocked
                          ? 'border-gray-600 bg-gray-800/30 opacity-60'
                          : 'border-gray-600'
                    }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-medium block mb-1">
                          {isLocked ? '🔒 ' : ''}
                          Class {level.level}: Level{' '}
                          {level.requiredCharacterLevel}
                        </span>
                        <span className="text-base font-semibold block">
                          {level.title}
                        </span>
                      </div>

                      {isCurrentLevel && (
                        <Badge className="bg-blue-500">ปัจจุบัน</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowProgressionDialog(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withErrorHandling(CharacterPageComponent)
