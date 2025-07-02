import { BaseService } from '@src/lib/services/client/baseService'

interface UserXeny {
  id: number
  userId: number
  currentXeny: number
  totalEarnedXeny: number
  totalSpentXeny: number
  createdAt: string
  updatedAt: string
}

interface XenyTransaction {
  id: number
  userId: number
  amount: number
  type: string
  description?: string
  referenceId?: number
  referenceType?: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

interface ExchangeResult {
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

export class XenyService extends BaseService {
  private static instance: XenyService

  public static getInstance() {
    if (!XenyService.instance) {
      XenyService.instance = new XenyService()
    }
    return XenyService.instance
  }

  // ดึงข้อมูล Xeny ของ user
  async getUserXeny(): Promise<UserXeny> {
    const response = await this.get<any>('/api/xeny')
    return response.data
  }

  // แลก Token เป็น Xeny
  async exchangeTokenToXeny(tokenAmount: number, exchangeRate: number = 10): Promise<ExchangeResult> {
    const response = await this.post<any>('/api/xeny/exchange', {
      tokenAmount,
      exchangeRate,
    })
    return response.data
  }

  // ดึงประวัติ transactions
  async getXenyTransactions(limit: number = 10, offset: number = 0) {
    const url = `/api/xeny/transactions?limit=${limit}&offset=${offset}`
    const response = await this.get<any>(url)
    return response.data
  }
}

export const xenyService = XenyService.getInstance() 