'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { Button } from '@src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { useNotification } from '@src/components/ui/notification-system'
import GachaRatesModal from '@src/features/reward/components/GachaRatesModal'
import JackpotWinnersSection from '@src/features/reward/components/JackpotWinnersSection'
import {
  type GachaResult,
  useCurrentJackpot,
  useGachaPull,
  usePurchaseReward,
  useRewards,
} from '@src/features/reward/hooks/api'
import {
  AlertCircle,
  Coins,
  Gift,
  Info,
  Sparkles,
  Star,
  Sun,
  Watch,
  Zap,
} from 'lucide-react'

// Map itemType to icon
const itemTypeIcons: Record<string, any> = {
  gift_card: Gift,
  day_off: Sun,
  smartwatch: Watch,
  scooter: Zap,
}

interface ConfirmDialogData {
  isOpen: boolean
  type: 'purchase' | 'gacha' | null
  title: string
  description: string
  cost: number
  onConfirm: () => void
  itemData?: any // สำหรับเก็บข้อมูล item ที่จะซื้อ
}

interface AnimatedCounterProps {
  value: number
  duration?: number
}

function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    console.log(displayValue)
    console.log(value)

    if (displayValue === value) return

    setIsAnimating(true)
    const startValue = displayValue
    const difference = value - startValue
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)

      const currentValue = Math.floor(startValue + difference * easeOutCubic)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, displayValue])

  return (
    <span
      className={`font-mono font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text transition-all duration-200 ${
        isAnimating ? 'scale-110 drop-shadow-lg' : ''
      }`}>
      {displayValue.toLocaleString()}
    </span>
  )
}

export default function RewardPage() {
  const [isGachaPlaying, setIsGachaPlaying] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [currentRewards, setCurrentRewards] = useState<GachaResult[]>([])
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0)
  const [showGachaRates, setShowGachaRates] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    type: null,
    title: '',
    description: '',
    cost: 0,
    onConfirm: () => {},
    itemData: null,
  })
  const videoRef = useRef<HTMLVideoElement>(null)

  // Hooks
  const { data: rewardsData, isLoading } = useRewards()
  const { data: jackpotData } = useCurrentJackpot()
  const purchaseReward = usePurchaseReward()
  const gachaPull = useGachaPull()
  const { addNotification } = useNotification()

  const userTokens = rewardsData?.currentTokens || 0
  const rewardItems = rewardsData?.rewards || []

  const handleGachaConfirm = (pullCount: 1 | 10) => {
    const cost = pullCount === 1 ? 50 : 500

    if (userTokens < cost) {
      addNotification({
        type: 'error',
        title: 'ไม่สามารถเล่นได้',
        message: 'Token ไม่เพียงพอ',
        duration: 3000,
      })
      return
    }

    setConfirmDialog({
      isOpen: true,
      type: 'gacha',
      title: `ยืนยันการเล่น Gacha ${pullCount} ครั้ง`,
      description:
        pullCount === 1
          ? 'คุณต้องการเล่น Gacha 1 ครั้งใช่หรือไม่?'
          : 'คุณต้องการเล่น Gacha 10 ครั้งใช่หรือไม่? (มีโอกาสได้รางวัลมากกว่า)',
      cost: cost,
      onConfirm: () => handleGacha(pullCount),
    })
  }

  const handleGacha = async (pullCount: 1 | 10) => {
    setConfirmDialog({ ...confirmDialog, isOpen: false })

    try {
      const result = await gachaPull.mutateAsync({ pullCount })

      if (result.success) {
        setIsGachaPlaying(true)
        setShowReward(false)
        setCurrentRewards(result.data.results)
        setCurrentRewardIndex(0)

        // แสดงข้อมูล Jackpot ที่เพิ่มขึ้น
        if (result.data.jackpot.addedThisSession > 0) {
          addNotification({
            type: 'info',
            title: '💎 Jackpot เพิ่มขึ้น!',
            message: `เพิ่ม ${result.data.jackpot.addedThisSession} Xeny เข้า Jackpot Pool`,
            duration: 4000,
          })
        }

        // เล่นวิดีโอ
        if (videoRef.current) {
          videoRef.current.currentTime = 0
          await videoRef.current.play()
        }
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message:
          error instanceof Error ? error.message : 'ไม่สามารถเล่น Gacha ได้',
        duration: 5000,
      })
    }
  }

  const handlePurchaseConfirm = (item: any) => {
    if (userTokens < item.tokenCost) {
      addNotification({
        type: 'error',
        title: 'ไม่สามารถซื้อได้',
        message: 'Token ไม่เพียงพอ',
        duration: 3000,
      })
      return
    }

    setConfirmDialog({
      isOpen: true,
      type: 'purchase',
      title: 'ยืนยันการซื้อ',
      description: `คุณต้องการซื้อ "${item.name}" หรือไม่?`,
      cost: item.tokenCost,
      onConfirm: () => handlePurchaseReward(item.id),
      itemData: item,
    })
  }

  const handlePurchaseReward = async (rewardId: number) => {
    setConfirmDialog({ ...confirmDialog, isOpen: false })

    try {
      const result = await purchaseReward.mutateAsync({ rewardId })

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'ซื้อสำเร็จ!',
          message: result.message,
          duration: 3000,
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'ซื้อไม่สำเร็จ',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        duration: 5000,
      })
    }
  }

  const handleVideoEnd = () => {
    setIsGachaPlaying(false)
    setShowReward(true)
  }

  const closeRewardModal = () => {
    if (currentRewardIndex < currentRewards.length - 1) {
      // แสดงรางวัลถัดไป
      setCurrentRewardIndex((prev) => prev + 1)
    } else {
      // ปิด modal ทั้งหมด
      setShowReward(false)
      setCurrentRewards([])
      setCurrentRewardIndex(0)
    }
  }

  const currentReward = currentRewards[currentRewardIndex]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header */}
      <div className="relative z-10">
        <div className="absolute inset-0"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold ai-gradient-text">Rewards</h1>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
              <div className="relativ backdrop-blur-2xl rounded-3xl px-6 py-4 shadow-2xl border border-white/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Coins className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">
                      {userTokens.toLocaleString()}
                    </div>
                    <div className="text-xs -mt-1 font-medium">Tokens</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-8 space-y-12">
        {/* Gacha Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
          <div className="relative overflow-hidden">
            <div className="px-10 py-12 pb-0">
              {/* Gacha Machine Image */}
              <div className="flex flex-col items-center">
                <div className="relative group/machine">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-3xl blur-2xl group-hover/machine:blur-3xl transition-all duration-500"></div>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setShowGachaRates(true)}>
                    <Image
                      src="/images/gacha-machine.webp"
                      alt="Futuristic Gacha Machine"
                      width={200}
                      height={200}
                      className="relative drop-shadow-2xl hover:scale-105 transition-transform duration-700 filter hover:brightness-110"
                      priority
                    />
                    {/* Info Icon Overlay */}
                    {/* <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-sm rounded-full p-2 hover:bg-blue-600/80 transition-colors">
                      <Info className="h-5 w-5 text-white" />
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Gacha Buttons */}
              <div className="flex space-x-4">
                <div className="relative group/btn1 w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-3xl blur-xl group-hover/btn1:blur-2xl transition-all duration-300"></div>
                  <Button
                    className="relative w-full font-white text-white py-6 text-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 border border-blue-400/40 hover:scale-[1.03] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    disabled={
                      userTokens < 50 || isGachaPlaying || gachaPull.isPending
                    }
                    onClick={() => handleGachaConfirm(1)}>
                    <div className="flex items-center justify-center">
                      <Sparkles className="h-6 w-6 mr-3 drop-shadow-sm" />
                      <span className="text-lg">กด 1 ครั้ง</span>
                    </div>
                  </Button>
                </div>

                <div className="relative group/btn2 w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-600/30 rounded-3xl blur-xl group-hover/btn2:blur-2xl transition-all duration-300"></div>
                  <Button
                    className="relative w-full font-white text-white py-6 text-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 border border-purple-400/40 hover:scale-[1.03] bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    disabled={
                      userTokens < 500 || isGachaPlaying || gachaPull.isPending
                    }
                    onClick={() => handleGachaConfirm(10)}>
                    <div className="flex items-center justify-center">
                      <div className="flex -space-x-1 mr-3">
                        <Sparkles className="h-5 w-5 drop-shadow-sm" />
                        <Sparkles className="h-5 w-5 drop-shadow-sm" />
                      </div>
                      <span className="text-lg">กด 10 ครั้ง</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jackpot Display */}
        <div className=" justify-center mb-8">
          <div className="relative group/jackpot">
            <div className="relative py-6">
              {/* 3D Jackpot Image */}
              <div className="flex justify-center mb-4">
                <Image
                  src="/jackpot.png"
                  alt="Jackpot 3D Text"
                  width={250}
                  height={100}
                  className="drop-shadow-2xl"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="bg-white/90 rounded-lg p-6 border-2 border-yellow-500/50 shadow-inner w-full">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-400 text-4xl">₿</span>
                    <div className="text-3xl flex items-center justify-center gap-2">
                      <AnimatedCounter
                        value={jackpotData?.data?.value || 0}
                        duration={2000}
                      />
                      <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text">
                        XENY
                      </span>
                    </div>
                    {(jackpotData?.data?.value || 0) >= 1000 && (
                      <div className="text-xs text-green-400 mt-1 animate-pulse">
                        🔥 สู้สู้ !
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jackpot Winners Section */}
        <div className="relative z-10 px-8 mb-12">
          <JackpotWinnersSection />
        </div>

        <hr />
        {/* Rewards Mall */}
        <div className="relative group">
          <div className="absolute inset-0"></div>
          <div className="relative overflow-hidden">
            <div className="px-10 pb-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl mb-3">Rewards Mall</h2>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {rewardItems.map((item: any) => {
                  const IconComponent = itemTypeIcons[item.itemType] || Gift
                  const canAfford = userTokens >= item.tokenCost

                  return (
                    <div
                      key={item.id}
                      className={`group/card ${canAfford ? 'cursor-pointer' : 'opacity-50'} duration-700`}
                      onClick={() => canAfford && handlePurchaseConfirm(item)}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br rounded-[1.5rem] blur-xl transition-all duration-500"></div>
                        <div className="relative">
                          {/* Icon or Image */}
                          {item.imageUrl ? (
                            <div className="relative w-20 h-20 mx-auto mb-6 rounded-3xl overflow-hidden transition-all duration-700 flex items-center justify-center p-3">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                              <Image
                                src={item.imageUrl || '/placeholder.svg'}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="relative w-full h-full object-contain drop-shadow-lg"
                              />
                            </div>
                          ) : (
                            <div
                              className={`relative w-20 h-20 bg-gradient-to-br ${item.color || 'from-gray-400 to-gray-600'} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-all duration-700`}>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                              <IconComponent className="h-10 w-10 text-white drop-shadow-lg relative z-10" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="text-center">
                            <h3 className="text-lg mb-2">{item.name}</h3>
                            {/* {item.subtitle && (
                              <p className="text-gray-500 text-sm mb-4 font-medium">
                                {item.subtitle}
                              </p>
                            )} */}

                            <div className="relative inline-block">
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-100/80 to-gray-50/80 rounded-2xl blur-sm"></div>
                              <div className="relative bg-gray-50/90 backdrop-blur-xl rounded-2xl px-4 py-3 inline-flex items-center border border-gray-200/60 shadow-lg">
                                <Coins className="h-5 w-5 text-green-500 mr-3 drop-shadow-sm" />
                                <span className="text-gray-900 font-black text-lg">
                                  {item.tokenCost.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Stock indicator */}
                            {item.stock !== null && (
                              <div className="mt-2 text-xs text-gray-500">
                                เหลือ {item.stock} ชิ้น
                              </div>
                            )}
                          </div>

                          {/* Hover Glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-500/5 rounded-[1.5rem] opacity-0 transition-opacity duration-700"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, isOpen: open })
        }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <Image
              src="/auto-import-evx-logo.png"
              alt="Auto Import EVX Logo"
              width={120}
              height={40}
              className="mx-auto mb-5"
            />
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="pt-3">
              {confirmDialog.description}
            </DialogDescription>
            {confirmDialog.itemData && confirmDialog.type === 'purchase' && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {confirmDialog.itemData.imageUrl ? (
                    <Image
                      src={confirmDialog.itemData.imageUrl}
                      alt={confirmDialog.itemData.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${confirmDialog.itemData.color || 'from-gray-400 to-gray-600'} rounded-lg flex items-center justify-center`}>
                      {(() => {
                        const Icon =
                          itemTypeIcons[confirmDialog.itemData.itemType] || Gift
                        return <Icon className="h-6 w-6 text-white" />
                      })()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">
                      {confirmDialog.itemData.name}
                    </div>
                    {confirmDialog.itemData.subtitle && (
                      <div className="text-sm text-muted-foreground">
                        {confirmDialog.itemData.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center p-4 bg-gradient-to-r rounded-lg border  items-center justify-center">
              {/* <span className="text-sm font-medium">จำนวน Token ที่ใช้:</span> */}
              <div className="flex items-center gap-2 text-white ">
                <Coins className="h-5 w-5 text-amber-600" />
                <span className="font-bold text-2xl">
                  {confirmDialog.cost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-muted-foreground">Token คงเหลือ:</span>
              <span
                className={`font-medium ${userTokens - confirmDialog.cost < 0 ? 'text-red-500' : ''}`}>
                {(userTokens - confirmDialog.cost).toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {/* <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, isOpen: false })
              }
              disabled={gachaPull.isPending || purchaseReward.isPending}>
              ยกเลิก
            </Button> */}
            <Button
              onClick={confirmDialog.onConfirm}
              disabled={gachaPull.isPending || purchaseReward.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {gachaPull.isPending || purchaseReward.isPending ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังดำเนินการ...
                </span>
              ) : (
                'ยืนยัน'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Modal - Full Screen */}
      {showReward && currentReward && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>

            {/* Animated Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}></div>

            {/* Content Container */}
            <div className="relative z-10 text-center">
              <div className="mb-8">
                {currentReward.isWin ? (
                  <>
                    {currentReward.reward && (
                      <>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className={`w-48 h-48 bg-gradient-to-br ${currentReward.reward.color || 'from-gray-400 to-gray-600'} rounded-full blur-2xl opacity-50 animate-pulse`}></div>
                        </div>

                        {/* Icon Container */}
                        <div
                          className={`relative w-40 h-40 bg-gradient-to-br ${currentReward.reward.color || 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-500`}>
                          {/* Inner Glow */}
                          <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>

                          {currentReward.reward.imageUrl ? (
                            <Image
                              src={
                                currentReward.reward.imageUrl ||
                                '/placeholder.svg'
                              }
                              alt={currentReward.reward.name}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-contain relative z-10 drop-shadow-2xl"
                            />
                          ) : (
                            (() => {
                              const Icon =
                                itemTypeIcons[currentReward.reward.itemType] ||
                                Gift
                              return (
                                <Icon className="h-20 w-20 text-white relative z-10 drop-shadow-2xl" />
                              )
                            })()
                          )}
                        </div>

                        {/* Sparkles Effect */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Sparkles
                            className="absolute h-8 w-8 text-yellow-400 animate-ping"
                            style={{ top: '20%', left: '30%' }}
                          />
                          <Sparkles
                            className="absolute h-6 w-6 text-yellow-300 animate-ping"
                            style={{
                              top: '25%',
                              right: '35%',
                              animationDelay: '0.5s',
                            }}
                          />
                          <Sparkles
                            className="absolute h-7 w-7 text-yellow-500 animate-ping"
                            style={{
                              bottom: '30%',
                              left: '25%',
                              animationDelay: '1s',
                            }}
                          />
                        </div>

                        <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                          Congratulations!
                        </h3>
                        <p className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                          {currentReward.reward.name}
                        </p>
                        <p className="text-xl text-gray-200 mb-8 drop-shadow-lg">
                          {currentReward.reward.subtitle}
                        </p>

                        {/* Rarity Badge */}
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
                          <Star className="h-5 w-5 text-yellow-400" />
                          <span className="text-white font-medium">
                            {currentReward.reward.rarity
                              .charAt(0)
                              .toUpperCase() +
                              currentReward.reward.rarity.slice(1)}{' '}
                            Reward
                          </span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative w-40 h-40 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <span className="text-6xl">😢</span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                      เสียใจด้วย
                    </h3>
                    <p className="text-2xl text-gray-200 mb-8 drop-shadow-lg">
                      คราวนี้ไม่ได้รางวัล ลองใหม่นะ!
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <span className="text-white/80">โชคดีครั้งหน้า!</span>
                    </div>
                  </>
                )}
              </div>

              {/* Show progress for multiple pulls */}
              {currentRewards.length > 1 && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {Array.from({ length: currentRewards.length }).map(
                      (_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentRewardIndex
                              ? 'w-8 bg-white'
                              : idx < currentRewardIndex
                                ? 'bg-white/60'
                                : 'bg-white/30'
                          }`}
                        />
                      )
                    )}
                  </div>
                  <p className="text-white/80 text-sm">
                    {currentRewardIndex + 1} / {currentRewards.length}
                  </p>
                </div>
              )}

              <Button
                onClick={closeRewardModal}
                className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                {currentRewardIndex < currentRewards.length - 1 ? (
                  <span className="flex items-center gap-2">
                    ถัดไป
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                ) : (
                  'ปิด'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gacha Video */}
      {isGachaPlaying && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-screen h-screen object-cover"
            onEnded={handleVideoEnd}
            playsInline
            autoPlay>
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/open-gacha-machine-KdCQ1b2scpOKXEf8dEwqMrB6thW37O.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      )}

      {/* Gacha Rates Modal */}
      <GachaRatesModal
        isOpen={showGachaRates}
        onClose={() => setShowGachaRates(false)}
      />
    </div>
  )
}
