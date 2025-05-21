// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef } from "react";

interface UseIntersectionObserverProps {
  callback: () => void;
  options?: IntersectionObserverInit;
  enabled?: boolean;
}

export function useIntersectionObserver({
  callback,
  options = { threshold: 0.1 },
  enabled = true,
}: UseIntersectionObserverProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [callback, options, enabled]);

  return targetRef;
}
