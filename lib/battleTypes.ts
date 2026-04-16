import { UnitTemplate } from '@/lib/gameData';

export type StatusEffectType = 'poison' | 'weak' | 'sick' | 'injured' | 'curse' | 'paralysis';

export interface StatusEffect {
  type: StatusEffectType;
  turnsRemaining: number;
  power: number; // Effect magnitude
}

export interface BattleUnit {
  id: string; // unique battle id
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
  actionState: 'idle' | 'attacking' | 'skill' | 'hurt' | 'bb_hurt' | 'dead';
  isWeaknessHit?: boolean;
  statusEffects: StatusEffect[];
  atkBuff: number; // ATK modifier from buffs/debuffs (1.0 = normal)
  defBuff: number; // DEF modifier from buffs/debuffs
  recBuff: number; // REC modifier
  elementalMitigation: number; // Damage reduction from elemental resistance
}

export interface BattleLeaderBonus {
  atkBoost: number;
  defBoost: number;
  recBoost: number;
  elementBoost: Record<string, number>; // Element-specific damage boost
  damageReduction: number;
}
