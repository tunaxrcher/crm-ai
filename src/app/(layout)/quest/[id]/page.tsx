'use client'

import { useParams } from 'next/navigation'

import QuestDetail from '@src/features/quest/components/QuestDetail'
import { useAuth } from '@src/hooks/useAuth'

export default function Page() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()

  if (!user) return <div></div>

  return (
    <QuestDetail
      questId={id}
      userId={+user.id}
      characterId={user.characterId}
    />
  )
}
