import QuestDetail from '@src/features/quest/components/QuestDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  // const { user } = useAuth()

  const { id } = await params

  // if (!user) return <div></div>

  return <QuestDetail questId={id} userId={1} characterId={1} />
}
