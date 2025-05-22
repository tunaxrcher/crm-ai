// Profile Feature Mock Data
export const mockUsers = {
  'user-1': {
    id: 'user-1',
    name: 'Jessica Lee',
    avatar: 'https://same-assets.com/avatars/sales-director-1.png',
    level: 62,
    currentXP: 58450,
    nextLevelXP: 65000,
    title: 'Sales Director',
    class: 'sales',
    classIcon: 'sales',
    position: 1,
    change: 0,
    joinedDate: 'March 15, 2024',
    about:
      'Passionate sales professional with 10+ years of experience. Consistently exceeds targets and mentors junior team members.',
    achievements: [
      {
        id: 'achievement-1',
        name: 'Top Performer',
        description: 'Highest customer satisfaction rating for the quarter',
        icon: '🏆',
        earned: true,
        earnedOn: new Date(Date.now() - 1209600000), // 14 days ago
      },
      {
        id: 'achievement-2',
        name: 'Sales Champion',
        description: 'Exceeded quarterly target by 150%',
        icon: '🥇',
        earned: true,
        earnedOn: new Date(Date.now() - 2592000000), // 30 days ago
      },
      {
        id: 'achievement-3',
        name: 'Team Builder',
        description: 'Successfully mentored 5 new team members',
        icon: '👥',
        earned: true,
        earnedOn: new Date(Date.now() - 5184000000), // 60 days ago
      },
    ],
    stats: {
      AGI: 42, // Speed, responsiveness
      STR: 38, // Heavy workload handling
      DEX: 56, // Precision, accuracy
      VIT: 45, // Consistency, endurance
      INT: 51, // Planning, analysis
    },
    questStats: {
      totalCompleted: 247,
      dailyCompleted: 185,
      weeklyCompleted: 62,
      averageRating: 4.8,
    },
    badges: [
      {
        id: 'badge-1',
        name: 'Persuasive Negotiator',
        icon: '🤝',
        description: 'Exceptional negotiation skills',
      },
      {
        id: 'badge-2',
        name: 'Client Whisperer',
        icon: '👂',
        description: 'Deeply understands client needs',
      },
      {
        id: 'badge-3',
        name: 'Closing Expert',
        icon: '✍️',
        description: 'High deal conversion rate',
      },
    ],
  },
  'user-2': {
    id: 'user-2',
    name: 'Michael Chen',
    avatar: 'https://same-assets.com/avatars/accountant-2.png',
    level: 36,
    currentXP: 38120,
    nextLevelXP: 40000,
    title: 'Senior Accountant',
    class: 'accounting',
    classIcon: 'accounting',
    position: 2,
    change: 1,
    joinedDate: 'May 4, 2024',
    about:
      'Detail-oriented accountant specializing in financial analysis and tax optimization strategies.',
    achievements: [
      {
        id: 'achievement-1',
        name: 'Accuracy Master',
        description: 'Zero errors in quarterly financial reports',
        icon: '🎯',
        earned: true,
        earnedOn: new Date(Date.now() - 1209600000), // 14 days ago
      },
      {
        id: 'achievement-2',
        name: 'Efficiency Expert',
        description: 'Streamlined payment processing system',
        icon: '⚡',
        earned: true,
        earnedOn: new Date(Date.now() - 3456000000), // 40 days ago
      },
      {
        id: 'achievement-3',
        name: 'Tax Strategist',
        description: 'Saved the company 15% in tax liabilities',
        icon: '💰',
        earned: false,
      },
    ],
    stats: {
      AGI: 32, // Speed, responsiveness
      STR: 28, // Heavy workload handling
      DEX: 48, // Precision, accuracy
      VIT: 34, // Consistency, endurance
      INT: 42, // Planning, analysis
    },
    questStats: {
      totalCompleted: 143,
      dailyCompleted: 96,
      weeklyCompleted: 47,
      averageRating: 4.6,
    },
    badges: [
      {
        id: 'badge-1',
        name: 'Number Wizard',
        icon: '🧙‍♂️',
        description: 'Exceptional numerical analysis',
      },
      {
        id: 'badge-2',
        name: 'Audit Ace',
        icon: '🔍',
        description: 'Thorough and meticulous audit skills',
      },
      {
        id: 'badge-3',
        name: 'Financial Forecaster',
        icon: '📊',
        description: 'Accurate financial predictions',
      },
    ],
  },
  'user-3': {
    id: 'user-3',
    name: 'Ryan Thompson',
    avatar: 'https://same-assets.com/avatars/marketing-manager-1.png',
    level: 42,
    currentXP: 36780,
    nextLevelXP: 45000,
    title: 'Marketing Manager',
    class: 'marketing',
    classIcon: 'marketing',
    position: 3,
    change: -1,
    joinedDate: 'January 7, 2024',
    about:
      'Creative marketing professional with a data-driven approach to campaign optimization and brand development.',
    achievements: [
      {
        id: 'achievement-1',
        name: 'Campaign Architect',
        description: 'Created multi-channel campaign with 35% ROI',
        icon: '🚀',
        earned: true,
        earnedOn: new Date(Date.now() - 604800000), // 7 days ago
      },
      {
        id: 'achievement-2',
        name: 'Social Media Guru',
        description: 'Grew social following by 200% in 3 months',
        icon: '📱',
        earned: true,
        earnedOn: new Date(Date.now() - 2592000000), // 30 days ago
      },
      {
        id: 'achievement-3',
        name: 'Content King',
        description: 'Produced viral content with 1M+ impressions',
        icon: '👑',
        earned: false,
      },
    ],
    stats: {
      AGI: 38, // Speed, responsiveness
      STR: 32, // Heavy workload handling
      DEX: 41, // Precision, accuracy
      VIT: 36, // Consistency, endurance
      INT: 44, // Planning, analysis
    },
    questStats: {
      totalCompleted: 168,
      dailyCompleted: 120,
      weeklyCompleted: 48,
      averageRating: 4.5,
    },
    badges: [
      {
        id: 'badge-1',
        name: 'Trend Spotter',
        icon: '📈',
        description: 'Identifies emerging market trends',
      },
      {
        id: 'badge-2',
        name: 'Brand Architect',
        icon: '🏛️',
        description: 'Expert at brand development',
      },
      {
        id: 'badge-3',
        name: 'Analytics Ace',
        icon: '📊',
        description: 'Data-driven marketing approach',
      },
    ],
  },
  'current-user': {
    id: 'current-user',
    name: 'Alex Johnson',
    avatar: 'https://same-assets.com/avatars/marketing-specialist-1.png',
    level: 8,
    currentXP: 2250,
    nextLevelXP: 3000,
    title: 'Marketing Specialist',
    class: 'marketing',
    classIcon: 'marketing',
    position: 24,
    change: 3,
    joinedDate: 'April 20, 2025',
    about:
      'Marketing specialist with a passion for creative content and digital strategy. Just starting my journey!',
    achievements: [
      {
        id: 'achievement-1',
        name: 'First Blood',
        description: 'Complete your first quest',
        icon: '🏆',
        earned: true,
        earnedOn: new Date(Date.now() - 2592000000), // 30 days ago
      },
      {
        id: 'achievement-2',
        name: 'Consistent Performer',
        description: 'Complete daily quests for 7 consecutive days',
        icon: '⚡',
        earned: true,
        earnedOn: new Date(Date.now() - 1209600000), // 14 days ago
      },
      {
        id: 'achievement-3',
        name: 'Top of the Class',
        description: 'Reach the top 10 in your class leaderboard',
        icon: '🥇',
        earned: false,
      },
    ],
    stats: {
      AGI: 18, // Speed, responsiveness
      STR: 12, // Heavy workload handling
      DEX: 22, // Precision, accuracy
      VIT: 15, // Consistency, endurance
      INT: 25, // Planning, analysis
    },
    questStats: {
      totalCompleted: 43,
      dailyCompleted: 32,
      weeklyCompleted: 11,
      averageRating: 4.2,
    },
    badges: [
      {
        id: 'badge-1',
        name: 'Fast Learner',
        icon: '🧠',
        description: 'Quickly adapts to new challenges',
      },
      {
        id: 'badge-2',
        name: 'Creative Spark',
        icon: '💡',
        description: 'Brings fresh ideas to the table',
      },
    ],
  },
}
