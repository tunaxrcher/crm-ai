"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { Achievement } from "../types";

interface AchievementListProps {
  achievements: Achievement[];
}

export default function AchievementList({ achievements }: AchievementListProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-400" />
          Achievements & ตำแหน่ง
        </CardTitle>
        <CardDescription>
          Achievements และตำแหน่งพิเศษที่คุณได้รับ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center p-3 rounded-lg ${achievement.earned ? 'bg-secondary/20' : 'bg-secondary/5 opacity-60'}`}
            >
              <div className="text-2xl mr-3">{achievement.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center">
                  {achievement.name}
                  {achievement.earned && (
                    <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-500">
                      ได้รับแล้ว
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
