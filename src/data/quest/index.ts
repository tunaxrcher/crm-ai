// Quest Feature Mock Data
export const mockQuests = [
  {
    id: "quest-1",
    title: "Create a compelling product presentation",
    description: "Design a presentation that highlights our new product's key features and benefits for potential clients.",
    type: "daily",
    rewards: {
      xp: 75,
      stats: {
        AGI: 2,
        DEX: 3,
        INT: 2
      }
    },
    deadline: new Date(Date.now() + 86400000), // 24 hours from now
    difficulty: "medium",
    completed: false
  },
  {
    id: "quest-login",
    title: "Login",
    description: "Log in to the system at least once today.",
    type: "daily",
    rewards: {
      xp: 25,
      stats: {
        AGI: 1,
        VIT: 1
      }
    },
    deadline: new Date(Date.now() + 86400000), // 24 hours from now
    difficulty: "easy",
    completed: true
  },
  {
    id: "quest-3",
    title: "Respond to customer inquiries",
    description: "Address all pending customer inquiries in the support queue with helpful and professional responses.",
    type: "daily",
    rewards: {
      xp: 50,
      stats: {
        AGI: 3,
        DEX: 1,
        VIT: 2
      }
    },
    deadline: new Date(Date.now() + 43200000), // 12 hours from now
    difficulty: "easy",
    completed: false
  },
  {
    id: "quest-2",
    title: "Submit monthly sales report",
    description: "Compile and submit your monthly sales report with highlights of key achievements and areas for improvement.",
    type: "weekly",
    rewards: {
      xp: 120,
      stats: {
        INT: 4,
        STR: 2,
        VIT: 3
      }
    },
    deadline: new Date(Date.now() + 172800000), // 48 hours from now
    difficulty: "hard",
    completed: false
  },
  {
    id: "quest-4",
    title: "Research competitive market trends",
    description: "Conduct market research to identify emerging trends and competitive strategies in our industry.",
    type: "weekly",
    rewards: {
      xp: 100,
      stats: {
        INT: 4,
        AGI: 1,
        STR: 2
      }
    },
    deadline: new Date(Date.now() + 259200000), // 72 hours from now
    difficulty: "medium",
    completed: false
  },
  {
    id: "quest-weekly-sales",
    title: "Weekly sales client meeting",
    description: "Conduct your weekly meeting with assigned clients and provide updates on products and services.",
    type: "weekly",
    rewards: {
      xp: 85,
      stats: {
        INT: 2,
        AGI: 3,
        STR: 1
      }
    },
    deadline: new Date(Date.now() + 345600000), // 4 days from now
    difficulty: "easy",
    completed: true
  },
  {
    id: "quest-5",
    title: "Optimize landing page conversion rate",
    description: "Analyze and optimize our product landing page to improve conversion rates by at least 5%.",
    type: "no-deadline",
    rewards: {
      xp: 150,
      stats: {
        INT: 5,
        DEX: 3,
        VIT: 2
      }
    },
    deadline: null,
    difficulty: "hard",
    completed: false
  },
  {
    id: "quest-6",
    title: "Run A/B test on email campaign",
    description: "Prepare and execute an A/B test on our latest email campaign to determine which version performs better.",
    type: "no-deadline",
    rewards: {
      xp: 110,
      stats: {
        INT: 4,
        DEX: 2,
        AGI: 3
      }
    },
    deadline: null,
    difficulty: "medium",
    completed: false
  }
];

// Mock completed quests
export const mockCompletedQuests = [
  {
    id: "completed-1",
    title: "Client outreach campaign",
    description: "Contacted 25 potential clients for our new service offering.",
    type: "weekly",
    completedOn: new Date(Date.now() - 259200000), // 3 days ago
    xpEarned: 120,
    statsGained: {
      AGI: 3,
      STR: 2,
      VIT: 4
    }
  },
  {
    id: "completed-2",
    title: "Daily team status update",
    description: "Provided a comprehensive update on project status to the team.",
    type: "daily",
    completedOn: new Date(Date.now() - 86400000), // 1 day ago
    xpEarned: 60,
    statsGained: {
      AGI: 2,
      DEX: 1,
      INT: 2
    }
  }
];
