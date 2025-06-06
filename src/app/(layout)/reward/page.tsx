'use client'

import Image from 'next/image'

import { Button } from '@src/components/ui/button'
import { Gift, Sparkles, Star, Sun, Watch, Zap } from 'lucide-react'

export default function RewardPage() {
  const userPoints = 750

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
    },
    {
      id: 2,
      name: 'Day Off',
      subtitle: 'Paid Leave',
      icon: Sun,
      cost: 1000,
      color: 'from-yellow-400 to-orange-500',
      iconColor: 'text-white',
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
    },
  ]

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
                    src="/images/gacha-machine.png"
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
                    disabled={userPoints < 50}>
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
                    disabled={userPoints < 500}>
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
    </div>
  )
}
