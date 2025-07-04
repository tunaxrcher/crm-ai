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
      <div className="flex items-center space-x-1">
        <div className="flex -space-x-1">
          {displayUsers.map((likeUser, index) => (
            <div
              key={likeUser.id}
              className="relative w-5 h-5 rounded-full overflow-hidden border border-background"
              style={{ zIndex: displayUsers.length - index }}
            >
              {likeUser.user.character?.currentPortraitUrl ? (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${likeUser.user.character.currentPortraitUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center -110px',
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
        <span className="ml-2 text-sm text-muted-foreground">
          {totalLikes} คน
        </span>
        {hasMoreUsers && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowAllLikes(true)}
          >
            ดูทั้งหมด
          </Button>
        )}
      </div>

      {/* Dialog แสดงผู้ที่กดไลค์ทั้งหมด */}
      <Dialog open={showAllLikes} onOpenChange={setShowAllLikes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500 fill-current" />
              ผู้ที่กดไลค์ ({totalLikes} คน)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {likeUsers.map((likeUser) => (
              <div key={likeUser.id} className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  {likeUser.user.character?.currentPortraitUrl ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${likeUser.user.character.currentPortraitUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center -110px',
                        transform: 'scale(2)',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Heart className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {likeUser.user.character?.name || likeUser.user.name}
                  </div>
                  {likeUser.user.character?.currentJobLevel?.title && (
                    <div className="text-xs text-muted-foreground">
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