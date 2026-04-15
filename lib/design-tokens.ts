import { Element } from './gameData';

export const COLORS = {
  background: {
    primary: 'bg-zinc-950',
    secondary: 'bg-zinc-900',
    tertiary: 'bg-zinc-800',
    card: 'bg-zinc-900/50',
  },
  border: {
    default: 'border-zinc-700',
    subtle: 'border-zinc-800',
    accent: 'border-zinc-600',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-zinc-300',
    muted: 'text-zinc-500',
    inverse: 'text-zinc-950',
  },
  rarity: {
    1: 'border-zinc-400',
    2: 'border-green-400',
    3: 'border-blue-400',
    4: 'border-purple-400',
    5: 'border-yellow-400',
  },
  rarityGlow: {
    1: 'shadow-[0_0_8px_rgba(161,161,170,0.4)]',
    2: 'shadow-[0_0_10px_rgba(74,222,128,0.5)]',
    3: 'shadow-[0_0_12px_rgba(96,165,250,0.6)]',
    4: 'shadow-[0_0_15px_rgba(192,132,252,0.7)]',
    5: 'shadow-[0_0_20px_rgba(250,204,21,0.8)]',
  },
  element: {
    Fire: 'text-red-400',
    Water: 'text-blue-400',
    Earth: 'text-green-400',
    Thunder: 'text-yellow-400',
    Light: 'text-yellow-200',
    Dark: 'text-purple-400',
  },
  hp: {
    bar: 'bg-gradient-to-b from-green-400 to-green-600',
    barBg: 'bg-red-950',
  },
  bb: {
    ready: 'bg-gradient-to-b from-yellow-300 to-yellow-500',
    charge: 'bg-gradient-to-b from-blue-400 to-blue-600',
  },
  button: {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-zinc-950 hover:from-yellow-400 hover:to-yellow-500',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  },
  feedback: {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  },
} as const;

export const TYPOGRAPHY = {
  font: {
    heading: 'font-black italic uppercase tracking-wider',
    body: 'font-medium',
    mono: 'font-mono',
  },
  size: {
    xs: 'text-[8px]',
    sm: 'text-[10px]',
    base: 'text-xs',
    lg: 'text-sm',
    xl: 'text-lg',
  },
} as const;

export const SPACING = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

export const SIZES = {
  unit: {
    xs: 'w-10 h-10',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    '3xl': 'w-40 h-40',
  },
  portrait: {
    sm: 'w-16 h-20',
    md: 'w-20 h-24',
    lg: 'w-24 h-28',
  },
  icon: {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  },
  button: {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },
} as const;

export const BORDERS = {
  radius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },
  width: {
    thin: 'border',
    default: 'border-2',
    thick: 'border-4',
  },
} as const;

export const ANIMATION = {
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  shake: 'animate-[shake_0.1s_ease-in-out_infinite]',
} as const;

export const SHADOWS = {
  sm: 'shadow-lg',
  md: 'shadow-xl',
  lg: 'shadow-2xl',
  glow: (color: string) => `shadow-[0_0_15px_rgba(${color},0.4)]`,
} as const;

export const ELEMENT_COLORS: Record<Element, string> = {
  Fire: '#ef4444',
  Water: '#3b82f6',
  Earth: '#22c55e',
  Thunder: '#eab308',
  Light: '#fef08a',
  Dark: '#a855f7',
};

export const RARITY_LABELS = {
  1: 'Normal',
  2: 'Rare',
  3: 'Super Rare',
  4: 'Ultra Rare',
  5: 'Legendary',
} as const;

export const BF_COLORS = {
  navy: {
    deep: '#1a1a2e',
    mid: '#16213e',
    light: '#252a4a',
  },
  gold: {
    primary: '#b89947',
    bright: '#c9a227',
    dim: '#8b7235',
  },
  health: '#22c55e',
  bb: '#3b82f6',
} as const;

// ============================================================================
// UI HELPERS - Composable classes for common patterns
// ============================================================================

export const BF_UI = {
  // BF2 Styled Cards
  cardNavy: 'bg-[#1a1a2e] border-2 border-[#b89947]/30 rounded-xl',
  cardGoldBorder: 'border-2 border-[#b89947] rounded-xl',
  
  // BF2 Buttons
  buttonGold: 'bg-gradient-to-b from-[#c9a227] to-[#b89947] text-zinc-900 font-bold px-4 py-2 rounded-lg hover:from-[#d4af37] hover:to-[#c9a227] transition-colors',
  buttonBlue: 'bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white font-bold px-4 py-2 rounded-lg hover:from-[#4b9bff] hover:to-[#3b82f6] transition-colors',
  
  // Status Badges
  badgeEnergy: 'bg-blue-900/50 border border-blue-500/30 px-2 py-1 rounded text-xs font-bold text-blue-400',
  badgeCleared: 'bg-emerald-900/50 border border-emerald-500/30 px-2 py-1 rounded text-xs font-bold text-emerald-400',
  badgeLocked: 'bg-zinc-800/50 border border-zinc-700 px-2 py-1 rounded text-xs font-bold text-zinc-500',
  
  // Difficulty Stars
  difficultyStars: (level: number) => {
    const filled = Array.from({ length: level }).map((_, i) => 
      '<span class="text-yellow-400">★</span>'
    ).join('');
    const empty = Array.from({ length: 5 - level }).map(() => 
      '<span class="text-zinc-700">★</span>'
    ).join('');
    return { __html: filled + empty };
  },
} as const;

export const UI = {
  // Cards and containers
  card: 'bg-zinc-900 rounded-xl border border-zinc-700 p-4',
  cardSolid: 'bg-zinc-900 rounded-xl p-4',
  cardBordered: 'border border-zinc-700 rounded-xl',
  
  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-zinc-950 font-bold px-4 py-2 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-colors',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-lg transition-colors',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition-colors',
    ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-lg transition-colors',
  },
  
  // Inputs
  input: 'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500',
  
  // Badges
  badge: {
    rarity: (r: number) => {
      const colors = { 1: 'border-zinc-500 text-zinc-300 bg-zinc-800', 2: 'border-green-500 text-green-300 bg-green-900/30', 3: 'border-blue-500 text-blue-300 bg-blue-900/30', 4: 'border-purple-500 text-purple-300 bg-purple-900/30', 5: 'border-yellow-500 text-yellow-300 bg-yellow-900/30' };
      return colors[r as keyof typeof colors] || colors[1];
    },
    element: (e: string) => {
      const colors: Record<string, string> = { Fire: 'border-red-500 text-red-300 bg-red-900/30', Water: 'border-blue-500 text-blue-300 bg-blue-900/30', Earth: 'border-green-500 text-green-300 bg-green-900/30', Thunder: 'border-yellow-500 text-yellow-300 bg-yellow-900/30', Light: 'border-yellow-200 text-yellow-200 bg-yellow-900/30', Dark: 'border-purple-500 text-purple-300 bg-purple-900/30' };
      return colors[e] || colors.Fire;
    },
  },
  
  // Borders
  border: {
    thin: 'border',
    default: 'border-2',
    thick: 'border-4',
  },
  
  // Gold accent (for battle HUD)
  gold: {
    border: 'border-[#b89947]',
    text: 'text-[#b89947]',
    bg: 'bg-[#b89947]',
  },
  
  // Empty states
  empty: 'text-zinc-500 text-sm',
  emptyDashed: 'border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center',
} as const;