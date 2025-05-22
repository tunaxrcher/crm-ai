'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

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
import { Progress } from '@src/components/ui/progress'
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
import QuestStatistics from './QuestStatistics'

export default function CharacterPageComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [expProgress, setExpProgress] = useState(50) // For EXP bar animation
  const [radarAnimation, setRadarAnimation] = useState(0) // For radar animation
  const [statHighlight, setStatHighlight] = useState(-1) // For stat highlight animation

  // Character stats (values from 0-100)
  const stats = {
    STR: 75, // Strength
    VIT: 60, // Vitality
    LUK: 45, // Luck
    INT: 85, // Intelligence
    DEX: 70, // Dexterity
    AGI: 65, // Agility
  }

  // Animate the EXP bar
  useEffect(() => {
    const interval = setInterval(() => {
      setExpProgress((prev) => {
        // Create a pulsing effect between 48 and 52
        if (prev >= 52) return 48
        return prev + 0.5
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Animate the radar chart
  useEffect(() => {
    // Radar pulse animation
    const radarInterval = setInterval(() => {
      setRadarAnimation((prev) => (prev + 1) % 100)
    }, 50)

    // Stat highlight animation
    const highlightInterval = setInterval(() => {
      setStatHighlight((prev) => (prev + 1) % (Object.keys(stats).length + 3))
    }, 2000)

    return () => {
      clearInterval(radarInterval)
      clearInterval(highlightInterval)
    }
  }, [])

  // Draw the radar chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions with higher resolution for retina displays
    const size = 400 // Increased from 320 to 400
    canvas.width = size * 2
    canvas.height = size * 2
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(2, 2)

    // Center of the chart
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 40 // Adjusted radius

    // Number of stats (sides of the polygon)
    const numStats = Object.keys(stats).length

    // Function to convert polar to cartesian coordinates
    const getCoordinates = (angle: number, value: number) => {
      const adjustedAngle = angle - Math.PI / 2 // Start from top
      const x = centerX + value * radius * Math.cos(adjustedAngle)
      const y = centerY + value * radius * Math.sin(adjustedAngle)
      return { x, y }
    }

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw rotating background effect
    // const rotationOffset = (radarAnimation / 100) * Math.PI * 2
    // ctx.beginPath()
    // for (let i = 0; i <= 30; i++) {
    //   const angle = (i / 30) * Math.PI * 2 + rotationOffset
    //   const innerRadius = radius * 0.2
    //   const outerRadius = radius * 1.05
    //   const x1 = centerX + innerRadius * Math.cos(angle)
    //   const y1 = centerY + innerRadius * Math.sin(angle)
    //   const x2 = centerX + outerRadius * Math.cos(angle)
    //   const y2 = centerY + outerRadius * Math.sin(angle)

    //   ctx.moveTo(x1, y1)
    //   ctx.lineTo(x2, y2)
    // }
    // ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    // ctx.lineWidth = 1
    // ctx.stroke()

    // Draw background hexagon layers
    for (let layer = 5; layer > 0; layer--) {
      const layerValue = layer / 5
      ctx.beginPath()
      for (let i = 0; i <= numStats; i++) {
        const angle = (i % numStats) * ((2 * Math.PI) / numStats)
        const { x, y } = getCoordinates(angle, layerValue)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + 0.1 * (5 - layer)})`
      ctx.fill()

      // Draw layer border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw stat lines from center
    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const { x, y } = getCoordinates(angle, 1)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw stat labels
    const statNames = Object.keys(stats)
    ctx.font = '14px sans-serif' // Increased font size
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const { x, y } = getCoordinates(angle, 1.15)

      // Highlight the current stat
      if (i === statHighlight) {
        ctx.fillStyle = '#22d3ee' // Cyan highlight
        ctx.font = 'bold 16px sans-serif'
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '14px sans-serif'
      }

      ctx.fillText(statNames[i], x, y)
    }

    // Draw character stats polygon with animation
    const animationProgress = Math.sin(radarAnimation / 16) * 0.05 + 0.95 // Subtle pulsing between 90% and 100%

    ctx.beginPath()
    const statValues = Object.values(stats)
    for (let i = 0; i <= numStats; i++) {
      const angle = (i % numStats) * ((2 * Math.PI) / numStats)
      const value = (statValues[i % numStats] / 100) * animationProgress
      const { x, y } = getCoordinates(angle, value)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()

    // Fill with gradient - updated to use the requested colors
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    )
    gradient.addColorStop(0, 'rgba(192, 132, 252, 0.7)') // #c084fc with opacity
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)') // #3b82f6 with opacity
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.3)') // #22d3ee with opacity
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw border with glow effect
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)' // #c084fc with opacity
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw outer glow ring
    ctx.beginPath()
    for (let i = 0; i <= numStats; i++) {
      const angle = (i % numStats) * ((2 * Math.PI) / numStats)
      const value =
        (statValues[i % numStats] / 100) * (animationProgress + 0.05)
      const { x, y } = getCoordinates(angle, value)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)' // #22d3ee with opacity
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw stat points with pulsing effect
    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const value = (statValues[i] / 100) * animationProgress
      const { x, y } = getCoordinates(angle, value)

      // Determine if this point should be highlighted
      const isHighlighted = i === statHighlight
      const pointSize = isHighlighted ? 7 : 5
      const glowSize = isHighlighted ? 15 : 0

      // Draw glow if highlighted
      if (isHighlighted) {
        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, 2 * Math.PI)
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        glowGradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)')
        glowGradient.addColorStop(1, 'rgba(34, 211, 238, 0)')
        ctx.fillStyle = glowGradient
        ctx.fill()
      }

      // Draw the point
      ctx.beginPath()
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
      ctx.fillStyle = isHighlighted ? '#22d3ee' : 'rgba(34, 211, 238, 0.8)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw center pulse
    const pulseSize = Math.sin(radarAnimation / 8) * 5 + 10
    ctx.beginPath()
    ctx.arc(centerX, centerY, pulseSize, 0, 2 * Math.PI)
    const pulseGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      pulseSize
    )
    pulseGradient.addColorStop(0, 'rgba(192, 132, 252, 0.8)')
    pulseGradient.addColorStop(1, 'rgba(192, 132, 252, 0)')
    ctx.fillStyle = pulseGradient
    ctx.fill()
  }, [radarAnimation, statHighlight, stats])

  // Floating animation for character
  const floatingAnimation = {
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
      '0%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
      '100%': { transform: 'translateY(0px)' },
    },
  }

  // ===============================

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

      {/* "Young Explorer" at the very top */}
      <div className="relative z-10 flex justify-center pt-6">
        <h1 className="text-2xl font-bold ai-gradient-text">
          นักขายมืออาชีพ (Job Class)
        </h1>
      </div>

      {/* Character Display with Radar Chart */}
      <div className="relative z-10 flex justify-center items-center h-[50vh] pt-4">
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          {/* Radar Chart */}
          <canvas
            ref={canvasRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
          />

          {/* Character Image */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              animation: 'float 6s ease-in-out infinite',
            }}>
            <Image
              src="/character-image.png"
              alt="Character"
              width={240}
              height={240}
              className="z-10"
            />
          </div>
        </div>
      </div>

      {/* Character Info - with improved spacing and glass effect */}
      <div className="relative z-10 flex-1 px-8 pb-10">
        <div className="flex justify-center">
          <div className="mb-6 w-full max-w-md">
            <div className="flex items-center justify-center mb-2">
              <span className="text-sm font-semibold px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md border border-purple-400/30">
                Level 2
              </span>
            </div>
            <h2 className="text-4xl font-bold mt-2 mb-1 text-white text-center">
              ชื่อ ทดสอบ ทดสอบ
            </h2>

            <div className="mt-4 flex items-center w-full max-w-xs mx-auto">
              <span className="text-xs text-muted-foreground mr-2">
                Level 2
              </span>
              <Progress value={50} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground ml-2">
                Level {2 + 1}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-center text-sm">
              <Award className="h-4 w-4 mr-1 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                {1000} / {2000} XP
              </span>
            </div>
          </div>
        </div>

        {/* Achievement Section (formerly Team Section) */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Achievement</h3>
            <button className="text-xs text-white/70 px-2 hover:text-cyan-300 transition-colors duration-300">
              All achievements
            </button>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-base">Insurgency</span>
            <div className="flex space-x-3">
              <div
                className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
                style={{
                  animation: 'pulse-purple 3s infinite',
                }}>
                🏆
              </div>
              <div
                className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
                style={{
                  animation: 'pulse-blue 3s infinite 1s',
                }}>
                ⚡
              </div>
              <div
                className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-cyan-300/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
                style={{
                  animation: 'pulse-cyan 3s infinite 2s',
                }}>
                🥇
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section - with improved spacing and glass effect */}
        {/* <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20">
          <h3 className="text-sm text-white/70 mb-3 font-medium">
            Statistics of the last battle
          </h3>
          <button className="w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-400/20 hover:from-purple-500/30 hover:via-blue-500/30 hover:to-cyan-400/30 text-white font-bold py-3 rounded-md mt-2 shadow-sm backdrop-blur-sm border border-purple-400/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(192,132,252,0.5)]">
            Equip card
          </button>
        </div> */}

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
                  const isCurrentLevel =
                    character.currentJobLevel === level.level
                  const isLocked =
                    character.level < level.requiredCharacterLevel

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
              <Button onClick={() => setShowProgressionDialog(false)}>
                ปิด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
