// Customer order templates and generation logic
// Customers evaluate delivered PCs based on their requirements

export const customerTemplates = [
  {
    id: 'gamer_budget',
    name: 'Budget Gamer',
    avatar: '🎮',
    dialogues: [
      "I need a gaming PC under ₹{budget}. Want to play at 1080p!",
      "Build me a solid gaming rig for ₹{budget}. Esports mainly.",
      "Looking for a decent 1080p gaming build. Budget is ₹{budget}.",
    ],
    requirements: {
      useCase: 'gaming',
      budgetRange: [45000, 65000],
      resolution: '1080p',
      fpsTarget: 60,
      noisePref: 'normal',
      storageMin: 256,
      aesthetic: 'any',
    },
    rewardRange: [5000, 8000],
    difficulty: 'easy',
  },
  {
    id: 'gamer_mid',
    name: '1440p Gamer',
    avatar: '🎯',
    dialogues: [
      "I want a ₹{budget} gaming PC for 1440p gaming.",
      "Build me a beast for 1440p! Budget: ₹{budget}.",
      "Need smooth 1440p gaming under ₹{budget}.",
    ],
    requirements: {
      useCase: 'gaming',
      budgetRange: [70000, 100000],
      resolution: '1440p',
      fpsTarget: 60,
      noisePref: 'normal',
      storageMin: 512,
      aesthetic: 'rgb',
    },
    rewardRange: [8000, 15000],
    difficulty: 'medium',
  },
  {
    id: 'gamer_high',
    name: '4K Enthusiast',
    avatar: '👑',
    dialogues: [
      "I want THE BEST 4K gaming PC. Budget: ₹{budget}.",
      "Build me an ultra-premium 4K gaming machine. ₹{budget} budget.",
      "Money isn't a big concern. Want 4K 60fps+. ₹{budget} max.",
    ],
    requirements: {
      useCase: 'gaming',
      budgetRange: [150000, 300000],
      resolution: '4K',
      fpsTarget: 60,
      noisePref: 'quiet',
      storageMin: 1000,
      aesthetic: 'premium',
    },
    rewardRange: [20000, 40000],
    difficulty: 'hard',
  },
  {
    id: 'office_basic',
    name: 'Office Worker',
    avatar: '💼',
    dialogues: [
      "Just need a basic office PC for ₹{budget}. Nothing fancy.",
      "Build me a simple workstation for emails and documents. ₹{budget}.",
      "Need a reliable office PC under ₹{budget}.",
    ],
    requirements: {
      useCase: 'office',
      budgetRange: [30000, 45000],
      resolution: '1080p',
      fpsTarget: 0,
      noisePref: 'quiet',
      storageMin: 256,
      aesthetic: 'any',
    },
    rewardRange: [3000, 5000],
    difficulty: 'easy',
  },
  {
    id: 'creator',
    name: 'Content Creator',
    avatar: '🎬',
    dialogues: [
      "I edit 4K videos. Need a powerful workstation for ₹{budget}.",
      "Build me a video editing rig. Budget: ₹{budget}.",
      "Need lots of cores and RAM for video editing. ₹{budget} max.",
    ],
    requirements: {
      useCase: 'workstation',
      budgetRange: [80000, 150000],
      resolution: '4K',
      fpsTarget: 0,
      noisePref: 'normal',
      storageMin: 2000,
      aesthetic: 'any',
    },
    rewardRange: [12000, 22000],
    difficulty: 'medium',
  },
  {
    id: 'esports',
    name: 'Esports Player',
    avatar: '⚡',
    dialogues: [
      "Maximum FPS! I play competitive esports. Budget ₹{budget}.",
      "Build the highest FPS PC possible under ₹{budget}.",
      "Need 240+ FPS at 1080p for competitive gaming. ₹{budget}.",
    ],
    requirements: {
      useCase: 'gaming',
      budgetRange: [50000, 80000],
      resolution: '1080p',
      fpsTarget: 144,
      noisePref: 'normal',
      storageMin: 512,
      aesthetic: 'rgb',
    },
    rewardRange: [6000, 12000],
    difficulty: 'medium',
  },
  {
    id: 'streamer',
    name: 'Streamer',
    avatar: '📺',
    dialogues: [
      "I stream and game simultaneously. Need something powerful for ₹{budget}.",
      "Build me a streaming + gaming PC. Budget: ₹{budget}.",
      "Need to stream in 1080p while gaming at high settings. ₹{budget}.",
    ],
    requirements: {
      useCase: 'streaming',
      budgetRange: [90000, 140000],
      resolution: '1080p',
      fpsTarget: 60,
      noisePref: 'quiet',
      storageMin: 1000,
      aesthetic: 'rgb',
    },
    rewardRange: [10000, 18000],
    difficulty: 'medium',
  },
  {
    id: 'silent_build',
    name: 'Quiet Enthusiast',
    avatar: '🤫',
    dialogues: [
      "I HATE noise. Build me the quietest PC possible for ₹{budget}.",
      "Silence is golden. Make it whisper-quiet. ₹{budget}.",
      "I work from home and need absolute silence. Budget ₹{budget}.",
    ],
    requirements: {
      useCase: 'office',
      budgetRange: [50000, 80000],
      resolution: '1080p',
      fpsTarget: 0,
      noisePref: 'silent',
      storageMin: 512,
      aesthetic: 'any',
    },
    rewardRange: [7000, 12000],
    difficulty: 'medium',
  },
  {
    id: 'student',
    name: 'College Student',
    avatar: '🎓',
    dialogues: [
      "I'm a student on a tight budget. ₹{budget} for studying + light gaming.",
      "Cheapest PC that can handle some games? ₹{budget} max.",
      "Need a budget PC for college and casual gaming. ₹{budget}.",
    ],
    requirements: {
      useCase: 'gaming',
      budgetRange: [35000, 50000],
      resolution: '1080p',
      fpsTarget: 30,
      noisePref: 'normal',
      storageMin: 256,
      aesthetic: 'any',
    },
    rewardRange: [3000, 6000],
    difficulty: 'easy',
  },
  {
    id: 'developer',
    name: 'Software Developer',
    avatar: '💻',
    dialogues: [
      "Need a dev machine with lots of RAM and fast storage. ₹{budget}.",
      "Build me a programming workstation. ₹{budget} budget.",
      "I run Docker containers and compile code. Need power. ₹{budget}.",
    ],
    requirements: {
      useCase: 'workstation',
      budgetRange: [60000, 100000],
      resolution: '1080p',
      fpsTarget: 0,
      noisePref: 'quiet',
      storageMin: 1000,
      aesthetic: 'any',
    },
    rewardRange: [8000, 14000],
    difficulty: 'medium',
  },
];

export function generateOrder(shopLevel = 1, reputation = 0) {
  // Filter templates by difficulty based on shop level
  const available = customerTemplates.filter(t => {
    if (shopLevel <= 1) return t.difficulty === 'easy';
    if (shopLevel <= 2) return t.difficulty !== 'hard';
    return true;
  });

  const template = available[Math.floor(Math.random() * available.length)];
  const budget = Math.round(
    (template.requirements.budgetRange[0] +
      Math.random() * (template.requirements.budgetRange[1] - template.requirements.budgetRange[0])) / 1000
  ) * 1000;

  const baseReward = template.rewardRange[0] +
    Math.random() * (template.rewardRange[1] - template.rewardRange[0]);
  const repBonus = Math.floor(reputation * 0.05);

  const dialogue = template.dialogues[Math.floor(Math.random() * template.dialogues.length)]
    .replace('{budget}', budget.toLocaleString('en-IN'));

  return {
    id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    customer: {
      name: generateName(),
      avatar: template.avatar,
      type: template.name,
    },
    dialogue,
    requirements: {
      ...template.requirements,
      budget,
    },
    deadline: shopLevel <= 2 ? 999 : Math.floor(3 + Math.random() * 5),
    reward: {
      base: Math.round(baseReward),
      bonus: Math.round(repBonus),
    },
    difficulty: template.difficulty,
    status: 'pending', // pending, accepted, building, delivered, expired
    createdAt: Date.now(),
  };
}

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun',
  'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya',
  'Priya', 'Riya', 'Neha', 'Pooja', 'Meera',
  'Rahul', 'Rohit', 'Amit', 'Vikram', 'Suresh',
  'Karan', 'Raj', 'Dev', 'Nikhil', 'Arun',
];

function generateName() {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}
