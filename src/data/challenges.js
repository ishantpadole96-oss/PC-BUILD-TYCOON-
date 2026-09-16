// Challenge scenarios
export const challenges = [
  {
    id: 'challenge_budget_50k',
    name: 'Budget Beast',
    icon: '💰',
    description: 'Build the best gaming PC possible under ₹50,000. Every rupee counts!',
    objective: 'Maximize performance score under ₹50,000 budget',
    rules: {
      maxBudget: 50000,
      mustInclude: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
      useCase: 'gaming',
    },
    scoring: {
      primary: 'performanceScore',
      bonuses: [
        { condition: 'underBudgetBy5000', points: 5, label: 'Saved ₹5,000+' },
        { condition: 'noWarnings', points: 10, label: 'No compatibility warnings' },
      ],
    },
    reward: 10000,
    difficulty: 'easy',
    unlockLevel: 1,
  },
  {
    id: 'challenge_max_fps_1l',
    name: 'FPS King',
    icon: '⚡',
    description: 'Maximum FPS at 1080p under ₹1,00,000. Frame rate is everything!',
    objective: 'Maximize 1080p FPS under ₹1,00,000',
    rules: {
      maxBudget: 100000,
      mustInclude: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
      useCase: 'gaming',
    },
    scoring: {
      primary: 'fps1080p',
      bonuses: [
        { condition: 'over144fps', points: 15, label: '144+ FPS' },
        { condition: 'noErrors', points: 10, label: 'No compatibility errors' },
      ],
    },
    reward: 15000,
    difficulty: 'medium',
    unlockLevel: 2,
  },
  {
    id: 'challenge_silent',
    name: 'Silent Assassin',
    icon: '🤫',
    description: 'Build the quietest PC that can still game at 1080p 60fps.',
    objective: 'Minimize noise while achieving 1080p 60fps',
    rules: {
      minFps1080p: 60,
      mustInclude: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
      useCase: 'gaming',
    },
    scoring: {
      primary: 'noiseLevel_inverse',
      bonuses: [
        { condition: 'under40dB', points: 20, label: 'Under 40dB' },
        { condition: 'over60fps', points: 5, label: '60+ FPS' },
      ],
    },
    reward: 12000,
    difficulty: 'medium',
    unlockLevel: 3,
  },
  {
    id: 'challenge_cool',
    name: 'Ice Cold',
    icon: '❄️',
    description: 'Build a PC with the lowest possible temperatures under full load.',
    objective: 'Minimize temperatures under load',
    rules: {
      mustInclude: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
    },
    scoring: {
      primary: 'temperature_inverse',
      bonuses: [
        { condition: 'cpuUnder60C', points: 15, label: 'CPU under 60°C' },
        { condition: 'gpuUnder65C', points: 10, label: 'GPU under 65°C' },
      ],
    },
    reward: 12000,
    difficulty: 'medium',
    unlockLevel: 3,
  },
  {
    id: 'challenge_efficiency',
    name: 'Green Machine',
    icon: '🌿',
    description: 'Maximum performance per watt. Efficiency is king!',
    objective: 'Maximize performance-per-watt ratio',
    rules: {
      mustInclude: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
    },
    scoring: {
      primary: 'perfPerWatt',
      bonuses: [
        { condition: 'under300W', points: 10, label: 'Under 300W total' },
        { condition: 'over60score', points: 10, label: 'Score 60+' },
      ],
    },
    reward: 15000,
    difficulty: 'hard',
    unlockLevel: 3,
  },
  {
    id: 'challenge_ultimate',
    name: 'No Limits',
    icon: '🚀',
    description: 'Build the ultimate ₹5,00,000 dream PC. Spare no expense!',
    objective: 'Maximize overall score under ₹5,00,000',
    rules: {
      maxBudget: 500000,
      mustInclude: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
    },
    scoring: {
      primary: 'overallScore',
      bonuses: [
        { condition: 'over90score', points: 20, label: 'Score 90+' },
        { condition: '4k60fps', points: 15, label: '4K 60+ FPS' },
        { condition: 'noWarnings', points: 5, label: 'Perfect compatibility' },
      ],
    },
    reward: 50000,
    difficulty: 'hard',
    unlockLevel: 4,
  },
];
