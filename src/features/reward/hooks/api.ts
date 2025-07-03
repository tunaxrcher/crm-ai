// src/features/reward/hooks/api.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types
export interface RewardItem {
  id: number
  name: string
  subtitle?: string
  description?: string
  category: string
  itemType: string
  icon?: string
  imageUrl?: string
  color?: string
  tokenCost: number
  gachaCost: number
  stock?: number | null
  isActive: boolean
  rarity: string
  gachaProbability: number
}

export interface GachaResult {
  rewardId: number | null
  reward: RewardItem | null
  isWin: boolean
}

export interface PurchaseResult {
  success: boolean
  message: string
  data: {
    purchase: any
    currentTokens: number
  }
}

export interface GachaPullResult {
  success: boolean
  message: string
  data: {
    results: GachaResult[]
    purchases: any[]
    currentTokens: number
    sessionId: string
  }
}

// Fetch rewards
export const useRewards = () => {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const response = await fetch('/api/rewards')
      if (!response.ok) throw new Error('Failed to fetch rewards')
      return response.json()
    },
  })
}

// Purchase reward
export const usePurchaseReward = () => {
  const queryClient = useQueryClient()

  return useMutation<PurchaseResult, Error, { rewardId: number }>({
    mutationFn: async ({ rewardId }) => {
      const response = await fetch('/api/rewards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to purchase')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      queryClient.invalidateQueries({ queryKey: ['user-token'] })
    },
  })
}

// Gacha pull
export const useGachaPull = () => {
  const queryClient = useQueryClient()

  return useMutation<GachaPullResult, Error, { pullCount: 1 | 10 }>({
    mutationFn: async ({ pullCount }) => {
      const response = await fetch('/api/rewards/gacha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pullCount }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to pull gacha')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      queryClient.invalidateQueries({ queryKey: ['user-token'] })
      queryClient.invalidateQueries({ queryKey: ['gacha-history'] })
    },
  })
}

// Get purchase history
export const usePurchaseHistory = () => {
  return useQuery({
    queryKey: ['purchase-history'],
    queryFn: async () => {
      const response = await fetch('/api/rewards/history')
      if (!response.ok) throw new Error('Failed to fetch history')
      return response.json()
    },
  })
}

// Get gacha history
export const useGachaHistory = () => {
  return useQuery({
    queryKey: ['gacha-history'],
    queryFn: async () => {
      const response = await fetch('/api/rewards/gacha/history')
      if (!response.ok) throw new Error('Failed to fetch gacha history')
      return response.json()
    },
  })
}

// Get gacha rates and rewards
export const useGachaRates = () => {
  return useQuery({
    queryKey: ['gacha-rates'],
    queryFn: async () => {
      const response = await fetch('/api/rewards/gacha/rates')
      if (!response.ok) throw new Error('Failed to fetch gacha rates')
      return response.json()
    },
  })
}
