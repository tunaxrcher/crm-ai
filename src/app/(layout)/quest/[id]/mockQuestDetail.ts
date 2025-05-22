// Mock quest data (in a real app, this would come from API/backend)
export const mockQuests = {
  'quest-1': {
    id: 'quest-1',
    title: 'Create a compelling product presentation',
    description:
      "Design a presentation that highlights our new product's key features and benefits for potential clients.",
    type: 'daily',
    rewards: {
      xp: 75,
      stats: {
        AGI: 2,
        DEX: 3,
        INT: 2,
      },
    },
    deadline: new Date(Date.now() + 86400000), // 24 hours from now
    difficulty: 'medium',
    requirements: [
      'Include at least 5 key product features',
      'Add competitive analysis section',
      'Create visually appealing slides',
      'Include call-to-action at the end',
    ],
  },
  'quest-2': {
    id: 'quest-2',
    title: 'Submit monthly sales report',
    description:
      'Compile and submit your monthly sales report with highlights of key achievements and areas for improvement.',
    type: 'weekly',
    rewards: {
      xp: 120,
      stats: {
        INT: 4,
        STR: 2,
        VIT: 3,
      },
    },
    deadline: new Date(Date.now() + 172800000), // 48 hours from now
    difficulty: 'hard',
    requirements: [
      'Include sales metrics from the past month',
      'Compare results with previous month',
      'Identify top-performing products',
      'Suggest improvements for next month',
    ],
  },
  'quest-3': {
    id: 'quest-3',
    title: 'Respond to customer inquiries',
    description:
      'Address all pending customer inquiries in the support queue with helpful and professional responses.',
    type: 'daily',
    rewards: {
      xp: 50,
      stats: {
        AGI: 3,
        DEX: 1,
        VIT: 2,
      },
    },
    deadline: new Date(Date.now() + 43200000), // 12 hours from now
    difficulty: 'easy',
    requirements: [
      'Respond to at least 10 customer inquiries',
      'Maintain professional tone',
      'Solve customer issues when possible',
      'Escalate complex issues appropriately',
    ],
  },
  'quest-4': {
    id: 'quest-4',
    title: 'Research competitive market trends',
    description:
      'Conduct market research to identify emerging trends and competitive strategies in our industry.',
    type: 'weekly',
    rewards: {
      xp: 100,
      stats: {
        INT: 4,
        AGI: 1,
        STR: 2,
      },
    },
    deadline: new Date(Date.now() + 259200000), // 72 hours from now
    difficulty: 'medium',
    requirements: [
      'Research at least 3 major competitors',
      'Identify emerging market trends',
      'Analyze competitive pricing strategies',
      'Suggest potential market opportunities',
    ],
  },
  'quest-5': {
    id: 'quest-5',
    title: 'Optimize landing page conversion rate',
    description:
      'Analyze and optimize our product landing page to improve conversion rates by at least 5%.',
    type: 'no-deadline',
    rewards: {
      xp: 150,
      stats: {
        INT: 5,
        DEX: 3,
        VIT: 2,
      },
    },
    deadline: null,
    difficulty: 'hard',
    requirements: [
      'Analyze current conversion rates',
      'Identify problem areas in user journey',
      'Implement A/B testing',
      'Make data-driven improvements',
    ],
  },
  'quest-6': {
    id: 'quest-6',
    title: 'Run A/B test on email campaign',
    description:
      'Prepare and execute an A/B test on our latest email campaign to determine which version performs better.',
    type: 'no-deadline',
    rewards: {
      xp: 110,
      stats: {
        INT: 4,
        DEX: 2,
        AGI: 3,
      },
    },
    deadline: null,
    difficulty: 'medium',
    requirements: [
      'Design two different email versions',
      'Set up tracking parameters',
      'Split test audience evenly',
      'Analyze open and click-through rates',
    ],
  },
}
