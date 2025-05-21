"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trophy, Award, Star } from 'lucide-react';

// Types
interface JobLevel {
  level: number;
  title: string;
  requiredCharacterLevel: number;
}

interface JobClass {
  id: string;
  name: string;
  description?: string;
  levels: JobLevel[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  reward?: string;
  unlocked: boolean;
  date?: Date;
}

interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  jobClassId: string;
  jobClassName: string;
  currentJobLevel: number;
  stats: {
    [key: string]: number;
  };
  achievements: Achievement[];
}

interface CharacterContextType {
  character: Character | null;
  jobClass: JobClass | null;
  loading: boolean;
  error: Error | null;
  addXp: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  showLevelUpAnimation: () => void;
  showAchievementAnimation: (achievement: Achievement) => void;
  setJobClass: (jobClass: JobClass) => void;
}

// Create context
const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

// Default job class data
const defaultJobClass: JobClass = {
  id: 'jobclass-marketing',
  name: 'นักการตลาด',
  description: 'ผู้เชี่ยวชาญด้านการวางแผนและดำเนินกลยุทธ์การตลาด',
  levels: [
    {
      level: 1,
      requiredCharacterLevel: 1,
      title: 'นักการตลาด'
    },
    {
      level: 2,
      requiredCharacterLevel: 10,
      title: 'นักการตลาดมืออาชีพ'
    },
    {
      level: 3,
      requiredCharacterLevel: 35,
      title: 'เซียนการตลาด'
    },
    {
      level: 4,
      requiredCharacterLevel: 60,
      title: 'เทพการตลาด'
    },
    {
      level: 5,
      requiredCharacterLevel: 80,
      title: 'ปรมาจารย์ด้านการตลาด'
    },
    {
      level: 6,
      requiredCharacterLevel: 100,
      title: 'เทพเจ้าการตลาด'
    }
  ]
};

// Default character data
const defaultCharacter: Character = {
  id: '1',
  name: 'Your Character',
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  jobClassId: defaultJobClass.id,
  jobClassName: defaultJobClass.name,
  currentJobLevel: 1,
  stats: {
    AGI: 5,
    STR: 5,
    DEX: 5,
    VIT: 5,
    INT: 5,
  },
  achievements: [
    {
      id: 'first-quest',
      name: 'First Steps',
      description: 'Complete your first quest',
      icon: <Trophy className="h-10 w-10 text-amber-400" />,
      reward: '50 XP + "Beginner" Title',
      unlocked: false,
    },
    {
      id: 'five-quests',
      name: 'Quest Addict',
      description: 'Complete 5 quests',
      icon: <Star className="h-10 w-10 text-yellow-400" />,
      reward: '100 XP + Special Badge',
      unlocked: false,
    },
    {
      id: 'first-team',
      name: 'Team Player',
      description: 'Join your first team',
      icon: <Award className="h-10 w-10 text-blue-400" />,
      reward: '75 XP + Team Leader Badge',
      unlocked: false,
    },
  ],
};

// Helper to get job level based on character level
const getJobLevelForCharacter = (jobClass: JobClass, characterLevel: number): number => {
  for (let i = jobClass.levels.length - 1; i >= 0; i--) {
    if (characterLevel >= jobClass.levels[i].requiredCharacterLevel) {
      return jobClass.levels[i].level;
    }
  }
  return 1; // Default to first level
};

// Helper to dispatch character events
const dispatchCharacterEvent = (eventName: string, detail?: any) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

// Context provider
export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [jobClass, setJobClass] = useState<JobClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load character data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, fetch from API
        setCharacter(defaultCharacter);
        setJobClass(defaultJobClass);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }, 500);
  }, []);

  // Update job level when character level changes
  useEffect(() => {
    if (character && jobClass) {
      const newJobLevel = getJobLevelForCharacter(jobClass, character.level);

      if (newJobLevel !== character.currentJobLevel) {
        setCharacter({
          ...character,
          currentJobLevel: newJobLevel
        });

        // Dispatch job level up event if it increased
        if (newJobLevel > character.currentJobLevel) {
          dispatchCharacterEvent('character:joblevelup', {
            level: newJobLevel,
            title: jobClass.levels[newJobLevel - 1]?.title || "Unknown Title"
          });
        }
      }
    }
  }, [character?.level, jobClass]);

  // Add XP and handle level up
  const addXp = (amount: number) => {
    if (!character) return;

    let newXp = character.xp + amount;
    let newLevel = character.level;
    let leveledUp = false;
    let newNextLevelXp = character.nextLevelXp;

    // Check for level up
    while (newXp >= newNextLevelXp) {
      newXp -= newNextLevelXp;
      newLevel++;
      leveledUp = true;
      // Next level requires more XP
      newNextLevelXp = Math.floor(newNextLevelXp * 1.5);
    }

    // Update character
    setCharacter({
      ...character,
      xp: newXp,
      level: newLevel,
      nextLevelXp: newNextLevelXp,
    });

    // Handle level up event
    if (leveledUp) {
      dispatchCharacterEvent('character:levelup', { level: newLevel });
    }
  };

  // Unlock achievement
  const unlockAchievement = (achievementId: string) => {
    if (!character) return;

    const achievement = character.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    // Update achievement
    const updatedAchievements = character.achievements.map(a =>
      a.id === achievementId ? { ...a, unlocked: true, date: new Date() } : a
    );

    // Update character
    setCharacter({
      ...character,
      achievements: updatedAchievements,
    });

    // Dispatch achievement event
    dispatchCharacterEvent('character:achievement', achievement);
  };

  // Animation helpers
  const showLevelUpAnimation = () => {
    dispatchCharacterEvent('character:levelup', { level: character?.level || 1 });
  };

  const showAchievementAnimation = (achievement: Achievement) => {
    dispatchCharacterEvent('character:achievement', achievement);
  };

  const setJobClassAndUpdate = (newJobClass: JobClass) => {
    setJobClass(newJobClass);

    if (character) {
      const currentJobLevel = getJobLevelForCharacter(newJobClass, character.level);
      const currentTitle = newJobClass.levels[currentJobLevel - 1]?.title || "Unknown Title";

      setCharacter({
        ...character,
        jobClassId: newJobClass.id,
        jobClassName: newJobClass.name,
        currentJobLevel
      });
    }
  };

  const value = {
    character,
    jobClass,
    loading,
    error,
    addXp,
    unlockAchievement,
    showLevelUpAnimation,
    showAchievementAnimation,
    setJobClass: setJobClassAndUpdate
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Hook for using the context
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
