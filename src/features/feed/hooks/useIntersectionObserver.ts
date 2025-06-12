import { useEffect, useRef } from 'react'

interface UseIntersectionObserverProps {
  callback: () => void
  options?: IntersectionObserverInit
  enabled?: boolean
}

export function useIntersectionObserver({
  callback,
  options = { threshold: 0.1 },
  enabled = true,
}: UseIntersectionObserverProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true
        callback()
      }
    }, options)

    observer.observe(target)

    return () => {
      observer.disconnect()
      hasTriggeredRef.current = false // Reset for next time
    }
  }, [callback, options, enabled])

  return targetRef
}
