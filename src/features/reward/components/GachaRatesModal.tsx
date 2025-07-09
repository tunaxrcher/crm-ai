'use client'

import Image from 'next/image'

import { Badge } from '@src/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { ScrollArea } from '@src/components/ui/scroll-area'
import { Skeleton } from '@src/components/ui/skeleton'
import {
  AlertCircle,
  Crown,
  Gift,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Watch,
  Zap,
} from 'lucide-react'

import { useGachaRates } from '../hooks/api'

interface GachaRatesModalProps {
  isOpen: boolean
  onClose: () => void
}

// Map rarity to colors
const rarityColors = {
  common: 'bg-gray-500 text-white',
  uncommon: 'bg-green-500 text-white',
  rare: 'bg-blue-500 text-white',
  epic: 'bg-purple-500 text-white',
  legendary: 'bg-yellow-500 text-white',
}

// Map itemType to icon
const itemTypeIcons: Record<string, any> = {
  gift_card: Gift,
  day_off: Sun,
  smartwatch: Watch,
  scooter: Zap,
  xeny: Sparkles,
  jackpot: Crown,
}

export default function GachaRatesModal({
  isOpen,
  onClose,
}: GachaRatesModalProps) {
  const { data: gachaRatesData, isLoading } = useGachaRates()

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <Image
            src="/auto-import-evx-logo.png"
            alt="Auto Import EVX Logo"
            width={120}
            height={40}
            className="mx-auto mb-5"
          />
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            อัตราการออกรางวัล
          </DialogTitle>
          <DialogDescription className="pt-3"></DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : gachaRatesData ? (
            <>
              {/* Summary Info */}
              {/* <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">อัตราได้รางวัล</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {gachaRatesData.totalRewardProbability.percentText}%
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm">อัตราไม่ได้รางวัล</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                    {gachaRatesData.noRewardProbability.percentText}%
                  </div>
                </div>
              </div> */}

              {/* Rewards List */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  รางวัลทั้งหมด ({gachaRatesData.gachaRewards.length} รายการ)
                </h3>

                <ScrollArea className="h-96">
                  <div className="space-y-3 pr-4">
                    {gachaRatesData.gachaRewards.map((reward: any) => {
                      const IconComponent =
                        itemTypeIcons[reward.itemType] || Gift
                      const isJackpot = reward.id === 1

                      return (
                        <div
                          key={reward.id}
                          className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                            isJackpot
                              ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 hover:border-yellow-500/50'
                              : 'bg-secondary/30 hover:bg-secondary/50'
                          }`}>
                          {/* Reward Icon/Image */}
                          <div className="relative">
                            {reward.imageUrl ? (
                              <Image
                                src={reward.imageUrl}
                                alt={reward.name}
                                width={48}
                                height={48}
                                className="rounded-lg object-contain"
                              />
                            ) : (
                              <div
                                className={`w-12 h-12 rounded-lg ${
                                  isJackpot
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                    : reward.color || 'bg-gray-500'
                                } flex items-center justify-center`}>
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                            )}

                            {/* Rarity Badge */}
                            <Badge
                              className={`absolute -top-1 -right-1 text-xs px-1 py-0 ${
                                isJackpot
                                  ? 'bg-yellow-500 text-white'
                                  : rarityColors[
                                      reward.rarity as keyof typeof rarityColors
                                    ] || rarityColors.common
                              } border-0`}>
                              {isJackpot
                                ? 'JACKPOT'
                                : reward.rarity?.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Reward Info */}
                          <div className="flex-1">
                            <h4
                              className={`font-semibold ${
                                isJackpot ? 'text-yellow-400' : ''
                              }`}>
                              {reward.name}
                            </h4>
                            {!isJackpot && reward.subtitle && (
                              <p className="text-muted-foreground text-sm">
                                {reward.subtitle}
                              </p>
                            )}
                            {!isJackpot && reward.description && (
                              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                                {reward.description}
                              </p>
                            )}
                            {!isJackpot && reward.stock !== null && (
                              <p className="text-yellow-600 dark:text-yellow-500 text-xs mt-1">
                                เหลือ: {reward.stock} ชิ้น
                              </p>
                            )}
                          </div>

                          {/* Drop Rate */}
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                isJackpot ? 'text-yellow-400' : 'text-primary'
                              }`}>
                              {reward.probabilityPercent}%
                            </div>
                            <div className="text-muted-foreground text-xs">
                              อัตราออก
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลได้</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
