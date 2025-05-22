import PartyDetailWrapper from './PartyDetailWrapper'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PartyDetailWrapper teamId={id} />
}
