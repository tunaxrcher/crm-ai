// src/features/feed/hooks/useAutoplayVideo.ts
import { useEffect, useRef } from 'react'

export function useAutoplayVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // สร้าง Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry.isIntersecting) {
          // เมื่อวิดีโอปรากฏบนหน้าจอ ให้เล่นวิดีโอ
          videoElement.play().catch((error) => {
            // จัดการกับข้อผิดพลาด (บางเบราว์เซอร์อาจจะไม่อนุญาตให้เล่นอัตโนมัติโดยไม่มีเสียง)
            console.log('Autoplay prevented:', error)

            // แก้ไขโดยลองเล่นวิดีโอแบบไม่มีเสียง
            videoElement.muted = true
            videoElement
              .play()
              .catch((e) => console.log('Still cannot autoplay:', e))
          })
        } else {
          // เมื่อวิดีโอไม่อยู่บนหน้าจอแล้ว ให้หยุดการเล่น
          videoElement.pause()
        }
      },
      // ตั้งค่า options - ควรกำหนด threshold ให้เหมาะสมกับขนาดของวิดีโอ
      { threshold: 0.5 } // วิดีโอจะเล่นเมื่อปรากฏบนหน้าจอ 50%
    )

    // เริ่มสังเกตวิดีโอ
    observer.observe(videoElement)
    observerRef.current = observer

    // cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return videoRef
}
