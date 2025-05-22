'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { Progress } from '@src/components/ui/progress'

export default function CharacterPageComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [expProgress, setExpProgress] = useState(50) // For EXP bar animation
  const [radarAnimation, setRadarAnimation] = useState(0) // For radar animation
  const [statHighlight, setStatHighlight] = useState(-1) // For stat highlight animation

  // Character stats (values from 0-100)
  const stats = {
    STR: 75, // Strength
    VIT: 60, // Vitality
    LUK: 45, // Luck
    INT: 85, // Intelligence
    DEX: 70, // Dexterity
    AGI: 65, // Agility
  }

  // Animate the EXP bar
  useEffect(() => {
    const interval = setInterval(() => {
      setExpProgress((prev) => {
        // Create a pulsing effect between 48 and 52
        if (prev >= 52) return 48
        return prev + 0.5
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Animate the radar chart
  useEffect(() => {
    // Radar pulse animation
    const radarInterval = setInterval(() => {
      setRadarAnimation((prev) => (prev + 1) % 100)
    }, 50)

    // Stat highlight animation
    const highlightInterval = setInterval(() => {
      setStatHighlight((prev) => (prev + 1) % (Object.keys(stats).length + 3))
    }, 2000)

    return () => {
      clearInterval(radarInterval)
      clearInterval(highlightInterval)
    }
  }, [])

  // Draw the radar chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions with higher resolution for retina displays
    const size = 400 // Increased from 320 to 400
    canvas.width = size * 2
    canvas.height = size * 2
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(2, 2)

    // Center of the chart
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 30 // Adjusted radius

    // Number of stats (sides of the polygon)
    const numStats = Object.keys(stats).length

    // Function to convert polar to cartesian coordinates
    const getCoordinates = (angle: number, value: number) => {
      const adjustedAngle = angle - Math.PI / 2 // Start from top
      const x = centerX + value * radius * Math.cos(adjustedAngle)
      const y = centerY + value * radius * Math.sin(adjustedAngle)
      return { x, y }
    }

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw rotating background effect
    const rotationOffset = (radarAnimation / 100) * Math.PI * 2
    ctx.beginPath()
    for (let i = 0; i <= 30; i++) {
      const angle = (i / 30) * Math.PI * 2 + rotationOffset
      const innerRadius = radius * 0.2
      const outerRadius = radius * 1.05
      const x1 = centerX + innerRadius * Math.cos(angle)
      const y1 = centerY + innerRadius * Math.sin(angle)
      const x2 = centerX + outerRadius * Math.cos(angle)
      const y2 = centerY + outerRadius * Math.sin(angle)

      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw background hexagon layers
    for (let layer = 5; layer > 0; layer--) {
      const layerValue = layer / 5
      ctx.beginPath()
      for (let i = 0; i <= numStats; i++) {
        const angle = (i % numStats) * ((2 * Math.PI) / numStats)
        const { x, y } = getCoordinates(angle, layerValue)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + 0.1 * (5 - layer)})`
      ctx.fill()

      // Draw layer border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw stat lines from center
    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const { x, y } = getCoordinates(angle, 1)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw stat labels
    const statNames = Object.keys(stats)
    ctx.font = '14px sans-serif' // Increased font size
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const { x, y } = getCoordinates(angle, 1.15)

      // Highlight the current stat
      if (i === statHighlight) {
        ctx.fillStyle = '#22d3ee' // Cyan highlight
        ctx.font = 'bold 16px sans-serif'
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '14px sans-serif'
      }

      ctx.fillText(statNames[i], x, y)
    }

    // Draw character stats polygon with animation
    const animationProgress = Math.sin(radarAnimation / 16) * 0.05 + 0.95 // Subtle pulsing between 90% and 100%

    ctx.beginPath()
    const statValues = Object.values(stats)
    for (let i = 0; i <= numStats; i++) {
      const angle = (i % numStats) * ((2 * Math.PI) / numStats)
      const value = (statValues[i % numStats] / 100) * animationProgress
      const { x, y } = getCoordinates(angle, value)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()

    // Fill with gradient - updated to use the requested colors
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    )
    gradient.addColorStop(0, 'rgba(192, 132, 252, 0.7)') // #c084fc with opacity
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)') // #3b82f6 with opacity
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.3)') // #22d3ee with opacity
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw border with glow effect
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)' // #c084fc with opacity
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw outer glow ring
    ctx.beginPath()
    for (let i = 0; i <= numStats; i++) {
      const angle = (i % numStats) * ((2 * Math.PI) / numStats)
      const value =
        (statValues[i % numStats] / 100) * (animationProgress + 0.05)
      const { x, y } = getCoordinates(angle, value)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)' // #22d3ee with opacity
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw stat points with pulsing effect
    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const value = (statValues[i] / 100) * animationProgress
      const { x, y } = getCoordinates(angle, value)

      // Determine if this point should be highlighted
      const isHighlighted = i === statHighlight
      const pointSize = isHighlighted ? 7 : 5
      const glowSize = isHighlighted ? 15 : 0

      // Draw glow if highlighted
      if (isHighlighted) {
        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, 2 * Math.PI)
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        glowGradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)')
        glowGradient.addColorStop(1, 'rgba(34, 211, 238, 0)')
        ctx.fillStyle = glowGradient
        ctx.fill()
      }

      // Draw the point
      ctx.beginPath()
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
      ctx.fillStyle = isHighlighted ? '#22d3ee' : 'rgba(34, 211, 238, 0.8)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw center pulse
    const pulseSize = Math.sin(radarAnimation / 8) * 5 + 10
    ctx.beginPath()
    ctx.arc(centerX, centerY, pulseSize, 0, 2 * Math.PI)
    const pulseGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      pulseSize
    )
    pulseGradient.addColorStop(0, 'rgba(192, 132, 252, 0.8)')
    pulseGradient.addColorStop(1, 'rgba(192, 132, 252, 0)')
    ctx.fillStyle = pulseGradient
    ctx.fill()
  }, [radarAnimation, statHighlight, stats])

  // Floating animation for character
  const floatingAnimation = {
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
      '0%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
      '100%': { transform: 'translateY(0px)' },
    },
  }

  return (
    <div className="flex flex-col min-h-screen relative ">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/tech-background.jpg"
          alt="Background"
          fill
          className="object-cover brightness-[0.8] blur-[2px]"
          priority
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* "Young Explorer" at the very top */}
      <div className="relative z-10 flex justify-center pt-6">
        <p className="text-xl text-white/90 font-medium tracking-wide px-4 py-1 bg-black/30 backdrop-blur-sm rounded-full border border-purple-400/30 animate-pulse">
          young explorer
        </p>
      </div>

      {/* Character Display with Radar Chart */}
      <div className="relative z-10 flex justify-center items-center h-[50vh] pt-4">
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          {/* Radar Chart */}
          <canvas
            ref={canvasRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
          />

          {/* Character Image */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              animation: 'float 6s ease-in-out infinite',
            }}>
            <Image
              src="/character-image.png"
              alt="Character"
              width={240}
              height={240}
              className="z-10"
            />
          </div>
        </div>
      </div>

      {/* Character Info - with improved spacing and glass effect */}
      <div className="relative z-10 flex-1 px-8 pb-10">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-sm font-semibold px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md border border-purple-400/30">
              Level 17
            </span>
          </div>
          <h2 className="text-4xl font-bold mt-2 mb-1 text-white">Mia Chen</h2>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">EXP 1000/2000</span>
              <span className="text-cyan-300 animate-pulse">จะสู่เลเวล 18</span>
            </div>
            <div className="relative">
              <Progress
                value={50}
                className="h-2 bg-white/20"
                indicatorClassName="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-300"
              />
              <div
                className="absolute top-0 left-0 h-2 bg-purple-400/50 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${expProgress}%`,
                  boxShadow:
                    '0 0 10px rgba(192, 132, 252, 0.7), 0 0 20px rgba(192, 132, 252, 0.5)',
                }}></div>
            </div>
          </div>
        </div>

        {/* Achievement Section (formerly Team Section) */}
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
                <Image
                  src="/anime-game-avatar-red.png"
                  alt="Achievement 1"
                  width={48}
                  height={48}
                />
              </div>
              <div
                className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
                style={{
                  animation: 'pulse-blue 3s infinite 1s',
                }}>
                <Image
                  src="/placeholder-s4uco.png"
                  alt="Achievement 2"
                  width={48}
                  height={48}
                />
              </div>
              <div
                className="w-12 h-12 rounded-md bg-black/40 backdrop-blur-sm border border-cyan-300/30 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300"
                style={{
                  animation: 'pulse-cyan 3s infinite 2s',
                }}>
                <Image
                  src="/anime-game-avatar-gray.png"
                  alt="Achievement 3"
                  width={48}
                  height={48}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section - with improved spacing and glass effect */}
        {/* <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20">
          <h3 className="text-sm text-white/70 mb-3 font-medium">
            Statistics of the last battle
          </h3>
          <button className="w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-400/20 hover:from-purple-500/30 hover:via-blue-500/30 hover:to-cyan-400/30 text-white font-bold py-3 rounded-md mt-2 shadow-sm backdrop-blur-sm border border-purple-400/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(192,132,252,0.5)]">
            Equip card
          </button>
        </div> */}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes pulse-purple {
          0% {
            box-shadow: 0 0 0 0 rgba(192, 132, 252, 0.4);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(192, 132, 252, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(192, 132, 252, 0);
          }
        }

        @keyframes pulse-blue {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        @keyframes pulse-cyan {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(34, 211, 238, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
          }
        }
      `}</style>
    </div>
  )
}
