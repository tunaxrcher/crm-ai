import React, { useState } from 'react'
import { Heart, Users } from 'lucide-react'
import { Button } from '@src/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@src/components/ui/dialog'
import { LikeUserUI } from '@src/features/feed/types/engagement.type'

interface LikeUsersDisplayProps {
  likeUsers: LikeUserUI[]
  totalLikes: number
}

export const LikeUsersDisplay: React.FC<LikeUsersDisplayProps> = ({
  likeUsers,
  totalLikes,
}) => {
  const [showAllLikes, setShowAllLikes] = useState(false)

  if (!likeUsers || likeUsers.length === 0) {
    return null
  }

  // แสดงเฉพาะ 3 คนแรก
  const displayUsers = likeUsers.slice(0, 3)
  const hasMoreUsers = likeUsers.length > 3

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-1.5">
          {displayUsers.map((likeUser, index) => (
            <div
              key={likeUser.id}
              className="relative w-6 h-6 rounded-full overflow-hidden"
              style={{ zIndex: displayUsers.length - index }}
            >
              {likeUser.user.character?.currentPortraitUrl ? (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${likeUser.user.character.currentPortraitUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center -114px',
                    transform: 'scale(2)',
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Heart className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">
          {displayUsers.length === 1 ? (
            <span>{displayUsers[0].user.character?.name || displayUsers[0].user.name}</span>
          ) : displayUsers.length === 2 ? (
            <span>
              {displayUsers[0].user.character?.name || displayUsers[0].user.name} และ{' '}
              {displayUsers[1].user.character?.name || displayUsers[1].user.name}
            </span>
          ) : displayUsers.length === 3 ? (
            <span>
              {displayUsers[0].user.character?.name || displayUsers[0].user.name}, {' '}
              {displayUsers[1].user.character?.name || displayUsers[1].user.name} และ{' '}
              {displayUsers[2].user.character?.name || displayUsers[2].user.name}
            </span>
          ) : (
            `${totalLikes} คน`
          )}
        </span>
        {hasMoreUsers && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full"
            onClick={() => setShowAllLikes(true)}
          >
            ดูทั้งหมด
          </Button>
        )}
      </div>

      {/* Dialog แสดงผู้ที่กดไลค์ทั้งหมด */}
      <Dialog open={showAllLikes} onOpenChange={setShowAllLikes}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg font-semibold">
              <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mr-3">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
              ผู้ที่กดไลค์ ({totalLikes} คน)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {likeUsers.map((likeUser) => (
              <div key={likeUser.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50">
                <div className="relative w-12 h-12 rounded-full overflow-hidden ai-gradient-bg">
                  {likeUser.user.character?.currentPortraitUrl ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${likeUser.user.character.currentPortraitUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center -84px',
                        transform: 'scale(2)',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Heart className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {likeUser.user.character?.name || likeUser.user.name}
                  </div>
                  {likeUser.user.character?.currentJobLevel?.title && (
                    <div className="text-xs text-muted-foreground truncate">
                      {likeUser.user.character.currentJobLevel.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 