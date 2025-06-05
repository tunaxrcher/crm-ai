'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

import { ImageWithFallback } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'
import type { StoryUI } from '@src/features/feed/types'
import { ChevronLeft, ChevronRight, ImageIcon, Play, X } from 'lucide-react'

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoading, setIsVideoLoading] = useState(false)

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
        setIsVideoLoading(true)
        videoRef.current.play().catch((err) => {
          console.error('Failed to autoplay video:', err)
          setIsVideoLoading(false)
        })
      } catch (error) {
        console.error('Error playing video:', error)
        setIsVideoLoading(false)
      }
    }
  }, [currentStoryIndex, isClient, currentStory])

  // ฟังก์ชันจัดการเมื่อวิดีโอโหลดเสร็จ
  const handleVideoLoaded = () => {
    setIsVideoLoading(false)
  }

  // ฟังก์ชันจัดการเมื่อวิดีโอเกิดข้อผิดพลาด
  const handleVideoError = () => {
    setIsVideoLoading(false)
    console.error('Failed to load story video')
    showError('ไม่สามารถโหลดวิดีโอได้', {
      severity: 'warning',
      message: 'ไม่สามารถเล่นวิดีโอนี้ได้ โปรดลองใหม่อีกครั้ง',
      autoHideAfter: 3000,
    })
  }

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
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Thumbnail as placeholder while video is loading */}
            {isVideoLoading && currentStory.media.thumbnail && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageWithFallback
                  src={currentStory.media.thumbnail}
                  alt="Video thumbnail"
                  width={600}
                  height={800}
                  fallbackSrc="/placeholder-video.png"
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-black/30 rounded-full p-4">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              src={currentStory.media.url}
              poster={currentStory.media.thumbnail} // ใช้ thumbnail เป็น poster
              controls
              className="max-w-full max-h-full"
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
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
                {currentStory.text || currentStory.media.url}
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
        <h2 className="text-sm font-medium">Stories</h2>
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
          className="flex overflow-x-auto pb-2 px-4 pl-0 space-x-3 no-scrollbar"
          style={{ scrollBehavior: 'smooth' }}>
          {/* Story items - Facebook rectangular style */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 w-32 cursor-pointer group"
              onClick={() => openStory(index)}>
              <div className="flex flex-col items-center relative">
                <div className="relative w-32 h-48 rounded-xl overflow-hidden hover:shadow-lg transition-shadow mb-4">
                  {/* Background image or gradient - ปรับให้ใช้ thumbnail สำหรับวิดีโอ */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-blue-400 to-purple-600"
                    style={{
                      backgroundImage:
                        story.media.type === 'video' && story.media.thumbnail
                          ? `url(${story.media.thumbnail})`
                          : story.media.type === 'image'
                            ? `url(${story.media.url})`
                            : story.user.avatar
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
                </div>

                {/* User avatar - positioned outside the story card but relative to parent */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                  {/* <div className={`p-0.5 rounded-full ${story.viewed ? 'bg-gray-400' : 'bg-blue-500'}`}> */}
                  <div
                    className={`p-0.5 rounded-full ${story.viewed ? 'bg-black' : 'bg-black'}`}>
                    <Avatar className="w-8 h-8  ring-2 ring-black">
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

                {/* User name below the story */}
                <p className="text-xs font-medium text-center truncate w-full mt-1">
                  {story.user.name.split(' ')[0]}
                </p>
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
