'use client'

import { Star } from 'lucide-react'

export default function RewardPage() {
  // Mock user points
  const userPoints = 750

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold ai-gradient-text">
            Rewards (กำลังพัฒนา...)
          </h1>
          <div className="flex items-center">
            <Star className="h-5 w-5 mr-1 text-yellow-400" />
            <span className="font-semibold">{userPoints} Points</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Earn and spend points on rewards
        </p>
      </div>
    </div>
  )
}
