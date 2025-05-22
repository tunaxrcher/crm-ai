'use client'

import { RefObject } from 'react'

import { ImageWithFallback } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'
import { StoryUI } from '@src/features/feed/types'
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Play,
  X,
} from 'lucide-react'

interface StoryListProps {
  stories: StoryUI[]
  isClient: boolean
  scrollPosition: number
  storiesRef: RefObject<HTMLDivElement | null>
  handleScrollLeft: () => void
  handleScrollRight: () => void
  openStory: (index: number) => void
  currentStoryIndex: number | null
  closeStory: () => void
  prevStory: () => void
  nextStory: () => void
}

export default function StoryList({
  stories,
  isClient,
  scrollPosition,
  storiesRef,
  handleScrollLeft,
  handleScrollRight,
  openStory,
  currentStoryIndex,
  closeStory,
  prevStory,
  nextStory,
}: StoryListProps) {
  const { showError } = useError()

  // กรณีที่ไม่มีข้อมูลสตอรี่หรือ currentStoryIndex ไม่ถูกต้อง
  const handleStoryError = () => {
    showError('ไม่สามารถโหลดสตอรี่ได้', {
      severity: 'warning',
      message: 'ไม่พบข้อมูลสตอรี่หรือข้อมูลไม่ถูกต้อง',
      autoHideAfter: 3000,
    })
    closeStory()
  }

  // Validate currentStoryIndex ก่อนดึงข้อมูล
  const isValidCurrentStory =
    currentStoryIndex !== null &&
    stories.length > 0 &&
    currentStoryIndex >= 0 &&
    currentStoryIndex < stories.length

  // ตรวจสอบ currentStory ให้ปลอดภัย
  const currentStory = isValidCurrentStory ? stories[currentStoryIndex] : null

  return (
    <div className="mb-6 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium"></h2>
        <button className="text-xs text-muted-foreground">ดูทั้งหมด</button>
      </div>

      <div className="relative">
        {isClient && scrollPosition > 0 && (
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 rounded-full p-1"
            onClick={handleScrollLeft}>
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div
          ref={storiesRef}
          className="flex overflow-x-auto pb-2 space-x-3 no-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
          onScroll={(e) => {
            const target = e.currentTarget
            if (target && isClient) {
              // จะไม่ใช้ setScrollPosition ที่นี่เพราะ prop นี้ควรถูกควบคุมจาก parent
            }
          }}>
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 w-20 cursor-pointer"
              onClick={() => openStory(index)}>
              <div
                className={`relative w-20 h-20 rounded-full mb-1 ${
                  story.viewed
                    ? 'border-2 border-gray-500'
                    : 'border-2 ai-gradient-border'
                }`}>
                <Avatar className="w-full h-full">
                  <AvatarImage src={story.user.avatar} alt={story.user.name} />
                  <AvatarFallback>{story.user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>

                {story.media.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                )}

                {story.media.type === 'image' && (
                  <div className="absolute bottom-0 right-0 bg-secondary rounded-full p-1">
                    <ImageIcon className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="text-xs text-center truncate">
                {story.user.name.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>

        {isClient &&
          scrollPosition <
            (storiesRef.current?.scrollWidth || 0) -
              (storiesRef.current?.clientWidth || 0) -
              10 && (
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 rounded-full p-1"
              onClick={handleScrollRight}>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
      </div>

      {/* Story Viewer Modal */}
      {isClient && isValidCurrentStory && currentStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 text-white bg-black/20 p-2 rounded-full"
            onClick={closeStory}>
            <X className="h-6 w-6" />
          </button>

          {/* Story content */}
          <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
            {/* Story header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={currentStory.user.avatar}
                    alt={currentStory.user.name}
                  />
                  <AvatarFallback>
                    {currentStory.user.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="text-white font-medium">
                    {currentStory.user.name}
                  </div>
                  <div className="text-xs text-gray-300">
                    {currentStory.questTitle}
                  </div>
                </div>
              </div>
            </div>

            {/* Story content */}
            <div className="flex-1 flex items-center justify-center">
              {currentStory.media.type === 'image' ? (
                <div className="w-full max-h-full flex items-center justify-center">
                  <ImageWithFallback
                    src={currentStory.media.url}
                    alt="Story"
                    width={600}
                    height={800}
                    fallbackSrc="/placeholder-image.png"
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                      console.error('Failed to load story image')
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full max-h-full">
                    <ImageWithFallback
                      src={
                        currentStory.media.thumbnail || '/placeholder-image.png'
                      }
                      alt="Video thumbnail"
                      width={600}
                      height={800}
                      fallbackSrc="/placeholder-image.png"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 p-2 rounded-full"
              onClick={prevStory}
              disabled={currentStoryIndex === 0}>
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 p-2 rounded-full"
              onClick={nextStory}>
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
