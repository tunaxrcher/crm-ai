// src/features/feed/components/story/StoryList.tsx
'use client'

import { type RefObject, useEffect, useRef } from 'react'

import { ImageWithFallback } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'
import type { StoryUI } from '@src/features/feed/types'
import { ChevronLeft, ChevronRight, ImageIcon, Play, X } from 'lucide-react'

// src/features/feed/components/story/StoryList.tsx

// src/features/feed/components/story/StoryList.tsx

// src/features/feed/components/story/StoryList.tsx

interface StoryListProps {
  stories: StoryUI[]
  isClient: boolean
  scrollPosition: number // นี่เป็นตัวแปรที่เก็บค่าตำแหน่งการเลื่อน ไม่ใช่ฟังก์ชัน
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
  const videoRef = useRef<HTMLVideoElement>(null)

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

  // Auto-play video when story opens
  useEffect(() => {
    if (
      isClient &&
      currentStory &&
      currentStory.media.type === 'video' &&
      videoRef.current
    ) {
      try {
        videoRef.current.play().catch((err) => {
          console.error('Failed to autoplay video:', err)
        })
      } catch (error) {
        console.error('Error playing video:', error)
      }
    }
  }, [currentStoryIndex, isClient, currentStory])

  // Render story content based on media type
  const renderStoryContent = () => {
    if (!currentStory) return null

    switch (currentStory.media.type) {
      case 'image':
        return (
          <div className="w-full max-h-full flex items-center justify-center">
            <ImageWithFallback
              src={currentStory.media.url || '/placeholder.svg'}
              alt="Story"
              width={600}
              height={800}
              fallbackSrc="/placeholder-image.png"
              className="max-w-full max-h-full object-contain"
              onError={() => {
                console.error('Failed to load story image')
                handleStoryError()
              }}
            />
          </div>
        )

      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={currentStory.media.url}
              controls
              className="max-w-full max-h-full"
              onError={() => {
                console.error('Failed to load story video')
                handleStoryError()
              }}
            />
          </div>
        )

      case 'text':
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/20 to-secondary/20 p-6 overflow-y-auto">
            <div className="max-w-md mx-auto bg-card/95 backdrop-blur-sm p-6 rounded-lg shadow-lg">
              <p className="text-lg font-medium mb-2">
                {currentStory.questTitle}
              </p>
              <p className="text-md whitespace-pre-wrap">
                {currentStory.media.url || currentStory.text}
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="mb-6 relative">
      {/* Header - Facebook style */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium"></h2>
        <button className="text-xs text-muted-foreground">ดูทั้งหมด</button>
      </div>

      <div className="relative">
        {/* Left scroll button - Enhanced styling */}
        {isClient && scrollPosition > 0 && (
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            onClick={handleScrollLeft}>
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Stories container - Facebook style */}
        <div
          ref={storiesRef}
          className="flex overflow-x-auto pb-2 px-4 pl-0 space-x-2 no-scrollbar"
          style={{ scrollBehavior: 'smooth' }}>
          {/* Add Story Button (First item) */}
          {/* <div className="flex-shrink-0 w-24 cursor-pointer group">
            <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700">Create Story</span>
              </div>
            </div>
          </div> */}

          {/* Story items - Facebook rectangular style */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 w-24 cursor-pointer group"
              onClick={() => openStory(index)}>
              <div className="relative w-24 h-36 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                {/* Background image or gradient */}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-blue-400 to-purple-600"
                  style={{
                    backgroundImage: story.user.avatar
                      ? `url(${story.user.avatar})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Story border indicator */}
                <div
                  className={`absolute inset-0 rounded-xl ${
                    story.viewed
                      ? 'ring-2 ring-gray-400'
                      : 'ring-3 ring-blue-500'
                  }`}
                />

                {/* User avatar */}
                <div className="absolute top-2 left-2">
                  <div
                    className={`p-0.5 rounded-full ${story.viewed ? 'bg-gray-400' : 'bg-blue-500'}`}>
                    <Avatar className="w-8 h-8 ring-2 ring-white">
                      <AvatarImage
                        src={story.user.avatar || '/placeholder.svg'}
                        alt={story.user.name}
                      />
                      <AvatarFallback className="text-xs bg-gray-300">
                        {story.user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Media type indicators */}
                {story.media.type === 'video' && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/50 rounded-full p-1">
                      <Play className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}

                {story.media.type === 'image' && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/50 rounded-full p-1">
                      <ImageIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}

                {/* User name */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate drop-shadow-sm">
                    {story.user.name.split(' ')[0]}
                  </p>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Right scroll button - Enhanced styling */}
        {isClient &&
          storiesRef.current &&
          scrollPosition <
            storiesRef.current.scrollWidth -
              storiesRef.current.clientWidth -
              10 && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              onClick={handleScrollRight}>
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
      </div>

      {/* Story Viewer Modal - Keep existing functionality */}
      {isClient && isValidCurrentStory && currentStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 text-white bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors"
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
                    src={currentStory.user.avatar || '/placeholder.svg'}
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

            {/* Story content - ใช้ฟังก์ชัน renderStoryContent แทนโค้ดเดิม */}
            <div className="flex-1 flex items-center justify-center">
              {renderStoryContent()}
            </div>

            {/* Navigation buttons - Enhanced styling */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors disabled:opacity-50"
              onClick={prevStory}
              disabled={currentStoryIndex === 0}>
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors"
              onClick={nextStory}>
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
