"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Sparkles,
  Trophy,
  XCircle,
  ArrowBigUp,
  Star,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Demo data for preview in storybook/examples
const demoUser = {
  name: "Alex Johnson",
  avatar: "https://same-assets.com/avatars/marketing-specialist-1.png",
};

// Types of notifications
export type NotificationType =
  | "quest_complete"
  | "level_up"
  | "achievement"
  | "stat_increase"
  | "party_invite"
  | "reward";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  data?: any;
  read: boolean;
  duration?: number; // How long to show the toast in ms
}

// Toast notification component for showing real-time notifications
export const NotificationToast = ({
  notification,
  onClose,
}: {
  notification: NotificationProps;
  onClose: () => void;
}) => {
  const [progress, setProgress] = useState(100);
  const duration = notification.duration || 5000;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100);
        if (newProgress <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [duration, onClose]);

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "quest_complete":
        return <CheckCircle2 className="h-6 w-6 text-green-400" />;
      case "level_up":
        return <Sparkles className="h-6 w-6 text-purple-400" />;
      case "achievement":
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case "stat_increase":
        return <ArrowBigUp className="h-6 w-6 text-blue-400" />;
      case "party_invite":
        return <PartyPopper className="h-6 w-6 text-pink-400" />;
      case "reward":
        return <Award className="h-6 w-6 text-amber-400" />;
      default:
        return <CheckCircle2 className="h-6 w-6 text-green-400" />;
    }
  };

  // Get background style based on notification type
  const getBackgroundStyle = () => {
    switch (notification.type) {
      case "quest_complete":
        return "bg-gradient-to-r from-green-500/10 via-green-400/10 to-green-300/10";
      case "level_up":
        return "bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10";
      case "achievement":
        return "bg-gradient-to-r from-yellow-500/10 via-amber-400/10 to-yellow-300/10";
      case "stat_increase":
        return "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-400/10";
      case "party_invite":
        return "bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-400/10";
      case "reward":
        return "bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-400/10";
      default:
        return "bg-secondary/10";
    }
  };

  return (
    <div
      className={`relative p-4 rounded-lg shadow-lg ${getBackgroundStyle()} backdrop-blur-sm border border-border max-w-sm w-full`}
      style={{
        opacity: 1,
        transform: "translateY(0px) scale(1)",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      <Progress value={progress} className="h-1 mt-2" />
    </div>
  );
};

// Quest complete notification with more details
export const QuestCompleteNotification = ({
  xpGained = 75,
  questTitle = "Product Presentation",
  onClose = () => {},
}) => {
  return (
    <div className="relative p-4 rounded-lg border border-border bg-gradient-to-r from-green-500/10 via-green-400/10 to-green-300/10 shadow-md">
      <div className="flex items-start">
        <div className="flex items-center justify-center rounded-full bg-green-500/20 p-2 mr-3">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Quest Completed!</h3>
            <button onClick={onClose}>
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            You've successfully completed "{questTitle}"
          </p>

          <div className="flex items-center space-x-1 bg-secondary/30 px-3 py-1.5 rounded-md w-fit">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold text-yellow-400">
              +{xpGained} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Level up notification
export const ArrowBigUpNotification = ({
  previousLevel = 7,
  newLevel = 8,
  newTitle = "Marketing Specialist",
  onClose = () => {},
}) => {
  return (
    <div className="relative p-4 rounded-lg border border-border bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 shadow-md">
      <div className="flex items-start">
        <div className="flex items-center justify-center rounded-full bg-blue-500/20 p-2 mr-3">
          <Sparkles className="h-6 w-6 text-blue-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold ai-gradient-text">
              Level Up!
            </h3>
            <button onClick={onClose}>
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            You've reached Level {newLevel}
          </p>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center bg-secondary/30 px-3 py-1.5 rounded-md">
              <span className="text-sm">Level {previousLevel}</span>
            </div>

            <ArrowBigUp className="h-5 w-5 text-blue-400 mx-2" />

            <div className="flex items-center bg-secondary/30 px-3 py-1.5 rounded-md">
              <span className="text-sm">Level {newLevel}</span>
            </div>
          </div>

          <div className="text-sm text-center mt-2">
            New Title:{" "}
            <span className="font-semibold ai-gradient-text">{newTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement notification
export const AchievementNotification = ({
  title = "First Blood",
  description = "Complete your first quest",
  icon = "🏆",
  onClose = () => {},
}) => {
  return (
    <div className="relative p-4 rounded-lg border border-border bg-gradient-to-r from-yellow-500/10 via-amber-400/10 to-yellow-300/10 shadow-md">
      <div className="flex items-start">
        <div className="flex items-center justify-center rounded-full bg-amber-500/20 p-2 mr-3 text-2xl">
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Achievement Unlocked!</h3>
            <button onClick={onClose}>
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <p className="text-base font-medium mt-1 text-yellow-400">{title}</p>

          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Notification center component (could be expanded in future)
export const NotificationCenter = ({
  notifications = [],
}: {
  notifications: NotificationProps[];
}) => {
  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <span className="text-xs text-muted-foreground">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.read
                  ? "bg-secondary/10 border-border"
                  : "bg-secondary/20 border-border"
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {notification.type === "quest_complete" && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                  {notification.type === "level_up" && (
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  )}
                  {notification.type === "achievement" && (
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  )}
                  {notification.type === "stat_increase" && (
                    <ArrowBigUp className="h-5 w-5 text-blue-400" />
                  )}
                  {notification.type === "party_invite" && (
                    <PartyPopper className="h-5 w-5 text-pink-400" />
                  )}
                  {notification.type === "reward" && (
                    <Award className="h-5 w-5 text-amber-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4">
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

// Notification Provider for App
export const NotificationDemo = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  // Sample notification creation functions (for demo purposes)
  const addQuestCompleteNotification = () => {
    const newNotification: NotificationProps = {
      id: `notification-${Date.now()}`,
      type: "quest_complete",
      title: "Quest Completed!",
      message: "You've successfully completed the Product Presentation quest.",
      createdAt: new Date(),
      data: {
        questTitle: "Product Presentation",
        xpGained: 75,
      },
      read: false,
      duration: 5000,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const addArrowBigUpNotification = () => {
    const newNotification: NotificationProps = {
      id: `notification-${Date.now()}`,
      type: "level_up",
      title: "Level Up!",
      message: "You've reached Level 8! New title: Marketing Specialist",
      createdAt: new Date(),
      data: {
        previousLevel: 7,
        newLevel: 8,
        newTitle: "Marketing Specialist",
      },
      read: false,
      duration: 5000,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const addAchievementNotification = () => {
    const newNotification: NotificationProps = {
      id: `notification-${Date.now()}`,
      type: "achievement",
      title: "Achievement Unlocked!",
      message: "First Blood: Complete your first quest",
      createdAt: new Date(),
      data: {
        title: "First Blood",
        description: "Complete your first quest",
        icon: "🏆",
      },
      read: false,
      duration: 5000,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold ai-gradient-text">Notification Demo</h1>

      <div className="flex flex-wrap gap-2">
        <button
          className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          onClick={addQuestCompleteNotification}
        >
          Show Quest Complete
        </button>

        <button
          className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          onClick={addArrowBigUpNotification}
        >
          Show Level Up
        </button>

        <button
          className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          onClick={addAchievementNotification}
        >
          Show Achievement
        </button>
      </div>

      <div className="space-y-3 max-w-sm">
        <h2 className="text-lg font-semibold">Toast Notifications</h2>
        <div>
          {notifications.map((notification) => (
            <div key={notification.id} style={{ marginBottom: "0.75rem" }}>
              <NotificationToast
                notification={notification}
                onClose={() => handleRemoveNotification(notification.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <h2 className="text-lg font-semibold">Notification Examples</h2>

        <div className="grid grid-cols-1 gap-4 max-w-sm">
          <QuestCompleteNotification />
          <ArrowBigUpNotification />
          <AchievementNotification />
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <h2 className="text-lg font-semibold">Notification Center</h2>

        <div className="border border-border rounded-lg max-w-sm">
          <NotificationCenter
            notifications={[
              {
                id: "notification-1",
                type: "quest_complete",
                title: "Quest Completed!",
                message:
                  "You've successfully completed the Product Presentation quest.",
                createdAt: new Date(),
                read: false,
              },
              {
                id: "notification-2",
                type: "level_up",
                title: "Level Up!",
                message:
                  "You've reached Level 8! New title: Marketing Specialist",
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                read: true,
              },
              {
                id: "notification-3",
                type: "achievement",
                title: "Achievement Unlocked!",
                message: "First Blood: Complete your first quest",
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
                read: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
