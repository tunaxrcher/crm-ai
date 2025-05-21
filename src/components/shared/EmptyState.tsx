"use client";

import React from "react";
import { Info } from "lucide-react";
import { Button } from "@src/components/ui/button";

interface EmptyStateProps {
  /** Main title to display */
  title?: string;
  /** Descriptive message */
  message?: string;
  /** Text for the action button */
  actionText?: string;
  /** Function to call when action button is clicked */
  onAction?: () => void;
  /** Custom class name for the container */
  className?: string;
  /** Icon to show, defaults to Info */
  icon?: React.ReactNode;
}

/**
 * A reusable empty state component for when there's no data to display
 */
export default function EmptyState({
  title = "No items found",
  message,
  actionText,
  onAction,
  className = "",
  icon = <Info className="h-10 w-10 text-muted-foreground" />,
}: EmptyStateProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center py-10 text-center ${className}`}>
      <div className="mb-4">
        {icon}
      </div>

      <h3 className="text-lg font-medium mb-2">{title}</h3>

      {message && (
        <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      )}

      {actionText && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-2"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
