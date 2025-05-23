import { userRepository } from '../repository'

export type User = NonNullable<
  Awaited<ReturnType<typeof userRepository.findById>>
>

export type UserWithCharacter = NonNullable<
  Awaited<ReturnType<typeof userRepository.findUserWithCharacterById>>
>
