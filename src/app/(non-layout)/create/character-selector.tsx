'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import Image from 'next/image'

import { Button } from '@src/components/ui/button'
import type { JobClass } from '@src/features/character/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CharacterSelectorProps {
  jobClasses: JobClass[]
  selectedJobClassId: string | null
  onSelectJobClass: (jobClassId: string) => void
}

export default function CharacterSelector({
  jobClasses,
  selectedJobClassId,
  onSelectJobClass,
}: CharacterSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null
  )

  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum distance required to trigger a swipe
  const minSwipeDistance = 50

  useEffect(() => {
    // Find the index of the selected job class if any
    if (selectedJobClassId) {
      const index = jobClasses.findIndex((job) => job.id === selectedJobClassId)
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }
  }, [selectedJobClassId, jobClasses])

  const goToPrevious = () => {
    if (isAnimating || jobClasses.length <= 1) return
    setSlideDirection('right')
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? jobClasses.length - 1 : prevIndex - 1
      return newIndex
    })
  }

  const goToNext = () => {
    if (isAnimating || jobClasses.length <= 1) return
    setSlideDirection('left')
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === jobClasses.length - 1 ? 0 : prevIndex + 1
      return newIndex
    })
  }

  const selectCharacter = (index: number) => {
    if (isAnimating || index === currentIndex || index >= jobClasses.length)
      return
    setSlideDirection(index > currentIndex ? 'left' : 'right')
    setIsAnimating(true)
    setCurrentIndex(index)
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

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
    return currentIndex === 0 ? jobClasses.length - 1 : currentIndex - 1
  }

  const getNextIndex = () => {
    return currentIndex === jobClasses.length - 1 ? 0 : currentIndex + 1
  }

  // If no job classes are available
  if (jobClasses.length === 0) {
    return <div className="text-center p-4">ไม่พบข้อมูลอาชีพ</div>
  }

  return (
    <div
      className="relative flex items-center justify-center h-[500px] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>
      <div className="relative w-full max-w-4xl flex items-center justify-center">
        {/* Previous Character */}
        <div
          className={`absolute left-0 z-10 opacity-80 scale-75 transform -translate-x-4 md:-translate-x-8 transition-all duration-300
            ${isAnimating && slideDirection === 'left' ? 'translate-x-[-200%] opacity-0' : ''}
            ${isAnimating && slideDirection === 'right' ? 'translate-x-[50%] opacity-100 scale-90' : ''}`}>
          <div className="rounded-2xl shadow-lg p-4 md:p-6 w-48 md:w-64 opacity-20">
            <div className="aspect-square relative mb-3 md:mb-4 overflow-hidden rounded-xl">
              {jobClasses[getPreviousIndex()]?.imageUrl ? (
                <Image
                  src={
                    jobClasses[getPreviousIndex()].imageUrl ||
                    '/placeholder.svg'
                  }
                  alt={jobClasses[getPreviousIndex()].name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-center ">
              {jobClasses[getPreviousIndex()].name}
            </h3>
          </div>
        </div>

        {/* Current Character */}
        <div
          className={`z-20 transition-all duration-300
            ${isAnimating && slideDirection === 'left' ? 'translate-x-[-100%] opacity-0 scale-75' : ''}
            ${isAnimating && slideDirection === 'right' ? 'translate-x-[100%] opacity-0 scale-75' : ''}`}>
          <div
            className={`rounded-3xl shadow-2xl p-8 w-80 ${selectedJobClassId === jobClasses[currentIndex].id ? '' : ''}`}>
            <div className="aspect-square relative mb-6 overflow-hidden rounded-2xl">
              {jobClasses[currentIndex]?.imageUrl ? (
                <Image
                  src={jobClasses[currentIndex].imageUrl || '/placeholder.svg'}
                  alt={jobClasses[currentIndex].name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold  mb-3">
                {jobClasses[currentIndex].name}
              </h2>
              <p className=" mb-6">{jobClasses[currentIndex].description}</p>
              <div className="text-sm text-muted-foreground mb-4">
                <div>
                  <span className="ai-gradient-text">Level 1:</span>{' '}
                  {jobClasses[currentIndex].levels[0]?.title}
                </div>
                <div>
                  <span className="ai-gradient-text">Level 100:</span>{' '}
                  {jobClasses[currentIndex].levels[5]?.title}
                </div>
              </div>
              <Button
                className="w-full ai-gradient-bg"
                onClick={() => onSelectJobClass(jobClasses[currentIndex].id)}>
                ใช่ ฉันอาชีพนี้แหละ
              </Button>
            </div>
          </div>
        </div>

        {/* Next Character */}
        <div
          className={`absolute right-0 z-10 opacity-80 scale-75 transform translate-x-4 md:translate-x-8 transition-all duration-300
            ${isAnimating && slideDirection === 'right' ? 'translate-x-[200%] opacity-0' : ''}
            ${isAnimating && slideDirection === 'left' ? 'translate-x-[-50%] opacity-100 scale-90' : ''}`}>
          <div className="rounded-2xl shadow-lg p-4 md:p-6 w-48 md:w-64 opacity-20">
            <div className="aspect-square relative mb-3 md:mb-4 overflow-hidden rounded-xl">
              {jobClasses[getNextIndex()]?.imageUrl ? (
                <Image
                  src={
                    jobClasses[getNextIndex()].imageUrl || '/placeholder.svg'
                  }
                  alt={jobClasses[getNextIndex()].name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-center ">
              {jobClasses[getNextIndex()].name}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        onClick={goToPrevious}
        variant="outline"
        size="icon"
        disabled={isAnimating || jobClasses.length <= 1}
        className="absolute left-2 md:left-16 z-30 bg-white/90 backdrop-blur-sm hover:border-2 border-indigo-200 hover:border-indigo-300 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg disabled:opacity-50">
        <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-indigo-600" />
      </Button>

      <Button
        onClick={goToNext}
        variant="outline"
        size="icon"
        disabled={isAnimating || jobClasses.length <= 1}
        className="absolute right-2 md:right-16 z-30 bg-white/90 backdrop-blur-sm hover:border-2 border-indigo-200 hover:border-indigo-300 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg disabled:opacity-50">
        <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-indigo-600" />
      </Button>
    </div>
  )
}
