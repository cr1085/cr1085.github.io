// ============================================================
// GAME QUESTIONS & EVENTS DATABASE
// Used as fallback / seeding data for Supabase
// ============================================================

window.GAME_QUESTIONS = [
  // ── RIDDLES ────────────────────────────────────────────────
  {
    type: 'riddle',
    question: 'I have cities, but no houses live there. Mountains, but no trees. Water, but no fish. What am I?',
    options: ['A dream', 'A map', 'A painting', 'A mirror'],
    answer: 'A map',
    reward: 3,
    penalty: -2
  },
  {
    type: 'riddle',
    question: 'The more you take, the more you leave behind. What am I?',
    options: ['Memories', 'Footsteps', 'Time', 'Money'],
    answer: 'Footsteps',
    reward: 4,
    penalty: -2
  },
  {
    type: 'riddle',
    question: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
    options: ['A ghost', 'An echo', 'A shadow', 'A cloud'],
    answer: 'An echo',
    reward: 3,
    penalty: -3
  },
  {
    type: 'riddle',
    question: 'What has hands but cannot clap?',
    options: ['A statue', 'A clock', 'A glove', 'A puppet'],
    answer: 'A clock',
    reward: 2,
    penalty: -1
  },
  {
    type: 'riddle',
    question: 'What gets wetter the more it dries?',
    options: ['Rain', 'A towel', 'A sponge', 'Ice'],
    answer: 'A towel',
    reward: 2,
    penalty: -2
  },
  {
    type: 'riddle',
    question: 'I have keys but no locks. I have space but no room. You can enter, but you cannot go inside. What am I?',
    options: ['A keyboard', 'A map', 'A dictionary', 'A piano'],
    answer: 'A keyboard',
    reward: 3,
    penalty: -2
  },
  {
    type: 'riddle',
    question: 'What has a head and a tail but no body?',
    options: ['A snake', 'A coin', 'A comet', 'A rope'],
    answer: 'A coin',
    reward: 2,
    penalty: -1
  },
  // ── WHAT WOULD YOU PREFER ──────────────────────────────────
  {
    type: 'prefer',
    question: 'A risky gamble — choose your fate!',
    options: [
      { text: '✅ Safe: Advance 4 tiles', effect: { type: 'advance', amount: 4 } },
      { text: '🎰 Risky: 50/50 chance — advance 10 or go back 3', effect: { type: 'gamble', win: 10, lose: -3 } }
    ]
  },
  {
    type: 'prefer',
    question: 'Time for a deal with the chaos gods!',
    options: [
      { text: '🛡️ Skip your next turn but gain a Shield power', effect: { type: 'power_skip', power: 'shield' } },
      { text: '⚡ Roll again right now!', effect: { type: 'extra_roll' } }
    ]
  },
  {
    type: 'prefer',
    question: 'The board has spoken — make your choice!',
    options: [
      { text: '📍 Teleport to tile 15 (guaranteed)', effect: { type: 'teleport', tile: 15 } },
      { text: '🎲 Roll two dice and take the higher result', effect: { type: 'double_roll' } }
    ]
  },
  {
    type: 'prefer',
    question: 'Chaos demands a sacrifice or a reward!',
    options: [
      { text: '💀 Swap positions with AI (might help or hurt!)', effect: { type: 'swap' } },
      { text: '🏃 Advance 6 tiles safely', effect: { type: 'advance', amount: 6 } }
    ]
  },
  {
    type: 'prefer',
    question: 'The Chaos Merchant appears before you!',
    options: [
      { text: '🎁 Get a random power-up', effect: { type: 'random_power' } },
      { text: '⏩ Advance 5 tiles immediately', effect: { type: 'advance', amount: 5 } }
    ]
  },
];

// ── POWERS ────────────────────────────────────────────────────
window.GAME_POWERS = [
  {
    id: 'double_roll',
    name: '⚡ Double Roll',
    description: 'Your next dice roll counts twice!',
    icon: '⚡',
    color: 0xFFD700
  },
  {
    id: 'push_back',
    name: '💨 Chaos Push',
    description: 'Send the AI back 4 tiles!',
    icon: '💨',
    color: 0xFF6B6B
  },
  {
    id: 'swap',
    name: '🔄 Position Swap',
    description: 'Swap your position with the AI!',
    icon: '🔄',
    color: 0x9B59B6
  },
  {
    id: 'shield',
    name: '🛡️ Chaos Shield',
    description: 'Immune to the next trap!',
    icon: '🛡️',
    color: 0x3498DB
  },
  {
    id: 'skip_ai',
    name: '😴 AI Freeze',
    description: "Skip the AI's next turn!",
    icon: '😴',
    color: 0x1ABC9C
  },
  {
    id: 'teleport_forward',
    name: '🌀 Warp Forward',
    description: 'Teleport 8 tiles ahead!',
    icon: '🌀',
    color: 0xE67E22
  }
];

// ── TRAPS ─────────────────────────────────────────────────────
window.GAME_TRAPS = [
  {
    id: 'go_back',
    name: '🕳️ Pit Trap',
    description: 'Fell into a pit! Go back 5 tiles.',
    effect: { type: 'advance', amount: -5 }
  },
  {
    id: 'lose_turn',
    name: '🧊 Frozen!',
    description: "You're frozen! Lose your next turn.",
    effect: { type: 'lose_turn' }
  },
  {
    id: 'random_teleport',
    name: '🌪️ Chaos Vortex',
    description: 'Sucked into a vortex! Teleported randomly.',
    effect: { type: 'random_teleport' }
  },
  {
    id: 'go_back_big',
    name: '💣 Bomb Tile',
    description: 'BOOM! Go back 8 tiles!',
    effect: { type: 'advance', amount: -8 }
  }
];
