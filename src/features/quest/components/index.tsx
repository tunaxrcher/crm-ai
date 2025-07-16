'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { ErrorDisplay, SkeletonLoading } from '@src/components/shared'
import { useError } from '@src/components/shared/ErrorProvider'
import { Progress } from '@src/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@src/components/ui/tabs'
import { useCharacter } from '@src/contexts/CharacterContext'
import { withErrorHandling } from '@src/hooks'
import useErrorHandler from '@src/hooks/useErrorHandler'

import { useQuests } from '../hooks/api'
import { GroupedQuests } from '../types'
import { formatDeadline } from '../utils'
import AddQuestButton from './AddQuestButton'
import CompletedQuestList from './CompletedQuestList'
import QuestTypeSection from './QuestTypeSection'

type QuestPageProps = {
  userId: number
}

function QuestPageComponent({ userId }: QuestPageProps) {
  const router = useRouter()
  const { character } = useCharacter()
  const { groupedQuests, completedQuests, isLoading, error, refreshQuests } =
    useQuests(userId)
  const [activeTab, setActiveTab] = useState('active')
  const [expandedTypes, setExpandedTypes] = useState({
    daily: true,
    weekly: false,
    'no-deadline': false,
  })

  // Use error handler context
  const { showError } = useError()
  const { handleAsyncOperation } = useErrorHandler()

  // Safe default values in case of undefined data
  const safeGroupedQuests: GroupedQuests = groupedQuests || {
    daily: [],
    weekly: [],
    'no-deadline': [],
  }

  const safeCompletedQuests = completedQuests || []

  // ตรวจสอบว่าควรแสดง AddQuestButton หรือไม่ (ซ่อนสำหรับ level 10+)
  const shouldShowAddQuestButton = !character || character.level < 10

  // Toggle expanded state for quest types
  const toggleExpanded = (type: 'daily' | 'weekly' | 'no-deadline') => {
    setExpandedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Navigate to quest detail page with error handling
  const navigateToQuest = async (questId: string) => {
    try {
      router.push(`/quest/${questId}`)
    } catch (error) {
      showError('ไม่สามารถนำทางไปยังรายละเอียดภารกิจได้', {
        message: 'โปรดลองอีกครั้งในภายหลัง',
        severity: 'error',
      })
      console.error('Navigation error:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="quest" text="กำลังโหลดภารกิจ..." />
      </div>
    )
  }

  // Show error state with improved error component
  if (error) {
    return (
      <div className="p-4 pb-20">
        <ErrorDisplay
          title="ไม่สามารถโหลดข้อมูลภารกิจได้"
          message="เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง"
          severity="error"
          onRetry={refreshQuests}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    )
  }

  // Calculate daily quests completion percentage
  const dailyQuests = safeGroupedQuests.daily
  const completedDailyQuests = dailyQuests.filter((q) => q.completed)
  const dailyQuestsPercentage =
    dailyQuests.length > 0
      ? Math.round((completedDailyQuests.length / dailyQuests.length) * 100)
      : 0

  return (
    <div className="p-4 pb-20">
      <style>
        {`
          .quest-item-hover {
            background: linear-gradient(90deg, rgba(139,92,246,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(34,211,238,0.05) 100%);
            transition: background 0.3s, box-shadow 0.3s;
            position: relative;
            z-index: 0;
          }
          .quest-item-hover:hover {
            background: linear-gradient(270deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%);
            background-size: 200% 200%;
            animation: quest-gradient-move 2s linear infinite;
            box-shadow: 0 2px 16px 0 rgba(34,211,238,0.08);
            z-index: 1;
          }
          @keyframes quest-gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold ai-gradient-text">ภารกิจ</h1>
          <p className="text-muted-foreground">
            ทำภารกิจเพื่อรับ XP และเลเวลอัพ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              ภารกิจประจำวันที่เสร็จแล้ว
            </p>
            <p className="font-semibold">
              {completedDailyQuests.length}/{dailyQuests.length}
            </p>
          </div>
          <Progress value={dailyQuestsPercentage} className="w-16 h-2" />
        </div>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="active">ภารกิจที่กำลังทำ</TabsTrigger>
          <TabsTrigger value="completed">เสร็จสิ้นแล้ว</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Daily Quests Section */}
          {safeGroupedQuests.daily.length > 0 && (
            <QuestTypeSection
              quests={safeGroupedQuests.daily}
              type="daily"
              isExpanded={expandedTypes.daily}
              onToggleExpand={() => toggleExpanded('daily')}
              onQuestClick={navigateToQuest}
              formatDeadline={formatDeadline}
            />
          )}

          {/* ถ้าไม่มีภารกิจประจำวัน */}
          {safeGroupedQuests.daily.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">ไม่มีภารกิจประจำวันในขณะนี้</p>
              <p className="text-sm text-muted-foreground mt-2">
                ภารกิจประจำวันใหม่จะปรากฏขึ้นเมื่อถึงเวลา
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {safeCompletedQuests.length > 0 ? (
            <CompletedQuestList completedQuests={safeCompletedQuests} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                ยังไม่มีภารกิจที่เสร็จสิ้น
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                เมื่อทำภารกิจเสร็จจะแสดงที่นี่
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {shouldShowAddQuestButton && <AddQuestButton />}
    </div>
  )
}

// ใช้ Higher Order Component เพื่อเพิ่ม error boundary
export default withErrorHandling(QuestPageComponent)
