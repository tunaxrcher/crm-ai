'use client'

import QuestDetail from '@src/features/quest/components/QuestDetail'
import { useAuth } from '@src/hooks/useAuth'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  const { user } = useAuth()
  const { id } = params

  if (!user) return <div></div>

  return (
    <QuestDetail
      questId={id}
      userId={+user.id}
      characterId={user.characterId}
    />
  )
}
