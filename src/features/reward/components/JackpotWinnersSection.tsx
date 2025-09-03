'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Crown, Trophy, User } from 'lucide-react'

import { useJackpotWinners } from '../hooks/api'

export default function JackpotWinnersSection() {
  const { data: winnersData, isLoading } = useJackpotWinners(20)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null
  )
  const [isHovered, setIsHovered] = useState(false)

  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum distance required to trigger a swipe
  const minSwipeDistance = 50

  const winners = winnersData?.data || []
  const showNavigation = winners.length >= 3 // แสดง navigation เมื่อมี 3 คนขึ้นไป

  const goToPrevious = () => {
    if (isAnimating || winners.length <= 1 || !showNavigation) return
    setSlideDirection('right')
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? winners.length - 1 : prevIndex - 1
      return newIndex
    })
  }

  const goToNext = () => {
    if (isAnimating || winners.length <= 1 || !showNavigation) return
    setSlideDirection('left')
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === winners.length - 1 ? 0 : prevIndex + 1
      return newIndex
    })
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (!showNavigation) return
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!showNavigation) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!showNavigation || !touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Swipe left = go to next
      goToNext()
    } else if (isRightSwipe) {
      // Swipe right = go to previous
      goToPrevious()
    }
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setSlideDirection(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  const getPreviousIndex = () => {
    return currentIndex === 0 ? winners.length - 1 : currentIndex - 1
  }

  const getNextIndex = () => {
    return currentIndex === winners.length - 1 ? 0 : currentIndex + 1
  }

  // Auto-scroll every 3 seconds (only if navigation is enabled)
  useEffect(() => {
    if (winners.length <= 1 || isHovered || isAnimating || !showNavigation)
      return

    const interval = setInterval(() => {
      goToNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [currentIndex, winners.length, isHovered, isAnimating, showNavigation])

  // If no winners are available
  if (isLoading || winners.length === 0) {
    return <div className="text-center p-4">ยังไม่มีผู้โชคดีถูก Jackpot</div>
  }

  // เมื่อมีผู้ชนะน้อยกว่า 3 คน แสดงแบบ grid
  if (!showNavigation) {
    return (
      <>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400 mb-2">
            🏆 แท่นรายชื่อ
          </h2>
          <p className="text-gray-400 text-sm">
            ผู้โชคดีได้รับ Jackpot จากตู้กาชา
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {winners.map((winner: any, index: number) => (
            <div key={winner.id} className="rounded-3xl shadow-2xl p-8 w-80">
              <div className="aspect-square relative mb-6 overflow-hidden rounded-2xl">
                {winner.currentPortraitUrl ? (
                  <Image
                    src={winner.currentPortraitUrl || '/placeholder.svg'}
                    alt={winner.characterName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Rank Badge */}
                <div className="absolute top-2 left-2">
                  {index + 1 === 1 ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">
                        #{index + 1}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {winner.characterName}
                </h2>
                <Badge variant="secondary" className="mb-3">
                  {winner.jobClassName}
                </Badge>
                <div className="text-sm text-muted-foreground mb-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold mb-2">
                    <Trophy className="h-5 w-5" />
                    <span className="text-lg">
                      {winner.jackpotAmount?.toLocaleString() || '0'} Xeny
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(winner.createdAt), 'dd MMM yyyy HH:mm', {
                      locale: th,
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400 mb-2">
          🏆 แท่นรายชื่อ
        </h2>
        <p className="text-gray-400 text-sm">
          ผู้โชคดีได้รับ Jackpot จากตู้กาชา
        </p>
      </div>
      <div
        className="relative flex items-center justify-center h-[500px] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <div className="relative w-full max-w-4xl flex items-center justify-center">
          {/* Previous Winner */}
          <div
            className={`absolute left-0 z-10 opacity-80 scale-75 transform -translate-x-4 md:-translate-x-8 transition-all duration-300
            ${isAnimating && slideDirection === 'left' ? 'translate-x-[-200%] opacity-0' : ''}
            ${isAnimating && slideDirection === 'right' ? 'translate-x-[50%] opacity-100 scale-90' : ''}`}>
            <div className="rounded-2xl shadow-lg p-4 md:p-6 w-48 md:w-64 opacity-20">
              <div className="aspect-square relative mb-3 md:mb-4 overflow-hidden rounded-xl">
                {winners[getPreviousIndex()]?.currentPortraitUrl ? (
                  <Image
                    src={
                      winners[getPreviousIndex()].currentPortraitUrl ||
                      '/placeholder.svg'
                    }
                    alt={winners[getPreviousIndex()].characterName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-center mb-1">
                {winners[getPreviousIndex()].characterName}
              </h3>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {winners[getPreviousIndex()].jobClassName}
                </Badge>
              </div>
            </div>
          </div>

          {/* Current Winner */}
          <div
            className={`z-20 transition-all duration-300
            ${isAnimating && slideDirection === 'left' ? 'translate-x-[-100%] opacity-0 scale-75' : ''}
            ${isAnimating && slideDirection === 'right' ? 'translate-x-[100%] opacity-0 scale-75' : ''}`}>
            <div className="rounded-3xl shadow-2xl p-8 w-80">
              <div className="aspect-square relative mb-6 overflow-hidden rounded-2xl">
                {winners[currentIndex]?.currentPortraitUrl ? (
                  <Image
                    src={
                      winners[currentIndex].currentPortraitUrl ||
                      '/placeholder.svg'
                    }
                    alt={winners[currentIndex].characterName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Rank Badge */}
                <div className="absolute top-2 left-2">
                  {currentIndex + 1 === 1 ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">
                        #{currentIndex + 1}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {winners[currentIndex].characterName}
                </h2>
                <Badge variant="secondary" className="mb-3">
                  {winners[currentIndex].jobClassName}
                </Badge>
                <div className="text-sm text-muted-foreground mb-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold mb-2">
                    <Trophy className="h-5 w-5" />
                    <span className="text-lg">
                      {winners[currentIndex].jackpotAmount?.toLocaleString() ||
                        '0'}{' '}
                      Xeny
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(
                      new Date(winners[currentIndex].createdAt),
                      'dd MMM yyyy HH:mm',
                      {
                        locale: th,
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Winner */}
          <div
            className={`absolute right-0 z-10 opacity-80 scale-75 transform translate-x-4 md:translate-x-8 transition-all duration-300
            ${isAnimating && slideDirection === 'right' ? 'translate-x-[200%] opacity-0' : ''}
            ${isAnimating && slideDirection === 'left' ? 'translate-x-[-50%] opacity-100 scale-90' : ''}`}>
            <div className="rounded-2xl shadow-lg p-4 md:p-6 w-48 md:w-64 opacity-20">
              <div className="aspect-square relative mb-3 md:mb-4 overflow-hidden rounded-xl">
                {winners[getNextIndex()]?.currentPortraitUrl ? (
                  <Image
                    src={
                      winners[getNextIndex()].currentPortraitUrl ||
                      '/placeholder.svg'
                    }
                    alt={winners[getNextIndex()].characterName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="text-sm md:text-lg font-semibold text-center mb-1">
                {winners[getNextIndex()].characterName}
              </h3>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {winners[getNextIndex()].jobClassName}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - แสดงเฉพาะเมื่อมี 3 คนขึ้นไป */}
        {showNavigation && (
          <>
            <Button
              onClick={goToPrevious}
              variant="outline"
              size="icon"
              disabled={isAnimating || winners.length <= 1}
              className="absolute left-2 md:left-16 z-30 bg-white/90 backdrop-blur-sm hover:border-2 border-indigo-200 hover:border-indigo-300 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg disabled:opacity-50">
              <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-indigo-600" />
            </Button>

            <Button
              onClick={goToNext}
              variant="outline"
              size="icon"
              disabled={isAnimating || winners.length <= 1}
              className="absolute right-2 md:right-16 z-30 bg-white/90 backdrop-blur-sm hover:border-2 border-indigo-200 hover:border-indigo-300 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg disabled:opacity-50">
              <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-indigo-600" />
            </Button>
          </>
        )}
      </div>
    </>
  )
}
