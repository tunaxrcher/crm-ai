import { Button } from '@src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { BadgePercent, Clock, Shield, Swords, Zap } from 'lucide-react'

import { Stat } from '../types'

interface StatAllocationDialogProps {
  // รับ props เดิมทุกอย่าง ไม่เปลี่ยนแปลง
  open: boolean
  onOpenChange: (open: boolean) => void
  tempStats: Stat | null
  statPoints: number
  character: any
  isAllocating: boolean
  getStatDescription: (stat: string) => string
  getStatIcon: (stat: string) => JSX.Element | null
  allocatePoint: (stat: keyof Stat) => void
  deallocatePoint: (stat: keyof Stat) => void
  confirmStatAllocation: () => Promise<void>
  setTempStats: any
  setStatPoints: any
  setShowLevelDialog: any
}

export default function StatAllocationDialog({
  open,
  onOpenChange,
  tempStats,
  statPoints,
  character,
  isAllocating,
  getStatDescription,
  getStatIcon,
  allocatePoint,
  deallocatePoint,
  confirmStatAllocation,
  setTempStats,
  setStatPoints,
  setShowLevelDialog,
}: StatAllocationDialogProps) {
  if (!tempStats) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>จัดสรรคะแนนสถิติ</DialogTitle>
          <DialogDescription>
            คุณมีคะแนนสถิติ {statPoints} คะแนนที่สามารถจัดสรรได้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(tempStats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                  {getStatIcon(stat)}
                </div>
                <div>
                  <div className="font-medium">{stat}</div>
                  <div className="text-xs text-muted-foreground">
                    {getStatDescription(stat)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={
                    tempStats[stat as keyof Stat] <=
                    character.stats[stat as keyof Stat]
                  }
                  onClick={() => deallocatePoint(stat as keyof Stat)}>
                  -
                </Button>

                <div className="w-10 text-center font-bold">
                  {value}
                  {value > character.stats[stat as keyof Stat] && (
                    <span className="text-green-500 text-xs ml-1">
                      +{value - character.stats[stat as keyof Stat]}
                    </span>
                  )}
                </div>

                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={statPoints <= 0}
                  onClick={() => allocatePoint(stat as keyof Stat)}>
                  +
                </Button>
              </div>
            </div>
          ))}

          <div className="bg-secondary/20 p-3 rounded-lg mt-4">
            <div className="text-sm font-medium mb-1">คำแนะนำจาก AI</div>
            <div className="text-sm text-muted-foreground">
              จากภารกิจล่าสุดของคุณ ควรพิจารณาลงทุนใน{' '}
              <span className="text-blue-400">INT</span> และ{' '}
              <span className="text-blue-400">DEX</span>{' '}
              เพื่อเพิ่มทักษะด้านการตลาดของคุณ
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setTempStats({ ...character.stats })
              setStatPoints(character.statPoints)
              setShowLevelDialog(false)
            }}>
            ยกเลิก
          </Button>
          <Button
            className="ai-gradient-bg"
            disabled={statPoints === character.statPoints || isAllocating}
            onClick={confirmStatAllocation}>
            {isAllocating ? 'กำลังบันทึก...' : 'ยืนยันการจัดสรร'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
