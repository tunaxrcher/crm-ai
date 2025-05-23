import React, { memo } from 'react'

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
import { FeedItemUI } from '@src/features/feed/types'
import { Award, Heart, MessageSquare, Send, ThumbsUp } from 'lucide-react'

interface PostCardProps {
  item: FeedItemUI
  formatTimeDiff: (date: Date | string | number) => string
  toggleLike: (feedItemId: string) => void
  commentInput: string
  onCommentInputChange: (value: string) => void
  handleAddComment: () => void
}

export const PostCard = function PostCard({
  item,
  formatTimeDiff,
  toggleLike,
  commentInput,
  onCommentInputChange,
  handleAddComment,
}: PostCardProps) {
  const { type, user, content } = item

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="font-medium">{user.name}</div>
                {user.level && (
                  <Badge className="ml-2 text-xs" variant="outline">
                    Lvl {user.level}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{formatTimeDiff(content.timestamp)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          {/* Quest Completion */}
          {type === 'quest_complete' && 'quest' in content && content.quest && (
            <div>
              <div className="mb-2">
                <span className="font-medium ai-gradient-text">
                  Completed a quest:
                </span>{' '}
                {content.quest.title}
              </div>

              {content.image && (
                <div className="mb-3 rounded-lg overflow-hidden h-40 bg-secondary/20">
                  <img
                    src={content.image}
                    alt="Quest evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1 text-yellow-400" />
                  <span className="text-yellow-400 font-medium text-sm">
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
                <div className="mb-3 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 p-4 rounded-lg text-center">
                  <div className="text-lg ai-gradient-text font-bold mb-1">
                    Level Up!
                  </div>
                  <div className="text-sm mb-2">
                    Level {content.previousLevel} → Level {content.newLevel}
                  </div>
                  <div className="text-sm">
                    New Title:{' '}
                    <span className="font-medium">{content.newTitle}</span>
                  </div>
                </div>
              </div>
            )}

          {/* Achievement */}
          {type === 'achievement' &&
            'achievement' in content &&
            content.achievement && (
              <div>
                <div className="mb-3 bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-300/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="text-2xl mr-3">
                      {content.achievement.icon}
                    </div>
                    <div>
                      <div className="font-bold">
                        {content.achievement.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Achievement Unlocked
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {content.achievement.description}
                  </div>
                </div>
              </div>
            )}

          {/* Regular Post */}
          {type === 'post' && 'text' in content && (
            <div>
              {content.text && (
                <div className="mb-3 whitespace-pre-wrap">{content.text}</div>
              )}

              {content.image && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img
                    src={content.image}
                    alt="Post image"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                <span>{content.engagement.likes}</span>
              </div>
            </div>

            <div>
              {content.engagement.comments.length > 0 && (
                <span>{content.engagement.comments.length} comments</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col pt-0">
          <div className="flex items-center justify-between w-full py-2 border-y border-border">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${
                item.hasLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'hover:text-primary'
              }`}
              onClick={() => toggleLike(item.id)}>
              {item.hasLiked ? (
                <Heart className="h-4 w-4 mr-2 fill-red-500" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              {item.hasLiked ? 'Liked' : 'ยกนิ้วให้'}
            </Button>

            <Button variant="ghost" size="sm" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>

          {/* Comments section */}
          {content.engagement.comments.length > 0 && (
            <div className="w-full pt-3 space-y-3">
              {content.engagement.comments.map((comment) => (
                <div key={comment.id} className="flex items-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={comment.user.avatar}
                      alt={comment.user.name}
                    />
                    <AvatarFallback>
                      {comment.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="bg-secondary/30 p-2 rounded-lg">
                      <div className="font-medium text-xs">
                        {comment.user.name}
                      </div>
                      <div className="text-sm">{comment.text}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                      <span>{formatTimeDiff(comment.timestamp)}</span>
                      <button className="hover:text-primary">Like</button>
                      <button className="hover:text-primary">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex items-center mt-3 w-full">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src="https://same-assets.com/avatars/marketing-specialist-1.png"
                alt="You"
              />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>

            <div className="flex-1 flex items-center bg-secondary/20 rounded-full overflow-hidden pl-3">
              <Input
                type="text"
                placeholder="Write a comment..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
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
                className="rounded-full h-8 w-8"
                onClick={handleAddComment}
                disabled={!commentInput || commentInput.trim() === ''}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
