"use client";

import React from "react";
import { GlobalErrorBoundary } from "@/components/shared";

/**
 * Higher Order Component (HOC) that wraps a component with GlobalErrorBoundary
 * This makes it easy to add error boundary to any component
 */
export default function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> {
  const displayName = Component.displayName || Component.name || "Component";

  const WithErrorHandling: React.FC<P> = (props) => {
    return (
      <GlobalErrorBoundary fallback={fallback}>
        <Component {...props} />
      </GlobalErrorBoundary>
    );
  };

  WithErrorHandling.displayName = `withErrorHandling(${displayName})`;

  return WithErrorHandling;
}
