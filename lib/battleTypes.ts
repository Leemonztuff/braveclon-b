import { UnitTemplate } from '@/lib/gameData';

export type StatusEffectType = 
  | 'poison' 
  | 'weak' 
  | 'sick' 
  | 'injured' 
  | 'curse' 
  | 'paralysis'
  | 'regen'
  | 'barrier'
  | 'reflect'
  | 'seal'
  | 'faint'
  | 'stealth'
  | 'enrage'
  | 'break';

export interface StatusEffect {
  type: StatusEffectType;
  turnsRemaining: number;
  power: number;
  sourceId?: string;
  stackable?: boolean;
  maxStacks?: number;
}

export const STATUS_EFFECT_COLORS: Record<StatusEffectType, string> = {
  poison: 'bg-purple-500',
  weak: 'bg-orange-400',
  sick: 'bg-green-500',
  injured: 'bg-red-500',
  curse: 'bg-fuchsia-500',
  paralysis: 'bg-yellow-400',
  regen: 'bg-cyan-400',
  barrier: 'bg-blue-500',
  reflect: 'bg-indigo-500',
  seal: 'bg-gray-500',
  faint: 'bg-zinc-700',
  stealth: 'bg-slate-400',
  enrage: 'bg-red-600',
  break: 'bg-amber-600',
};

export const STATUS_EFFECT_ICONS: Record<StatusEffectType, string> = {
  poison: '☠️',
  weak: '💪',
  sick: '🤢',
  injured: '🩹',
  curse: '😈',
  paralysis: '⚡',
  regen: '💚',
  barrier: '🛡️',
  reflect: '🔄',
  seal: '❌',
  faint: '💤',
  stealth: '👁️',
  enrage: '😡',
  break: '💥',
};

export interface BuffState {
  atkBoost: number;
  defBoost: number;
  recBoost: number;
  critChance: number;
  critDamage: number;
  damageReduction: number;
  hpRegen: number;
  barrier: number;
  drain: number;
  counter: number;
}

export interface BattleUnit {
  id: string;
  template: UnitTemplate;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  bbGauge: number;
  maxBb: number;
  isDead: boolean;
  queuedBb: boolean;
  actionState: 'idle' | 'attacking' | 'skill' | 'hurt' | 'bb_hurt' | 'dead' | 'guarding' | 'countering' | 'casting';
  isWeaknessHit?: boolean;
  statusEffects: StatusEffect[];
  buff: BuffState;
  hitCount: number;
  totalDamageDealt: number;
  comboChain: number;
  lastHitElement?: string;
  isGuarding: boolean;
}

export interface BattleLeaderBonus {
  atkBoost: number;
  defBoost: number;
  recBoost: number;
  elementBoost: Record<string, number>;
  damageReduction: number;
  critBoost: number;
}

export interface CombatEvent {
  type: 'attack' | 'skill' | 'heal' | 'buff' | 'debuff' | 'counter' | 'guard' | 'death' | 'barrier' | 'drain' | 'crit' | 'miss';
  attackerId?: string;
  targetId?: string;
  damage?: number;
  heal?: number;
  element?: string;
  isWeakness?: boolean;
  isCrit?: boolean;
  isCounter?: boolean;
  isDrain?: boolean;
  statusEffect?: StatusEffect;
  timestamp: number;
}

export interface BattleStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  critsLanded: number;
  weaknessesExploited: number;
  hitsPerformed: number;
  skillsUsed: number;
  statusEffectsApplied: number;
}
