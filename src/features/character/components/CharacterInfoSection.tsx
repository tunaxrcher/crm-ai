import { Progress } from '@src/components/ui/progress'
import { Award } from 'lucide-react'

interface CharacterInfoSectionProps {
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
        {/* <div className="flex items-center justify-center mb-2">
          <span className="text-sm font-semibold px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md border border-purple-400/30">
            เลเวลปัจจุบัน {character.level}
          </span>
        </div> */}
        <h2 className="text-4xl font-bold mt-2 mb-1 text-white text-center">
          {character.name}
        </h2>

        <div className="mt-4 flex items-center w-full max-w-xs mx-auto">
          <span className="text-xs text-muted-foreground mr-2">
            Level {character.level}
          </span>
          <Progress value={xpPercentage} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground ml-2">
            Level {character.level + 1}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center text-sm">
          <Award className="h-4 w-4 mr-1 text-yellow-400" />
          <span className="text-yellow-400 font-medium">
            {character.currentXP} / {character.nextLevelXP} XP
          </span>
        </div>
      </div>
    </div>
  )
}
