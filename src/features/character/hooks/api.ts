import { useMutation, useQuery } from '@tanstack/react-query'

import { characterService, jobClassService } from '../services/client'
import { CharacterConfirmPayload, CharacterCreatePayload } from '../types'

export const useGetJobClass = () => {
  return useQuery({
    queryKey: ['jobclass'],
    queryFn: () => jobClassService.fetchJobClass(),
  })
}

export const useConfirmCharacter = () => {
  return useMutation({
    mutationFn: (payload: CharacterConfirmPayload) =>
      characterService.confirmCharacter(payload),
  })
}
