"use client";

import { useState, useRef, useEffect } from "react";
import { useFeed } from "../hook/api";
import StoryList from "./story/StoryList";
import PostList from "./post/PostList";
import {
  SkeletonLoading,
  ErrorDisplay,
  GlobalErrorBoundary,
} from "@src/components/shared";
import { useError } from "@src/components/shared/ErrorProvider";
import useErrorHandler from "@src/hooks/useErrorHandler";
import { useIntersectionObserver } from "../hook/useIntersectionObserver";

export default function FeedPageComponent() {
  // Wrap the component with GlobalErrorBoundary
  return (
    <GlobalErrorBoundary>
      <FeedPageContent />
    </GlobalErrorBoundary>
  );
}

function FeedPageContent() {
  const {
    feedItems,
    stories,
    isLoading,
    isRefreshing,
    error,
    refreshFeed,
    toggleLike,
    addComment,
    formatTimeDiff,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useFeed();

  const { showError } = useError();
  const { handleAsyncOperation } = useErrorHandler();

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(
    null
  );
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const storiesRef = useRef<HTMLDivElement>(null);

  // This prevents hydration mismatch by only running client-side code after mount
  useEffect(() => {
    setIsClient(true);

    // Add scroll event listener to storiesRef
    const handleScroll = () => {
      if (storiesRef.current) {
        setScrollPosition(storiesRef.current.scrollLeft);
      }
    };

    const currentRef = storiesRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Handle adding a comment
  const handleAddComment = async (feedItemId: string) => {
    if (!commentInputs[feedItemId] || commentInputs[feedItemId].trim() === "")
      return;

    const result = await handleAsyncOperation(async () => {
      return await addComment(feedItemId, commentInputs[feedItemId]);
    });

    if (result) {
      // Clear input on success
      setCommentInputs((prev) => ({
        ...prev,
        [feedItemId]: "",
      }));
    } else {
      // Error is already handled by handleAsyncOperation
      showError("ไม่สามารถเพิ่มความคิดเห็นได้", {
        severity: "error",
        message: "โปรดลองอีกครั้งในภายหลัง",
      });
    }
  };

  // Handle liking a post with error handling
  const handleToggleLike = async (feedItemId: string) => {
    const result = await handleAsyncOperation(async () => {
      return await toggleLike(feedItemId);
    });

    if (!result) {
      showError("ไม่สามารถกดไลค์ได้", {
        severity: "warning",
        message: "โปรดลองอีกครั้งในภายหลัง",
        autoHideAfter: 3000,
      });
    }
  };

  // Handle horizontal scroll for stories
  const handleScrollLeft = () => {
    if (storiesRef.current) {
      const newPosition = Math.max(scrollPosition - 200, 0);
      storiesRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  const handleScrollRight = () => {
    if (storiesRef.current) {
      const newPosition = Math.min(
        scrollPosition + 200,
        storiesRef.current.scrollWidth - storiesRef.current.clientWidth
      );
      storiesRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  // Story navigation functions
  const openStory = (index: number) => {
    setCurrentStoryIndex(index);
  };

  const closeStory = () => {
    setCurrentStoryIndex(null);
  };

  const nextStory = () => {
    if (
      currentStoryIndex !== null &&
      stories &&
      stories.length > 0 &&
      currentStoryIndex < stories.length - 1
    ) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex !== null && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const loadMoreRef = useIntersectionObserver({
    callback: loadMore,
    enabled: !isLoading && !isLoadingMore && hasMore,
  });

  // Show loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="p-4 pb-20">
        <SkeletonLoading type="feed" text="กำลังโหลดฟีด..." />
      </div>
    );
  }

  // Show error state with improved error component
  if (error) {
    return (
      <div className="p-4 pb-20">
        <ErrorDisplay
          title="ไม่สามารถโหลดฟีดได้"
          message={
            error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์"
          }
          severity="error"
          onRetry={refreshFeed}
          showRetry={true}
          technicalDetails={error}
        />
      </div>
    );
  }

  // Ensure stories is not undefined
  const safeStories = stories || [];

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold ai-gradient-text">ฟีดรวมกิจกรรม</h1>
        <p className="text-muted-foreground">
          ดูว่าเพื่อนร่วมงานของคุณกำลังทำอะไรกัน
        </p>
      </div>

      {isRefreshing && (
        <div className="mb-4 p-2 bg-blue-500/10 text-blue-400 rounded-md text-sm">
          กำลังรีเฟรชฟีด...
        </div>
      )}

      <StoryList
        stories={safeStories}
        isClient={isClient}
        scrollPosition={scrollPosition}
        storiesRef={storiesRef}
        handleScrollLeft={handleScrollLeft}
        handleScrollRight={handleScrollRight}
        openStory={openStory}
        currentStoryIndex={currentStoryIndex}
        closeStory={closeStory}
        prevStory={prevStory}
        nextStory={nextStory}
      />

      <PostList
        feedItems={feedItems || []}
        formatTimeDiff={formatTimeDiff}
        toggleLike={handleToggleLike}
        commentInputs={commentInputs}
        setCommentInputs={setCommentInputs}
        handleAddComment={handleAddComment}
      />
      {/* Load More Trigger & Loading State */}
      <div ref={loadMoreRef} className="py-4">
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2 text-muted-foreground">
              กำลังโหลดเพิ่มเติม...
            </span>
          </div>
        )}

        {!hasMore && feedItems.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>คุณได้ดูฟีดทั้งหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
