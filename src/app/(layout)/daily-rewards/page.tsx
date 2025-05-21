"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Gift,
  Info,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

// Type definitions
type RewardType = "xp" | "points" | "buff" | "item" | "title" | "exclusive";

interface BaseReward {
  type: RewardType;
}

interface XPReward extends BaseReward {
  type: "xp";
  amount: number;
}

interface PointsReward extends BaseReward {
  type: "points";
  amount: number;
}

interface BuffReward extends BaseReward {
  type: "buff";
  name: string;
  description: string;
}

interface ItemReward extends BaseReward {
  type: "item";
  name: string;
  description: string;
}

interface TitleReward extends BaseReward {
  type: "title";
  name: string;
}

interface ExclusiveReward extends BaseReward {
  type: "exclusive";
  name: string;
}

type Reward =
  | XPReward
  | PointsReward
  | BuffReward
  | ItemReward
  | TitleReward
  | ExclusiveReward;

interface DailyReward {
  day: number;
  reward: Reward;
  icon: React.ReactNode;
}

interface StreakBonus {
  streak: number;
  reward: Reward;
  claimed: boolean;
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastClaimed: Date;
  canClaimToday: boolean;
  currentDay: number;
  totalDaysClaimed: number;
}

// Mock daily rewards data
const dailyRewards: DailyReward[] = [
  {
    day: 1,
    reward: { type: "xp", amount: 50 },
    icon: <Sparkles className="h-6 w-6 text-blue-400" />,
  },
  {
    day: 2,
    reward: { type: "points", amount: 100 },
    icon: <Star className="h-6 w-6 text-yellow-400" />,
  },
  {
    day: 3,
    reward: {
      type: "buff",
      name: "XP Boost",
      description: "+20% XP for 24 hours",
    },
    icon: <Zap className="h-6 w-6 text-purple-400" />,
  },
  {
    day: 4,
    reward: { type: "points", amount: 150 },
    icon: <Star className="h-6 w-6 text-yellow-400" />,
  },
  {
    day: 5,
    reward: {
      type: "item",
      name: "Time Extension",
      description: "Extend one quest deadline by 24 hours",
    },
    icon: <Clock className="h-6 w-6 text-cyan-400" />,
  },
  {
    day: 6,
    reward: { type: "points", amount: 200 },
    icon: <Star className="h-6 w-6 text-yellow-400" />,
  },
  {
    day: 7,
    reward: { type: "title", name: "The Consistent" },
    icon: <Trophy className="h-6 w-6 text-amber-400" />,
  },
];

// Mock streak bonus rewards
const streakBonuses: StreakBonus[] = [
  {
    streak: 7,
    reward: { type: "title", name: "The Dedicated" },
    claimed: true,
  },
  {
    streak: 14,
    reward: {
      type: "buff",
      name: "Sales Magnet",
      description: "+10% chance for high-value deals for 3 days",
    },
    claimed: false,
  },
  { streak: 21, reward: { type: "points", amount: 500 }, claimed: false },
  {
    streak: 30,
    reward: { type: "exclusive", name: "Special Avatar Frame: Golden Streak" },
    claimed: false,
  },
];

// Demo user streak data
const mockUserStreak: UserStreak = {
  currentStreak: 12,
  longestStreak: 18,
  lastClaimed: new Date(),
  canClaimToday: true,
  currentDay: 5, // in the 7-day cycle
  totalDaysClaimed: 24,
};

// Function to format reward text
const getRewardText = (reward: Reward): string => {
  switch (reward.type) {
    case "xp":
      return `${reward.amount} XP`;
    case "points":
      return `${reward.amount} Points`;
    case "buff":
      return `Buff: ${reward.name}`;
    case "item":
      return `Item: ${reward.name}`;
    case "title":
      return `Title: ${reward.name}`;
    case "exclusive":
      return `Exclusive: ${reward.name}`;
    default:
      return "";
  }
};

// Function to get reward icon color based on type
const getRewardBgColor = (reward: Reward): string => {
  switch (reward.type) {
    case "xp":
      return "bg-blue-500/20";
    case "points":
      return "bg-yellow-500/20";
    case "buff":
    case "item":
      return "bg-purple-500/20";
    case "title":
      return "bg-green-500/20";
    case "exclusive":
      return "bg-orange-500/20";
    default:
      return "bg-gray-500/20";
  }
};

export default function DailyRewardsPage() {
  const router = useRouter();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimedReward, setClaimedReward] = useState<DailyReward | null>(null);
  const [userStreak, setUserStreak] = useState<UserStreak>(mockUserStreak);

  // Calendar days (for the monthly view)
  const calendarDays = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    claimed: i < userStreak.totalDaysClaimed,
    isToday:
      i + 1 === userStreak.totalDaysClaimed + 1 && userStreak.canClaimToday,
  }));

  // Handle claim reward
  const handleClaimReward = () => {
    const todayReward = dailyRewards[(userStreak.currentDay - 1) % 7];
    setClaimedReward(todayReward);
    setShowClaimDialog(true);

    // In a real app, this would update the backend
    setUserStreak((prev) => ({
      ...prev,
      currentStreak: prev.currentStreak + 1,
      currentDay: (prev.currentDay % 7) + 1,
      totalDaysClaimed: prev.totalDaysClaimed + 1,
      canClaimToday: false,
      lastClaimed: new Date(),
    }));
  };

  // Format date as "Day, Month Date, Year"
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.push("/")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold ai-gradient-text">Daily Rewards</h1>
          <p className="text-muted-foreground">
            Log in daily to earn rewards and maintain your streak
          </p>
        </div>
      </div>

      {/* Streak Status Card */}
      <Card className="mb-6 bg-gradient-to-br from-yellow-900/20 to-amber-700/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start mb-4">
            <div className="p-3 bg-amber-500/20 rounded-lg mr-4">
              <Zap className="h-8 w-8 text-amber-400" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {userStreak.currentStreak} Day Streak
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Keep it going! Your longest streak is{" "}
                    {userStreak.longestStreak} days
                  </p>
                </div>

                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>
                    Next streak bonus at{" "}
                    {Math.ceil(userStreak.currentStreak / 7) * 7} days
                  </span>
                  <span>
                    {userStreak.currentStreak % 7}/{7} days
                  </span>
                </div>
                <Progress
                  value={((userStreak.currentStreak % 7) * 100) / 7}
                  className="h-2"
                />
              </div>
            </div>
          </div>

          <div className="text-center text-sm border-t border-amber-500/20 pt-4 mt-2">
            <div className="font-medium">
              {userStreak.canClaimToday
                ? "You can claim today's reward!"
                : `Next reward available in ${Math.floor(
                    24 -
                      (new Date().getTime() -
                        new Date(userStreak.lastClaimed).getTime()) /
                        (1000 * 60 * 60)
                  )} hours`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last claimed: {formatDate(userStreak.lastClaimed)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Rewards Cycle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2 text-purple-400" />
            <span>7-Day Reward Cycle</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dailyRewards.map((reward, index) => {
              const isActive = index + 1 === userStreak.currentDay;
              const isClaimed =
                index + 1 < userStreak.currentDay ||
                (index + 1 === userStreak.currentDay &&
                  !userStreak.canClaimToday);
              const isFuture = index + 1 > userStreak.currentDay;

              return (
                <div
                  key={index}
                  className={`
                    relative p-3 rounded-lg border-2 text-center transition-all
                    ${
                      isActive && userStreak.canClaimToday
                        ? "ai-gradient-border animate-pulse"
                        : "border-border"
                    }
                    ${isClaimed ? "bg-secondary/20" : ""}
                    ${isFuture ? "opacity-70" : ""}
                  `}
                >
                  <div className="absolute top-1 left-1 bg-secondary/60 text-xs px-1 rounded">
                    Day {reward.day}
                  </div>

                  <div
                    className={`mx-auto my-2 p-2 rounded-full ${getRewardBgColor(
                      reward.reward
                    )}`}
                  >
                    {reward.icon}
                  </div>

                  <div className="text-xs font-medium">
                    {getRewardText(reward.reward)}
                  </div>

                  {isClaimed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <Check className="h-6 w-6 text-green-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              className="ai-gradient-bg"
              onClick={handleClaimReward}
              disabled={!userStreak.canClaimToday}
            >
              {userStreak.canClaimToday
                ? "Claim Today's Reward"
                : "Already Claimed Today"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Streak Bonuses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-400" />
            <span>Streak Bonuses</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {streakBonuses.map((bonus, index) => {
              const isUnlocked = userStreak.currentStreak >= bonus.streak;

              return (
                <div
                  key={index}
                  className={`
                    flex items-center p-3 rounded-lg border
                    ${isUnlocked ? "border-amber-500/30" : "border-border"}
                    ${bonus.claimed ? "bg-secondary/20" : ""}
                  `}
                >
                  <div
                    className={`p-2 rounded-lg mr-3 ${getRewardBgColor(
                      bonus.reward
                    )}`}
                  >
                    {isUnlocked ? (
                      <Trophy className="h-6 w-6 text-amber-400" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {bonus.streak} Day Streak Bonus
                      </div>
                      {bonus.claimed && (
                        <Badge className="bg-green-500/20 text-green-400">
                          Claimed
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mt-1">
                      Reward: {getRewardText(bonus.reward)}
                    </div>

                    {!isUnlocked && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Unlocks in {bonus.streak - userStreak.currentStreak}{" "}
                        more days
                      </div>
                    )}
                  </div>

                  {isUnlocked && !bonus.claimed && (
                    <Button size="sm" className="ml-2 ai-gradient-bg">
                      Claim
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Calendar View */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            <span>Monthly Streak Calendar</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 text-xs text-center mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Offset for the starting day (placeholder) */}
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={`offset-${i}`} className="h-10 rounded-md"></div>
              ))}

            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  h-10 flex items-center justify-center rounded-md text-sm relative
                  ${day.claimed ? "bg-green-500/20" : "bg-secondary/10"}
                  ${day.isToday ? "ring-2 ring-blue-400" : ""}
                `}
              >
                {day.day}
                {day.claimed && (
                  <div className="absolute bottom-1 right-1">
                    <Check className="h-3 w-3 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500/20 rounded-sm mr-1"></div>
                <span>Claimed</span>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 bg-secondary/10 rounded-sm mr-1"></div>
                <span>Unclaimed</span>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 border-2 border-blue-400 rounded-sm mr-1"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 mr-2 text-blue-400" />
            <h3 className="font-semibold">Streak Tips</h3>
          </div>

          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-yellow-400">💡</span> Log in every day to
              maintain your streak and earn rewards
            </div>
            <div className="text-sm">
              <span className="text-yellow-400">💡</span> Longer streaks unlock
              special bonuses and exclusive items
            </div>
            <div className="text-sm">
              <span className="text-yellow-400">💡</span> If you're about to
              break your streak, you can use a "Streak Saver" item (available in
              the shop)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Reward Claimed!</DialogTitle>
            <DialogDescription>
              You've successfully claimed your daily reward
            </DialogDescription>
          </DialogHeader>

          {claimedReward && (
            <div className="flex flex-col items-center justify-center py-6">
              <div
                className={`p-4 ${getRewardBgColor(
                  claimedReward.reward
                )} rounded-full mb-4`}
              >
                {claimedReward.icon}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">
                  Day {claimedReward.day} Reward
                </h3>
                <p className="text-lg">{getRewardText(claimedReward.reward)}</p>

                {"description" in claimedReward.reward &&
                  claimedReward.reward.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {claimedReward.reward.description}
                    </p>
                  )}
              </div>

              <div className="mt-6 text-center">
                <div className="text-sm font-medium">
                  Current Streak: {userStreak.currentStreak} days
                </div>
                <div className="text-xs text-muted-foreground">
                  Keep logging in daily to maintain your streak!
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowClaimDialog(false)}
              className="w-full ai-gradient-bg"
            >
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
