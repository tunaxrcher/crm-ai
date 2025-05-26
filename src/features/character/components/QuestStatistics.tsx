'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import { ScrollText } from 'lucide-react'

import { QuestStats } from '../types'

interface QuestStatisticsProps {
  questStats: QuestStats
}

export default function QuestStatistics({ questStats }: QuestStatisticsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <ScrollText className="h-5 w-5 mr-2 text-blue-400" />
          สถิติ
        </CardTitle>
        <CardDescription>สถิติการทำภารกิจสำเร็จของคุณ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/20 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">งานทั้งหมด</div>
            <div className="text-xl font-bold">{questStats.totalCompleted}</div>
          </div>
          <div className="bg-secondary/20 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">คะแนนเฉลี่ย</div>
            <div className="text-xl font-bold">
              {questStats.averageRating} / 5
            </div>
          </div>
          <div className="bg-secondary/20 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">ภารกิจรายวัน</div>
            <div className="text-xl font-bold">{questStats.dailyCompleted}</div>
          </div>
          <div className="bg-secondary/20 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">
              ภารกิจรายสัปดาห์
            </div>
            <div className="text-xl font-bold">
              {questStats.weeklyCompleted}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
