'use client'

import { useRef, useState } from 'react'
import { Button } from '@src/components/ui/button'
import { Card } from '@src/components/ui/card'

export default function TestCameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [log, setLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const startCamera = async () => {
    try {
      addLog('Starting camera...')
      setError('')

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })

      addLog('Got media stream')
      setStream(mediaStream)

      if (videoRef.current) {
        addLog('Setting video source')
        videoRef.current.srcObject = mediaStream
        
        // Try to play
        try {
          await videoRef.current.play()
          addLog('Video playing')
        } catch (playError: any) {
          addLog(`Play error: ${playError.message}`)
        }
      }
    } catch (err: any) {
      const errorMsg = `Error: ${err.name} - ${err.message}`
      setError(errorMsg)
      addLog(errorMsg)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      addLog('Camera stopped')
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Camera Test</h1>
      
      <Card className="p-4 space-y-4">
        <div className="space-x-2">
          <Button onClick={startCamera}>Start Camera</Button>
          <Button onClick={stopCamera} variant="outline">Stop</Button>
        </div>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-black rounded" style={{ height: '300px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Debug Log:</h3>
          <div className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-y-auto">
            {log.map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          <p>Secure Context: {typeof window !== 'undefined' ? String(window.isSecureContext) : 'N/A'}</p>
        </div>
      </Card>
    </div>
  )
} 