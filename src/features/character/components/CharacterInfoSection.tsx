import { Progress } from '@src/components/ui/progress'
import { Award } from 'lucide-react'

interface CharacterInfoSectionProps {
  // รับข้อมูลเดิมทุกอย่าง ไม่เปลี่ยนแปลง
  character: any
  xpPercentage: number
}

export default function CharacterInfoSection({
  character,
  xpPercentage,
}: CharacterInfoSectionProps) {
  return (
    <div className="flex justify-center">
      <div className="mb-6 w-full max-w-md">
        <div className="flex items-center justify-center mb-2">
          <span className="text-sm font-semibold px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md border border-purple-400/30">
            Level 2
          </span>
        </div>
        {/* <h2 className="text-4xl font-bold mt-2 mb-1 text-white text-center">
          ชื่อ ทดสอบ ทดสอบ
        </h2> */}

        <div className="mt-4 flex items-center w-full max-w-xs mx-auto">
          <span className="text-xs text-muted-foreground mr-2">Level 2</span>
          <Progress value={50} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground ml-2">
            Level {2 + 1}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center text-sm">
          <Award className="h-4 w-4 mr-1 text-yellow-400" />
          <span className="text-yellow-400 font-medium">
            {1000} / {2000} XP
          </span>
        </div>
      </div>
    </div>
  )
}
