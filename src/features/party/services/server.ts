// import { mockTeams, mockTeamDetail, mockTeamQuests } from '@src/data/party';
import type { GlobalTeamQuest, Team, TeamDetail } from '../types'

const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Dragon Slayers',
    description: 'Elite team focusing on high-level raids and dungeons',
    members: 3,
    maxMembers: 5,
    level: 15,
    xp: 7500,
    xpToNextLevel: 10000,
    joinRequirement: 'Level 10+ required, must have completed Chapter 3',
    leader: {
      id: 'user-1',
      name: 'ThunderBlade',
      level: 45,
      role: 'Tank',
      avatar: '/avatars/tank.png',
    },
    tags: ['raids', 'dungeons', 'hardcore'],
    activity: 'very-active' as const,
    completedQuests: 42,
    achievements: 15,
    isFull: false,
    isPrivate: false,
  },
  {
    id: 'team-2',
    name: 'Casual Explorers',
    description: 'Friendly team for casual players who enjoy exploration',
    members: 4,
    maxMembers: 8,
    level: 8,
    xp: 3200,
    xpToNextLevel: 5000,
    joinRequirement: '',
    leader: {
      id: 'user-2',
      name: 'MoonWalker',
      level: 25,
      role: 'Support',
      avatar: '/avatars/support.png',
    },
    tags: ['casual', 'exploration', 'social'],
    activity: 'active' as const,
    completedQuests: 18,
    achievements: 7,
    isFull: false,
    isPrivate: false,
  },
  {
    id: 'team-3',
    name: 'PvP Masters',
    description: 'Competitive team for Player vs Player battles',
    members: 5,
    maxMembers: 5,
    level: 20,
    xp: 15000,
    xpToNextLevel: 20000,
    joinRequirement: 'PvP rank Gold or higher',
    leader: {
      id: 'user-3',
      name: 'ShadowStrike',
      level: 50,
      role: 'DPS',
      avatar: '/avatars/dps.png',
    },
    tags: ['pvp', 'competitive', 'tournaments'],
    activity: 'very-active' as const,
    completedQuests: 67,
    achievements: 23,
    isFull: true,
    isPrivate: true,
  },
]

export async function getTeams(): Promise<Team[]> {
  console.log('[SERVER] Fetching teams...')
  // In a real app, this would fetch from a database/API
  return mockTeams
}

const mockTeamDetail: TeamDetail = {
  id: 'team-1',
  name: 'Dragon Slayers',
  description: 'Elite team focusing on high-level raids and dungeons',
  members: [
    {
      id: 'user-1',
      name: 'ThunderBlade',
      level: 45,
      role: 'Tank',
      avatar: '/avatars/tank.png',
      isLeader: true,
      status: 'online',
      joinedAt: '2024-01-15',
      questContribution: 1250,
      specialties: ['Shield Master', 'Dragon Expert'],
    },
    {
      id: 'user-4',
      name: 'MysticMage',
      level: 42,
      role: 'Mage',
      avatar: '/avatars/mage.png',
      isLeader: false,
      status: 'online',
      joinedAt: '2024-01-20',
      questContribution: 980,
      specialties: ['Fire Magic', 'Enchantments'],
    },
    {
      id: 'user-5',
      name: 'SilentArrow',
      level: 38,
      role: 'DPS',
      avatar: '/avatars/archer.png',
      isLeader: false,
      status: 'away',
      joinedAt: '2024-02-01',
      questContribution: 750,
      specialties: ['Precision Shots', 'Trap Master'],
    },
  ],
  pendingRequests: [
    {
      id: 'req-1',
      name: 'HolyPriest',
      level: 35,
      role: 'Healer',
      avatar: '/avatars/healer.png',
      message:
        'I would love to join your team! I have experience in all major raids.',
    },
    {
      id: 'req-2',
      name: 'StealthNinja',
      level: 40,
      role: 'DPS',
      avatar: '/avatars/ninja.png',
      message: 'Looking for an active team for end-game content.',
    },
  ],
  teamQuests: [
    {
      id: 'tq-1',
      title: "Dragon's Lair Raid",
      description: 'Defeat the ancient dragon and claim its treasure',
      progress: 65,
      reward: {
        xp: 5000,
        points: 1000,
        buff: 'Dragon Slayer Buff (+10% damage vs dragons for 7 days)',
      },
      deadline: '2024-03-01',
      difficulty: 'hard',
      participants: 3,
      requiredParticipants: 4,
    },
    {
      id: 'tq-2',
      title: 'Crystal Cave Exploration',
      description: 'Map the crystal caves and collect rare gems',
      progress: 30,
      reward: {
        xp: 2000,
        points: 500,
        buff: 'Crystal Vision (+5% loot quality for 3 days)',
      },
      deadline: '2024-02-25',
      difficulty: 'medium',
      participants: 2,
      requiredParticipants: 3,
    },
  ],
  completedQuests: [
    {
      id: 'cq-1',
      title: 'Goblin King Fortress',
      description: 'Successfully raided the goblin stronghold',
      completedOn: '2024-02-10',
      reward: {
        xp: 3000,
        points: 750,
      },
      participants: 4,
    },
    {
      id: 'cq-2',
      title: 'Desert Temple Mystery',
      description: 'Solved the ancient puzzles and claimed the artifact',
      completedOn: '2024-02-05',
      reward: {
        xp: 2500,
        points: 600,
      },
      participants: 3,
    },
  ],
  chat: [
    {
      id: 'msg-1',
      userId: 'user-1',
      userName: 'ThunderBlade',
      avatar: '/avatars/tank.png',
      message: 'Great job on the raid yesterday team!',
      timestamp: '2024-02-15T10:30:00Z',
    },
    {
      id: 'msg-2',
      userId: 'user-4',
      userName: 'MysticMage',
      avatar: '/avatars/mage.png',
      message: 'Thanks! Ready for the dragon raid tonight?',
      timestamp: '2024-02-15T10:35:00Z',
    },
    {
      id: 'msg-3',
      userId: 'user-5',
      userName: 'SilentArrow',
      avatar: '/avatars/archer.png',
      message: "I'll be there. Let's aim for 8 PM server time.",
      timestamp: '2024-02-15T10:40:00Z',
    },
  ],
  benefits: [
    {
      title: 'XP Boost',
      description: '+20% XP gain for all team activities',
      icon: '⚡',
    },
    {
      title: 'Exclusive Quests',
      description: 'Access to high-tier team-only quests',
      icon: '🎯',
    },
    {
      title: 'Team Bank',
      description: 'Shared storage for resources and items',
      icon: '🏦',
    },
    {
      title: 'Team Buffs',
      description: 'Permanent stat boosts while in team',
      icon: '💪',
    },
  ],
  achievements: [
    {
      title: 'First Victory',
      description: 'Complete your first team quest',
      progress: 100,
      reward: 'Team Banner Customization',
      completed: true,
    },
    {
      title: 'Raid Masters',
      description: 'Complete 50 raid quests as a team',
      progress: 84,
      reward: 'Legendary Team Mount',
      completed: false,
    },
    {
      title: 'Perfect Coordination',
      description: 'Complete 10 quests without any member falling',
      progress: 70,
      reward: 'Team Emote Pack',
      completed: false,
    },
  ],
  level: 15,
  xp: 7500,
  xpToNextLevel: 10000,
}

export async function getTeamDetails(
  teamId: string
): Promise<TeamDetail | null> {
  console.log(`[SERVER] Fetching details for team ${teamId}...`)
  // ในแอพจริง จะดึงข้อมูลจาก database/API
  if (teamId === 'team-1') {
    return mockTeamDetail
  }

  // ถ้าไม่พบทีม return null
  return null
}

const mockTeamQuests: GlobalTeamQuest[] = [
  {
    id: 'gtq-1',
    title: 'Weekly Raid Challenge',
    description: 'Complete the Shadow Fortress raid with your team',
    rewards: {
      xp: 10000,
      points: 2000,
      buff: 'Raid Champion (+15% damage in raids for 7 days)',
    },
    requirements: {
      minTeamLevel: 10,
      minMembers: 4,
      duration: '7 days',
      difficulty: 'hard', // ไม่ต้องใช้ as const เพราะ TypeScript จะ infer จาก context
    },
    tags: ['raid', 'weekly', 'challenge'],
  },
  {
    id: 'gtq-2',
    title: 'Resource Gathering Marathon',
    description: 'Collect 1000 rare materials as a team',
    rewards: {
      xp: 5000,
      points: 1000,
      buff: "Gatherer's Fortune (+20% resource drop rate for 3 days)",
    },
    requirements: {
      minTeamLevel: 5,
      minMembers: 3,
      duration: '3 days',
      difficulty: 'medium',
    },
    tags: ['gathering', 'cooperation', 'resources'],
  },
  {
    id: 'gtq-3',
    title: 'Dungeon Speed Run',
    description: 'Clear the Crystal Caverns in under 30 minutes',
    rewards: {
      xp: 7500,
      points: 1500,
      buff: 'Speed Demon (+10% movement speed for 5 days)',
    },
    requirements: {
      minTeamLevel: 8,
      minMembers: 4,
      duration: '2 days',
      difficulty: 'hard',
    },
    tags: ['speedrun', 'dungeon', 'timed'],
  },
  {
    id: 'gtq-4',
    title: 'Team Building Exercise',
    description: 'Complete 20 quests together without any member falling',
    rewards: {
      xp: 3000,
      points: 600,
      buff: 'Unity Strength (+5% all stats when near teammates)',
    },
    requirements: {
      minTeamLevel: 1,
      minMembers: 2,
      duration: '5 days',
      difficulty: 'easy',
    },
    tags: ['teamwork', 'beginner-friendly', 'coordination'],
  },
]

export async function getTeamQuests(): Promise<GlobalTeamQuest[]> {
  console.log('[SERVER] Fetching team quests...')
  // ในแอพจริง จะดึงข้อมูลจาก database/API
  return mockTeamQuests
}

/**
 * Join a team (request to join)
 * @param teamId - The ID of the team to join
 * @param userId - The ID of the user requesting to join
 * @param message - The message from the user to the team leader
 * @returns Promise<{success: boolean; message: string}> Result of the join request
 */
export async function joinTeam(
  teamId: string,
  userId: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  console.log(
    `[SERVER] Processing join request for team ${teamId} from user ${userId}`
  )

  // In a real app, this would:
  // 1. Validate if the team can be joined (not full, user meets requirements)
  // 2. Create a join request in the database
  // 3. Notify the team leader

  // For now, just return success
  return {
    success: true,
    message: 'Join request sent successfully',
  }
}

/**
 * Create a new team
 * @param teamData - Data for the new team
 * @returns Promise<{success: boolean; teamId?: string; message: string}> Result of team creation
 */
export async function createTeam(
  teamData: Partial<Team>
): Promise<{ success: boolean; teamId?: string; message: string }> {
  console.log('[SERVER] Creating new team:', teamData.name)

  // In a real app, this would:
  // 1. Validate the team data
  // 2. Create a new team in the database
  // 3. Add the current user as leader

  // For now, just return success with a mock ID
  return {
    success: true,
    teamId: 'new-team-' + Date.now(),
    message: 'Team created successfully',
  }
}
