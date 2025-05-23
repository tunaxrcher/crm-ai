import React from 'react'

import { Achievement } from '../types'

interface AchievementSectionProps {
  achievements: Achievement[]
}

export default function AchievementSection({
  achievements,
}: AchievementSectionProps) {
  const visibleAchievements = achievements.slice(0, 3)
  const remainingCount = achievements.length - visibleAchievements.length

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Achievement</h3>
        <button className="text-xs text-white/70 px-2 hover:text-cyan-300 transition-colors duration-300">
          All achievements
          {remainingCount > 0 && (
            <span className="ml-1 text-white/50">({achievements.length})</span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold text-base">Insurgency</span>
        <div className="flex space-x-3">
          {visibleAchievements.map((a, index) => (
            <div
              key={a.id}
              className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-cyan-300/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
              style={{
                animation: `pulse-cyan 3s infinite ${index}s`,
              }}
              title={`${a.name}\n${a.description}`} // ✅ Tooltip ที่แสดงชื่อและคำอธิบาย
            >
              {a.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
