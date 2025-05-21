"use client";

import React, { useState } from "react";
import { Bell, X, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@src/components/ui/sheet";
import { Button } from "@src/components/ui/button";
import { Badge } from "@src/components/ui/badge";
import { useNotification } from "@src/components/ui/notification-system";

export default function NotificationSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    unreadCount,
  } = useNotification();

  // Helper to format notification time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[90vw] sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between pr-8">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </SheetHeader>

        <div className="mt-4 space-y-2 pb-16 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-3 rounded-lg border ${
                  notification.isRead
                    ? "bg-background border-border"
                    : "bg-secondary/5 border-primary/10"
                } hover:bg-secondary/10 transition-colors`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Info
                      className={`h-5 w-5 ${
                        notification.type === "success"
                          ? "text-green-400"
                          : notification.type === "error"
                          ? "text-red-400"
                          : notification.type === "warning"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp &&
                          formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
