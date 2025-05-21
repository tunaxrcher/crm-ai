"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTeamDetails } from "@/features/party/hook/api";
import TeamDetailView from "@/features/party/components/TeamDetailView";
import { Team } from "@/features/party/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PartyDetailWrapperProps {
  teamId: string;
}

export default function PartyDetailWrapper({ teamId }: PartyDetailWrapperProps) {
  const router = useRouter();
  const { team, loading, error } = useTeamDetails(teamId);
  const [basicTeam, setBasicTeam] = useState<Team | null>(null);

  // Create a basic team object for the TeamDetailView when we have data
  useEffect(() => {
    if (team) {
      setBasicTeam({
        id: team.id,
        name: team.name,
        description: team.description,
        members: team.members?.length || 0,
        maxMembers: 5, // Default value
        level: team.level || 1,
        xp: team.xp || 0,
        xpToNextLevel: team.xpToNextLevel || 1000,
        joinRequirement: "",
        leader: team.members?.find(m => m.isLeader) || {
          id: "unknown",
          name: "Unknown",
          level: 1,
          role: "Member",
          avatar: "?"
        },
        tags: [],
        activity: "active",
        completedQuests: team.completedQuests?.length || 0,
        achievements: team.achievements?.length || 0,
        isFull: (team.members?.length || 0) >= 5,
        isPrivate: false
      });
    }
  }, [team]);

  const handleBack = () => {
    router.push("/party");
  };

  const handleJoinTeam = (team: Team) => {
    // Normally would handle join request, for now just navigate back
    console.log("Would join team:", team.id);
    router.push("/party");
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 pb-20">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !team) {
    return (
      <div className="p-4 pb-20">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Info className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">Team Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The team you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={handleBack}>Return to Teams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we have a team but no basicTeam yet, show a loading state
  if (!basicTeam) {
    return (
      <div className="p-4 pb-20">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">Loading team details...</div>
      </div>
    );
  }

  // Successfully loaded team
  return (
    <div className="p-4 pb-20">
      <TeamDetailView
        team={basicTeam}
        onBack={handleBack}
        onJoin={handleJoinTeam}
      />
    </div>
  );
}
