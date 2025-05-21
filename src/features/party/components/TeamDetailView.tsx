"use client";

import { Button } from "@src/components/ui/button";
import { Card, CardContent } from "@src/components/ui/card";
import { Badge } from "@src/components/ui/badge";
import { Progress } from "@src/components/ui/progress";
import { Avatar, AvatarFallback } from "@src/components/ui/avatar";
import { Input } from "@src/components/ui/input";
import { ScrollArea } from "@src/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@src/components/ui/tabs";
import {
  Check, ChevronLeft, Clock, Crown, Info, Shield, Target, Users
} from "lucide-react";
import { useTeamDetails } from "../hook/api";
import type { Team } from "../types";
import { LoadingState, ErrorState } from "@src/components/shared";
import React from "react";

// Map icon string names to Lucide React components
const benefitIconMap: Record<string, React.ReactNode> = {
  Shield: <Shield className="h-5 w-5 text-blue-400" />,
  Crown: <Crown className="h-5 w-5 text-yellow-400" />,
  Users: <Users className="h-5 w-5 text-blue-400" />,
  Target: <Target className="h-5 w-5 text-purple-400" />,
  Check: <Check className="h-5 w-5 text-green-400" />,
  Clock: <Clock className="h-5 w-5 text-blue-400" />,
  // Add more mappings as needed
};

interface TeamDetailViewProps {
  team: Team;
  onBack: () => void;
  onJoin: (team: Team) => void;
}

export default function TeamDetailView({ team, onBack, onJoin }: TeamDetailViewProps) {
  // Fetch detailed information about the team
  const { team: teamDetail, loading, error } = useTeamDetails(team.id);

  // Get difficulty badge (helper function)
  const getDifficultyBadge = (difficulty: string | undefined) => {
    if (!difficulty) return null;

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

  if (loading) {
    return (
      <div>
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Teams
        </Button>

        <LoadingState text="Loading team details..." itemCount={3} itemHeight={80} />
      </div>
    );
  }

  if (error || !teamDetail) {
    return (
      <div>
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Teams
        </Button>

        <ErrorState
          title="Team Not Found"
          message={error?.message || "Failed to load team details"}
          onRetry={onBack}
          actionText="Return to Teams"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        className="mb-2"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Teams
      </Button>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-secondary/30 rounded-lg flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-400" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-medium">{teamDetail?.name ?? ""}</h3>
                <p className="text-sm text-muted-foreground">{teamDetail?.description ?? ""}</p>

                <div className="flex items-center text-xs text-muted-foreground space-x-2 mt-1">
                  <span>Level {teamDetail?.level ?? ""}</span>
                  <span>•</span>
                  <span>
                    {teamDetail?.members?.length ?? 0}/{team?.maxMembers ?? 0} members
                  </span>
                  <span>•</span>
                  <span>
                    Led by {teamDetail?.members?.find(m => m.isLeader)?.name || team?.leader?.name || ""}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="ai-gradient-bg"
              onClick={() => onJoin(team)}
              disabled={team?.isFull}
            >
              {team?.isFull ? "Team Full" : "Request to Join"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Team Members
          </h3>

          <div className="space-y-3">
            {teamDetail?.members?.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>{member.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium">{member.name}</div>
                        {member.isLeader && (
                          <Badge className="ml-2 bg-amber-500/20 text-amber-400">
                            <Crown className="h-3 w-3 mr-1" />
                            Leader
                          </Badge>
                        )}
                        {member.status && (
                          <Badge
                            variant="outline"
                            className={`ml-2 ${
                              member.status === 'online'
                                ? 'text-green-400'
                                : member.status === 'away'
                                ? 'text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {member.status}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>Level {member.level}</span>
                        <span className="mx-2">•</span>
                        <span>{member.role}</span>
                        {member.joinedAt && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Joined {member.joinedAt}</span>
                          </>
                        )}
                      </div>

                      {member.specialties && member.specialties.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Specialties:</span>
                          <div className="ml-1 flex flex-wrap gap-1">
                            {member.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {member.questContribution !== undefined && (
                      <div className="text-right">
                        <div className="font-medium text-yellow-400">{member.questContribution}%</div>
                        <div className="text-xs text-muted-foreground">Contribution</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {teamDetail?.pendingRequests && teamDetail.pendingRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Pending Requests</h3>

              <div className="space-y-3">
                {teamDetail.pendingRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden bg-secondary/5">
                    <CardContent className="p-3">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{request.avatar}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="font-medium">{request.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>Level {request.level}</span>
                            <span className="mx-2">•</span>
                            <span>{request.role}</span>
                          </div>
                          <div className="text-sm mt-1">{request.message}</div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="h-8">Decline</Button>
                          <Button size="sm" className="h-8 bg-green-500">Accept</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-4">
          <h3 className="text-lg font-medium">Active Team Quests</h3>

          <div className="space-y-4">
            {teamDetail?.teamQuests && teamDetail.teamQuests.length > 0 ? (
              teamDetail.teamQuests.map((quest) => (
                <Card key={quest.id} className="overflow-hidden">
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
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span>{quest.progress}%</span>
                            </div>
                            <Progress value={quest.progress} className="h-2" />
                          </div>

                          <div className="flex items-center text-xs text-muted-foreground space-x-2">
                            <span>{quest.deadline}</span>
                            <span>•</span>
                            <span>{quest.participants}/{quest.requiredParticipants} participants</span>
                            <span>•</span>
                            {getDifficultyBadge(quest.difficulty)}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-medium">Rewards:</h4>
                            <div className="flex items-center text-xs space-x-2">
                              <span className="text-blue-400">{quest.reward?.xp} XP</span>
                              <span>•</span>
                              <span className="text-yellow-400">{quest.reward?.points} Points</span>
                              {quest.reward?.buff && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-400">{quest.reward.buff}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="mt-1"
                      >
                        Contribute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No active quests at the moment.</p>
            )}
          </div>

          <h3 className="text-lg font-medium mt-6">Completed Quests</h3>

          <div className="space-y-3">
            {teamDetail?.completedQuests && teamDetail.completedQuests.length > 0 ? (
              teamDetail.completedQuests.map((quest) => (
                <Card key={quest.id} className="overflow-hidden bg-secondary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                        <Check className="h-5 w-5 text-green-400" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium">{quest.title}</h3>
                        <p className="text-sm text-muted-foreground">{quest.description}</p>

                        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-2">
                          <span>Completed {quest.completedOn}</span>
                          <span>•</span>
                          <span>{quest.participants} participants</span>
                          <span>•</span>
                          <span className="text-blue-400">{quest.reward?.xp} XP</span>
                          <span>•</span>
                          <span className="text-yellow-400">{quest.reward?.points} Points</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No completed quests yet.</p>
            )}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[400px] flex flex-col">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    <span className="font-medium">Team Chat</span>
                  </div>

                  <Badge variant="outline">
                    {teamDetail?.members?.filter(m => m.status === 'online').length || 0} online
                  </Badge>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {teamDetail?.chat && teamDetail.chat.length > 0 ? (
                      teamDetail.chat.map((message) => (
                        <div key={message.id} className="flex items-start">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{message.avatar}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-sm">{message.userName}</span>
                              <span className="text-xs text-muted-foreground ml-2">{message.timestamp}</span>
                            </div>
                            <p className="text-sm mt-1">{message.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-10">No messages yet. Be the first to say hello!</p>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t border-border">
                  <div className="flex items-center">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1 mr-2"
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Team Benefits</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teamDetail?.benefits && teamDetail.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-secondary/10 rounded-lg">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      {/* Render icon from string if present, fallback to Shield */}
                      {typeof benefit.icon === "string"
                        ? (benefitIconMap[benefit.icon] || <Shield className="h-5 w-5 text-blue-400" />)
                        : (benefit.icon || <Shield className="h-5 w-5 text-blue-400" />)}
                    </div>

                    <div>
                      <div className="font-medium">{benefit.title}</div>
                      <div className="text-xs text-muted-foreground">{benefit.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Team Progress</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Level {teamDetail?.level ?? ""}</span>
                    <span>{teamDetail?.xp ?? 0}/{teamDetail?.xpToNextLevel ?? 0} XP</span>
                  </div>
                  <Progress value={(teamDetail?.xp && teamDetail?.xpToNextLevel) ? (teamDetail.xp/teamDetail.xpToNextLevel) * 100 : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">{teamDetail?.xpToNextLevel && teamDetail?.xp ? teamDetail.xpToNextLevel - teamDetail.xp : 0} XP needed for next level</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-secondary/10 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">{(teamDetail?.completedQuests?.length || 0) + 3}</div>
                    <div className="text-xs text-muted-foreground">Quests Completed</div>
                  </div>

                  <div className="bg-secondary/10 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">{teamDetail?.achievements?.filter(a => a.completed).length || 0}/{teamDetail?.achievements?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Team Achievements</h3>

              <div className="space-y-3">
                {teamDetail?.achievements && teamDetail.achievements.length > 0 ? (
                  teamDetail.achievements.map((achievement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {achievement.completed ? (
                            <Check className="h-4 w-4 mr-2 text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 mr-2 text-blue-400" />
                          )}
                          <span className="font-medium">{achievement.title}</span>
                        </div>
                        <span className="text-xs">{achievement.progress}%</span>
                      </div>

                      <p className="text-xs text-muted-foreground">{achievement.description}</p>

                      <div className="space-y-1">
                        <Progress value={achievement.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">Reward: {achievement.reward}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No achievements yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
