'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

interface CharacterRadarChartProps {
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
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const highlightStatLabel = ['STR', 'VIT', 'LUK', 'INT', 'DEX', 'AGI']
  const highlightStatDescription = [
    'ความสามารถในการรับมือกับงานหนัก',
    'ความสม่ำเสมอ, ความอดทน',
    'โชค / ดวง',
    'การวางแผน, การวิเคราะห์',
    'ความแม่นยำ ความเป๊ะในการทำงาน',
    'ความเร็ว, การตอบสนอง',
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 400
    canvas.width = size * 2
    canvas.height = size * 2
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(2, 2)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 40
    const numStats = Object.keys(stats).length

    const getCoordinates = (angle: number, value: number) => {
      const adjustedAngle = angle - Math.PI / 2
      const x = centerX + value * radius * Math.cos(adjustedAngle)
      const y = centerY + value * radius * Math.sin(adjustedAngle)
      return { x, y }
    }

    ctx.clearRect(0, 0, size, size)

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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

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

    const statNames = Object.keys(stats)
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Default label style
    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const { x, y } = getCoordinates(angle, 1.15)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '14px sans-serif'

      if (statHighlight !== -1 && i === statHighlight) {
        ctx.fillStyle = '#22d3ee'
        ctx.font = 'bold 16px sans-serif'
        setTooltipPosition({ x, y: y - 10 })
      }

      ctx.fillText(statNames[i], x, y)
    }

    const animationProgress = Math.sin(radarAnimation / 16) * 0.05 + 0.95
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

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    )
    gradient.addColorStop(0, 'rgba(192, 132, 252, 0.7)')
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)')
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.3)')
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()

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
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    for (let i = 0; i < numStats; i++) {
      const angle = i * ((2 * Math.PI) / numStats)
      const value = (statValues[i] / 100) * animationProgress
      const { x, y } = getCoordinates(angle, value)
      const isHighlighted = i === statHighlight
      const pointSize = isHighlighted ? 7 : 5
      const glowSize = isHighlighted ? 15 : 0

      if (isHighlighted) {
        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, 2 * Math.PI)
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        glowGradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)')
        glowGradient.addColorStop(1, 'rgba(34, 211, 238, 0)')
        ctx.fillStyle = glowGradient
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
      ctx.fillStyle = isHighlighted ? '#22d3ee' : 'rgba(34, 211, 238, 0.8)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.stroke()
    }

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

    if (statHighlight === -1) {
      setTooltipPosition(null)
    }
  }, [radarAnimation, statHighlight, stats])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
      />

      {/* Tooltip */}
      {tooltipPosition &&
        statHighlight >= 0 &&
        highlightStatDescription[statHighlight] && (
          <div
            className="absolute text-xs px-2 py-1 bg-black/70 text-white rounded pointer-events-none z-20"
            style={{
              top: tooltipPosition.y,
              left: tooltipPosition.x,
              transform: 'translate(-50%, -100%)',
              maxWidth: 160,
              whiteSpace: 'pre-line',
            }}>
            {/* <strong>{highlightStatLabel[statHighlight]}</strong> */}
            <div>{highlightStatDescription[statHighlight]}</div>
          </div>
        )}
    </>
  )
}
