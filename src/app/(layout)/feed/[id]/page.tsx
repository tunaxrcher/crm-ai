'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  ErrorDisplay,
  GlobalErrorBoundary,
  SkeletonLoading,
} from '@src/components/shared'
import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import { useCharacter } from '@src/contexts/CharacterContext'
import { PostCard } from '@src/features/feed/components/post/PostCard'
import { useFeed } from '@src/features/feed/hooks/api'
import { FeedItemUI } from '@src/features/feed/types'
import { ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'

// Map API type to UI type helper function
const mapTypeToUI = (
  apiType: string
): 'post' | 'quest_complete' | 'level_up' | 'achievement' => {
  switch (apiType) {
    case 'quest_completion':
      return 'quest_complete'
    case 'level_up':
      return 'level_up'
    case 'achievement':
      return 'achievement'
    case 'post':
    default:
      return 'post'
  }
}

// Transform API data to FeedItemUI format
const transformApiToFeedItem = (data: any, session: any): FeedItemUI => {
  const transformedFeedItem: FeedItemUI = {
    id: data.id.toString(),
    type: mapTypeToUI(data.type),
    hasLiked: session?.user?.id
      ? data.likes?.some(
          (like: any) => like.user.id === parseInt(session.user.id)
        )
      : false,
    user: {
      id: data.user.id,
      name: data.user.name,
      character: data.user.character,
      title: data.user.bio || data.user.character?.currentJobLevel?.title,
    },
    content: {
      timestamp: new Date(data.createdAt),
      text: data.content,
      image: data.mediaUrl,
      engagement: {
        likes: data.likes?.length || 0,
        likeUsers:
          data.likes?.map((like: any) => ({
            id: like.id,
            user: {
              id: like.user.id,
              name: like.user.name,
              character: like.user.character,
            },
            createdAt: like.createdAt,
          })) || [],
        comments:
          data.comments?.map((comment: any) => ({
            id: comment.id,
            user: {
              id: comment.user.id,
              name: comment.user.name,
              character: comment.user.character,
            },
            text: comment.content,
            timestamp: new Date(comment.createdAt),
          })) || [],
      },
      // Add quest data if it's a quest completion
      ...(mapTypeToUI(data.type) === 'quest_complete' &&
        data.questSubmission && {
          quest: {
            id: data.questSubmission.id,
            title: data.questSubmission.quest?.title || 'Unknown Quest',
            xpEarned: data.questSubmission.xpEarned || 0,
          },
        }),
      // Add level up data if it's a level up
      ...(data.type === 'level_up' &&
        data.levelHistory && {
          previousLevel: data.levelHistory.levelFrom,
          newLevel: data.levelHistory.levelTo,
          newTitle: data.user.character?.currentJobLevel?.title || 'Level Up!',
        }),
      // Add achievement data if it's an achievement
      ...(data.type === 'achievement' &&
        data.achievement && {
          achievement: {
            id: data.achievement.id,
            name: data.achievement.achievement?.name || 'Achievement',
            description: data.achievement.achievement?.description || '',
            icon: data.achievement.achievement?.icon || '🏆',
          },
        }),
    },
  }

  // Add additional fields from API
  Object.assign(transformedFeedItem, {
    post: data.post,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
  })

  return transformedFeedItem
}

export default function SingleFeedPage() {
  return (
    <GlobalErrorBoundary>
      <SingleFeedContent />
    </GlobalErrorBoundary>
  )
}

function SingleFeedContent() {
  const params = useParams()
  const router = useRouter()
  const feedId = params.id as string
  const { character } = useCharacter()
  const { data: session } = useSession()

  const [feedItem, setFeedItem] = useState<FeedItemUI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState('')

  const { toggleLike, addComment, formatTimeDiff } = useFeed()

  useEffect(() => {
    const fetchFeedItem = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/feed/${feedId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('ไม่พบโพสต์ที่ต้องการ')
          }
          throw new Error('ไม่สามารถโหลดโพสต์ได้')
        }

        const data = await response.json()

        // Transform data to match FeedItemUI format
        const transformedFeedItem = transformApiToFeedItem(data, session)
        setFeedItem(transformedFeedItem)
      } catch (err) {
        console.error('Error fetching feed item:', err)
        setError(
          err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (feedId) {
      fetchFeedItem()
    }
  }, [feedId])

  const handleBack = () => {
    router.push('/feed')
  }

  const handleToggleLike = async () => {
    if (!feedItem) return

    try {
      await toggleLike(feedItem.id)
      // Refetch the feed item to get updated data
      if (feedId) {
        const response = await fetch(`/api/feed/${feedId}`)
        if (response.ok) {
          const data = await response.json()
          const transformedFeedItem = transformApiToFeedItem(data, session)
          setFeedItem(transformedFeedItem)
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleAddComment = async () => {
    if (!feedItem || !commentInput.trim()) return

    try {
      await addComment(feedItem.id, commentInput)
      setCommentInput('')
      // Refetch the feed item to get updated data
      if (feedId) {
        const response = await fetch(`/api/feed/${feedId}`)
        if (response.ok) {
          const data = await response.json()
          const transformedFeedItem = transformApiToFeedItem(data, session)
          setFeedItem(transformedFeedItem)
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleCharacterClick = (e: React.MouseEvent, character: any) => {
    e.preventDefault()
    // Handle character click if needed
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            กลับไปที่ฟีด
          </Button>
        </div>
        <SkeletonLoading type="feed" text="กำลังโหลดโพสต์..." />
      </div>
    )
  }

  // Error state
  if (error || !feedItem) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            กลับไปที่ฟีด
          </Button>
        </div>
        <ErrorDisplay
          title="ไม่สามารถโหลดโพสต์ได้"
          message={error || 'ไม่พบโพสต์ที่ต้องการ'}
          severity="error"
          onRetry={() => window.location.reload()}
          showRetry={true}
        />
      </div>
    )
  }

  // No character state
  if (!character) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            กลับไปที่ฟีด
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">
              กำลังโหลดข้อมูลผู้ใช้...
            </h2>
            <p className="text-muted-foreground">โปรดรอสักครู่</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          กลับไปที่ฟีด
        </Button>
      </div>

      {/* Single Feed Item using PostCard */}
      <div className="pb-6">
        <PostCard
          character={character}
          item={feedItem}
          formatTimeDiff={formatTimeDiff}
          toggleLike={handleToggleLike}
          commentInput={commentInput}
          onCommentInputChange={setCommentInput}
          handleAddComment={handleAddComment}
          handleCharacterClick={handleCharacterClick}
        />
      </div>
    </div>
  )
}
