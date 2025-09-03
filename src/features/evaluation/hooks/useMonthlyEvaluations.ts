import { useQuery } from '@tanstack/react-query'

interface MonthlyEvaluation {
  id: number
  characterId: number
  month: number
  year: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  evaluation: string | null
  summary: string | null
  strengths: string | null
  weaknesses: string | null
  improvements: string | null
  isPassed: boolean | null
  totalSubmissions: number
  evaluatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const fetchCharacterEvaluations = async (characterId: number): Promise<MonthlyEvaluation[]> => {
  const response = await fetch(`/api/evaluation/character/${characterId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch evaluations')
  }
  
  const data = await response.json()
  return data.data
}

const fetchEvaluationByMonth = async (
  characterId: number, 
  month: number, 
  year: number
): Promise<MonthlyEvaluation | null> => {
  const response = await fetch(
    `/api/evaluation/character/${characterId}?month=${month}&year=${year}`
  )
  
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('Failed to fetch evaluation')
  }
  
  const data = await response.json()
  return data.data
}

export const useMonthlyEvaluations = (characterId: number) => {
  return useQuery({
    queryKey: ['monthlyEvaluations', characterId],
    queryFn: () => fetchCharacterEvaluations(characterId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useMonthlyEvaluationByMonth = (
  characterId: number, 
  month: number, 
  year: number
) => {
  return useQuery({
    queryKey: ['monthlyEvaluation', characterId, month, year],
    queryFn: () => fetchEvaluationByMonth(characterId, month, year),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook สำหรับ manual trigger evaluation
export const useTriggerEvaluation = () => {
  const triggerEvaluation = async (month: number, year: number) => {
    const response = await fetch('/api/evaluation/monthly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ month, year }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to trigger evaluation')
    }
    
    return response.json()
  }
  
  return { triggerEvaluation }
}
