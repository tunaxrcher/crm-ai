// src/features/feed/components/post/PostList.tsx
'use client'

import { Dispatch, SetStateAction, useCallback } from 'react'

import { FeedItemUI, FeedItemWithRelations } from '@src/features/feed/types'

import { PostCard } from './PostCard'

// src/features/feed/components/post/PostList.tsx

interface PostListProps {
  feedItems: FeedItemUI[]
  formatTimeDiff: (date: Date | string | number) => string
  toggleLike: (feedItemId: string) => void
  commentInputs: Record<string, string>
  setCommentInputs: Dispatch<SetStateAction<Record<string, string>>>
  handleAddComment: (feedItemId: string) => void
}

export default function PostList({
  feedItems,
  formatTimeDiff,
  toggleLike,
  commentInputs,
  setCommentInputs,
  handleAddComment,
}: PostListProps) {
  // Memoize handler functions
  const handleCommentInputChange = useCallback(
    (feedItemId: string, value: string) => {
      setCommentInputs((prev) => ({
        ...prev,
        [feedItemId]: value,
      }))
    },
    [setCommentInputs]
  )

  const createCommentHandler = useCallback(
    (feedItemId: string) => () => {
      handleAddComment(feedItemId)
    },
    [handleAddComment]
  )

  // Safety check
  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No feed items to display</p>
      </div>
    )
  }

  return (
    <>
      {feedItems.map((item) => (
        <PostCard
          key={item.id}
          item={item}
          formatTimeDiff={formatTimeDiff}
          toggleLike={toggleLike}
          commentInput={commentInputs[item.id.toString()] || ''}
          onCommentInputChange={(value) =>
            handleCommentInputChange(item.id.toString(), value)
          }
          handleAddComment={createCommentHandler(item.id.toString())}
        />
      ))}
    </>
  )
}
