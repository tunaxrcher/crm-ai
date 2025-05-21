"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Clock, Gift, Info, Lock, Plus, Sparkles, Star, Trophy, Unlock } from "lucide-react";

// Mock reward data
const mockRewards = [
  {
    id: "reward-1",
    name: "XP Boost",
    description: "Gain 50% more XP from your next 3 quests",
    icon: <Sparkles className="h-10 w-10 text-purple-400" />,
    cost: 500,
    type: "buff",
    unlocked: true
  },
  {
    id: "reward-2",
    name: "Time Extension",
    description: "Extend the deadline of any quest by 24 hours",
    icon: <Clock className="h-10 w-10 text-blue-400" />,
    cost: 300,
    type: "buff",
    unlocked: true
  },
  {
    id: "reward-3",
    name: "Title: The Diligent",
    description: "Special title to display on your profile",
    icon: <Trophy className="h-10 w-10 text-yellow-400" />,
    cost: 1000,
    type: "title",
    unlocked: true
  },
  {
    id: "reward-4",
    name: "Custom Avatar Frame",
    description: "Unique frame for your character portrait",
    icon: <Award className="h-10 w-10 text-green-400" />,
    cost: 2000,
    type: "cosmetic",
    unlocked: false,
    requiredLevel: 15
  },
  {
    id: "reward-5",
    name: "Stat Reset",
    description: "Reset and reallocate all your stat points",
    icon: <Unlock className="h-10 w-10 text-red-400" />,
    cost: 1500,
    type: "special",
    unlocked: false,
    requiredLevel: 20
  }
];

// Mock achievements data
const mockAchievements = [
  {
    id: "achievement-1",
    name: "First Quest",
    description: "Complete your first quest",
    icon: "🏆",
    progress: 100,
    completed: true,
    reward: {
      type: "xp",
      amount: 100
    }
  },
  {
    id: "achievement-2",
    name: "Daily Streak",
    description: "Complete quests for 7 consecutive days",
    icon: "⚡",
    progress: 71, // 5 out of 7 days
    completed: false,
    reward: {
      type: "title",
      name: "The Consistent"
    }
  },
  {
    id: "achievement-3",
    name: "Level Up",
    description: "Reach level 10",
    icon: "🌟",
    progress: 80, // Level 8 out of 10
    completed: false,
    reward: {
      type: "points",
      amount: 500
    }
  },
  {
    id: "achievement-4",
    name: "Marketing Guru",
    description: "Complete 20 marketing quests",
    icon: "📢",
    progress: 65, // 13 out of 20 quests
    completed: false,
    reward: {
      type: "buff",
      name: "Marketing Excellence",
      description: "+10% to DEX and INT stats for 7 days"
    }
  },
  {
    id: "achievement-5",
    name: "Team Player",
    description: "Participate in 5 team quests",
    icon: "👥",
    progress: 60, // 3 out of 5 team quests
    completed: false,
    reward: {
      type: "points",
      amount: 300
    }
  },
  {
    id: "achievement-6",
    name: "Flawless Execution",
    description: "Complete a quest with perfect ratings in all stats",
    icon: "✨",
    progress: 0,
    completed: false,
    reward: {
      type: "title",
      name: "The Perfect"
    }
  }
];

// Mock inventory data
const mockInventory = [
  {
    id: "inventory-1",
    name: "XP Boost",
    description: "Gain 50% more XP from your next 3 quests",
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    quantity: 2,
    type: "buff",
    usable: true
  },
  {
    id: "inventory-2",
    name: "Title: The Diligent",
    description: "Special title to display on your profile",
    icon: <Trophy className="h-6 w-6 text-yellow-400" />,
    quantity: 1,
    type: "title",
    usable: true,
    active: false
  }
];

export default function RewardPage() {
  const [activeTab, setActiveTab] = useState("rewards");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  // Mock user points
  const userPoints = 750;
  const userLevel = 8;

  // Format reward type badge
  const getRewardTypeBadge = (type: string) => {
    switch(type) {
      case 'buff':
        return <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">{type}</Badge>;
      case 'title':
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">{type}</Badge>;
      case 'cosmetic':
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">{type}</Badge>;
      case 'special':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">{type}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Format achievement reward description
  const getAchievementRewardText = (reward: any) => {
    switch(reward.type) {
      case 'xp':
        return `${reward.amount} XP`;
      case 'points':
        return `${reward.amount} Points`;
      case 'title':
        return `Title: ${reward.name}`;
      case 'buff':
        return reward.description;
      default:
        return '';
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold ai-gradient-text">Rewards</h1>
          <div className="flex items-center">
            <Star className="h-5 w-5 mr-1 text-yellow-400" />
            <span className="font-semibold">{userPoints} Points</span>
          </div>
        </div>
        <p className="text-muted-foreground">Earn and spend points on rewards</p>
      </div>

      <Tabs defaultValue="rewards" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="rewards">Shop</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Rewards Shop Tab */}
        <TabsContent value="rewards" className="space-y-4">
          {mockRewards.map((reward) => (
            <Card key={reward.id} className={`${reward.unlocked ? 'quest-card' : 'bg-secondary/10 opacity-80'}`}>
              <div className="flex p-4">
                <div className="mr-4 flex items-center justify-center">
                  {reward.unlocked ? (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      {reward.icon}
                    </div>
                  ) : (
                    <div className="p-3 bg-secondary/20 rounded-lg relative">
                      {reward.icon}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold">
                      {reward.name}
                      {!reward.unlocked && (
                        <Badge variant="outline" className="ml-2">
                          Lvl {reward.requiredLevel}+
                        </Badge>
                      )}
                    </div>
                    {getRewardTypeBadge(reward.type)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span className="font-medium text-yellow-400">{reward.cost} Points</span>
                    </div>

                    <Button
                      size="sm"
                      variant={reward.unlocked && userPoints >= reward.cost ? "default" : "outline"}
                      className={reward.unlocked && userPoints >= reward.cost ? "ai-gradient-bg" : ""}
                      disabled={!reward.unlocked || userPoints < reward.cost}
                      onClick={() => {
                        setSelectedReward(reward);
                        setIsRewardDialogOpen(true);
                      }}
                    >
                      {userPoints >= reward.cost ? "Purchase" : "Not Enough Points"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {mockAchievements.map((achievement) => (
            <Card key={achievement.id} className="overflow-hidden">
              <div className="flex p-4">
                <div className="mr-4 flex items-center justify-center">
                  <div className={`p-3 rounded-lg flex items-center justify-center text-3xl ${achievement.completed ? 'bg-green-500/20' : 'bg-secondary/20'}`}>
                    {achievement.icon}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold flex items-center">
                      {achievement.name}
                      {achievement.completed && (
                        <Badge className="ml-2 bg-green-500/20 text-green-400 hover:bg-green-500/30">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>

                  <div className="flex items-center text-sm">
                    <Gift className="h-4 w-4 mr-1 text-purple-400" />
                    <span>Reward: {getAchievementRewardText(achievement.reward)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          {mockInventory.length > 0 ? (
            <div className="space-y-4">
              {mockInventory.map((item) => (
                <Card key={item.id} className="quest-card">
                  <div className="flex p-4">
                    <div className="mr-4 flex items-center justify-center">
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        {item.icon}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold flex items-center">
                          {item.name}
                          <Badge className="ml-2" variant="outline">x{item.quantity}</Badge>
                          {item.active && (
                            <Badge className="ml-2 bg-green-500/20 text-green-400">
                              Active
                            </Badge>
                          )}
                        </div>
                        {getRewardTypeBadge(item.type)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

                      <Button
                        size="sm"
                        variant={item.usable ? "default" : "outline"}
                        className={item.usable ? "ai-gradient-bg" : ""}
                        disabled={!item.usable || item.active}
                        onClick={() => {
                          setSelectedInventoryItem(item);
                          setIsInventoryDialogOpen(true);
                        }}
                      >
                        {item.active ? "Active" : item.usable ? "Use" : "Cannot Use"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <Info className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Your inventory is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase rewards from the shop to add them to your inventory
                </p>
                <Button onClick={() => setActiveTab("rewards")} className="ai-gradient-bg">
                  Go to Shop
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase Reward Dialog */}
      <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Reward</DialogTitle>
            <DialogDescription>
              Confirm your purchase details
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-3 bg-secondary/30 rounded-lg mr-4">
                  {selectedReward.icon}
                </div>

                <div>
                  <div className="font-semibold mb-1">{selectedReward.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedReward.description}</div>
                </div>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span>Cost:</span>
                  <div className="flex items-center font-semibold">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{selectedReward.cost} Points</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Your balance after purchase:</span>
                  <div className="flex items-center font-semibold">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{userPoints - selectedReward.cost} Points</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setIsRewardDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="ai-gradient-bg">
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use Inventory Item Dialog */}
      <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Use Item</DialogTitle>
            <DialogDescription>
              Confirm you want to use this item
            </DialogDescription>
          </DialogHeader>

          {selectedInventoryItem && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-3 bg-secondary/30 rounded-lg mr-4">
                  {selectedInventoryItem.icon}
                </div>

                <div>
                  <div className="font-semibold mb-1">{selectedInventoryItem.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedInventoryItem.description}</div>
                </div>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="flex items-center text-sm">
                  <Info className="h-4 w-4 mr-2 text-blue-400" />
                  {selectedInventoryItem.type === 'buff'
                    ? "This buff will activate immediately upon use."
                    : selectedInventoryItem.type === 'title'
                    ? "This title will be applied to your profile."
                    : "This item will be consumed upon use."}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setIsInventoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="ai-gradient-bg">
              Use Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
