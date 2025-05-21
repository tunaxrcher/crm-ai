"use client";

import { Award, Clock3, Check } from "lucide-react";
import { CompletedQuest } from "../types";

interface CompletedQuestListProps {
  completedQuests: CompletedQuest[];
}

export default function CompletedQuestList({ completedQuests }: CompletedQuestListProps) {
  return (
    <div className="space-y-4">
      {completedQuests.map((quest) => (
        <div
          key={quest.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10"
        >
          <div className="flex-1">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <h3 className="text-base font-medium text-muted-foreground">
                {quest.title}
              </h3>
            </div>

            <div className="flex items-center mt-1 ml-4">
              <Award className="h-3 w-3 mr-1 text-yellow-400" />
              <span className="text-xs text-yellow-400">{quest.xpEarned} XP</span>
              <span className="mx-2 text-xs text-muted-foreground">•</span>
              <Clock3 className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Completed {new Date(quest.completedOn).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="ml-2">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
