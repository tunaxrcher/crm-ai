// src/features/feed/hook/useVideoThumbnail.ts
import { useCallback, useRef, useState } from 'react'

/**
 * Custom hook สำหรับการสร้าง thumbnail จากวิดีโอ
 */
export function useVideoThumbnail() {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  /**
   * สร้าง thumbnail จากไฟล์วิดีโอ
   *
   * @param videoFile ไฟล์วิดีโอ
   * @param timeInSeconds เวลาในวิดีโอที่ต้องการใช้เป็น thumbnail (default: 0)
   */
  const generateThumbnail = useCallback(
    async (videoFile: File, timeInSeconds: number = 0): Promise<string> => {
      setIsGenerating(true)
      setError(null)

      return new Promise((resolve, reject) => {
        try {
          // สร้าง object URL จากไฟล์วิดีโอ
          const videoUrl = URL.createObjectURL(videoFile)

          // สร้าง video element
          const video = document.createElement('video')
          video.src = videoUrl
          video.crossOrigin = 'anonymous'

          // เก็บ reference ไว้ใช้ภายนอก
          videoRef.current = video

          // สร้าง canvas สำหรับการสร้าง thumbnail
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          // เมื่อวิดีโอโหลดเมตาดาต้าเสร็จ
          video.onloadedmetadata = () => {
            // กำหนดขนาดของ canvas ตามขนาดของวิดีโอ
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            // ตั้งเวลาวิดีโอไปยังจุดที่ต้องการใช้เป็น thumbnail
            video.currentTime = timeInSeconds
          }

          // เมื่อวิดีโอไปถึงเวลาที่กำหนด
          video.onseeked = () => {
            if (!context) {
              setError('Could not get canvas context')
              setIsGenerating(false)
              URL.revokeObjectURL(videoUrl)
              reject('Could not get canvas context')
              return
            }

            // วาดเฟรมปัจจุบันของวิดีโอลงบน canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            // แปลง canvas เป็น data URL
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

            // เคลียร์ object URL
            URL.revokeObjectURL(videoUrl)

            // อัปเดตสถานะ
            setThumbnailUrl(dataUrl)
            setIsGenerating(false)

            resolve(dataUrl)
          }

          // จัดการข้อผิดพลาด
          video.onerror = (e) => {
            console.error('Video error:', e)
            setError('Error loading video')
            setIsGenerating(false)
            URL.revokeObjectURL(videoUrl)
            reject('Error loading video')
          }
        } catch (err) {
          console.error('Error generating thumbnail:', err)
          setError('Error generating thumbnail')
          setIsGenerating(false)
          reject(err)
        }
      })
    },
    []
  )

  /**
   * สร้าง thumbnail จาก element วิดีโอ
   *
   * @param videoElement HTML video element ที่ต้องการใช้สร้าง thumbnail
   */
  const generateThumbnailFromElement = useCallback(
    (videoElement: HTMLVideoElement): string => {
      try {
        // สร้าง canvas
        const canvas = document.createElement('canvas')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight

        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Could not get canvas context')
        }

        // วาดเฟรมปัจจุบันของวิดีโอลงบน canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

        // แปลง canvas เป็น data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        setThumbnailUrl(dataUrl)
        return dataUrl
      } catch (err) {
        console.error('Error generating thumbnail from element:', err)
        setError('Error generating thumbnail from video element')
        throw err
      }
    },
    []
  )

  /**
   * แปลง data URL เป็นไฟล์
   *
   * @param dataUrl Data URL ของรูปภาพ
   * @param filename ชื่อไฟล์ (default: thumbnail.jpg)
   * @param mimeType MIME type ของไฟล์ (default: image/jpeg)
   */
  const dataUrlToFile = useCallback(
    (
      dataUrl: string,
      filename: string = 'thumbnail.jpg',
      mimeType: string = 'image/jpeg'
    ): File => {
      // แยกส่วน data และ MIME type จาก data URL
      const arr = dataUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType
      const bstr = atob(arr[1])

      // สร้าง array buffer
      let n = bstr.length
      const u8arr = new Uint8Array(n)

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      // สร้างไฟล์จาก array buffer
      return new File([u8arr], filename, { type: mime })
    },
    []
  )

  /**
   * รีเซ็ตสถานะทั้งหมด
   */
  const reset = useCallback(() => {
    setThumbnailUrl(null)
    setIsGenerating(false)
    setError(null)
    videoRef.current = null
  }, [])

  return {
    thumbnailUrl,
    isGenerating,
    error,
    videoRef,
    generateThumbnail,
    generateThumbnailFromElement,
    dataUrlToFile,
    reset,
  }
}
