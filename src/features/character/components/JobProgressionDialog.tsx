import { Badge } from '@src/components/ui/badge'
import { Button } from '@src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog'
import { Briefcase } from 'lucide-react'

interface JobProgressionDialogProps {
  // รับ props เดิมทุกอย่าง ไม่เปลี่ยนแปลง
  open: boolean
  onOpenChange: (open: boolean) => void
  character: any
  jobClass: any
}

export default function JobProgressionDialog({
  open,
  onOpenChange,
  character,
  jobClass,
}: JobProgressionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ระบบอาชีพ</DialogTitle>
          <DialogDescription>
            การพัฒนาอาชีพและระดับความเชี่ยวชาญ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <h3 className="font-semibold flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-blue-400" />
            {jobClass?.name || 'อาชีพปัจจุบัน'}
          </h3>

          <div className="text-sm text-muted-foreground mb-4">
            {jobClass?.description || 'รายละเอียดอาชีพ'}
          </div>

          <div className="space-y-3">
            {jobClass?.levels.map((level: any, index: number) => {
              const isCurrentLevel = character.currentJobLevel === level.level
              const isLocked = character.level < level.requiredCharacterLevel

              return (
                <div
                  key={level.level}
                  className={`relative border rounded-md p-3 ${
                    isCurrentLevel
                      ? 'border-blue-500 bg-blue-500/10'
                      : isLocked
                        ? 'border-gray-600 bg-gray-800/30 opacity-60'
                        : 'border-gray-600'
                  }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-medium block mb-1">
                        {isLocked ? '🔒 ' : ''}
                        Class {level.level}: Level{' '}
                        {level.requiredCharacterLevel}
                      </span>
                      <span className="text-base font-semibold block">
                        {level.title}
                      </span>
                    </div>

                    {isCurrentLevel && (
                      <Badge className="bg-blue-500">ปัจจุบัน</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>ปิด</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
