export interface UserXeny {
  id: number
  userId: number
  currentXeny: number
  totalEarnedXeny: number
  totalSpentXeny: number
  createdAt: string
  updatedAt: string
}

export interface XenyTransaction {
  id: number
  userId: number
  characterId: number
  amount: number
  type: XenyTransactionType
  description?: string
  referenceId?: number
  referenceType?: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export type XenyTransactionType =
  | 'gacha_reward'
  | 'shop_purchase'
  | 'admin_grant'
  | 'admin_deduct'
  | 'event_reward'
  | 'referral_bonus'
  | 'exchange_from_token'
  | 'exchange_to_token'

export interface XenyShopItem {
  id: number
  name: string
  description?: string
  category: string
  itemType: XenyShopItemType
  price: number
  imageUrl?: string
  metadata?: any
  stock?: number
  isActive: boolean
  validFrom?: string
  validUntil?: string
  minLevel?: number
  maxPurchasePerUser?: number
  createdAt: string
  updatedAt: string
}

export type XenyShopItemType =
  | 'special_item'
  | 'exclusive_portrait'
  | 'premium_title'
  | 'rare_cosmetic'
  | 'limited_edition'
  | 'event_item'

export interface XenyPurchase {
  id: number
  userId: number
  shopItemId: number
  quantity: number
  totalPrice: number
  status: PurchaseStatus
  appliedAt?: string
  expiresAt?: string
  purchasedAt: string
  characterId: number
  shopItem?: XenyShopItem
}

export type PurchaseStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'expired'

export interface ExchangeTokenToXenyRequest {
  tokenAmount: number
  exchangeRate?: number
}

export interface ExchangeTokenToXenyResponse {
  success: boolean
  message: string
  data: {
    userToken: {
      currentTokens: number
    }
    userXeny: UserXeny
    exchangeDetails: {
      tokensUsed: number
      xenyReceived: number
      exchangeRate: number
    }
  }
}

export interface GetXenyTransactionsResponse {
  success: boolean
  data: {
    transactions: XenyTransaction[]
    total: number
    hasMore: boolean
  }
}
