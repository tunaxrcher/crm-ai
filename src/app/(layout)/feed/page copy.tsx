'use client'

import { useEffect, useRef, useState } from 'react'

import {
  ErrorDisplay,
  GlobalErrorBoundary,
  SkeletonLoading,
} from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar'
import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@src/components/ui/card'
import { Input } from '@src/components/ui/input'
import PostList from '@src/features/feed/components/post/PostList'
import StoryList from '@src/features/feed/components/story/StoryList'
import { useFeed } from '@src/features/feed/hook/api'
import { useIntersectionObserver } from '@src/features/feed/hook/useIntersectionObserver'
import useErrorHandler from '@src/hooks/useErrorHandler'
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image,
  MessageSquare,
  Play,
  Send,
  Share2,
  ThumbsUp,
  X,
} from 'lucide-react'

const mockStories = [
  {
    id: 'story-1',
    user: {
      id: 'user-3',
      name: 'Michael Chen',
      avatar: 'https://same-assets.com/avatars/accountant-2.png',
    },
    media: {
      type: 'image',
      url: 'https://same-assets.com/quest-complete-3.png',
    },
    questTitle: 'Financial report analysis',
    viewed: false,
  },
  {
    id: 'story-2',
    user: {
      id: 'user-6',
      name: 'Jessica Lee',
      avatar: 'https://same-assets.com/avatars/sales-director-1.png',
    },
    media: {
      type: 'video',
      url: 'https://same-assets.com/quest-video-1.mp4',
      thumbnail: 'https://same-assets.com/quest-video-1-thumb.png',
    },
    questTitle: 'Sales pitch demo',
    viewed: false,
  },
  {
    id: 'story-3',
    user: {
      id: 'user-4',
      name: 'Emma Davies',
      avatar: 'https://same-assets.com/avatars/sales-manager-1.png',
    },
    media: {
      type: 'image',
      url: 'https://same-assets.com/quest-complete-4.png',
    },
    questTitle: 'Team motivation workshop',
    viewed: true,
  },
  {
    id: 'story-4',
    user: {
      id: 'user-5',
      name: 'James Rodriguez',
      avatar: 'https://same-assets.com/avatars/sales-rep-3.png',
    },
    media: {
      type: 'image',
      url: 'https://same-assets.com/quest-complete-5.png',
    },
    questTitle: 'Client satisfaction survey',
    viewed: false,
  },
  {
    id: 'story-5',
    user: {
      id: 'user-7',
      name: 'Daniel Brown',
      avatar: 'https://same-assets.com/avatars/sales-rep-2.png',
    },
    media: {
      type: 'video',
      url: 'https://same-assets.com/quest-video-2.mp4',
      thumbnail: 'https://same-assets.com/quest-video-2-thumb.png',
    },
    questTitle: 'Product demo recording',
    viewed: true,
  },
]

export default function FeedPageComponent() {
  // Wrap the component with GlobalErrorBoundary
  return (
    <GlobalErrorBoundary>
      <FeedPageContent />
    </GlobalErrorBoundary>
  )
}

function FeedPageContent() {
  const {
    feedItems,
    stories,
    isLoading,
    isRefreshing,
    error,
    refreshFeed,
    toggleLike,
    addComment,
    formatTimeDiff,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useFeed()

  const { showError } = useError()
  const { handleAsyncOperation } = useErrorHandler()

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(
    null
  )
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const storiesRef = useRef<HTMLDivElement>(null)

  // This prevents hydration mismatch by only running client-side code after mount
  useEffect(() => {
    setIsClient(true)

    // Add scroll event listener to storiesRef
    const handleScroll = () => {
      if (storiesRef.current) {
        setScrollPosition(storiesRef.current.scrollLeft)
      }
    }

    const currentRef = storiesRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // Handle adding a comment
  const handleAddComment = async (feedItemId: string) => {
    if (!commentInputs[feedItemId] || commentInputs[feedItemId].trim() === '')
      return

    const result = await handleAsyncOperation(async () => {
      return await addComment(feedItemId, commentInputs[feedItemId])
    })

    if (result) {
      // Clear input on success
      setCommentInputs((prev) => ({
        ...prev,
        [feedItemId]: '',
      }))
    } else {
      // Error is already handled by handleAsyncOperation
      showError('ไม่สามารถเพิ่มความคิดเห็นได้', {
        severity: 'error',
        message: 'โปรดลองอีกครั้งในภายหลัง',
      })
    }
  }

  // Handle liking a post with error handling
  const handleToggleLike = async (feedItemId: string) => {
    const result = await handleAsyncOperation(async () => {
      return await toggleLike(feedItemId)
    })

    if (!result) {
      showError('ไม่สามารถกดไลค์ได้', {
        severity: 'warning',
        message: 'โปรดลองอีกครั้งในภายหลัง',
        autoHideAfter: 3000,
      })
    }
  }

  // Handle horizontal scroll for stories
  const handleScrollLeft = () => {
    if (storiesRef.current) {
      const newPosition = Math.max(scrollPosition - 200, 0)
      storiesRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const handleScrollRight = () => {
    if (storiesRef.current) {
      const newPosition = Math.min(
        scrollPosition + 200,
        storiesRef.current.scrollWidth - storiesRef.current.clientWidth
      )
      storiesRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  // Story navigation functions
  const openStory = (index: number) => {
    setCurrentStoryIndex(index)
  }

  const closeStory = () => {
    setCurrentStoryIndex(null)
  }

  const nextStory = () => {
    if (
      currentStoryIndex !== null &&
      stories &&
      stories.length > 0 &&
      currentStoryIndex < stories.length - 1
    ) {
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else {
      closeStory()
    }
  }

  const prevStory = () => {
    if (currentStoryIndex !== null && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
    }
  }

  const loadMoreRef = useIntersectionObserver({
    callback: loadMore,
    enabled: !isLoading && !isLoadingMore && hasMore,
  })

  // Show loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="feed" text="กำลังโหลดฟีด..." />
      </div>
    )
  }

  // Show error state with improved error component
  if (error) {
    return (
      <div className="p-4 pb-20">
        <ErrorDisplay
          title="ไม่สามารถโหลดฟีดได้"
          message={
            error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'
          }
          severity="error"
          onRetry={refreshFeed}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    )
  }

  // Ensure stories is not undefined
  const safeStories = stories || []

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold ai-gradient-text">ฟีดรวมกิจกรรม</h1>
        <p className="text-muted-foreground">
          ดูว่าเพื่อนร่วมงานของคุณกำลังทำอะไรกัน
        </p>
      </div>

      {isRefreshing && (
        <div className="mb-4 p-2 bg-blue-500/10 text-blue-400 rounded-md text-sm">
          กำลังรีเฟรชฟีด...
        </div>
      )}
      {/* Stories section */}
      <div className="mb-6 relative">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium">Recent Stories</h2>
          <button className="text-xs text-muted-foreground">View All</button>
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
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}>
            {mockStories.map((story, index) => (
              <div
                key={story.id}
                className="flex-shrink-0 w-20 cursor-pointer"
                onClick={() => openStory(index)}>
                <div
                  className={`relative w-20 h-20 rounded-full mb-1 ${story.viewed ? 'border-2 border-gray-500' : 'border-2 ai-gradient-border'}`}>
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={story.user.avatar}
                      alt={story.user.name}
                    />
                    <AvatarFallback>
                      {story.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {story.media.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  )}

                  {story.media.type === 'image' && (
                    <div className="absolute bottom-0 right-0 bg-secondary rounded-full p-1">
                      <Image className="h-3 w-3" />
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
      </div>

      <PostList
        feedItems={feedItems || []}
        formatTimeDiff={formatTimeDiff}
        toggleLike={handleToggleLike}
        commentInputs={commentInputs}
        setCommentInputs={setCommentInputs}
        handleAddComment={handleAddComment}
      />

      {/* Story Viewer Modal */}
      {isClient && currentStoryIndex !== null && (
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
                    src={mockStories[currentStoryIndex].user.avatar}
                    alt={mockStories[currentStoryIndex].user.name}
                  />
                  <AvatarFallback>
                    {mockStories[currentStoryIndex].user.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="text-white font-medium">
                    {mockStories[currentStoryIndex].user.name}
                  </div>
                  <div className="text-xs text-gray-300">
                    {mockStories[currentStoryIndex].questTitle}
                  </div>
                </div>
              </div>
            </div>

            {/* Story content */}
            <div className="flex-1 flex items-center justify-center">
              {mockStories[currentStoryIndex].media.type === 'image' ? (
                <img
                  src={mockStories[currentStoryIndex].media.url}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full max-h-full">
                    <img
                      src={mockStories[currentStoryIndex].media.thumbnail}
                      alt="Video thumbnail"
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

      {/* Load More Trigger & Loading State */}
      <div ref={loadMoreRef} className="py-4">
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2 text-muted-foreground">
              กำลังโหลดเพิ่มเติม...
            </span>
          </div>
        )}

        {!hasMore && feedItems.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>คุณได้ดูฟีดทั้งหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  )
}
