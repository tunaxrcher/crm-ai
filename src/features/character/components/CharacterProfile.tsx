"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase } from "lucide-react";
import { Character, JobClass } from "../types";

interface CharacterProfileProps {
  character: Character;
  portrait: string;
  jobClass?: JobClass | null;
  xpPercentage: number;
  onAllocateStats: () => void;
}

export default function CharacterProfile({
  character,
  portrait,
  jobClass,
  xpPercentage,
  onAllocateStats
}: CharacterProfileProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative mb-4">
        <div className="rounded-full overflow-hidden w-24 h-24 border-4 ai-gradient-border">
          <img
            src={portrait}
            alt={character.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://same-assets.com/placeholder-avatar.png";
            }}
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 border-2 border-background ai-gradient-border">
          <Badge className="ai-gradient-bg border-0">Lvl {character.level}</Badge>
        </div>
      </div>

      <h1 className="text-xl font-bold">{character.name}</h1>

      <div className="flex items-center mt-1 mb-2">
        <Briefcase className="h-4 w-4 mr-1 text-blue-400" />
        <p className="text-blue-400">{character.jobClassName}</p>
        <span className="mx-1 text-muted-foreground">•</span>
        <p className="text-muted-foreground">{character.title}</p>
      </div>

      <div className="flex items-center mb-2">
        <Badge variant="outline" className="bg-secondary/30">
          Class {character.currentJobLevel}
        </Badge>
        {jobClass && (
          <div className="text-xs ml-2 text-muted-foreground">
            {character.currentJobLevel < 6 && (
              <>
                Next Class: <span className="text-primary">Lvl {jobClass.levels[character.currentJobLevel]?.requiredCharacterLevel || "???"}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center w-full max-w-xs">
        <span className="text-xs text-muted-foreground mr-2">Level {character.level}</span>
        <Progress value={xpPercentage} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground ml-2">Level {character.level + 1}</span>
      </div>

      <div className="mt-2 flex items-center text-sm">
        <Award className="h-4 w-4 mr-1 text-yellow-400" />
        <span className="text-yellow-400 font-medium">
          {character.currentXP} / {character.nextLevelXP} XP
        </span>
      </div>

      {character.statPoints > 0 && (
        <Button
          variant="outline"
          className="mt-4 ai-gradient-text ai-gradient-border"
          onClick={onAllocateStats}
        >
          จัดสรร {character.statPoints} คะแนนสถิติ
        </Button>
      )}
    </div>
  );
}
