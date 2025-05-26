import Image from 'next/image'

import { CharacterData as Character } from '@src/features/user/types/character.type'

interface CharacterProfileProps {
  character: Character
}

export default function CharacterProfile({ character }: CharacterProfileProps) {
  return (
    <>
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ animation: 'float 6s ease-in-out infinite' }}>
        <Image
          src={character.portrait}
          alt="Character"
          width={240}
          height={240}
          className="z-10"
        />
      </div>
    </>
  )
}
