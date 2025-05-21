"use client";

import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

/**
 * Error fallback component to be rendered when an error occurs within an ErrorBoundary
 */
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();

  const handleNavigateHome = () => {
    router.push("/");
    resetErrorBoundary();
  };

  return (
    <Card className="w-full overflow-hidden my-4">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>

        <h3 className="text-lg font-medium mb-2">เกิดข้อผิดพลาดที่ไม่คาดคิด</h3>

        <p className="text-muted-foreground mb-4 max-w-md">
          ขออภัย ระบบเกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-900/20 p-4 rounded-md mb-4 w-full max-w-md overflow-auto text-left">
            <p className="text-red-500 font-mono text-sm break-words">
              {error.message}
            </p>
            <p className="text-red-400/70 font-mono text-xs mt-2 break-words">
              {error.stack?.split("\n").slice(0, 3).join("\n")}
            </p>
          </div>
        )}

        <div className="flex flex-row gap-2">
          <Button onClick={resetErrorBoundary} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            ลองใหม่
          </Button>

          <Button variant="outline" onClick={handleNavigateHome} className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            กลับสู่หน้าหลัก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Global error boundary component that wraps content and catches JavaScript errors
 */
export default function GlobalErrorBoundary({
  children,
  fallback,
}: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={(error, info) => {
        // ในอนาคตสามารถเพิ่มการ log ไปยัง error tracking service เช่น Sentry ได้
        console.error("Error caught by GlobalErrorBoundary:", error);
        console.error("Component stack:", info.componentStack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
