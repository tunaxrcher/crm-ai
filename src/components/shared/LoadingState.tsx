"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  /** Text to display while loading, defaults to "Loading..." */
  text?: string;
  /** Number of skeleton items to show, defaults to 3 */
  itemCount?: number;
  /** Height of each skeleton item in pixels, defaults to 64 */
  itemHeight?: number;
  /** Custom class name for the container */
  className?: string;
}

/**
 * A reusable loading state component with customizable options
 */
export default function LoadingState({
  text = "Loading...",
  itemCount = 3,
  itemHeight = 64,
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {text && (
        <div className="text-center text-muted-foreground py-2">{text}</div>
      )}

      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Skeleton
            key={`loading-skeleton-${index}`}
            className="w-full"
            style={{ height: `${itemHeight}px` }}
          />
        ))}
      </div>
    </div>
  );
}
