import { useCallback, useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

interface SmartPollingOptions {
  fastPollDuration?: number // จำนวนครั้งที่จะ poll เร็ว
  fastInterval?: number // interval เมื่อ poll เร็ว (ms)
  slowInterval?: number // interval เมื่อ poll ช้า (ms)
  queryKeys?: (string | number)[][] // query keys ที่จะ refetch
  ultraFastMode?: boolean // โหมดเร็วสุดสำหรับ critical actions
}

export function useSmartPolling(options: SmartPollingOptions = {}) {
  const queryClient = useQueryClient()
  const {
    fastPollDuration = 8, // poll เร็ว 8 ครั้ง (เพิ่มขึ้น)
    fastInterval = 800, // ทุก 0.8 วินาที (เร็วขึ้น)
    slowInterval = 20000, // ทุก 20 วินาที (เร็วขึ้น)
    queryKeys = [['notifications']], // default refetch notifications
    ultraFastMode = false, // โหมดเร็วสุด
  } = options

  // ปรับ intervals ถ้าเป็น ultra fast mode
  const actualFastInterval = ultraFastMode
    ? Math.min(fastInterval, 300)
    : fastInterval // ขั้นต่ำ 300ms
  const actualFastDuration = ultraFastMode
    ? fastPollDuration + 5
    : fastPollDuration // เพิ่ม 5 cycles

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fastPollCountRef = useRef<number>(0)
  const isActiveRef = useRef<boolean>(true)
  const startSlowPollingRef = useRef<() => void>(() => {})

  // ฟังก์ชัน refetch ตาม query keys ที่กำหนด
  const refetchQueries = useCallback(() => {
    if (!isActiveRef.current) return

    queryKeys.forEach((queryKey: (string | number)[]) => {
      queryClient.refetchQueries({ queryKey })
    })
  }, [queryClient, queryKeys])

  // เริ่ม fast polling หลัง user action
  const startFastPolling = useCallback(() => {
    const modeText = ultraFastMode ? '🚀⚡ ULTRA FAST' : '🚀 Fast'
    console.log(
      `${modeText} Polling - Starting for ${actualFastDuration} cycles every ${actualFastInterval}ms`
    )

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    fastPollCountRef.current = 0

    // Immediate refetch เพื่อความเร็วทันที
    console.log('⚡ Immediate refetch before fast polling starts')
    refetchQueries()

    intervalRef.current = setInterval(() => {
      queryKeys.forEach((queryKey: (string | number)[]) => {
        queryClient.refetchQueries({ queryKey })
      })
      fastPollCountRef.current++

      console.log(
        `⚡ Fast poll cycle ${fastPollCountRef.current}/${actualFastDuration}`
      )

      // หลังจาก fast poll ครบแล้ว กลับไป slow polling
      if (fastPollCountRef.current >= actualFastDuration) {
        console.log('🐌 Smart Polling - Switching to slow polling')
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        startSlowPollingRef.current()
      }
    }, actualFastInterval)
  }, [
    actualFastDuration,
    actualFastInterval,
    queryKeys,
    queryClient,
    ultraFastMode,
  ])

  // เริ่ม slow polling ปกติ
  const startSlowPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        queryKeys.forEach((queryKey: (string | number)[]) => {
          queryClient.refetchQueries({ queryKey })
        })
        console.log('🐌 Slow poll cycle')
      }
    }, slowInterval)
  }, [slowInterval, queryKeys, queryClient])

  // อัปเดต ref ทุกครั้งที่ function เปลี่ยน
  startSlowPollingRef.current = startSlowPolling

  // เรียกใช้หลัง user action เพื่อเริ่ม fast polling
  const triggerFastPolling = useCallback(() => {
    console.log(
      '🎯 Smart Polling - User action detected, triggering fast polling'
    )
    startFastPolling()
  }, [startFastPolling])

  // หยุด polling ชั่วคราว
  const pausePolling = useCallback(() => {
    isActiveRef.current = false
    console.log('⏸️ Smart Polling - Paused')
  }, [])

  // เริ่ม polling ใหม่
  const resumePolling = useCallback(() => {
    isActiveRef.current = true
    console.log('▶️ Smart Polling - Resumed')
  }, [])

  // เริ่ม slow polling เมื่อ component mount
  useEffect(() => {
    console.log('🔄 Smart Polling - Initialized with slow polling')
    startSlowPolling()

    return () => {
      console.log('🛑 Smart Polling - Cleanup')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startSlowPolling])

  // หยุด polling เมื่อ tab ไม่ active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pausePolling()
      } else {
        resumePolling()
        // ทริกเกอร์ refetch ทันทีเมื่อกลับมา
        refetchQueries()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pausePolling, resumePolling, refetchQueries])

  return {
    triggerFastPolling,
    pausePolling,
    resumePolling,
    isActive: isActiveRef.current,
  }
}
