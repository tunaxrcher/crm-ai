// Character Feature Mock Data
import { JobClass, Character, JobLevel, LevelRequirement } from '@src/features/character/types';

// Job Classes
export const mockJobClasses: JobClass[] = [
  {
    id: "jobclass-marketing",
    name: "นักการตลาด",
    description: "ผู้เชี่ยวชาญด้านการวางแผนและดำเนินกลยุทธ์การตลาด มีความสามารถในการวิเคราะห์ตลาดและพฤติกรรมผู้บริโภค",
    levels: [
      {
        level: 1,
        requiredCharacterLevel: 1,
        title: "นักการตลาด",
        imageUrl: "https://same-assets.com/avatars/marketing-specialist-1.png"
      },
      {
        level: 2,
        requiredCharacterLevel: 10,
        title: "นักการตลาดมืออาชีพ",
        imageUrl: "https://same-assets.com/avatars/marketing-specialist-2.png"
      },
      {
        level: 3,
        requiredCharacterLevel: 35,
        title: "เซียนการตลาด",
        imageUrl: "https://same-assets.com/avatars/marketing-specialist-3.png"
      },
      {
        level: 4,
        requiredCharacterLevel: 60,
        title: "เทพการตลาด",
        imageUrl: "https://same-assets.com/avatars/marketing-specialist-4.png"
      },
      {
        level: 5,
        requiredCharacterLevel: 80,
        title: "ปรมาจารย์ด้านการตลาด",
        imageUrl: "https://same-assets.com/avatars/marketing-specialist-5.png"
      },
      {
        level: 6,
        requiredCharacterLevel: 100,
        title: "เทพเจ้าการตลาด",
        imageUrl: "https://same-assets.com/avatars/marketing-specialist-6.png"
      }
    ]
  },
  {
    id: "jobclass-sales",
    name: "นักขาย",
    description: "ผู้เชี่ยวชาญด้านการขายและเจรจาต่อรอง มีความสามารถในการสร้างความสัมพันธ์กับลูกค้าและปิดการขาย",
    levels: [
      {
        level: 1,
        requiredCharacterLevel: 1,
        title: "นักขาย",
        imageUrl: "https://same-assets.com/avatars/sales-agent-1.png"
      },
      {
        level: 2,
        requiredCharacterLevel: 10,
        title: "นักขายอาวุโส",
        imageUrl: "https://same-assets.com/avatars/sales-agent-2.png"
      },
      {
        level: 3,
        requiredCharacterLevel: 35,
        title: "ผู้เชี่ยวชาญด้านการขาย",
        imageUrl: "https://same-assets.com/avatars/sales-agent-3.png"
      },
      {
        level: 4,
        requiredCharacterLevel: 60,
        title: "นักเจรจาขั้นเทพ",
        imageUrl: "https://same-assets.com/avatars/sales-agent-4.png"
      },
      {
        level: 5,
        requiredCharacterLevel: 80,
        title: "ราชาแห่งการขาย",
        imageUrl: "https://same-assets.com/avatars/sales-agent-5.png"
      },
      {
        level: 6,
        requiredCharacterLevel: 100,
        title: "เทพเจ้าแห่งการขาย",
        imageUrl: "https://same-assets.com/avatars/sales-agent-6.png"
      }
    ]
  },
  {
    id: "jobclass-accounting",
    name: "นักบัญชี",
    description: "ผู้เชี่ยวชาญด้านการจัดการบัญชีและการเงิน มีความแม่นยำและละเอียดรอบคอบในการจัดการข้อมูลทางการเงิน",
    levels: [
      {
        level: 1,
        requiredCharacterLevel: 1,
        title: "นักบัญชี",
        imageUrl: "https://same-assets.com/avatars/accountant-1.png"
      },
      {
        level: 2,
        requiredCharacterLevel: 10,
        title: "นักบัญชีคิดไว",
        imageUrl: "https://same-assets.com/avatars/accountant-2.png"
      },
      {
        level: 3,
        requiredCharacterLevel: 35,
        title: "นักบัญชีมือฉมัง",
        imageUrl: "https://same-assets.com/avatars/accountant-3.png"
      },
      {
        level: 4,
        requiredCharacterLevel: 60,
        title: "นักบัญชีเทพ",
        imageUrl: "https://same-assets.com/avatars/accountant-4.png"
      },
      {
        level: 5,
        requiredCharacterLevel: 80,
        title: "นักบัญชีของแท้",
        imageUrl: "https://same-assets.com/avatars/accountant-5.png"
      },
      {
        level: 6,
        requiredCharacterLevel: 100,
        title: "เทพเจ้าแห่งบัญชี",
        imageUrl: "https://same-assets.com/avatars/accountant-6.png"
      }
    ]
  }
];

// Generate XP requirements for levels 1-100 based on the formula
// baseXP = 50, rate = 1.45
// xpRequiredForLevel = baseXP * level^rate
export const generateXPTable = (): LevelRequirement[] => {
  const baseXP = 50;
  const rate = 1.45;
  const table: LevelRequirement[] = [];

  let totalXP = 0;

  for (let level = 1; level <= 100; level++) {
    const xpForThisLevel = Math.round(baseXP * Math.pow(level, rate));
    totalXP += level === 1 ? 0 : xpForThisLevel; // Level 1 doesn't require XP

    table.push({
      level,
      requiredXP: totalXP
    });
  }

  return table;
};

export const xpTable = generateXPTable();

// Function to get the appropriate job level based on character level
const getJobLevelForCharacter = (
  jobClass: JobClass,
  characterLevel: number
): { jobLevel: JobLevel, jobLevelIndex: number } => {
  // Find the highest job level that the character qualifies for
  for (let i = jobClass.levels.length - 1; i >= 0; i--) {
    if (characterLevel >= jobClass.levels[i].requiredCharacterLevel) {
      return {
        jobLevel: jobClass.levels[i],
        jobLevelIndex: i
      };
    }
  }

  // Default to the first level if nothing else matches
  return {
    jobLevel: jobClass.levels[0],
    jobLevelIndex: 0
  };
};

// Find next level XP requirement
const getNextLevelXP = (currentLevel: number): number => {
  if (currentLevel >= 100) return 0;

  const currentTotalXP = xpTable.find(x => x.level === currentLevel)?.requiredXP || 0;
  const nextTotalXP = xpTable.find(x => x.level === currentLevel + 1)?.requiredXP || 0;

  return nextTotalXP - currentTotalXP;
};

// Mock character data
const selectedJobClass = mockJobClasses[0]; // Using the Marketing job class
const characterLevel = 8;
const { jobLevel, jobLevelIndex } = getJobLevelForCharacter(selectedJobClass, characterLevel);

export const mockCharacter: Character = {
  id: "char-1",
  name: "Alex Johnson",
  jobClassId: selectedJobClass.id,
  jobClassName: selectedJobClass.name,
  currentJobLevel: jobLevelIndex + 1,
  level: characterLevel,
  currentXP: 450,
  nextLevelXP: getNextLevelXP(characterLevel),
  totalXP: xpTable.find(x => x.level === characterLevel)?.requiredXP || 0,
  title: jobLevel.title,
  stats: {
    AGI: 18, // Speed, responsiveness
    STR: 12, // Heavy workload handling
    DEX: 22, // Precision, accuracy
    VIT: 15, // Consistency, endurance
    INT: 25  // Planning, analysis
  },
  statPoints: 3,
  achievements: [
    {
      id: "achievement-1",
      name: "First Blood",
      description: "Complete your first quest",
      icon: "🏆",
      earned: true,
      earnedOn: new Date(Date.now() - 2592000000) // 30 days ago
    },
    {
      id: "achievement-2",
      name: "Consistent Performer",
      description: "Complete daily quests for 7 consecutive days",
      icon: "⚡",
      earned: true,
      earnedOn: new Date(Date.now() - 1209600000) // 14 days ago
    },
    {
      id: "achievement-3",
      name: "Top of the Class",
      description: "Reach the top 10 in your class leaderboard",
      icon: "🥇",
      earned: false
    }
  ],
  questStats: {
    totalCompleted: 43,
    dailyCompleted: 32,
    weeklyCompleted: 11,
    averageRating: 4.2
  },
  portrait: jobLevel.imageUrl
};

// Character portrait (now included in character object, but kept for backward compatibility)
export const characterPortrait = mockCharacter.portrait || "https://same-assets.com/avatars/marketing-specialist-1.png";
