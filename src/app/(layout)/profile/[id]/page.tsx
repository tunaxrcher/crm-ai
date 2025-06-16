// src/app/(layout)/profile/[id]/page.tsx

interface ProfilePageProps {
  params: {
    id: string // จะได้ "32" จาก URL /profile/32
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const userId = params.id // "32"

  return (
    <div>
      <h1>Profile Page</h1>
      <p>User ID: {userId}</p>
    </div>
  )
}
