// src/features/feed/components/post/PostCard.tsx
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

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
import { useAutoplayVideo } from '@src/features/feed/hooks/useAutoplayVideo'
import { FeedItemUI } from '@src/features/feed/types'
import {
  Award,
  Heart,
  MessageCircle,
  Send,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react'

interface PostCardProps {
  character: any
  item: FeedItemUI
  formatTimeDiff: (date: Date | string | number) => string
  toggleLike: (feedItemId: string) => void
  commentInput: string
  onCommentInputChange: (value: string) => void
  handleAddComment: () => void
}

export const PostCard = function PostCard({
  character,
  item,
  formatTimeDiff,
  toggleLike,
  commentInput,
  onCommentInputChange,
  handleAddComment,
}: PostCardProps) {
  const { type, user, content } = item
  // สร้าง ref สำหรับวิดีโอโดยใช้ custom hook
  const videoRef = useAutoplayVideo()
  const [showComments, setShowComments] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // ฟังก์ชันสำหรับแสดง media ตามประเภท
  const renderMedia = () => {
    let mediaUrl = null

    // กำหนด media URL ตามประเภทของ content
    if (type === 'quest_complete' && content.image) mediaUrl = content.image
    else if (type === 'post' && content.image) mediaUrl = content.image
    else if (type === 'new_portrait' && content.image) mediaUrl = content.image

    if (!mediaUrl) return null

    // ตรวจสอบประเภทของ media (video หรือ image)
    const isVideo =
      /\.(mp4|mov)$/i.test(mediaUrl) || mediaUrl.includes('/video')

    if (isVideo) {
      return (
        <div className="mb-3 overflow-hidden bg-secondary/20">
          <video
            ref={videoRef}
            src={mediaUrl}
            controls
            className="w-full h-full object-cover"
            loop
            muted
            playsInline // สำคัญสำหรับมือถือ
          />
        </div>
      )
    } else {
      return (
        <div className="mb-3 overflow-hidden bg-secondary/20">
          <img
            src={mediaUrl || '/placeholder.svg'}
            alt="Content media"
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setSelectedImage(mediaUrl)}
          />
        </div>
      )
    }
  }

  if (!character) return <></>

  return (
    <>
      <Card className="mb-6 shadow-sm border overflow-hidden bg-card">
        <CardHeader className="pb-2 px-4">
          <div className="flex items-center">
            <Link
              href={`/profile/${user.character?.id}`}
              className="relative w-10 h-10 mr-3">
              {/* ภาพโปรไฟล์แบบ bg cover */}
              <div className="w-10 h-10 rounded-full overflow-hidden ai-gradient-bg relative">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${user.character?.currentPortraitUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center -110px',
                    transform: 'scale(2)',
                  }}
                />
              </div>

              {/* Level Badge ซ้อนล่างขวา */}
              {user.character?.level && (
                <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 z-10">
                  <span className="text-[10px] bg-background border border-border rounded px-1.5 py-[1px] font-medium shadow-sm">
                    {user.character.level}
                  </span>
                </div>
              )}
            </Link>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="font-medium text-foreground">
                  {user.character?.name}
                </div>
                {user.character?.currentJobLevel?.title && (
                  <Badge className="ml-2 text-xs" variant="outline">
                    {user.character?.currentJobLevel?.title}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimeDiff(content.timestamp)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-2">
          {/* Quest Completion */}
          {type === 'quest_complete' && 'quest' in content && content.quest && (
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                <Award className="h-4 w-4 mr-1.5" />
                <span className="font-medium">ทำเควสสำเร็จ:</span>{' '}
                {content.quest.title}
              </div>

              {/* แสดง Caption จาก field post */}
              {item.post && (
                <div className="mb-3 text-foreground">{item.post}</div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                <div className="flex items-center text-yellow-800 dark:text-yellow-300">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="font-semibold">
                    +{content.quest.xpEarned} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Level Up */}
          {type === 'level_up' &&
            'previousLevel' in content &&
            'newLevel' in content && (
              <div>
                <div className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-xl text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
                  <div className="relative">
                    <div className="text-2xl font-bold mb-2">🎉 Level Up!</div>
                    <div className="text-lg mb-1">
                      Level {content.previousLevel} → Level {content.newLevel}
                    </div>
                    {content.newTitle && (
                      <div className="text-sm opacity-90">
                        <span className="font-medium">{content.newTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Achievement */}
          {type === 'achievement' &&
            'achievement' in content &&
            content.achievement && (
              <div>
                <div className="mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <div className="text-3xl mr-4">
                      {content.achievement.icon}
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {content.achievement.name}
                      </div>
                      <div className="text-sm opacity-90">
                        Achievement Unlocked
                      </div>
                    </div>
                  </div>
                  <div className="text-sm opacity-95">
                    {content.achievement.description}
                  </div>
                </div>
              </div>
            )}

          {/* Regular Post */}
          {type === 'post' && 'text' in content && (
            <div>
              {content.text && (
                <div className="mb-3 text-foreground">{content.text}</div>
              )}
            </div>
          )}
        </CardContent>

        {/* Media - Full width without padding */}
        {renderMedia()}

        {/* Engagement stats */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border pb-2">
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white fill-current" />
                </div>
              </div>
              <span className="ml-2">{content.engagement.likes}</span>
            </div>

            <div>
              {content.engagement.comments.length > 0 && (
                <span>{content.engagement.comments.length} comments</span>
              )}
            </div>
          </div>
        </div>

        <CardFooter className="flex flex-col pt-0 px-4 pb-0">
          <div className="flex items-center justify-between w-full pt-0 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${item.hasLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:bg-muted'}`}
              onClick={() => toggleLike(item.id)}>
              {item.hasLiked ? (
                <Heart className="h-5 w-5 mr-2 fill-red-500" />
              ) : (
                <ThumbsUp className="h-5 w-5 mr-2" />
              )}
              {item.hasLiked ? 'Liked' : 'ยกนิ้วให้'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-muted-foreground hover:bg-muted"
              onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-5 w-5 mr-2" />
              Comment
            </Button>
          </div>

          {/* Comments section - Only show when showComments is true */}
          {showComments && (
            <div className="w-full pt-3 space-y-3">
              {/* Existing comments */}
              {content.engagement.comments.length > 0 && (
                <div className="space-y-3">
                  {content.engagement.comments.map((comment: any) => (
                    <div key={comment.id} className="flex items-start">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ai-gradient-bg mr-2">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${comment.user.character?.currentPortraitUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center -110px',
                            transform: 'scale(2)',
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted p-2 rounded-lg">
                          <div className="font-medium text-xs text-foreground">
                            {comment.user.character?.name}
                          </div>
                          <div className="text-sm text-foreground">
                            {comment.text}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                          <span>{formatTimeDiff(comment.timestamp)}</span>
                          {/* <button className="hover:text-primary font-medium">
                            Like
                          </button>
                          <button className="hover:text-primary font-medium">
                            Reply
                          </button> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input - Always show when comments section is open */}
              <div className="flex items-center w-full pb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ai-gradient-bg mr-2">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${character?.portrait})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center -110px',
                      transform: 'scale(2)',
                    }}
                  />
                </div>

                <div className="flex-1 flex items-center bg-muted rounded-full overflow-hidden">
                  <Input
                    type="text"
                    placeholder={`แสดงความคิดเห็นในชื่อ ${character.name}`}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground pl-3"
                    value={commentInput}
                    onChange={(e) => onCommentInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddComment()
                      }
                    }}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-primary"
                    onClick={handleAddComment}
                    disabled={!commentInput || commentInput.trim() === ''}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {selectedImage && (
        <div
          className="fixed inset-0 ai-gradient-bg/80 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  )
}
