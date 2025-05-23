'use client'

import { useEffect, useRef } from 'react'

import Image from 'next/image'

interface CharacterRadarChartProps {
  // ส่ง props ที่จำเป็นเท่านั้น ไม่เปลี่ยนแปลงข้อมูล
  radarAnimation: number
  statHighlight: number
  stats: {
    STR: number
    VIT: number
    LUK: number
    INT: number
    DEX: number
    AGI: number
  }
}

export default function CharacterRadarChart({
  radarAnimation,
  statHighlight,
  stats,
}: CharacterRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Canvas drawing logic - ย้ายมาจากเดิมทุกบรรทัด ไม่เปลี่ยนแปลง
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
    const radius = size / 2 - 40 // Adjusted radius

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

  return (
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
  )
}
