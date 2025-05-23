export default function AchievementSection() {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Achievement</h3>
        <button className="text-xs text-white/70 px-2 hover:text-cyan-300 transition-colors duration-300">
          All achievements
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold text-base">Insurgency</span>
        <div className="flex space-x-3">
          <div
            className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
            style={{
              animation: 'pulse-purple 3s infinite',
            }}>
            🏆
          </div>
          <div
            className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
            style={{
              animation: 'pulse-blue 3s infinite 1s',
            }}>
            ⚡
          </div>
          <div
            className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-cyan-300/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
            style={{
              animation: 'pulse-cyan 3s infinite 2s',
            }}>
            🥇
          </div>
        </div>
      </div>
    </div>
  )
}
