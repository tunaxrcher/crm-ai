/**
 * Mock data for stories and feed items with error handling for image loading.
 * If an image fails to load, a local placeholder image is used.
 */

// Constants for time calculations
const HOUR_IN_MS = 3600000
const DAY_IN_MS = 86400000

// Base timestamp for stable SSR rendering
const NOW = new Date('2025-05-19T12:00:00.000Z').getTime()

// Mock stories data
export const mockStories = [
  {
    id: 'story-1',
    user: {
      id: 'user-3',
      name: 'ไมเคิล เชน',
      avatar: 'https://same-assets.com/avatars/accountant-2.png',
    },
    media: {
      type: 'image',
      url: 'https://same-assets.com/quest-complete-3.png',
    },
    questTitle: 'วิเคราะห์รายงานการเงิน',
    viewed: false,
  },
  {
    id: 'story-2',
    user: {
      id: 'user-6',
      name: 'เจสสิก้า ลี',
      avatar: 'https://same-assets.com/avatars/sales-director-1.png',
    },
    media: {
      type: 'video',
      url: 'https://same-assets.com/quest-video-1.mp4',
      thumbnail: 'https://same-assets.com/quest-video-1-thumb.png',
    },
    questTitle: 'สาธิตการนำเสนอขาย',
    viewed: false,
  },
  {
    id: 'story-3',
    user: {
      id: 'user-4',
      name: 'เอ็มม่า เดวีส์',
      avatar: 'https://same-assets.com/avatars/sales-manager-1.png',
    },
    media: {
      type: 'image',
      url: 'https://same-assets.com/quest-complete-4.png',
    },
    questTitle: 'เวิร์กช็อปสร้างแรงจูงใจทีม',
    viewed: true,
  },
  {
    id: 'story-4',
    user: {
      id: 'user-5',
      name: 'เจมส์ โรดริเกซ',
      avatar: 'https://same-assets.com/avatars/sales-rep-3.png',
    },
    media: {
      type: 'image',
      url: 'https://same-assets.com/quest-complete-5.png',
    },
    questTitle: 'แบบสำรวจความพึงพอใจลูกค้า',
    viewed: false,
  },
  {
    id: 'story-5',
    user: {
      id: 'user-7',
      name: 'แดเนียล บราวน์',
      avatar: 'https://same-assets.com/avatars/sales-rep-2.png',
    },
    media: {
      type: 'video',
      url: 'https://same-assets.com/quest-video-2.mp4',
      thumbnail: 'https://same-assets.com/quest-video-2-thumb.png',
    },
    questTitle: 'บันทึกการสาธิตสินค้า',
    viewed: true,
  },
]

// Mock feed data
export const mockFeedItems = [
  {
    id: 'feed-1',
    type: 'quest_complete',
    user: {
      id: 'user-1',
      name: 'อเล็กซ์ จอห์นสัน',
      avatar: 'https://same-assets.com/avatars/marketing-specialist-1.png',
      title: 'ผู้เชี่ยวชาญด้านการตลาด',
      level: 8,
    },
    content: {
      quest: {
        title: 'สร้างการนำเสนอสินค้าที่น่าสนใจ',
        xpEarned: 75,
        statsGained: {
          AGI: 2,
          DEX: 3,
          INT: 2,
        },
      },
      image: '/placeholder-image.png', // Changed to local placeholder
      timestamp: new Date(NOW - HOUR_IN_MS), // 1 hour ago
      engagement: {
        likes: 5,
        comments: [
          {
            id: 'comment-1',
            user: {
              id: 'user-2',
              name: 'เอ็มม่า เดวีส์',
              avatar: 'https://same-assets.com/avatars/sales-manager-1.png',
            },
            text: 'ทำได้ดีมากกับการนำเสนอนี้! ภาพประกอบโดดเด่นจริงๆ',
            timestamp: new Date(NOW - HOUR_IN_MS / 2), // 30 minutes ago
          },
        ],
      },
    },
  },
  {
    id: 'feed-2',
    type: 'level_up',
    user: {
      id: 'user-3',
      name: 'ไมเคิล เชน',
      avatar: 'https://same-assets.com/avatars/accountant-2.png',
      title: 'นักบัญชีอาวุโส',
      level: 36,
    },
    content: {
      previousLevel: 35,
      newLevel: 36,
      newTitle: 'นักบัญชีอาวุโส',
      statsAllocated: {
        STR: 1,
        VIT: 1,
        INT: 1,
      },
      timestamp: new Date(NOW - DAY_IN_MS), // 1 day ago
      engagement: {
        likes: 12,
        comments: [
          {
            id: 'comment-2',
            user: {
              id: 'user-4',
              name: 'ซาร่า วิลสัน',
              avatar:
                'https://same-assets.com/avatars/marketing-director-1.png',
            },
            text: 'ยินดีด้วยกับการเลื่อนตำแหน่งนะ! คุณสมควรได้รับมันจริงๆ',
            timestamp: new Date(NOW - DAY_IN_MS / 2), // 12 hours ago
          },
          {
            id: 'comment-3',
            user: {
              id: 'user-5',
              name: 'เจมส์ โรดริเกซ',
              avatar: 'https://same-assets.com/avatars/sales-rep-3.png',
            },
            text: 'น่าประทับใจมาก! มีเคล็ดลับอะไรในการเลเวลอัพเร็วขนาดนี้?',
            timestamp: new Date(NOW - DAY_IN_MS / 4), // 6 hours ago
          },
        ],
      },
    },
  },
  {
    id: 'feed-3',
    type: 'achievement',
    user: {
      id: 'user-6',
      name: 'เจสสิก้า ลี',
      avatar: 'https://same-assets.com/avatars/sales-director-1.png',
      title: 'ผู้อำนวยการฝ่ายขาย',
      level: 62,
    },
    content: {
      achievement: {
        name: 'สุดยอดนักทำผลงาน',
        description: 'ได้รับคะแนนความพึงพอใจจากลูกค้าสูงสุดในไตรมาสนี้',
        icon: '🏆',
      },
      timestamp: new Date(NOW - 2 * DAY_IN_MS), // 2 days ago
      engagement: {
        likes: 23,
        comments: [
          {
            id: 'comment-4',
            user: {
              id: 'user-7',
              name: 'แดเนียล บราวน์',
              avatar: 'https://same-assets.com/avatars/sales-rep-2.png',
            },
            text: 'ทำได้เยี่ยมมากเจสสิก้า! คุณได้ตั้งมาตรฐานไว้สูงมากสำหรับพวกเราทุกคน',
            timestamp: new Date(NOW - 1.5 * DAY_IN_MS), // 1.5 days ago
          },
        ],
      },
    },
  },
  {
    id: 'feed-4',
    type: 'quest_complete',
    user: {
      id: 'user-8',
      name: 'ไรอัน ทอมป์สัน',
      avatar: 'https://same-assets.com/avatars/marketing-manager-1.png',
      title: 'ผู้จัดการฝ่ายการตลาด',
      level: 42,
    },
    content: {
      quest: {
        title: 'เปิดตัวแคมเปญอีเมลสำหรับไลน์ผลิตภัณฑ์ใหม่',
        xpEarned: 120,
        statsGained: {
          DEX: 4,
          INT: 3,
          AGI: 2,
        },
      },
      image: '/placeholder-image.png', // Changed to local placeholder
      timestamp: new Date(NOW - 3 * DAY_IN_MS), // 3 days ago
      engagement: {
        likes: 9,
        comments: [],
      },
    },
  },
]

// Helper function to format time difference with stable output for SSR
export const formatTimeDiff = (date: Date | string | number) => {
  try {
    // Handle different date formats
    let timestamp: number

    if (date instanceof Date) {
      timestamp = date.getTime()
    } else if (typeof date === 'string') {
      timestamp = new Date(date).getTime()
    } else if (typeof date === 'number') {
      timestamp = date
    } else {
      // Fallback for invalid date
      return 'เมื่อเร็วๆ นี้'
    }

    // Check if the timestamp is valid
    if (isNaN(timestamp)) {
      return 'เมื่อเร็วๆ นี้'
    }

    const diffMs = NOW - timestamp
    const diffSecs = Math.round(diffMs / 1000)
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)

    if (diffSecs < 60) {
      return `${diffSecs} วินาทีที่แล้ว`
    } else if (diffMins < 60) {
      return `${diffMins} นาทีที่แล้ว`
    } else if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`
    } else {
      return `${diffDays} วันที่แล้ว`
    }
  } catch (error) {
    console.error('Error formatting time difference:', error)
    return 'เมื่อเร็วๆ นี้'
  }
}
