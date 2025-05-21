export type RankingPeriod = 'all-time' | 'weekly';
export type CharacterClass = 'all' | 'marketing' | 'sales' | 'accounting';

export interface ClassConfig {
  name: string;
  icon: React.ReactNode;
}

export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  title: string;
  class: string;
  position: number;
  change: number;
}

export interface RankingData {
  [period: string]: {
    [characterClass: string]: RankingUser[];
  };
}

export interface GetRankingsParams {
  period: RankingPeriod;
  characterClass: CharacterClass;
}

export interface GetRankingsResponse {
  rankings: RankingUser[];
  currentUser?: RankingUser;
  topUser?: RankingUser;
}
