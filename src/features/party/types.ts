import React from 'react';

export interface TeamMember {
  id: string;
  name: string;
  level: number;
  role: string;
  avatar: string;
  isLeader?: boolean;
  status?: 'online' | 'offline' | 'away';
  joinedAt?: string;
  questContribution?: number;
  specialties?: string[];
}

export interface PendingRequest {
  id: string;
  name: string;
  level: number;
  role: string;
  avatar: string;
  message: string;
}

export interface TeamQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  reward: {
    xp: number;
    points: number;
    buff?: string;
  };
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  participants: number;
  requiredParticipants: number;
}

export interface CompletedTeamQuest {
  id: string;
  title: string;
  description: string;
  completedOn: string;
  reward: {
    xp: number;
    points: number;
  };
  participants: number;
}

export interface TeamChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  message: string;
  timestamp: string;
}

export interface TeamBenefit {
  title: string;
  description: string;
  icon?: string | React.ReactNode;
}

export interface TeamAchievement {
  title: string;
  description: string;
  progress: number;
  reward: string;
  completed?: boolean;
}

export interface TeamDetail {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  pendingRequests: PendingRequest[];
  teamQuests: TeamQuest[];
  completedQuests: CompletedTeamQuest[];
  chat: TeamChatMessage[];
  benefits: TeamBenefit[];
  achievements: TeamAchievement[];
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  joinRequirement: string;
  leader: {
    id: string;
    name: string;
    level: number;
    role: string;
    avatar: string;
  };
  tags: string[];
  activity: 'very-active' | 'active' | 'semi-active' | 'inactive';
  completedQuests: number;
  achievements: number;
  isFull: boolean;
  isPrivate: boolean;
}

export interface GlobalTeamQuest {
  id: string;
  title: string;
  description: string;
  rewards: {
    xp: number;
    points: number;
    buff: string;
  };
  requirements: {
    minTeamLevel: number;
    minMembers: number;
    duration: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  tags: string[];
}
