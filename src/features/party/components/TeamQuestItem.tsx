"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import type { GlobalTeamQuest } from "../types";

interface TeamQuestItemProps {
  quest: GlobalTeamQuest;
}

export default function TeamQuestItem({ quest }: TeamQuestItemProps) {
  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">{difficulty}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">{difficulty}</Badge>;
      case 'hard':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">{difficulty}</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden quest-item-hover cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                <Target className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h3 className="font-medium">{quest.title}</h3>
                <p className="text-sm text-muted-foreground">{quest.description}</p>
              </div>
            </div>

            <div className="pl-10 space-y-3">
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                <span>Duration: {quest.requirements.duration}</span>
                <span>•</span>
                <span>Min Level: {quest.requirements.minTeamLevel}</span>
                <span>•</span>
                <span>Min Members: {quest.requirements.minMembers}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {quest.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {getDifficultyBadge(quest.requirements.difficulty)}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-medium">Rewards:</h4>
                <div className="flex items-center text-xs space-x-2">
                  <span className="text-blue-400">{quest.rewards.xp} XP</span>
                  <span>•</span>
                  <span className="text-yellow-400">{quest.rewards.points} Points</span>
                  <span>•</span>
                  <span className="text-purple-400">{quest.rewards.buff}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="mt-1"
          >
            Start Quest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
