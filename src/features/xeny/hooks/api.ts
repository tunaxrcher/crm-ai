import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { xenyService } from '../services/client'

// Hook สำหรับดึงข้อมูล Xeny
export const useUserXeny = () => {
  return useQuery({
    queryKey: ['userXeny'],
    queryFn: () => xenyService.getUserXeny(),
  })
}

// Hook สำหรับแลก Token เป็น Xeny
export const useExchangeTokenToXeny = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tokenAmount, exchangeRate = 10 }: { tokenAmount: number; exchangeRate?: number }) =>
      xenyService.exchangeTokenToXeny(tokenAmount, exchangeRate),
    onSuccess: () => {
      // อัปเดต cache ของ userXeny และ userToken
      queryClient.invalidateQueries({ queryKey: ['userXeny'] })
      queryClient.invalidateQueries({ queryKey: ['userToken'] })
    },
  })
}

// Hook สำหรับดึงประวัติ Xeny transactions
export const useXenyTransactions = (limit: number = 10, offset: number = 0) => {
  return useQuery({
    queryKey: ['xenyTransactions', limit, offset],
    queryFn: () => xenyService.getXenyTransactions(limit, offset),
  })
} 