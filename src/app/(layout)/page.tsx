'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@src/components/ui/button'
import { Card, CardContent } from '@src/components/ui/card'
import { useNotification } from '@src/components/ui/notification-system'
import {
  BarChart3,
  Calendar,
  ChartPieIcon,
  Gift,
  Layout,
  Medal,
  ScrollText,
  Timer,
  Trophy,
  Users,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { addNotification } = useNotification()

  // Show welcome notification
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'ยินดีต้อนรับสู่ เอไอ & CRM',
        message: 'Check out the new features and enhancements!',
        duration: 5000,
        action: {
          label: 'ทดสอบ Noti',
          onClick: () => console.log('Welcome notification clicked'),
        },
      })
    }, 1000)

    return () => clearTimeout(welcomeTimer)
  }, [addNotification])

  return (
    <div className="p-4 pb-20">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold ai-gradient-text mb-2">เอไอ & CRM</h1>
        <p className="text-muted-foreground">
          Turn your CRM work into an engaging RPG experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* <Button
          className="h-24 flex flex-col ai-gradient-bg"
          onClick={() => router.push("/character/create")}
        >
          <Layout className="h-8 w-8 mb-2" />
          <span>สร้างโปรไฟล์r</span>
        </Button> */}

        {/* <Button
          className="h-24 flex flex-col bg-blue-500"
          onClick={() => router.push("/quest")}
        >
          <ScrollText className="h-8 w-8 mb-2" />
          <span>Start Quests</span>
        </Button> */}
      </div>

      {/* <h2 className="text-xl font-bold mb-4">Game Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          className="overflow-hidden quest-item-hover cursor-pointer"
          onClick={() => router.push("/reward/achievements")}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-amber-500/20 rounded-lg mr-4">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium">Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Complete achievements to earn special rewards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="overflow-hidden quest-item-hover cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Performance Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress and performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="overflow-hidden quest-item-hover cursor-pointer"
          onClick={() => router.push("/daily-rewards")}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Daily Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Log in daily to earn rewards and maintain your streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="overflow-hidden quest-item-hover cursor-pointer"
          onClick={() => router.push("/party")}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium">Party System</h3>
                <p className="text-sm text-muted-foreground">
                  Join teams and tackle collaborative quests together
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Quick Access</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center"
          onClick={() => router.push("/character")}
        >
          <Trophy className="h-5 w-5 mb-1 text-yellow-400" />
          <span className="text-xs">Character</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center"
          onClick={() => router.push("/feed")}
        >
          <ChartPieIcon className="h-5 w-5 mb-1 text-blue-400" />
          <span className="text-xs">Feed</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center"
          onClick={() => router.push("/ranking")}
        >
          <Medal className="h-5 w-5 mb-1 text-green-400" />
          <span className="text-xs">Ranking</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center"
          onClick={() => router.push("/reward")}
        >
          <Gift className="h-5 w-5 mb-1 text-purple-400" />
          <span className="text-xs">Rewards</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center"
          onClick={() => router.push("/notifications/demo")}
        >
          <Timer className="h-5 w-5 mb-1 text-red-400" />
          <span className="text-xs">Notifications</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center"
          onClick={() => router.push("/party")}
        >
          <Users className="h-5 w-5 mb-1 text-violet-400" />
          <span className="text-xs">Party</span>
        </Button>
      </div> */}
    </div>
  )
}
