import { useMutation, useQuery } from '@tanstack/react-query'

import { characterService, jobClassService } from '../service/client'
import { CharacterConfirmPayload, CharacterCreatePayload } from '../types'

export const useGetJobClass = () => {
  return useQuery({
    queryKey: ['jobclass'],
    queryFn: () => jobClassService.fetchJobClass(),
  })
}

// export const useCreateCharacter = () =>
//   useMutation({
//     mutationFn: (payload: CharacterCreatePayload) =>
//       characterService.createCharacter(payload),
//   })

export const useConfirmCharacter = () =>
  useMutation({
    mutationFn: (payload: CharacterConfirmPayload) =>
      characterService.confirmCharacter(payload),
  })
