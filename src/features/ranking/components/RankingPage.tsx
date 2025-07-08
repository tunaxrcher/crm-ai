// src/features/ranking/components/RankingPage.tsx
'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ErrorDisplay, SkeletonLoading } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'
import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@src/components/ui/tabs'
import CharacterDialog from '@src/features/character/components/CharacterDialog'
import { withErrorHandling } from '@src/hooks'
import {
  Award,
  Calendar,
  ChevronRight,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react'

import { useJobClasses, useRankings } from '../hooks/api'
import { CharacterClass, RankingPeriod } from '../types'

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

// src/features/ranking/components/RankingPage.tsx

function RankingPageComponent() {
  const router = useRouter()
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null)
  const [showCharacterDialog, setShowCharacterDialog] = useState(false)

  const [period, setPeriod] = useState<RankingPeriod>('all-time')
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('all')
  const [imageError, setImageError] = useState(false)
  const { jobClasses, isLoading: isLoadingClasses } = useJobClasses()

  const {
    topUser,
    currentUser,
    orderedRankings,
    isLoading,
    error,
    refresh: fetchRankings,
  } = useRankings(period, selectedClass)

  const { showError } = useError()

  const handleCharacterClick = (e: React.MouseEvent, character: any) => {
    console.log(character)
    // e.preventDefault() // ป้องกันการ navigate
    // setSelectedCharacter(character)
    // setShowCharacterDialog(true)
  }

  // Get position badge
  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500 text-black font-bold">
            <Crown className="h-5 w-5" />
          </div>
        )
      case 2:
        return (
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-black font-bold">
            <Medal className="h-5 w-5" />
          </div>
        )
      case 3:
        return (
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center bg-amber-600 text-black font-bold">
            <Award className="h-5 w-5" />
          </div>
        )
      default:
        return (
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center bg-secondary text-foreground font-bold text-xs">
            {position}
          </div>
        )
    }
  }

  // Get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span className="text-xs">{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
          <span className="text-xs">{Math.abs(change)}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center text-muted-foreground">
        <span className="text-xs">-</span>
      </div>
    )
  }

  // Handle avatar click to view character profile
  const handleViewCharacter = async (userId: string) => {
    try {
      router.push(`/profile/${userId}`)
    } catch (error) {
      showError('ไม่สามารถนำทางไปยังโปรไฟล์ได้', {
        message: 'โปรดลองอีกครั้งในภายหลัง',
        severity: 'error',
      })
      console.error('Navigation error:', error)
    }
  }

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setPeriod(value as RankingPeriod)
  }

  // Handle class change
  const handleClassChange = (value: string) => {
    setSelectedClass(value as CharacterClass)
  }

  // Render loading state
  if (isLoading || isLoadingClasses) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="ranking" text="กำลังโหลดข้อมูลอันดับ..." />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 pb-20">
        <ErrorDisplay
          title="ไม่สามารถโหลดข้อมูลอันดับได้"
          message="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง"
          severity="error"
          onRetry={fetchRankings}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold ai-gradient-text">อันดับผู้เล่น</h1>
        <p className="text-muted-foreground">
          ดูอันดับของคุณเทียบกับผู้เล่นอื่น
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList>
            <TabsTrigger value="all-time" className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              ตลอดกาล
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              รายสัปดาห์
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={selectedClass} onValueChange={handleClassChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="เลือกอาชีพ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกอาชีพ</SelectItem>
            {jobClasses.map((jobClass) => (
              <SelectItem key={jobClass.id} value={jobClass.id.toString()}>
                <div className="flex items-center gap-2">
                  {!imageError && jobClass.imageUrl && (
                    <Image
                      src={jobClass.imageUrl}
                      alt={jobClass.name}
                      width={16}
                      height={16}
                      className="rounded"
                      onError={() => setImageError(true)}
                    />
                  )}
                  {jobClass.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top 1 Spotlight Section */}
      {topUser && (
        <Card className="mb-6 overflow-hidden ai-gradient-border">
          <div className="p-6 pb-4 text-center">
            <h2 className="text-lg font-bold ai-gradient-text mb-1">
              ผู้เล่นอันดับ 1
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              #{period === 'weekly' ? 'สัปดาห์นี้' : 'ตลอดกาล'}
            </p>

            <div
              className="relative cursor-pointer mx-auto mb-2"
              onClick={(e) => handleCharacterClick(e, topUser)}>
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full overflow-hidden ai-gradient-border border-4 mx-auto">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={topUser.avatar} alt={topUser.name} />
                    <AvatarFallback>{topUser.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Crown animation */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
                </div>

                {/* Class image badge */}
                {/* {topUser.classImage && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-yellow-500 overflow-hidden">
                    <Image
                      src={topUser.classImage}
                      alt={topUser.class}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                )} */}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1">{topUser.name}</h3>
            <p className="text-sm text-muted-foreground">{topUser.title}</p>

            <div className="flex items-center justify-center mt-2 mb-4">
              <Badge className="mr-2">Lvl {topUser.level}</Badge>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-medium">
                  {topUser.xp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* <div className="flex justify-center">
              <Button
                size="sm"
                className="ai-gradient-bg"
                onClick={() => handleViewCharacter(topUser.id)}>
                <User className="h-4 w-4 mr-2" />
                ดูโปรไฟล์
              </Button>
            </div> */}
          </div>
        </Card>
      )}

      {/* Current User Card (if not #1) */}
      {currentUser && currentUser.position !== 1 && (
        <Card
          className={`mb-6 border border-blue-500/30 relative cursor-pointer`}
          onClick={(e) => handleCharacterClick(e, currentUser)}>
          <CardContent className="p-4">
            {getPositionBadge(currentUser.position)}

            <div className="flex items-center ml-6">
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="font-semibold flex items-center">
                  <span>{currentUser.name}</span>
                  <span className="ml-2 text-blue-400 text-xs">(คุณ)</span>
                  {/* {currentUser.classImage && (
                    <Image
                      src={currentUser.classImage}
                      alt={currentUser.class}
                      width={16}
                      height={16}
                      className="ml-2 rounded"
                    />
                  )} */}
                </div>
                <div className="text-sm flex items-center">
                  <Badge variant="outline" className="mr-2 text-xs">
                    Lvl {currentUser.level}
                  </Badge>
                  <span className="text-muted-foreground">
                    {currentUser.title}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{currentUser.xp.toLocaleString()} XP</span>
                </div>
                {/* <div className="flex justify-end">
                  {getChangeIndicator(currentUser.change)}
                </div> */}
              </div>

              <ChevronRight className="h-5 w-5 ml-2 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {orderedRankings.map((user) => (
          <div
            key={user.id}
            className={`relative rounded-lg ${
              user.id === currentUser?.id
                ? 'bg-blue-500/10 border border-blue-500/30'
                : 'bg-secondary/20'
            } p-3 cursor-pointer`}
            onClick={(e) => handleCharacterClick(e, user)}>
            {getPositionBadge(user.position)}

            <div className="flex items-center ml-6">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="font-medium flex items-center">
                  {user.name}
                  {user.id === currentUser?.id && (
                    <span className="ml-2 text-blue-400 text-xs">(คุณ)</span>
                  )}
                  {/* {selectedClass === 'all' && user.classImage && (
                    <Image
                      src={user.classImage}
                      alt={user.class}
                      width={16}
                      height={16}
                      className="ml-2 rounded"
                    />
                  )} */}
                </div>
                <div className="text-xs flex items-center">
                  <Badge variant="outline" className="mr-2 text-xs">
                    Lvl {user.level}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {user.title}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold flex items-center justify-end">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{user.xp.toLocaleString()} XP</span>
                </div>
                {/* <div className="flex justify-end">
                  {getChangeIndicator(user.change)}
                </div> */}
              </div>

              <ChevronRight className="h-5 w-5 ml-2 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Character Dialog */}
      <CharacterDialog
        isOpen={showCharacterDialog}
        onClose={() => {
          setShowCharacterDialog(false)
          setSelectedCharacter(null)
        }}
        character={selectedCharacter}
      />
    </div>
  )
}

export default withErrorHandling(RankingPageComponent)
