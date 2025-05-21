"use client";

import React from "react";
import { Skeleton } from "@src/components/ui/skeleton";

interface SkeletonLoadingProps {
  /** Type of skeleton to show (feed, character, quest, ranking, party) */
  type: "feed" | "character" | "quest" | "ranking" | "party" | "default";
  /** Custom text to display while loading, defaults to empty */
  text?: string;
  /** Custom class name for the container */
  className?: string;
}

/**
 * Facebook-style skeleton loading component that adapts to different content types
 */
export default function SkeletonLoading({
  type = "default",
  text,
  className = "",
}: SkeletonLoadingProps) {
  return (
    <div className={`w-full animate-pulse-subtle ${className}`}>
      {text && (
        <div className="text-center text-muted-foreground py-2 mb-4">{text}</div>
      )}

      {type === "feed" && <FeedSkeleton />}
      {type === "character" && <CharacterSkeleton />}
      {type === "quest" && <QuestSkeleton />}
      {type === "ranking" && <RankingSkeleton />}
      {type === "party" && <PartySkeleton />}
      {type === "default" && <DefaultSkeleton />}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stories row */}
      <div className="mb-4">
        <Skeleton className="h-4 w-40 mb-2" />
        <div className="flex space-x-2 overflow-hidden py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`story-${i}`} className="w-16 h-16 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Posts */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`post-${i}`} className="rounded-lg overflow-hidden space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-40 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CharacterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Character profile */}
      <div className="flex flex-col items-center mb-4">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-2 w-full max-w-xs mb-1" />
        <Skeleton className="h-6 w-40 mt-2" />
      </div>

      {/* Character stats */}
      <div className="rounded-lg p-4 space-y-3">
        <Skeleton className="h-5 w-48 mb-2" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`stat-${i}`} className="flex flex-col items-center">
              <Skeleton className="w-12 h-12 rounded-full mb-2" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-lg p-4 space-y-3">
        <Skeleton className="h-5 w-40 mb-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`achievement-${i}`} className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-md" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="rounded-lg p-4 space-y-3">
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`grid-${i}`} className="p-3 rounded-lg">
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Quest progress */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-2 w-full mb-1" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Quest items */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`quest-${i}`} className="p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Filters */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Top performer */}
      <div className="rounded-lg p-6 text-center space-y-4 mb-4">
        <Skeleton className="h-5 w-36 mx-auto mb-2" />
        <Skeleton className="h-28 w-28 rounded-full mx-auto mb-2" />
        <Skeleton className="h-5 w-32 mx-auto mb-1" />
        <Skeleton className="h-4 w-24 mx-auto mb-3" />
        <div className="flex justify-center items-center space-x-4">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md mx-auto" />
      </div>

      {/* Current user */}
      <div className="rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-full mr-3" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-3 w-10 ml-auto" />
          </div>
        </div>
      </div>

      {/* Rankings list */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`rank-${i}`} className="rounded-lg p-3">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-3 w-10 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PartySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Skeleton className="h-8 w-8 rounded-md mr-2" />
        <div>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Tabs & Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full rounded-md mb-4" />

      {/* Team cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`team-${i}`} className="rounded-lg p-4 mb-4">
          <div className="flex justify-between">
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-48" />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-8" />

      <Skeleton className="h-64 w-full rounded-md mb-6" />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      <Skeleton className="h-10 w-32 rounded-md mx-auto" />
    </div>
  );
}
