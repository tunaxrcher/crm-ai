// src/features/feed/components/CharacterDialog.tsx
'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { Progress } from '@src/components/ui/progress'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  Brain,
  Briefcase,
  Calendar,
  Coins,
  Crown,
  Heart,
  Star,
  Swords,
  Trophy,
  Wind,
  Zap,
} from 'lucide-react'

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

// src/features/feed/components/CharacterDialog.tsx

interface CharacterDialogProps {
  isOpen: boolean
  onClose: () => void
  character: any
}

const statConfig = {
  AGI: {
    icon: Wind,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Agility',
  },
  STR: {
    icon: Swords,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Strength',
  },
  DEX: {
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Dexterity',
  },
  VIT: {
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    label: 'Vitality',
  },
  INT: {
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Intelligence',
  },
}

export default function CharacterDialog({
  isOpen,
  onClose,
  character,
}: CharacterDialogProps) {
  const [tokenData, setTokenData] = useState<{
    currentTokens: number
    totalEarnedTokens: number
  } | null>(null)

  useEffect(() => {
    if (isOpen && character?.id) {
      console.log('CharacterDialog opened with character:', character)
      // Fetch token data when dialog opens
      const fetchTokenData = async () => {
        try {
          const response = await fetch(`/api/character/${character.id}/token`)
          console.log('Token API response status:', response.status)
          if (response.ok) {
            const data = await response.json()
            console.log('Token data received:', data)
            setTokenData({
              currentTokens: data.currentTokens,
              totalEarnedTokens: data.totalEarnedTokens,
            })
          }
        } catch (error) {
          console.error('Failed to fetch token data:', error)
        }
      }
      fetchTokenData()
    }
  }, [isOpen, character?.id])

  if (!character) return null

  const xpProgress = (character.currentXP / character.nextLevelXP) * 100
  const joinDate = character.user?.createdAt
    ? format(new Date(character.user.createdAt), 'dd MMMM yyyy', { locale: th })
    : 'ไม่ทราบ'

  const stats = [
    { key: 'AGI', value: character.statAGI },
    { key: 'STR', value: character.statSTR },
    { key: 'DEX', value: character.statDEX },
    { key: 'VIT', value: character.statVIT },
    { key: 'INT', value: character.statINT },
  ]

  console.log('Character data:', character)
  console.log('Token data state:', tokenData)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <Image
            src="/auto-import-evx-logo.png"
            alt="Auto Import EVX Logo"
            width={120}
            height={40}
            className="mx-auto mb-5"
          />
          <DialogTitle className="flex items-center gap-2"></DialogTitle>
          <DialogDescription className="pt-3"></DialogDescription>
        </DialogHeader>
        {/* Header with Portrait */}
        <div className="relative">
          {/* Character Portrait */}
          <div className="relative flex flex-col items-center">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <Image
                src={character?.currentPortraitUrl || ''}
                alt=""
                width={240}
                height={240}
                className="object-cover"
              />

              {character && (
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{character.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Crown className="h-3 w-3" />
                    Level {character.level} - {character.currentJobLevel?.title}
                  </p>
                </div>
              )}
            </div>

            {/* User Name */}
            {character.user && (
              <p className="text-xs text-muted-foreground mt-1">
                @{character.user.name}
              </p>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="space-y-4">
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">
                {character.currentXP.toLocaleString()} /{' '}
                {character.nextLevelXP.toLocaleString()} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          {/* Token Balance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">Token</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">ปัจจุบัน</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                  {tokenData?.currentTokens?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  ได้รับไปทั้งหมดแล้ว
                </p>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-500">
                  {tokenData?.totalEarnedTokens?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Stats
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {stats.map(({ key, value }) => {
                const config = statConfig[key as keyof typeof statConfig]
                const Icon = config.icon
                return (
                  <div key={key} className="text-center">
                    <div className={`${config.bgColor} rounded-lg p-3 mb-1`}>
                      <Icon className={`h-5 w-5 mx-auto ${config.color}`} />
                    </div>
                    <div className="text-xs font-medium">{key}</div>
                    <div className={`text-lg font-bold ${config.color}`}>
                      {value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Job Class Info */}
          {character.jobClass && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{character.jobClass.name}</p>
                {character.currentJobLevel && (
                  <p className="text-xs text-muted-foreground">
                    Level {character.currentJobLevel.level}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {character.user?.bio && (
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-sm">{character.user.bio}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>เข้าร่วมเมื่อ ...</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{character.totalXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2"></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
