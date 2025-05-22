'use client'

import { Badge } from '@src/components/ui/badge'
import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Clock3,
  ScrollText,
} from 'lucide-react'

import { Quest, QuestDifficulty, QuestType } from '../types'

interface QuestTypeSectionProps {
  quests: Quest[]
  type: QuestType
  isExpanded: boolean
  onToggleExpand: () => void
  onQuestClick: (questId: string) => void
  formatDeadline: (date: Date | null | string | number) => string
}

export default function QuestTypeSection({
  quests,
  type,
  isExpanded,
  onToggleExpand,
  onQuestClick,
  formatDeadline,
}: QuestTypeSectionProps) {
  // Get type label and icon
  const getQuestTypeInfo = (type: QuestType) => {
    switch (type) {
      case 'daily':
        return {
          label: 'ภารกิจประจำวัน',
          description: 'รีเซ็ตทุกวัน',
          icon: <Clock className="h-5 w-5 text-blue-400" />,
        }
      case 'weekly':
        return {
          label: 'ภารกิจประจำสัปดาห์',
          description: 'รีเซ็ตทุกสัปดาห์',
          icon: <Clock className="h-5 w-5 text-purple-400" />,
        }
      case 'no-deadline':
        return {
          label: 'ภารกิจทั่วไป',
          description: 'ภารกิจถาวร',
          icon: <ScrollText className="h-5 w-5 text-green-400" />,
        }
      default:
        return {
          label: 'ภารกิจ',
          description: '',
          icon: <ScrollText className="h-5 w-5" />,
        }
    }
  }

  // Function to determine quest type icon
  const getQuestTypeIcon = (type: QuestType) => {
    switch (type) {
      case 'daily':
        return <Clock className="h-4 w-4 mr-1 text-blue-400" />
      case 'weekly':
        return <Clock className="h-4 w-4 mr-1 text-purple-400" />
      case 'no-deadline':
        return <ScrollText className="h-4 w-4 mr-1 text-green-400" />
      default:
        return <ScrollText className="h-4 w-4 mr-1" />
    }
  }

  // Function to determine difficulty badge color
  const getDifficultyBadge = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
            ง่าย
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
            ปานกลาง
          </Badge>
        )
      case 'hard':
        return (
          <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
            ยาก
          </Badge>
        )
      default:
        return <Badge>{difficulty}</Badge>
    }
  }

  const typeInfo = getQuestTypeInfo(type)

  return (
    <div>
      <div className="relative">
        <button
          className="flex items-center justify-center w-full mb-2 bg-secondary/20 p-3 rounded-lg relative"
          onClick={onToggleExpand}>
          <div className="flex flex-col items-center w-full">
            {typeInfo.icon}
            <div className="text-center">
              <div className="font-semibold">{typeInfo.label}</div>
              <p className="text-xs text-muted-foreground">
                {typeInfo.description}
              </p>
            </div>
          </div>
          <div className="absolute right-4 flex items-center">
            <Badge className="mr-2">
              {quests.filter((q) => q.completed).length}/{quests.length}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-2">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="flex items-center justify-between p-3 rounded-lg border border-transparent quest-item-hover cursor-pointer"
              onClick={() => onQuestClick(quest.id)}>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="mr-2">
                    {quest.completed ? (
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    )}
                  </div>
                  <h3
                    className={`text-base font-medium ${
                      quest.completed ? 'text-muted-foreground' : ''
                    }`}>
                    {quest.title}
                  </h3>
                </div>

                <div className="flex items-center mt-1 ml-4">
                  <Award className="h-3 w-3 mr-1 text-yellow-400" />
                  <span className="text-xs text-yellow-400">
                    {quest.rewards.xp} XP
                  </span>
                  <span className="mx-2 text-xs text-muted-foreground">•</span>
                  <Clock3 className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDeadline(quest.deadline)}
                  </span>
                </div>
              </div>

              <div className="ml-2 flex items-center">
                {quest.completed ? (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400" />
                  </div>
                ) : (
                  <div className="flex">
                    {getDifficultyBadge(quest.difficulty)}
                    <ChevronRight className="h-5 w-5 ml-1 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
