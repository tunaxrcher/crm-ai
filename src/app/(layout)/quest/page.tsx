"use client";

import { useState, useEffect } from "react";
import QuestPageComponent from "@/features/quest/components/QuestPage";

export default function QuestPage() {
  // Simple error boundary
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    try {
      // Detect errors that may occur during hydration or rendering
      if (hasError) {
        console.error("Quest page error:", errorMessage);
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  }, [hasError, errorMessage]);

  if (hasError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Error loading Quests</h1>
        <p className="mt-2">{errorMessage || "There was an error loading this page"}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <QuestPageComponent />;
}
