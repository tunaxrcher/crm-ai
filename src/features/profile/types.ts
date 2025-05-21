export interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ProfileAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedOn?: Date;
}

export interface ProfileStats {
  AGI: number; // Speed, responsiveness
  STR: number; // Heavy workload handling
  DEX: number; // Precision, accuracy
  VIT: number; // Consistency, endurance
  INT: number; // Planning, analysis
}

export interface QuestStats {
  totalCompleted: number;
  dailyCompleted: number;
  weeklyCompleted: number;
  averageRating: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  title: string;
  class: string;
  classIcon: string;
  position: number;
  change: number;
  joinedDate: string;
  about: string;
  achievements: ProfileAchievement[];
  stats: ProfileStats;
  questStats: QuestStats;
  badges: ProfileBadge[];
}

export interface GetProfileParams {
  userId: string;
}

export interface GetProfileResponse {
  profile: UserProfile;
}
