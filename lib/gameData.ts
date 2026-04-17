import { MaterialType } from './economyTypes';

export type Element = 'Fire' | 'Water' | 'Earth' | 'Thunder' | 'Light' | 'Dark';
export type DungeonFloorType = 'normal' | 'elite' | 'boss' | 'treasure' | 'event';

export const ELEMENT_ICONS: Record<Element, string> = {
  Fire: '🔥',
  Water: '💧',
  Earth: '🌿',
  Thunder: '⚡',
  Light: '✨',
  Dark: '🌑'
};

export const ELEMENT_PARTICLE_COLORS: Record<Element, string[]> = {
  Fire: ['bg-red-500', 'bg-orange-500', 'bg-yellow-500'],
  Water: ['bg-blue-500', 'bg-cyan-400', 'bg-white'],
  Earth: ['bg-green-500', 'bg-emerald-400', 'bg-lime-400'],
  Thunder: ['bg-yellow-400', 'bg-amber-300', 'bg-white'],
  Light: ['bg-yellow-200', 'bg-white', 'bg-amber-100'],
  Dark: ['bg-purple-600', 'bg-fuchsia-500', 'bg-black'],
};

export const ELEMENT_BG_GRADIENTS: Record<Element, string> = {
  Fire: 'from-red-600 to-orange-600',
  Water: 'from-blue-600 to-cyan-600',
  Earth: 'from-green-600 to-emerald-600',
  Thunder: 'from-yellow-500 to-amber-600',
  Light: 'from-yellow-200 to-white',
  Dark: 'from-purple-700 to-black',
};

// Elemental Weakness Matrix: attacker element -> defender element -> damage multiplier
// Used for attack damage calculation in battle
// 2.0 = double damage (weakness), 1.0 = normal, 0.5 = resistant
// Pattern: Fire>Earth>Thunder>Water>Fire (cycle), Light>Dark (mutual)
export const ELEMENT_WEAKNESS: Record<Element, Partial<Record<Element, number>>> = {
  Fire:    { Fire: 0.5, Water: 0.5, Earth: 2.0, Thunder: 1.0, Light: 1.0, Dark: 1.0 },
  Water:   { Fire: 2.0, Water: 0.5, Earth: 1.0, Thunder: 0.5, Light: 1.0, Dark: 1.0 },
  Earth:   { Fire: 1.0, Water: 1.0, Earth: 0.5, Thunder: 2.0, Light: 1.0, Dark: 1.0 },
  Thunder: { Fire: 1.0, Water: 2.0, Earth: 0.5, Thunder: 0.5, Light: 1.0, Dark: 1.0 },
  Light:   { Fire: 1.0, Water: 1.0, Earth: 1.0, Thunder: 1.0, Dark: 2.0, Light: 1.0 },
  Dark:    { Fire: 1.0, Water: 1.0, Earth: 1.0, Thunder: 1.0, Light: 2.0, Dark: 0.5 },
};

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  rec: number; // Recovery, affects healing
}

export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export interface EquipmentSetBonus {
  name: string;
  description: string;
  piecesRequired: number;
  statBonuses?: Partial<Stats>;
  specialEffect?: {
    type: 'damage' | 'defense' | 'heal' | 'bb' | 'crit' | 'element';
    value: number;
    element?: Element;
  };
}

export interface EquipmentSet {
  id: string;
  name: string;
  pieces: string[];
  bonuses: EquipmentSetBonus[];
}

export interface EquipmentTemplate {
  id: string;
  name: string;
  type: EquipSlot;
  rarity: number;
  statsBonus: Partial<Stats>;
  description: string;
  icon: string;
  setId?: string;
  uniqueEffect?: {
    name: string;
    description: string;
    trigger: 'onHit' | 'onKill' | 'onHitCrit' | 'onTurnStart' | 'onLowHP' | 'onBattleStart';
    effect: {
      type: 'heal' | 'barrier' | 'bbFill' | 'damage' | 'buff' | 'counter';
      value: number;
      duration?: number;
      element?: Element;
    };
  };
}

export type SkillType = 'damage' | 'heal' | 'buff' | 'debuff' | 'leader' | 'extra';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  power: number; // Multiplier for damage or heal
  cost: number; // BB gauge cost
  target?: 'self' | 'ally' | 'all_allies' | 'enemy' | 'all_enemies';
  turns?: number; // Duration for buffs
  statusEffect?: {
    type: 'poison' | 'weak' | 'sick' | 'injured' | 'curse' | 'paralysis';
    chance: number; // 0-1 probability
    power: number; // Effect magnitude
    turns: number; // Duration
  };
}

// Leader skill - passive buff to team
export interface LeaderSkill {
  id: string;
  name: string;
  description: string;
  statBoost?: Partial<Stats>; // e.g., { atk: 0.5 } = +50% ATK
  elementBoost?: Partial<Record<Element, number>>; // e.g., { Fire: 0.25 } = +25% Fire damage
  damageReduction?: number; // e.g., 0.2 = 20% damage reduction
}

export interface UnitTemplate {
  id: string;
  name: string;
  element: Element;
  rarity: number;
  baseStats: Stats;
  growthRate: Stats; // Stats gained per level
  maxLevel: number;
  skill: Skill;
  leaderSkill?: LeaderSkill; // Passive buff when leading the team
  extraSkill?: Skill; // Secondary skill (unlocks at certain conditions)
  spriteUrl?: string;
  evolutionTarget?: string; // ID of the unit it evolves into
  evolutionMaterials?: string[]; // Array of unit IDs required to evolve
}

export interface StageTemplate {
  id: number;
  name: string;
  area: string;
  energy: number;
  description: string;
  enemies: string[]; // Array of enemy IDs from ENEMIES
  expReward: number;
  zelReward: number;
  equipmentDrops?: string[]; // Array of equipment template IDs that can drop
  equipmentDropChance?: number; // 0.0 to 1.0 chance per item
}

export interface GachaRate {
  unitId: string;
  weight: number; // Higher weight = higher chance
}

export interface QRRewardTable {
  type: 'zel' | 'energy' | 'gems' | 'unit' | 'equipment';
  chance: number; // 0-100
  min?: number;
  max?: number;
}

export const ELEMENTS: Element[] = ['Fire', 'Water', 'Earth', 'Thunder', 'Light', 'Dark'];

const BASE_URL = 'https://cdn.jsdelivr.net/gh/Leem0nGames/gameassets@main/RO';

export const UNIT_DATABASE: Record<string, UnitTemplate> = {
  // Evolution Materials
  'mat_fire': { id: 'mat_fire', name: 'Fire Essence', element: 'Fire', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_018.png` },
  'mat_water': { id: 'mat_water', name: 'Water Essence', element: 'Water', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_016.png` },
  'mat_earth': { id: 'mat_earth', name: 'Earth Essence', element: 'Earth', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_017.png` },
  'mat_thunder': { id: 'mat_thunder', name: 'Thunder Essence', element: 'Thunder', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_019.png` },
  'mat_light': { id: 'mat_light', name: 'Light Essence', element: 'Light', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_021.png` },
  'mat_dark': { id: 'mat_dark', name: 'Dark Essence', element: 'Dark', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_020.png` },

  // Second Job (5-star) - Knights, Wizards, Priests, etc.
  'u1_4': { id: 'u1_4', name: 'Iron Gustav', element: 'Fire', rarity: 4, baseStats: { hp: 1800, atk: 600, def: 450, rec: 300 }, growthRate: { hp: 50, atk: 20, def: 15, rec: 10 }, maxLevel: 60, skill: { id: 's1_4', name: 'Brandish', type: 'damage', description: 'Powerful slash to all enemies + burn', power: 1.8, cost: 24, target: 'all_enemies', statusEffect: { type: 'poison', chance: 0.5, power: 1, turns: 3 } }, leaderSkill: { id: 'ls1_4', name: 'Blade Master', description: '+30% Fire damage to team', elementBoost: { Fire: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_001.png` },
  'u2_4': { id: 'u2_4', name: 'Celina', element: 'Water', rarity: 4, baseStats: { hp: 1650, atk: 500, def: 500, rec: 450 }, growthRate: { hp: 45, atk: 16, def: 16, rec: 14 }, maxLevel: 60, skill: { id: 's2_4', name: 'Frost Nova', type: 'heal', description: 'Greatly heals all allies', power: 1.5, cost: 28, target: 'all_allies' }, leaderSkill: { id: 'ls2_4', name: 'Arcane Wisdom', description: '+30% Water damage to team', elementBoost: { Water: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_002.png` },
  'u3_4': { id: 'u3_4', name: 'Heilig', element: 'Light', rarity: 4, baseStats: { hp: 1950, atk: 450, def: 600, rec: 250 }, growthRate: { hp: 55, atk: 14, def: 20, rec: 8 }, maxLevel: 60, skill: { id: 's3_4', name: 'Divine Smite', type: 'damage', description: 'Sacred damage + weakness', power: 1.8, cost: 24, target: 'all_enemies', statusEffect: { type: 'weak', chance: 0.4, power: 0.5, turns: 2 } }, leaderSkill: { id: 'ls3_4', name: 'Earth Shield', description: '+30% Earth damage to team', elementBoost: { Earth: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_003.png` },
  'u4_4': { id: 'u4_4', name: 'Shadow Kira', element: 'Thunder', rarity: 4, baseStats: { hp: 1500, atk: 650, def: 350, rec: 300 }, growthRate: { hp: 40, atk: 24, def: 12, rec: 10 }, maxLevel: 60, skill: { id: 's4_4', name: 'Sonic Vortex', type: 'damage', description: 'Thunder vortex + paralysis', power: 1.9, cost: 26, target: 'all_enemies', statusEffect: { type: 'paralysis', chance: 0.3, power: 1, turns: 2 } }, leaderSkill: { id: 'ls4_4', name: 'Eagle Eye', description: '+30% Thunder damage to team', elementBoost: { Thunder: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_004.png` },
  'u5_4': { id: 'u5_4', name: 'Silver Wind', element: 'Light', rarity: 4, baseStats: { hp: 1700, atk: 550, def: 550, rec: 350 }, growthRate: { hp: 48, atk: 18, def: 18, rec: 12 }, maxLevel: 60, skill: { id: 's5_4', name: 'Arrow Storm', type: 'damage', description: 'Arrow rain + curse', power: 1.8, cost: 24, target: 'all_enemies', statusEffect: { type: 'curse', chance: 0.5, power: 0.5, turns: 3 } }, leaderSkill: { id: 'ls5_4', name: 'Divine Blessing', description: '+30% Light damage to team', elementBoost: { Light: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_005.png` },
  'u6_4': { id: 'u6_4', name: 'Dark Whisper', element: 'Dark', rarity: 4, baseStats: { hp: 2100, atk: 480, def: 650, rec: 150 }, growthRate: { hp: 60, atk: 15, def: 22, rec: 6 }, maxLevel: 60, skill: { id: 's6_4', name: 'Shadow Strip', type: 'damage', description: 'Dark strike + injury', power: 1.7, cost: 24, target: 'all_enemies', statusEffect: { type: 'injured', chance: 0.6, power: 0.5, turns: 2 } }, leaderSkill: { id: 'ls6_4', name: 'Void Walker', description: '+15% damage reduction to team', damageReduction: 0.15 }, spriteUrl: `${BASE_URL}/abbys_sprite_006.png` },

  // First Job (3-star) - Swordsman, Mage, Acolyte, Thief, Archer, Rogue
  'u1': {
    id: 'u1',
    name: 'Marcus',
    element: 'Fire',
    rarity: 3,
    baseStats: { hp: 1200, atk: 400, def: 300, rec: 200 },
    growthRate: { hp: 40, atk: 15, def: 10, rec: 8 },
    maxLevel: 40,
    skill: { id: 's1', name: 'Bash', type: 'damage', description: 'Heavy strike to single enemy', power: 1.5, cost: 20 },
    spriteUrl: `${BASE_URL}/abbys_sprite_001.png`,
    evolutionTarget: 'u1_4',
    evolutionMaterials: ['mat_fire', 'mat_fire']
  },
  'u2': {
    id: 'u2',
    name: 'Luna',
    element: 'Water',
    rarity: 3,
    baseStats: { hp: 1100, atk: 350, def: 350, rec: 300 },
    growthRate: { hp: 35, atk: 12, def: 12, rec: 10 },
    maxLevel: 40,
    skill: { id: 's2', name: 'Fire Bolt', type: 'damage', description: 'Fire projectile to single enemy', power: 1.2, cost: 18 },
    spriteUrl: `${BASE_URL}/abbys_sprite_002.png`,
    evolutionTarget: 'u2_4',
    evolutionMaterials: ['mat_water', 'mat_water']
  },
  'u3': {
    id: 'u3',
    name: 'Terra',
    element: 'Earth',
    rarity: 3,
    baseStats: { hp: 1300, atk: 300, def: 400, rec: 150 },
    growthRate: { hp: 45, atk: 10, def: 15, rec: 5 },
    maxLevel: 40,
    skill: { id: 's3', name: 'Heal', type: 'heal', description: 'Heals single ally', power: 1.0, cost: 15 },
    spriteUrl: `${BASE_URL}/abbys_sprite_003.png`,
    evolutionTarget: 'u3_4',
    evolutionMaterials: ['mat_light', 'mat_light']
  },
  'u4': {
    id: 'u4',
    name: 'Volt',
    element: 'Thunder',
    rarity: 3,
    baseStats: { hp: 1000, atk: 450, def: 250, rec: 200 },
    growthRate: { hp: 30, atk: 18, def: 8, rec: 8 },
    maxLevel: 40,
    skill: { id: 's4', name: 'Backstab', type: 'damage', description: 'Critical damage from behind', power: 1.8, cost: 18 },
    spriteUrl: `${BASE_URL}/abbys_sprite_004.png`,
    evolutionTarget: 'u4_4',
    evolutionMaterials: ['mat_thunder', 'mat_thunder']
  },
  'u5': {
    id: 'u5',
    name: 'Kira',
    element: 'Light',
    rarity: 3,
    baseStats: { hp: 1150, atk: 380, def: 380, rec: 250 },
    growthRate: { hp: 38, atk: 14, def: 14, rec: 9 },
    maxLevel: 40,
    skill: { id: 's5', name: 'Double Strafe', type: 'damage', description: 'Two arrows strike one enemy', power: 1.3, cost: 16 },
    spriteUrl: `${BASE_URL}/abbys_sprite_005.png`,
    evolutionTarget: 'u5_4',
    evolutionMaterials: ['mat_light', 'mat_light']
  },
  'u6': {
    id: 'u6',
    name: 'Noir',
    element: 'Dark',
    rarity: 3,
    baseStats: { hp: 1400, atk: 320, def: 450, rec: 100 },
    growthRate: { hp: 50, atk: 11, def: 16, rec: 4 },
    maxLevel: 40,
    skill: { id: 's6', name: 'Envenom', type: 'damage', description: 'Poison strike to enemy', power: 1.2, cost: 18, statusEffect: { type: 'poison', chance: 0.4, power: 0.3, turns: 3 } },
    spriteUrl: `${BASE_URL}/abbys_sprite_006.png`,
    evolutionTarget: 'u6_4',
    evolutionMaterials: ['mat_dark', 'mat_dark']
  },
  'u7': {
    id: 'u7',
    name: 'Lava Golem',
    element: 'Fire',
    rarity: 4,
    baseStats: { hp: 1500, atk: 500, def: 400, rec: 300 },
    growthRate: { hp: 45, atk: 18, def: 12, rec: 10 },
    maxLevel: 60,
    skill: { id: 's7', name: 'Flame Breath', type: 'damage', description: 'Fire damage to all enemies', power: 1.7, cost: 24 },
    extraSkill: { id: 'es7', name: 'Molten Skin', type: 'buff', description: '+20% DEF when hit 3 times', power: 1.2, cost: 0, target: 'self', turns: 3 },
    spriteUrl: `${BASE_URL}/abbys_sprite_007.png`
  },
  'u8': {
    id: 'u8',
    name: 'Frost Predator',
    element: 'Water',
    rarity: 4,
    baseStats: { hp: 1400, atk: 450, def: 450, rec: 400 },
    growthRate: { hp: 40, atk: 15, def: 15, rec: 12 },
    maxLevel: 60,
    skill: { id: 's8', name: 'Tidal Wave', type: 'heal', description: 'Heals all allies', power: 1.4, cost: 30 },
    extraSkill: { id: 'es8', name: 'Frost Armor', type: 'buff', description: '+15% DEF to team', power: 1.15, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_008.png`
  },
  'u9': {
    id: 'u9',
    name: 'Stone Guardian',
    element: 'Earth',
    rarity: 4,
    baseStats: { hp: 1600, atk: 400, def: 500, rec: 200 },
    growthRate: { hp: 50, atk: 12, def: 18, rec: 6 },
    maxLevel: 60,
    skill: { id: 's9', name: 'Stone Curse', type: 'damage', description: 'Earth damage + reduce DEF', power: 1.6, cost: 26, statusEffect: { type: 'weak', chance: 0.4, power: 0.5, turns: 2 } },
    extraSkill: { id: 'es9', name: 'Earth Shield', type: 'buff', description: '+20% DEF when HP > 80%', power: 1.2, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_009.png`
  },
  'u10': {
    id: 'u10',
    name: 'Storm Spirit',
    element: 'Thunder',
    rarity: 4,
    baseStats: { hp: 1300, atk: 550, def: 350, rec: 300 },
    growthRate: { hp: 35, atk: 22, def: 10, rec: 10 },
    maxLevel: 60,
    skill: { id: 's10', name: 'Thunder Storm', type: 'damage', description: 'Thunder damage to all enemies', power: 1.9, cost: 26 },
    extraSkill: { id: 'es10', name: 'Thunder Focus', type: 'buff', description: '+30% ATK when BB ready', power: 1.3, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_010.png`
  },
  'u11': {
    id: 'u11',
    name: 'Seraph',
    element: 'Light',
    rarity: 4,
    baseStats: { hp: 1450, atk: 480, def: 480, rec: 350 },
    growthRate: { hp: 42, atk: 16, def: 16, rec: 11 },
    maxLevel: 60,
    skill: { id: 's11', name: 'Holy Light', type: 'damage', description: 'Light damage to all enemies', power: 1.7, cost: 24 },
    extraSkill: { id: 'es11', name: 'Divine Blessing', type: 'buff', description: '-15% damage taken for 3 turns', power: 0.85, cost: 0, turns: 3 },
    spriteUrl: `${BASE_URL}/abbys_sprite_011.png`
  },
  'u12': {
    id: 'u12',
    name: 'Demon Lord',
    element: 'Dark',
    rarity: 4,
    baseStats: { hp: 1700, atk: 420, def: 550, rec: 150 },
    growthRate: { hp: 55, atk: 14, def: 20, rec: 5 },
    maxLevel: 60,
    skill: { id: 's12', name: 'Abyssal Drain', type: 'damage', description: 'Dark damage + heal from damage', power: 1.5, cost: 22 },
    extraSkill: { id: 'es12', name: 'Dark Contract', type: 'buff', description: 'Heal 10% of damage dealt', power: 0.1, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_012.png`
  },
  'u13': {
    id: 'u13',
    name: 'Lario',
    element: 'Earth',
    rarity: 3,
    baseStats: { hp: 1250, atk: 350, def: 350, rec: 250 },
    growthRate: { hp: 42, atk: 12, def: 12, rec: 8 },
    maxLevel: 40,
    skill: { id: 's13', name: 'Arrow Rain', type: 'damage', description: 'Earth damage to all enemies', power: 1.4, cost: 18 },
    spriteUrl: `${BASE_URL}/abbys_sprite_013.png`
  },
  'u14': {
    id: 'u14',
    name: 'Mifune',
    element: 'Dark',
    rarity: 3,
    baseStats: { hp: 900, atk: 500, def: 200, rec: 150 },
    growthRate: { hp: 25, atk: 25, def: 5, rec: 5 },
    maxLevel: 40,
    skill: { id: 's14', name: 'Demon Slash', type: 'damage', description: 'Massive Dark damage to one enemy', power: 2.5, cost: 25 },
    spriteUrl: `${BASE_URL}/abbys_sprite_014.png`
  },
  'u15': {
    id: 'u15',
    name: 'Luna',
    element: 'Light',
    rarity: 3,
    baseStats: { hp: 1100, atk: 400, def: 300, rec: 350 },
    growthRate: { hp: 35, atk: 15, def: 10, rec: 12 },
    maxLevel: 40,
    skill: { id: 's15', name: 'Moonlight', type: 'heal', description: 'Heals all allies and removes status ailments', power: 1.5, cost: 30 },
    spriteUrl: `${BASE_URL}/abbys_sprite_015.png`
  }
};

export const ENEMIES: UnitTemplate[] = [
  {
    id: 'e1',
    name: 'Poring',
    element: 'Water',
    rarity: 1,
    baseStats: { hp: 500, atk: 100, def: 50, rec: 0 },  // Base: 500 HP
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es1', name: 'Tackle', type: 'damage', description: 'Basic attack', power: 1, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_016.png`
  },
  {
    id: 'e2',
    name: 'Fabre',
    element: 'Earth',
    rarity: 1,
    baseStats: { hp: 600, atk: 120, def: 60, rec: 0 },  // +20% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es2', name: 'Club', type: 'damage', description: 'Basic attack', power: 1.2, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_017.png`
  },
  {
    id: 'e3',
    name: 'Roda Frog',
    element: 'Water',
    rarity: 2,
    baseStats: { hp: 750, atk: 150, def: 80, rec: 0 },  // +50% from e1 (smooth)
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es3', name: 'Tongue', type: 'damage', description: 'Basic attack', power: 1.3, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_018.png`
  },
  {
    id: 'e4',
    name: 'Lunatic',
    element: 'Dark',
    rarity: 2,
    baseStats: { hp: 850, atk: 180, def: 70, rec: 0 },  // +70% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es4', name: 'Moon Hit', type: 'damage', description: 'Basic attack', power: 1.4, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_019.png`
  },
  {
    id: 'e5',
    name: 'Skeleton',
    element: 'Dark',
    rarity: 2,
    baseStats: { hp: 950, atk: 160, def: 100, rec: 0 },  // +90% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es5', name: 'Bone Strike', type: 'damage', description: 'Basic attack', power: 1.2, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_020.png`
  },
  {
    id: 'e6',
    name: 'Picky',
    element: 'Fire',
    rarity: 2,
    baseStats: { hp: 1050, atk: 170, def: 110, rec: 0 },  // +110% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es6', name: 'Peck', type: 'damage', description: 'Basic attack', power: 1.3, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_021.png`
  },
  {
    id: 'e7',
    name: 'Poporing',
    element: 'Water',
    rarity: 2,
    baseStats: { hp: 1200, atk: 190, def: 130, rec: 0 },  // +140% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es7', name: 'Slimy Hit', type: 'damage', description: 'Water attack', power: 1.4, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_016.png`
  },
  {
    id: 'e8',
    name: 'Dustiness',
    element: 'Earth',
    rarity: 3,
    baseStats: { hp: 1350, atk: 220, def: 150, rec: 0 },  // +170% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es8', name: 'Wind Cutter', type: 'damage', description: 'Earth attack', power: 1.5, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_017.png`
  },
  {
    id: 'e9',
    name: 'Orc Warrior',
    element: 'Earth',
    rarity: 3,
    baseStats: { hp: 1500, atk: 280, def: 160, rec: 0 },  // +200% from e1
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es9', name: 'Heavy Strike', type: 'damage', description: 'Earth attack', power: 1.6, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_006.png`
  },
  {
    id: 'e10',
    name: 'Drake',
    element: 'Water',
    rarity: 4,
    baseStats: { hp: 1800, atk: 350, def: 220, rec: 0 },  // +260% from e1 (3.6x, not 7x!)
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es10', name: 'Aqua Breath', type: 'damage', description: 'Massive water attack', power: 2.0, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_018.png`
  },
  // Arena Enemies
  {
    id: 'arena_shadow_knight',
    name: 'Shadow Knight',
    element: 'Dark',
    rarity: 4,
    baseStats: { hp: 5000, atk: 800, def: 600, rec: 100 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'arena_s1', name: 'Shadow Strike', type: 'damage', description: 'Dark attack', power: 1.5, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_001.png`
  },
  {
    id: 'arena_flame_warrior',
    name: 'Flame Warrior',
    element: 'Fire',
    rarity: 4,
    baseStats: { hp: 4500, atk: 900, def: 500, rec: 80 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'arena_s2', name: 'Flame Slash', type: 'damage', description: 'Fire attack', power: 1.6, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_002.png`
  },
  {
    id: 'arena_ice_mage',
    name: 'Ice Mage',
    element: 'Water',
    rarity: 4,
    baseStats: { hp: 3500, atk: 1000, def: 400, rec: 150 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'arena_s3', name: 'Ice Blast', type: 'damage', description: 'Water attack', power: 1.7, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_003.png`
  },
  {
    id: 'arena_thunder_lord',
    name: 'Thunder Lord',
    element: 'Thunder',
    rarity: 5,
    baseStats: { hp: 8000, atk: 1200, def: 700, rec: 120 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'arena_s4', name: 'Thunder Storm', type: 'damage', description: 'Thunder attack', power: 2.0, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_004.png`
  },
  {
    id: 'arena_light_guardian',
    name: 'Light Guardian',
    element: 'Light',
    rarity: 5,
    baseStats: { hp: 7500, atk: 1100, def: 800, rec: 200 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'arena_s5', name: 'Divine Smite', type: 'damage', description: 'Light attack', power: 1.9, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_005.png`
  },
  {
    id: 'arena_dark_emperor',
    name: 'Dark Emperor',
    element: 'Dark',
    rarity: 5,
    baseStats: { hp: 10000, atk: 1500, def: 900, rec: 180 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'arena_s6', name: 'Doom', type: 'damage', description: 'Ultimate dark attack', power: 2.5, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_006.png`
  }
];

export const STAGES: StageTemplate[] = [
  // Region 1: Izlude & Prontera (basic areas) - Smooth early scaling
  { id: 1, name: "Prontera", area: "Izlude Bridge", energy: 3, description: "Where every hero begins their journey.", enemies: ['e1', 'e2', 'e1'], expReward: 50, zelReward: 200, equipmentDrops: ['eq_w1', 'eq_a1'], equipmentDropChance: 0.3 },
  { id: 2, name: "Prontera", area: "Cave of East Gozar", energy: 4, description: "The first dungeon awaits beginners.", enemies: ['e2', 'e2', 'e3'], expReward: 80, zelReward: 350, equipmentDrops: ['eq_w2', 'eq_ac2'], equipmentDropChance: 0.3 },
  
  // Region 2: Geffen & Payon (mid areas) - ~10-15% harder per stage
  { id: 3, name: "Geffen", area: "Geffen Fields", energy: 5, description: "Fields outside the magic city.", enemies: ['e3', 'e4', 'e3'], expReward: 120, zelReward: 500, equipmentDrops: ['eq_w4', 'eq_ac1'], equipmentDropChance: 0.35 },
  { id: 4, name: "Payon", area: "Payon Forest", energy: 6, description: "Dense forest full of hostile creatures.", enemies: ['e4', 'e5', 'e4'], expReward: 180, zelReward: 800, equipmentDrops: ['eq_a2', 'eq_ac3'], equipmentDropChance: 0.4 },
  
  // Region 3: Glast Heim (hard areas) - Gradual progression
  { id: 5, name: "Glast Heim", area: "Glast Heim Castle", energy: 7, description: "The cursed castle of fallen knights.", enemies: ['e5', 'e6', 'e5'], expReward: 250, zelReward: 1200, equipmentDrops: ['eq_a3', 'eq_ac4'], equipmentDropChance: 0.45 },
  { id: 6, name: "Glast Heim", area: "Glast Heim Basement", energy: 8, description: "Deeper into the haunted castle.", enemies: ['e6', 'e7', 'e6'], expReward: 350, zelReward: 1800, equipmentDrops: ['eq_w3', 'eq_ac3'], equipmentDropChance: 0.5 },
  
  // Region 4: Endless Tower - Escalating but smooth
  { id: 7, name: "Tower", area: "Endless Tower - Floor 1", energy: 9, description: "The endless tower defies comprehension.", enemies: ['e7', 'e7', 'e8'], expReward: 500, zelReward: 2500, equipmentDrops: ['eq_w4', 'eq_a4'], equipmentDropChance: 0.55 },
  { id: 8, name: "Tower", area: "Endless Tower - Floor 10", energy: 10, description: "Each floor deadlier than the last.", enemies: ['e7', 'e8', 'e8'], expReward: 700, zelReward: 3500, equipmentDrops: ['eq_ac4'], equipmentDropChance: 0.6 },
  { id: 9, name: "Tower", area: "Endless Tower - Floor 20", energy: 12, description: "The darkness grows stronger.", enemies: ['e8', 'e8', 'e9', 'e7'], expReward: 1000, zelReward: 5000, equipmentDrops: [], equipmentDropChance: 0.7 },
  { id: 10, name: "Tower", area: "Endless Tower - Floor 30", energy: 15, description: "Only legends reach this high.", enemies: ['e9', 'e9', 'e8', 'e9', 'e8'], expReward: 1500, zelReward: 8000, equipmentDrops: [], equipmentDropChance: 0.8 },
 
  // Region 5: Niflheim (dungeon gates) - Back to easier stages for variety
  { id: 11, name: "Niflheim", area: "Nifflheim Gate", energy: 5, description: "The realm of the dead beckons.", enemies: ['e5', 'e6', 'e7'], expReward: 800, zelReward: 3000, equipmentDrops: ['eq_w2'], equipmentDropChance: 0.5 },
  { id: 12, name: "Niflheim", area: "Bio Labyrinth", energy: 5, description: "Where science and horror meet.", enemies: ['e6', 'e7', 'e8'], expReward: 800, zelReward: 3000, equipmentDrops: ['eq_a2'], equipmentDropChance: 0.5 },
  { id: 13, name: "Niflheim", area: "Umbara Dungeon", energy: 5, description: "Darkness incarnate.", enemies: ['e7', 'e8', 'e9'], expReward: 800, zelReward: 3000, equipmentDrops: ['eq_ac2'], equipmentDropChance: 0.5 },
  { id: 14, name: "Niflheim", area: "Jawaii", energy: 6, description: "The volcanic island of chaos.", enemies: ['e8', 'e8', 'e9'], expReward: 1000, zelReward: 4000, equipmentDrops: ['eq_w3'], equipmentDropChance: 0.6 },
  { id: 15, name: "Niflheim", area: "Thor Volcano", energy: 8, description: "Home of the legendary smith.", enemies: ['e9', 'e9', 'e10'], expReward: 1500, zelReward: 6000, equipmentDrops: ['eq_a3'], equipmentDropChance: 0.7 },
  { id: 16, name: "Niflheim", area: "Abyss Lake", energy: 10, description: "The bottomless lake of darkness.", enemies: ['e9', 'e10', 'e10'], expReward: 2000, zelReward: 8000, equipmentDrops: ['eq_w4'], equipmentDropChance: 0.8 },
  
  // Arena / Colosseum (IDs 100-199)
  { id: 100, name: "Arena", area: "Colosseum - Beginner", energy: 0, description: "Practice against shadow knights.", enemies: ['arena_shadow_knight'], expReward: 200, zelReward: 500, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 101, name: "Arena", area: "Colosseum - Warrior", energy: 0, description: "Face the flame warriors.", enemies: ['arena_flame_warrior'], expReward: 250, zelReward: 600, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 102, name: "Arena", area: "Colosseum - Mage", energy: 0, description: "Defeat the ice mages.", enemies: ['arena_ice_mage'], expReward: 300, zelReward: 700, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 103, name: "Arena", area: "Colosseum - Ranger", energy: 0, description: "Hunt with the thunder lord.", enemies: ['arena_thunder_lord'], expReward: 500, zelReward: 1000, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 104, name: "Arena", area: "Colosseum - Champion", energy: 0, description: "Prove your worth as a champion.", enemies: ['arena_light_guardian'], expReward: 600, zelReward: 1200, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 105, name: "Arena", area: "Colosseum - Champion", energy: 0, description: "The final test of champions.", enemies: ['arena_dark_emperor'], expReward: 1000, zelReward: 2000, equipmentDrops: [], equipmentDropChance: 0 },
];

export const GACHA_POOL: GachaRate[] = [
  // 3-star units (Common) - Weight 100
  { unitId: 'u1', weight: 100 }, { unitId: 'u2', weight: 100 }, { unitId: 'u3', weight: 100 },
  { unitId: 'u4', weight: 100 }, { unitId: 'u5', weight: 100 }, { unitId: 'u6', weight: 100 },
  { unitId: 'u13', weight: 100 }, { unitId: 'u14', weight: 100 }, { unitId: 'u15', weight: 100 },
  // 4-star units (Rare) - Weight 20
  { unitId: 'u7', weight: 20 }, { unitId: 'u8', weight: 20 }, { unitId: 'u9', weight: 20 },
  { unitId: 'u10', weight: 20 }, { unitId: 'u11', weight: 20 }, { unitId: 'u12', weight: 20 },
  // Evolution Materials - Weight 50
  { unitId: 'mat_fire', weight: 50 }, { unitId: 'mat_water', weight: 50 }, { unitId: 'mat_earth', weight: 50 },
  { unitId: 'mat_thunder', weight: 50 }, { unitId: 'mat_light', weight: 50 }, { unitId: 'mat_dark', weight: 50 },
];

export const QR_REWARD_TABLE: QRRewardTable[] = [
  { type: 'zel', chance: 40, min: 500, max: 2000 },
  { type: 'energy', chance: 25, min: 3, max: 7 },
  { type: 'gems', chance: 15, min: 1, max: 3 },
  { type: 'equipment', chance: 15 },
  { type: 'unit', chance: 5 }
];

export const EQUIPMENT_DATABASE: Record<string, EquipmentTemplate> = {
  'eq_w1': { id: 'eq_w1', name: 'Brave Sword', type: 'weapon', rarity: 1, statsBonus: { atk: 50 }, description: 'A basic sword for brave warriors.', icon: '⚔️' },
  'eq_w2': { id: 'eq_w2', name: 'Flame Blade', type: 'weapon', rarity: 2, statsBonus: { atk: 120, hp: 100 }, description: 'A sword imbued with fire.', icon: '🗡️' },
  'eq_w3': { id: 'eq_w3', name: 'Muramasa', type: 'weapon', rarity: 4, statsBonus: { atk: 250, def: -50 }, description: 'A cursed blade that grants immense power.', icon: '🗡️' },
  'eq_w4': { id: 'eq_w4', name: 'Holy Lance', type: 'weapon', rarity: 3, statsBonus: { atk: 180, rec: 100 }, description: 'A lance blessed by the gods.', icon: '🔱' },
  'eq_a1': { id: 'eq_a1', name: 'Leather Armor', type: 'armor', rarity: 1, statsBonus: { def: 50, hp: 200 }, description: 'Basic protection.', icon: '🛡️' },
  'eq_a2': { id: 'eq_a2', name: 'Knight Shield', type: 'armor', rarity: 2, statsBonus: { def: 150, hp: 500 }, description: 'Heavy shield for knights.', icon: '🛡️' },
  'eq_a3': { id: 'eq_a3', name: 'Dragon Scale', type: 'armor', rarity: 4, statsBonus: { def: 300, hp: 1000 }, description: 'Armor made from dragon scales.', icon: '🐉' },
  'eq_a4': { id: 'eq_a4', name: 'Phantom Cloak', type: 'armor', rarity: 3, statsBonus: { def: 100, hp: 300, rec: 200 }, description: 'A cloak that makes the wearer hard to hit.', icon: '🧥' },
  'eq_ac1': { id: 'eq_ac1', name: 'Health Ring', type: 'accessory', rarity: 1, statsBonus: { hp: 500, rec: 100 }, description: 'Boosts vitality.', icon: '💍' },
  'eq_ac2': { id: 'eq_ac2', name: 'Power Amulet', type: 'accessory', rarity: 2, statsBonus: { atk: 100, def: 50 }, description: 'Increases overall power.', icon: '📿' },
  'eq_ac3': { id: 'eq_ac3', name: 'Heroic Emblem', type: 'accessory', rarity: 4, statsBonus: { hp: 1000, atk: 100, def: 100, rec: 100 }, description: 'An emblem given to true heroes.', icon: '🏅' },
  'eq_ac4': { id: 'eq_ac4', name: 'Soul Gem', type: 'accessory', rarity: 3, statsBonus: { rec: 500 }, description: 'A gem that vastly improves recovery.', icon: '💎' },
};

export function getExpForLevel(level: number): number {
  // Exponential curve: 100 * 1.15^level
  if (level <= 0) return 0;
  return Math.floor(100 * Math.pow(1.15, level));
}

export function getElementMultiplier(attacker: Element, defender: Element): number {
  return ELEMENT_WEAKNESS[attacker]?.[defender] ?? 1.0;
}

export function getFusionCost(targetLevel: number, materialCount: number): number {
  return targetLevel * 100 * materialCount;
}

export function getFusionExpGain(materialRarity: number, materialLevel: number, isSameElement: boolean): number {
  let exp = materialRarity * 500 + materialLevel * 50;
  if (isSameElement) {
    exp = Math.floor(exp * 1.5);
  }
  return exp;
}

export function getEvolutionCost(targetRarity: number): number {
  return targetRarity * 10000;
}

export const EQUIPMENT_SETS: Record<string, EquipmentSet> = {
  'set_dragon': {
    id: 'set_dragon',
    name: 'Dragon Slayer',
    pieces: ['eq_w3', 'eq_a3', 'eq_ac3'],
    bonuses: [
      { name: 'Dragon Scale', description: '+15% ATK & DEF', piecesRequired: 2, statBonuses: { atk: 0.15, def: 0.15 } },
      { name: 'Dragon Slayer', description: '+30% Fire damage, +20% crit chance', piecesRequired: 3, specialEffect: { type: 'element', value: 0.3, element: 'Fire' }, statBonuses: { atk: 0.15, def: 0.15 } },
    ],
  },
  'set_holy': {
    id: 'set_holy',
    name: 'Holy Knight',
    pieces: ['eq_w4', 'eq_a2', 'eq_ac4'],
    bonuses: [
      { name: 'Divine Protection', description: '+10% HP, +10% DEF', piecesRequired: 2, statBonuses: { hp: 0.1, def: 0.1 } },
      { name: 'Holy Aura', description: '+20% healing, +25% damage reduction when >50% HP', piecesRequired: 3, specialEffect: { type: 'heal', value: 0.2 }, statBonuses: { hp: 0.1, def: 0.1, rec: 0.1 } },
    ],
  },
  'set_ninja': {
    id: 'set_ninja',
    name: 'Shadow Ninja',
    pieces: ['eq_w2', 'eq_a4', 'eq_ac2'],
    bonuses: [
      { name: 'Shadow Step', description: '+15% ATK, +10% evasion', piecesRequired: 2, statBonuses: { atk: 0.15 } },
      { name: 'Assassin', description: '+30% crit damage, +20% BB gauge on kill', piecesRequired: 3, specialEffect: { type: 'crit', value: 0.5 }, statBonuses: { atk: 0.15, def: 0.1 } },
    ],
  },
};

export function getEquipmentSet(setId: string): EquipmentSet | undefined {
  return EQUIPMENT_SETS[setId];
}

export function getSetBonus(setId: string, pieceCount: number): EquipmentSetBonus | undefined {
  const set = EQUIPMENT_SETS[setId];
  if (!set) return undefined;
  return set.bonuses.find(b => b.piecesRequired === pieceCount);
}

export function getActiveSetBonuses(equipment: { templateId: string }[]): EquipmentSetBonus[] {
  const setCounts: Record<string, number> = {};
  
  for (const eq of equipment) {
    const template = EQUIPMENT_DATABASE[eq.templateId];
    if (template?.setId) {
      setCounts[template.setId] = (setCounts[template.setId] || 0) + 1;
    }
  }
  
  const activeBonuses: EquipmentSetBonus[] = [];
  for (const [setId, count] of Object.entries(setCounts)) {
    const set = EQUIPMENT_SETS[setId];
    if (set) {
      const applicableBonus = set.bonuses
        .filter(b => b.piecesRequired <= count)
        .sort((a, b) => b.piecesRequired - a.piecesRequired)[0];
      if (applicableBonus) {
        activeBonuses.push(applicableBonus);
      }
    }
  }
  
  return activeBonuses;
}

// ============================================================================
// DUNGEON GENERATOR
// ============================================================================

import { DungeonTemplate, DungeonFloor } from './economyTypes';

function generateDungeonFloors(dungeonId: string, totalFloors: number, element: Element | 'mixed'): DungeonFloor[] {
  const floors: DungeonFloor[] = [];
  const baseEnemies = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];
  
  for (let i = 1; i <= totalFloors; i++) {
    const progress = i / totalFloors;
    let floorType: DungeonFloor['type'] = 'normal';
    let specialEvent: DungeonFloor['specialEvent'] = 'none';
    
    if (i === totalFloors) {
      floorType = 'boss';
    } else if (i % 5 === 0 && i < totalFloors) {
      floorType = 'elite';
      specialEvent = 'mini_boss';
    } else if (i % 10 === 0) {
      floorType = 'treasure';
      specialEvent = 'treasure';
    } else if (Math.random() < 0.15) {
      specialEvent = Math.random() < 0.5 ? 'heal' : 'mystery';
    }
    
    const hpMultiplier = 1 + (progress * 2);
    const atkMultiplier = 1 + (progress * 1.5);
    
    const enemyPool = baseEnemies.slice(0, Math.min(2 + Math.floor(progress * 4), 6));
    const selectedEnemies = Array(Math.min(1 + Math.floor(Math.random() * 3), 4)).fill(null).map(() => 
      enemyPool[Math.floor(Math.random() * enemyPool.length)]
    );
    
    const materialPool: MaterialType[] = ['ironOre', 'steelIngot', 'mythril'];
    if (progress > 0.5) materialPool.push('orichalcum');
    if (progress > 0.8) materialPool.push('dragonScale');
    
    floors.push({
      floorNumber: i,
      type: floorType,
      enemies: selectedEnemies,
      enemyCount: selectedEnemies.length,
      baseHpMultiplier: hpMultiplier,
      baseAtkMultiplier: atkMultiplier,
      zelReward: Math.floor(500 * (1 + progress) * i),
      expReward: Math.floor(300 * (1 + progress) * i),
      materialDrop: materialPool,
      equipmentDropChance: floorType === 'elite' ? 0.3 : floorType === 'boss' ? 0.5 : 0.1,
      specialEvent,
    });
  }
  
  return floors;
}

export const DUNGEONS: Record<string, DungeonTemplate> = {
  'dungeon_abyss': {
    id: 'dungeon_abyss',
    name: 'Abyss Gate',
    description: 'A dark portal leading to endless depths.',
    element: 'Dark',
    recommendedLevel: 10,
    totalFloors: 10,
    entryCost: 10,
    clearReward: { zel: 5000, gems: 5, materials: ['orichalcum'] },
    floors: generateDungeonFloors('dungeon_abyss', 10, 'Dark'),
  },
  'dungeon_dragon': {
    id: 'dungeon_dragon',
    name: "Dragon's Lair",
    description: 'A volcanic cave home to ancient dragons.',
    element: 'Fire',
    recommendedLevel: 30,
    totalFloors: 15,
    entryCost: 20,
    clearReward: { zel: 15000, gems: 15, materials: ['dragonScale', 'orichalcum'] },
    floors: generateDungeonFloors('dungeon_dragon', 15, 'Fire'),
  },
  'dungeon_ruins': {
    id: 'dungeon_ruins',
    name: 'Ancient Ruins',
    description: 'Crumbling ruins filled with mysteries.',
    element: 'Earth',
    recommendedLevel: 20,
    totalFloors: 12,
    entryCost: 15,
    clearReward: { zel: 8000, gems: 8, materials: ['mythril'] },
    floors: generateDungeonFloors('dungeon_ruins', 12, 'Earth'),
  },
  'dungeon_forest': {
    id: 'dungeon_forest',
    name: 'Phantom Forest',
    description: 'A twisted forest where spirits dwell.',
    element: 'Light',
    recommendedLevel: 25,
    totalFloors: 10,
    entryCost: 15,
    clearReward: { zel: 10000, gems: 10, materials: ['mythril', 'orichalcum'] },
    floors: generateDungeonFloors('dungeon_forest', 10, 'Light'),
  },
  'dungeon_volcano': {
    id: 'dungeon_volcano',
    name: 'Volcanic Cave',
    description: 'Beneath the mountains lies molten danger.',
    element: 'Fire',
    recommendedLevel: 35,
    totalFloors: 20,
    entryCost: 25,
    clearReward: { zel: 25000, gems: 25, materials: ['dragonScale'] },
    floors: generateDungeonFloors('dungeon_volcano', 20, 'Fire'),
  },
};

export function getDungeon(dungeonId: string): DungeonTemplate | undefined {
  return DUNGEONS[dungeonId];
}

export function getDungeonFloors(dungeonId: string): DungeonFloor[] {
  return DUNGEONS[dungeonId]?.floors || [];
}
