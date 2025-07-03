'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import { ScrollArea } from '@src/components/ui/scroll-area'
import { Skeleton } from '@src/components/ui/skeleton'
import { useGachaHistory } from '@src/features/reward/hooks/api'
import { 
  Sparkles, 
  Coins, 
  TrendingUp, 
  Award,
  X,
  Gem
} from 'lucide-react'

// Map rarity to colors
const rarityColors: Record<string, string> = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
}

export default function GachaHistorySection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data, isLoading } = useGachaHistory()

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            ประวัติการสุ่มกาชา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const history = data?.history || []
  const stats = data?.stats

  // แสดงแค่ 5 รายการล่าสุดถ้าไม่ได้ขยาย
  const displayHistory = isExpanded ? history : history.slice(0, 5)

  return (
    <Card className="backdrop-blur-xl bg-black/20 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            ประวัติการสุ่มกาชา
          </CardTitle>
          {history.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'ย่อ' : 'ดูทั้งหมด'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-400">สุ่มไปแล้ว</span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.totalGachaPulls.toLocaleString()} ครั้ง
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-3 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-400">ได้รางวัล</span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.totalGachaWins.toLocaleString()} ครั้ง
              </div>
              <div className="text-xs text-gray-400">
                ({((stats.totalGachaWins / stats.totalGachaPulls) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        <ScrollArea className={isExpanded ? "h-[400px]" : ""}>
          <div className="space-y-2">
            {displayHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีประวัติการสุ่มกาชา</p>
              </div>
            ) : (
              displayHistory.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className={`relative group p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                    item.isWin 
                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50' 
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Result Icon/Image */}
                    <div className="relative">
                      {item.isWin && item.rewardItem ? (
                        <div className="relative">
                          {item.rewardItem.imageUrl ? (
                            <Image
                              src={item.rewardItem.imageUrl}
                              alt={item.rewardItem.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-contain"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-lg ${rarityColors[item.rewardItem.rarity] || 'bg-gray-500'} flex items-center justify-center`}>
                              {item.rewardItem.itemType === 'xeny' ? (
                                <Gem className="h-6 w-6 text-white" />
                              ) : (
                                <Sparkles className="h-6 w-6 text-white" />
                              )}
                            </div>
                          )}
                          {/* Rarity indicator */}
                          <Badge 
                            className={`absolute -top-1 -right-1 text-[10px] px-1 py-0 ${rarityColors[item.rewardItem.rarity] || 'bg-gray-500'} text-white border-0`}
                          >
                            {item.rewardItem.rarity?.toUpperCase()}
                          </Badge>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                          <X className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.isWin ? 'text-white' : 'text-gray-400'}`}>
                          {item.isWin && item.rewardItem ? item.rewardItem.name : 'ไม่ได้รางวัล'}
                        </span>
                        {item.isWin && item.rewardItem?.itemType === 'xeny' && item.rewardItem.metadata && (
                          <span className="text-purple-400 text-sm">
                            +{item.rewardItem.metadata.value} Xeny
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {item.tokenSpent} Tokens
                        </span>
                        <span>
                          {format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Lucky Streak Indicator */}
        {stats && stats.luckyStreak > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Lucky Streak</span>
              </div>
              <span className="text-lg font-bold text-red-400">
                {stats.luckyStreak} ครั้ง
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              โอกาสได้รางวัลเพิ่มขึ้น {Math.min(stats.luckyStreak * 2, 30)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 