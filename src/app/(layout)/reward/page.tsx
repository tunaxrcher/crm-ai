'use client'

import { useRef, useState } from 'react'

import Image from 'next/image'

import { Button } from '@src/components/ui/button'
import { Gift, Sparkles, Star, Sun, Watch, Zap } from 'lucide-react'

export default function RewardPage() {
  const [userPoints, setUserPoints] = useState(750)
  const [isGachaPlaying, setIsGachaPlaying] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const rewardItems = [
    {
      id: 1,
      name: 'Gift Card',
      subtitle: '$10 Value',
      icon: Gift,
      cost: 500,
      color: 'from-orange-400 to-red-500',
      iconColor: 'text-white',
      image: '/images/gift-card.png',
      probability: 0.4,
    },
    {
      id: 2,
      name: 'Day Off',
      subtitle: 'Paid Leave',
      icon: Sun,
      cost: 1000,
      color: 'from-yellow-400 to-orange-500',
      iconColor: 'text-white',
      probability: 0.3,
    },
    {
      id: 3,
      name: 'Smartwatch',
      subtitle: 'Apple Watch',
      icon: Watch,
      cost: 2000,
      color: 'from-gray-700 to-gray-900',
      iconColor: 'text-white',
      image: '/images/smartwatch.png',
      probability: 0.2,
    },
    {
      id: 4,
      name: 'Electric',
      subtitle: 'E-Scooter',
      icon: Zap,
      cost: 1500,
      color: 'from-purple-500 to-indigo-600',
      iconColor: 'text-white',
      image: '/images/electric-scooter.png',
      probability: 0.1,
    },
  ]

  const getRandomReward = () => {
    const random = Math.random()
    let cumulativeProbability = 0
    for (const item of rewardItems) {
      cumulativeProbability += item.probability
      if (random <= cumulativeProbability) {
        return item
      }
    }
    return rewardItems[0]
  }

  const handleGacha = async (cost: number) => {
    if (userPoints < cost) return
    setUserPoints((prev) => prev - cost)
    setIsGachaPlaying(true)
    setShowReward(false)

    if (videoRef.current) {
      videoRef.current.currentTime = 0
      await videoRef.current.play()
    }
  }

  const handleVideoEnd = () => {
    setIsGachaPlaying(false)
    const reward = getRandomReward()
    setCurrentReward(reward)
    setShowReward(true)
  }

  const closeRewardModal = () => {
    setShowReward(false)
    setCurrentReward(null)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600'
      case 'uncommon':
        return 'from-green-400 to-green-600'
      case 'rare':
        return 'from-blue-400 to-blue-600'
      case 'epic':
        return 'from-purple-400 to-purple-600'
      case 'legendary':
        return 'from-yellow-400 to-orange-500'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <div className="">
      {/* Ambient Background Effects */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
      </div> */}

      {/* Status Bar Spacer */}
      {/* <div className="h-12"></div> */}

      {/* Header */}
      <div className="relative z-10">
        <div className="absolute inset-0"></div>
        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold ai-gradient-text">Rewards</h1>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl px-6 py-4 shadow-2xl border border-white/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Star className="h-5 w-5 text-white fill-white drop-shadow-sm" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">
                      {userPoints}
                    </div>
                    <div className="text-xs text-gray-500 -mt-1 font-medium">
                      Points
                    </div>
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
          <div className="relative  overflow-hidden">
            <div className="px-10 py-12">
              {/* Gacha Machine Image */}
              <div className="flex flex-col items-center">
                <div className="relative group/machine">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-3xl blur-2xl group-hover/machine:blur-3xl transition-all duration-500"></div>
                  <Image
                    src="/images/gacha-machine.webp"
                    alt="Futuristic Gacha Machine"
                    width={220}
                    height={330}
                    className="relative drop-shadow-2xl hover:scale-105 transition-transform duration-700 filter hover:brightness-110"
                    priority
                  />
                </div>
              </div>

              {/* Enhanced Premium Buttons */}
              <div className="flex space-x-4">
                <div className="relative group/btn1 w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-3xl blur-xl group-hover/btn1:blur-2xl transition-all duration-300"></div>
                  <Button
                    className="relative w-full font-bold py-5 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-blue-400/30 hover:scale-[1.02]"
                    disabled={userPoints < 50 || isGachaPlaying}
                    onClick={() => handleGacha(50)}>
                    <div className="flex items-center justify-center">
                      <Sparkles className="h-6 w-6 mr-3 drop-shadow-sm" />
                      <span className="text-lg">กด 1 ครั้ง</span>
                    </div>
                  </Button>
                </div>

                <div className="relative group/btn2 w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-600/30 rounded-3xl blur-xl group-hover/btn2:blur-2xl transition-all duration-300"></div>
                  <Button
                    className="relative w-full font-bold py-5 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-purple-400/30 hover:scale-[1.02]"
                    disabled={userPoints < 500 || isGachaPlaying}
                    onClick={() => handleGacha(500)}>
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

        {/* Enhanced Rewards Mall */}
        <div className="relative group">
          <div className="absolute inset-0 "></div>
          <div className="relativeoverflow-hidden">
            <div className="px-10 py-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl mb-3">Rewards Mall</h2>
                {/* <p className="text-gray-500 text-lg font-medium">
                  Premium rewards for your achievements
                </p> */}
              </div>

              <div className="grid grid-cols-2 gap-8">
                {rewardItems.map((item) => {
                  const IconComponent = item.icon
                  const canAfford = userPoints >= item.cost

                  return (
                    <div
                      key={item.id}
                      className={`group/card cursor-pointer duration-700`}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br rounded-[1.5rem] blur-xl transition-all duration-500"></div>
                        <div className="relative">
                          {/* Enhanced Icon or Image */}
                          {item.image ? (
                            <div className="relative w-20 h-20 mx-auto mb-6 rounded-3xl overflow-hidden  transition-all duration-700 flex items-center justify-center p-3">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                              <Image
                                src={item.image || '/placeholder.svg'}
                                alt={item.name}
                                width={item.id === 1 ? 72 : 64}
                                height={item.id === 1 ? 54 : 64}
                                className={`relative ${item.id === 1 ? 'w-full h-full object-cover' : 'w-full h-full object-contain'} drop-shadow-lg filter `}
                              />
                            </div>
                          ) : (
                            <div
                              className={`relative w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-all duration-700`}>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                              <IconComponent
                                className={`h-10 w-10 ${item.iconColor} drop-shadow-lg relative z-10`}
                              />
                            </div>
                          )}

                          {/* Enhanced Content */}
                          <div className="text-center">
                            <h3 className=" text-lg mb-2">{item.name}</h3>
                            {/* <p className="text-gray-500 text-sm mb-4 font-medium">
                              {item.subtitle}
                            </p> */}

                            <div className="relative inline-block">
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-100/80 to-gray-50/80 rounded-2xl blur-sm"></div>
                              <div className="relative bg-gray-50/90 backdrop-blur-xl rounded-2xl px-4 py-3 inline-flex items-center border border-gray-200/60 shadow-lg">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-3 drop-shadow-sm" />
                                <span className="text-gray-900 font-black text-lg">
                                  {item.cost}
                                </span>
                                <span className="text-gray-500 text-sm ml-2 font-medium">
                                  pts
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Hover Glow */}
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

      {showReward && currentReward && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-white/50 max-w-sm w-full text-center">
              <div className="mb-6">
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${currentReward.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                  {currentReward.image ? (
                    <Image
                      src={currentReward.image || '/placeholder.svg'}
                      alt={currentReward.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <currentReward.icon className="h-12 w-12 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Congratulations!
                </h3>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  {currentReward.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {currentReward.subtitle}
                </p>
              </div>
              <Button
                onClick={closeRewardModal}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-2xl">
                รับรางวัล
              </Button>
            </div>
          </div>
        </div>
      )}
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
    </div>
  )
}
