"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Award,
  BookUser,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Gift,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Info,
  LineChart,
  Lock,
  LucideIcon,
  Medal,
  MessageCircle,
  Star,
  Trophy,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type CategoryId =
  | "sales"
  | "marketing"
  | "customer"
  | "teamwork"
  | "personal"
  | "efficiency";
type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
type RewardType = "xp" | "points" | "title" | "buff";

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

interface TitleReward extends BaseReward {
  type: "title";
  name: string;
}

interface BuffReward extends BaseReward {
  type: "buff";
  name: string;
  description: string;
}

type Reward = XPReward | PointsReward | TitleReward | BuffReward;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  completed: boolean;
  tier: AchievementTier;
  reward: Reward;
}

interface Category {
  id: CategoryId;
  name: string;
  icon: React.ReactNode;
  description: string;
  totalAchievements: number;
  completedAchievements: number;
  color: string;
}

// Achievement categories with icons and descriptions
const achievementCategories: Category[] = [
  {
    id: "sales" as CategoryId,
    name: "Sales Mastery",
    icon: <TrendingUp className="h-10 w-10 text-green-400" />,
    description: "Excellence in closing deals and generating revenue",
    totalAchievements: 12,
    completedAchievements: 4,
    color: "green",
  },
  {
    id: "marketing" as CategoryId,
    name: "Marketing Wizardry",
    icon: <Globe className="h-10 w-10 text-blue-400" />,
    description: "Skills in attracting and engaging potential customers",
    totalAchievements: 15,
    completedAchievements: 7,
    color: "blue",
  },
  {
    id: "customer" as CategoryId,
    name: "Customer Relations",
    icon: <Heart className="h-10 w-10 text-red-400" />,
    description: "Building lasting relationships with clients",
    totalAchievements: 10,
    completedAchievements: 5,
    color: "red",
  },
  {
    id: "teamwork" as CategoryId,
    name: "Team Excellence",
    icon: <Users className="h-10 w-10 text-purple-400" />,
    description: "Collaboration and coordination with colleagues",
    totalAchievements: 8,
    completedAchievements: 3,
    color: "purple",
  },
  {
    id: "personal" as CategoryId,
    name: "Personal Growth",
    icon: <GraduationCap className="h-10 w-10 text-yellow-400" />,
    description: "Individual development and skill improvement",
    totalAchievements: 10,
    completedAchievements: 3,
    color: "yellow",
  },
  {
    id: "efficiency" as CategoryId,
    name: "Efficiency Expert",
    icon: <Zap className="h-10 w-10 text-cyan-400" />,
    description: "Optimizing workflows and processes",
    totalAchievements: 8,
    completedAchievements: 2,
    color: "cyan",
  },
];
// Detailed mock achievements by category
// Update the mockAchievementsByCategory with proper type
const mockAchievementsByCategory: Record<CategoryId, Achievement[]> = {
  sales: [
    {
      id: "sales-1",
      name: "First Sale",
      description: "Close your first sales deal",
      icon: <CheckCircle className="h-6 w-6 text-green-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 50,
      },
    },
    {
      id: "sales-2",
      name: "Sales Rookie",
      description: "Close 5 sales deals",
      icon: <CheckCircle className="h-6 w-6 text-green-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 100,
      },
    },
    {
      id: "sales-3",
      name: "Deal Hunter",
      description: "Close 10 sales deals",
      icon: <CheckCircle className="h-6 w-6 text-green-400" />,
      progress: 100,
      completed: true,
      tier: "silver" as AchievementTier,
      reward: {
        type: "points" as const,
        amount: 200,
      },
    },
    {
      id: "sales-4",
      name: "Sales Champion",
      description: "Close 25 sales deals",
      icon: <CheckCircle className="h-6 w-6 text-green-400" />,
      progress: 100,
      completed: true,
      tier: "gold" as AchievementTier,
      reward: {
        type: "title" as const,
        name: "The Closer",
      },
    },
    {
      id: "sales-5",
      name: "Big Spender",
      description: "Close a deal worth more than $10,000",
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      progress: 0,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "points" as const,
        amount: 300,
      },
    },
    {
      id: "sales-6",
      name: "Whale Hunter",
      description: "Close a deal worth more than $50,000",
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      progress: 0,
      completed: false,
      tier: "gold" as AchievementTier,
      reward: {
        type: "buff" as const,
        name: "Deal Magnet",
        description: "+15% chance to find high-value leads for 7 days",
      },
    },
  ],
  marketing: [
    {
      id: "marketing-1",
      name: "Content Creator",
      description: "Create your first marketing content",
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 50,
      },
    },
    {
      id: "marketing-2",
      name: "Social Media Novice",
      description: "Post 5 times on social media",
      icon: <MessageCircle className="h-6 w-6 text-blue-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 100,
      },
    },
    {
      id: "marketing-3",
      name: "Engagement Expert",
      description: "Achieve 100+ engagements on your posts",
      icon: <Users className="h-6 w-6 text-blue-400" />,
      progress: 85,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "points" as const,
        amount: 150,
      },
    },
    {
      id: "marketing-4",
      name: "Campaign Strategist",
      description: "Successfully run 3 marketing campaigns",
      icon: <LineChart className="h-6 w-6 text-blue-400" />,
      progress: 67,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "buff" as const,
        name: "Viral Content",
        description: "+20% engagement on your next campaign",
      },
    },
  ],
  customer: [
    // Add customer achievements
    {
      id: "customer-1",
      name: "Customer Friend",
      description: "Receive 5 positive customer reviews",
      icon: <Heart className="h-6 w-6 text-red-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 75,
      },
    },
    {
      id: "customer-2",
      name: "Problem Solver",
      description: "Resolve 10 customer issues",
      icon: <Heart className="h-6 w-6 text-red-400" />,
      progress: 50,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "points" as const,
        amount: 200,
      },
    },
  ],
  teamwork: [
    {
      id: "teamwork-1",
      name: "Team Player",
      description: "Join your first team",
      icon: <Users className="h-6 w-6 text-purple-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 50,
      },
    },
    {
      id: "teamwork-2",
      name: "Collaborator",
      description: "Complete 3 team quests",
      icon: <Handshake className="h-6 w-6 text-purple-400" />,
      progress: 67,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "buff" as const,
        name: "Team Spirit",
        description: "+10% XP from team activities for 3 days",
      },
    },
  ],
  personal: [
    {
      id: "personal-1",
      name: "Early Bird",
      description: "Log in before 8 AM for 5 days",
      icon: <Clock className="h-6 w-6 text-yellow-400" />,
      progress: 100,
      completed: true,
      tier: "bronze" as AchievementTier,
      reward: {
        type: "xp" as const,
        amount: 75,
      },
    },
    {
      id: "personal-2",
      name: "Consistent Performer",
      description: "Complete daily quests for 7 consecutive days",
      icon: <CheckCircle className="h-6 w-6 text-yellow-400" />,
      progress: 71,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "points" as const,
        amount: 150,
      },
    },
    {
      id: "personal-3",
      name: "Level Up Master",
      description: "Reach level 10",
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      progress: 80,
      completed: false,
      tier: "gold" as AchievementTier,
      reward: {
        type: "title" as const,
        name: "The Dedicated",
      },
    },
  ],
  efficiency: [
    // Add efficiency achievements
    {
      id: "efficiency-1",
      name: "Speed Demon",
      description: "Complete 5 quests in under 30 minutes each",
      icon: <Zap className="h-6 w-6 text-cyan-400" />,
      progress: 40,
      completed: false,
      tier: "silver" as AchievementTier,
      reward: {
        type: "buff" as const,
        name: "Lightning Fast",
        description: "+10% quest completion speed for 24 hours",
      },
    },
    {
      id: "efficiency-2",
      name: "Multitasker",
      description: "Complete 3 quests simultaneously",
      icon: <Zap className="h-6 w-6 text-cyan-400" />,
      progress: 0,
      completed: false,
      tier: "gold" as AchievementTier,
      reward: {
        type: "title" as const,
        name: "The Efficient",
      },
    },
  ],
};

// Function to get achievements by selected category
const getAchievementsByCategory = (categoryId: CategoryId): Achievement[] => {
  return mockAchievementsByCategory[categoryId] || [];
};

// Function to get achievement progress text
const getAchievementProgressText = (achievement: Achievement): string => {
  if (achievement.completed) {
    return "Completed";
  }

  if (achievement.progress > 0) {
    return `${achievement.progress}% complete`;
  }

  return "Not started";
};

// Function to get tier badge
const getTierBadge = (tier: AchievementTier): React.ReactNode => {
  switch (tier) {
    case "bronze":
      return (
        <Badge className="bg-amber-700/20 text-amber-700 hover:bg-amber-700/30">
          {tier}
        </Badge>
      );
    case "silver":
      return (
        <Badge className="bg-slate-400/20 text-slate-400 hover:bg-slate-400/30">
          {tier}
        </Badge>
      );
    case "gold":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
          {tier}
        </Badge>
      );
    case "platinum":
      return (
        <Badge className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
          {tier}
        </Badge>
      );
    default:
      return <Badge>{tier}</Badge>;
  }
};

// Function to format achievement reward description
const getAchievementRewardText = (reward: Reward): string => {
  switch (reward.type) {
    case "xp":
      return `${reward.amount} XP`;
    case "points":
      return `${reward.amount} Points`;
    case "title":
      return `Title: ${reward.name}`;
    case "buff":
      return reward.description;
    default:
      return "";
  }
};

// Function to get category background color
const getCategoryBgColor = (color: string): string => {
  switch (color) {
    case "green":
      return "bg-gradient-to-br from-green-900/20 to-green-700/10";
    case "blue":
      return "bg-gradient-to-br from-blue-900/20 to-blue-700/10";
    case "red":
      return "bg-gradient-to-br from-red-900/20 to-red-700/10";
    case "purple":
      return "bg-gradient-to-br from-purple-900/20 to-purple-700/10";
    case "yellow":
      return "bg-gradient-to-br from-yellow-900/20 to-yellow-700/10";
    case "cyan":
      return "bg-gradient-to-br from-cyan-900/20 to-cyan-700/10";
    default:
      return "bg-secondary/10";
  }
};

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const router = useRouter();

  const achievements = selectedCategory
    ? getAchievementsByCategory(selectedCategory.id)
    : [];

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold ai-gradient-text">Achievements</h1>
          <p className="text-muted-foreground">
            Complete achievements to earn rewards
          </p>
        </div>
      </div>

      {!selectedCategory ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementCategories.map((category) => (
              <Card
                key={category.id}
                className={`overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-200 ${getCategoryBgColor(
                  category.color
                )}`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4">{category.icon}</div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <p className="text-muted-foreground text-sm mb-3">
                        {category.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {category.completedAchievements}/
                            {category.totalAchievements}
                          </span>
                        </div>

                        <Progress
                          value={
                            (category.completedAchievements /
                              category.totalAchievements) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Medal className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="font-semibold">Your Achievement Stats</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">
                    {achievementCategories.reduce(
                      (sum, cat) => sum + cat.completedAchievements,
                      0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>

                <div className="bg-secondary/10 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">
                    {achievementCategories.reduce(
                      (sum, cat) => sum + cat.totalAchievements,
                      0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>

                <div className="bg-secondary/10 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">
                    {Math.round(
                      (achievementCategories.reduce(
                        (sum, cat) => sum + cat.completedAchievements,
                        0
                      ) /
                        achievementCategories.reduce(
                          (sum, cat) => sum + cat.totalAchievements,
                          0
                        )) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completion
                  </div>
                </div>

                <div className="bg-secondary/10 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold ai-gradient-text">
                    1,250
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Points Earned
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className={`${getCategoryBgColor(selectedCategory.color)}`}>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="mr-4">{selectedCategory.icon}</div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {selectedCategory.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {selectedCategory.completedAchievements}/
                        {selectedCategory.totalAchievements}
                      </span>
                    </div>

                    <Progress
                      value={
                        (selectedCategory.completedAchievements /
                          selectedCategory.totalAchievements) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`overflow-hidden border-${
                  achievement.completed ? "primary/30" : "border"
                } cursor-pointer hover:border-primary/50 transition-all quest-item-hover`}
                onClick={() => {
                  setSelectedAchievement(achievement);
                  setIsAchievementDialogOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-lg mr-4 ${
                        achievement.completed
                          ? "bg-green-500/20"
                          : "bg-secondary/20"
                      }`}
                    >
                      {achievement.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium flex items-center">
                          {achievement.name}
                          {achievement.completed && (
                            <Badge className="ml-2 bg-green-500/20 text-green-400 hover:bg-green-500/30">
                              Completed
                            </Badge>
                          )}
                        </div>

                        {getTierBadge(achievement.tier)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{getAchievementProgressText(achievement)}</span>
                          <span>{achievement.progress}%</span>
                        </div>

                        <Progress
                          value={achievement.progress}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => setSelectedCategory(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Button>
          </div>
        </div>
      )}

      {/* Achievement Details Dialog */}
      <Dialog
        open={isAchievementDialogOpen}
        onOpenChange={setIsAchievementDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
            <DialogDescription>
              Learn more about this achievement and its rewards
            </DialogDescription>
          </DialogHeader>

          {selectedAchievement && (
            <div className="space-y-4">
              <div className="flex items-start">
                <div
                  className={`p-3 rounded-lg mr-4 ${
                    selectedAchievement.completed
                      ? "bg-green-500/20"
                      : "bg-secondary/20"
                  }`}
                >
                  {selectedAchievement.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">
                      {selectedAchievement.name}
                    </h3>
                    {getTierBadge(selectedAchievement.tier)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedAchievement.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{selectedAchievement.progress}%</span>
                    </div>

                    <Progress
                      value={selectedAchievement.progress}
                      className="h-2"
                    />
                  </div>

                  <div className="bg-secondary/20 p-4 rounded-lg mb-3">
                    <div className="flex items-center mb-2">
                      <Gift className="h-5 w-5 mr-2 text-purple-400" />
                      <span className="font-semibold">Reward</span>
                    </div>

                    <div className="text-sm">
                      {getAchievementRewardText(selectedAchievement.reward)}
                    </div>
                  </div>

                  {selectedAchievement.completed ? (
                    <div className="flex items-center text-green-400">
                      <CircleCheck className="h-4 w-4 mr-1" />
                      <span>Completed! Reward claimed.</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <Info className="h-4 w-4 mr-1" />
                      <span>
                        Complete this achievement to claim your reward.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsAchievementDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
