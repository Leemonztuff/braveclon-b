export type Element = 'Fire' | 'Water' | 'Earth' | 'Thunder' | 'Light' | 'Dark';

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

export interface EquipmentTemplate {
  id: string;
  name: string;
  type: EquipSlot;
  statsBonus: Partial<Stats>;
  description: string;
  icon: string;
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
  'mat_fire': { id: 'mat_fire', name: 'Fire Nymph', element: 'Fire', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_018.png` },
  'mat_water': { id: 'mat_water', name: 'Water Nymph', element: 'Water', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_016.png` },
  'mat_earth': { id: 'mat_earth', name: 'Earth Nymph', element: 'Earth', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_017.png` },
  'mat_thunder': { id: 'mat_thunder', name: 'Thunder Nymph', element: 'Thunder', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_019.png` },
  'mat_light': { id: 'mat_light', name: 'Light Nymph', element: 'Light', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_021.png` },
  'mat_dark': { id: 'mat_dark', name: 'Dark Nymph', element: 'Dark', rarity: 1, baseStats: { hp: 100, atk: 10, def: 10, rec: 10 }, growthRate: { hp: 0, atk: 0, def: 0, rec: 0 }, maxLevel: 1, skill: { id: 's_mat', name: 'None', type: 'damage', description: 'Material', power: 0, cost: 999 }, spriteUrl: `${BASE_URL}/abbys_sprite_020.png` },

  // Evolved Forms (4-star) - with leader skills and status effects
  'u1_4': { id: 'u1_4', name: 'Ignis Vargas', element: 'Fire', rarity: 4, baseStats: { hp: 1800, atk: 600, def: 450, rec: 300 }, growthRate: { hp: 50, atk: 20, def: 15, rec: 10 }, maxLevel: 60, skill: { id: 's1_4', name: 'Burst Flare', type: 'damage', description: 'Strong Fire damage to all enemies + burn', power: 1.8, cost: 24, target: 'all_enemies', statusEffect: { type: 'poison', chance: 0.5, power: 1, turns: 3 } }, leaderSkill: { id: 'ls1_4', name: 'Fire Lord', description: '+30% Fire damage to team', elementBoost: { Fire: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_001.png` },
  'u2_4': { id: 'u2_4', name: 'Aqua Selena', element: 'Water', rarity: 4, baseStats: { hp: 1650, atk: 500, def: 500, rec: 450 }, growthRate: { hp: 45, atk: 16, def: 16, rec: 14 }, maxLevel: 60, skill: { id: 's2_4', name: 'Glacial Dance', type: 'heal', description: 'Greatly heals all allies', power: 1.5, cost: 28, target: 'all_allies' }, leaderSkill: { id: 'ls2_4', name: 'Water Guardian', description: '+30% Water damage to team', elementBoost: { Water: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_002.png` },
  'u3_4': { id: 'u3_4', name: 'Terra Lance', element: 'Earth', rarity: 4, baseStats: { hp: 1950, atk: 450, def: 600, rec: 250 }, growthRate: { hp: 55, atk: 14, def: 20, rec: 8 }, maxLevel: 60, skill: { id: 's3_4', name: 'Grand Pike', type: 'damage', description: 'Strong Earth damage + weakness', power: 1.8, cost: 24, target: 'all_enemies', statusEffect: { type: 'weak', chance: 0.4, power: 0.5, turns: 2 } }, leaderSkill: { id: 'ls3_4', name: 'Earth Warden', description: '+30% Earth damage to team', elementBoost: { Earth: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_003.png` },
  'u4_4': { id: 'u4_4', name: 'Bolt Eze', element: 'Thunder', rarity: 4, baseStats: { hp: 1500, atk: 650, def: 350, rec: 300 }, growthRate: { hp: 40, atk: 24, def: 12, rec: 10 }, maxLevel: 60, skill: { id: 's4_4', name: 'Thunder Storm', type: 'damage', description: 'Strong Thunder damage + paralysis', power: 1.9, cost: 26, target: 'all_enemies', statusEffect: { type: 'paralysis', chance: 0.3, power: 1, turns: 2 } }, leaderSkill: { id: 'ls4_4', name: 'Thunder Lord', description: '+30% Thunder damage to team', elementBoost: { Thunder: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_004.png` },
  'u5_4': { id: 'u5_4', name: 'Lux Atro', element: 'Light', rarity: 4, baseStats: { hp: 1700, atk: 550, def: 550, rec: 350 }, growthRate: { hp: 48, atk: 18, def: 18, rec: 12 }, maxLevel: 60, skill: { id: 's5_4', name: 'Divine Light', type: 'damage', description: 'Strong Light damage + curse', power: 1.8, cost: 24, target: 'all_enemies', statusEffect: { type: 'curse', chance: 0.5, power: 0.5, turns: 3 } }, leaderSkill: { id: 'ls5_4', name: 'Light Bearer', description: '+30% Light damage to team', elementBoost: { Light: 0.3 } }, spriteUrl: `${BASE_URL}/abbys_sprite_005.png` },
  'u6_4': { id: 'u6_4', name: 'Nox Magress', element: 'Dark', rarity: 4, baseStats: { hp: 2100, atk: 480, def: 650, rec: 150 }, growthRate: { hp: 60, atk: 15, def: 22, rec: 6 }, maxLevel: 60, skill: { id: 's6_4', name: 'Abyssal Guard', type: 'damage', description: 'Strong Dark damage + injury', power: 1.7, cost: 24, target: 'all_enemies', statusEffect: { type: 'injured', chance: 0.6, power: 0.5, turns: 2 } }, leaderSkill: { id: 'ls6_4', name: 'Dark Shield', description: '+15% damage reduction to team', damageReduction: 0.15 }, spriteUrl: `${BASE_URL}/abbys_sprite_006.png` },

  'u1': {
    id: 'u1',
    name: 'Vargas',
    element: 'Fire',
    rarity: 3,
    baseStats: { hp: 1200, atk: 400, def: 300, rec: 200 },
    growthRate: { hp: 40, atk: 15, def: 10, rec: 8 },
    maxLevel: 40,
    skill: { id: 's1', name: 'Flare Ride', type: 'damage', description: 'Fire damage to all enemies', power: 1.5, cost: 20 },
    spriteUrl: `${BASE_URL}/abbys_sprite_001.png`,
    evolutionTarget: 'u1_4',
    evolutionMaterials: ['mat_fire', 'mat_fire']
  },
  'u2': {
    id: 'u2',
    name: 'Selena',
    element: 'Water',
    rarity: 3,
    baseStats: { hp: 1100, atk: 350, def: 350, rec: 300 },
    growthRate: { hp: 35, atk: 12, def: 12, rec: 10 },
    maxLevel: 40,
    skill: { id: 's2', name: 'Ice Dance', type: 'heal', description: 'Heals all allies', power: 1.2, cost: 25 },
    spriteUrl: `${BASE_URL}/abbys_sprite_002.png`,
    evolutionTarget: 'u2_4',
    evolutionMaterials: ['mat_water', 'mat_water']
  },
  'u3': {
    id: 'u3',
    name: 'Lance',
    element: 'Earth',
    rarity: 3,
    baseStats: { hp: 1300, atk: 300, def: 400, rec: 150 },
    growthRate: { hp: 45, atk: 10, def: 15, rec: 5 },
    maxLevel: 40,
    skill: { id: 's3', name: 'Earth Pike', type: 'damage', description: 'Earth damage to all enemies', power: 1.5, cost: 20 },
    spriteUrl: `${BASE_URL}/abbys_sprite_003.png`,
    evolutionTarget: 'u3_4',
    evolutionMaterials: ['mat_earth', 'mat_earth']
  },
  'u4': {
    id: 'u4',
    name: 'Eze',
    element: 'Thunder',
    rarity: 3,
    baseStats: { hp: 1000, atk: 450, def: 250, rec: 200 },
    growthRate: { hp: 30, atk: 18, def: 8, rec: 8 },
    maxLevel: 40,
    skill: { id: 's4', name: 'Lightning Strike', type: 'damage', description: 'Thunder damage to all enemies', power: 1.6, cost: 22 },
    spriteUrl: `${BASE_URL}/abbys_sprite_004.png`,
    evolutionTarget: 'u4_4',
    evolutionMaterials: ['mat_thunder', 'mat_thunder']
  },
  'u5': {
    id: 'u5',
    name: 'Atro',
    element: 'Light',
    rarity: 3,
    baseStats: { hp: 1150, atk: 380, def: 380, rec: 250 },
    growthRate: { hp: 38, atk: 14, def: 14, rec: 9 },
    maxLevel: 40,
    skill: { id: 's5', name: 'Holy Light', type: 'damage', description: 'Light damage to all enemies', power: 1.5, cost: 20 },
    spriteUrl: `${BASE_URL}/abbys_sprite_005.png`,
    evolutionTarget: 'u5_4',
    evolutionMaterials: ['mat_light', 'mat_light']
  },
  'u6': {
    id: 'u6',
    name: 'Magress',
    element: 'Dark',
    rarity: 3,
    baseStats: { hp: 1400, atk: 320, def: 450, rec: 100 },
    growthRate: { hp: 50, atk: 11, def: 16, rec: 4 },
    maxLevel: 40,
    skill: { id: 's6', name: 'Dark Guard', type: 'damage', description: 'Dark damage to all enemies', power: 1.4, cost: 20 },
    spriteUrl: `${BASE_URL}/abbys_sprite_006.png`,
    evolutionTarget: 'u6_4',
    evolutionMaterials: ['mat_dark', 'mat_dark']
  },
  'u7': {
    id: 'u7',
    name: 'Lava',
    element: 'Fire',
    rarity: 4,
    baseStats: { hp: 1500, atk: 500, def: 400, rec: 300 },
    growthRate: { hp: 45, atk: 18, def: 12, rec: 10 },
    maxLevel: 60,
    skill: { id: 's7', name: 'Flame Breath', type: 'damage', description: 'Fire damage to all enemies', power: 1.7, cost: 24 },
    extraSkill: { id: 'es7', name: 'Firestorm', type: 'buff', description: '+20% ATK to self after 3 hits', power: 1.2, cost: 0, target: 'self', turns: 3 },
    spriteUrl: `${BASE_URL}/abbys_sprite_007.png`
  },
  'u8': {
    id: 'u8',
    name: 'Mega',
    element: 'Water',
    rarity: 4,
    baseStats: { hp: 1400, atk: 450, def: 450, rec: 400 },
    growthRate: { hp: 40, atk: 15, def: 15, rec: 12 },
    maxLevel: 60,
    skill: { id: 's8', name: 'Tidal Wave', type: 'heal', description: 'Heals all allies', power: 1.4, cost: 30 },
    extraSkill: { id: 'es8', name: 'Aqua Regen', type: 'buff', description: '+15% REC to team when HP < 50%', power: 1.15, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_008.png`
  },
  'u9': {
    id: 'u9',
    name: 'Douglas',
    element: 'Earth',
    rarity: 4,
    baseStats: { hp: 1600, atk: 400, def: 500, rec: 200 },
    growthRate: { hp: 50, atk: 12, def: 18, rec: 6 },
    maxLevel: 60,
    skill: { id: 's9', name: 'Gatling Seed', type: 'damage', description: 'Earth damage to all enemies + def down', power: 1.6, cost: 26, statusEffect: { type: 'weak', chance: 0.4, power: 0.5, turns: 2 } },
    extraSkill: { id: 'es9', name: 'Earth Shield', type: 'buff', description: '+20% DEF when HP > 80%', power: 1.2, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_009.png`
  },
  'u10': {
    id: 'u10',
    name: 'Emilia',
    element: 'Thunder',
    rarity: 4,
    baseStats: { hp: 1300, atk: 550, def: 350, rec: 300 },
    growthRate: { hp: 35, atk: 22, def: 10, rec: 10 },
    maxLevel: 60,
    skill: { id: 's10', name: 'Spark Rush', type: 'damage', description: 'Thunder damage to all enemies', power: 1.9, cost: 26 },
    extraSkill: { id: 'es10', name: 'Thunder Focus', type: 'buff', description: '+30% ATK when BB ready', power: 1.3, cost: 0 },
    spriteUrl: `${BASE_URL}/abbys_sprite_010.png`
  },
  'u11': {
    id: 'u11',
    name: 'Will',
    element: 'Light',
    rarity: 4,
    baseStats: { hp: 1450, atk: 480, def: 480, rec: 350 },
    growthRate: { hp: 42, atk: 16, def: 16, rec: 11 },
    maxLevel: 60,
    skill: { id: 's11', name: 'Shining Slash', type: 'damage', description: 'Light damage to all enemies', power: 1.7, cost: 24 },
    extraSkill: { id: 'es11', name: 'Holy Barrier', type: 'buff', description: '-15% damage taken for 3 turns after using BB', power: 0.85, cost: 0, turns: 3 },
    spriteUrl: `${BASE_URL}/abbys_sprite_011.png`
  },
  'u12': {
    id: 'u12',
    name: 'Alice',
    element: 'Dark',
    rarity: 4,
    baseStats: { hp: 1700, atk: 420, def: 550, rec: 150 },
    growthRate: { hp: 55, atk: 14, def: 20, rec: 5 },
    maxLevel: 60,
    skill: { id: 's12', name: 'Blood Drain', type: 'damage', description: 'Dark damage + heal from damage', power: 1.5, cost: 22 },
    extraSkill: { id: 'es12', name: 'Life Steal', type: 'heal', description: 'Heal 10% of damage dealt', power: 0.1, cost: 0 },
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
    name: 'Slime',
    element: 'Water',
    rarity: 1,
    baseStats: { hp: 500, atk: 100, def: 50, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es1', name: 'Tackle', type: 'damage', description: 'Basic attack', power: 1, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_016.png`
  },
  {
    id: 'e2',
    name: 'Goblin',
    element: 'Earth',
    rarity: 1,
    baseStats: { hp: 800, atk: 150, def: 80, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es2', name: 'Club', type: 'damage', description: 'Basic attack', power: 1.2, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_017.png`
  },
  {
    id: 'e3',
    name: 'Orc',
    element: 'Fire',
    rarity: 2,
    baseStats: { hp: 1200, atk: 200, def: 120, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es3', name: 'Smash', type: 'damage', description: 'Basic attack', power: 1.3, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_018.png`
  },
  {
    id: 'e4',
    name: 'Harpy',
    element: 'Thunder',
    rarity: 2,
    baseStats: { hp: 900, atk: 250, def: 90, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es4', name: 'Claw', type: 'damage', description: 'Basic attack', power: 1.4, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_019.png`
  },
  {
    id: 'e5',
    name: 'Skeleton',
    element: 'Dark',
    rarity: 2,
    baseStats: { hp: 1000, atk: 180, def: 150, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es5', name: 'Bone Strike', type: 'damage', description: 'Basic attack', power: 1.2, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_020.png`
  },
  {
    id: 'e6',
    name: 'Angel',
    element: 'Light',
    rarity: 2,
    baseStats: { hp: 1100, atk: 190, def: 140, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es6', name: 'Holy Ray', type: 'damage', description: 'Basic attack', power: 1.3, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_021.png`
  },
  {
    id: 'e7',
    name: 'Ice Elemental',
    element: 'Water',
    rarity: 2,
    baseStats: { hp: 1500, atk: 220, def: 150, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es7', name: 'Ice Shard', type: 'damage', description: 'Water attack', power: 1.4, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_016.png`
  },
  {
    id: 'e8',
    name: 'Golem',
    element: 'Earth',
    rarity: 3,
    baseStats: { hp: 2000, atk: 280, def: 200, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es8', name: 'Boulder Toss', type: 'damage', description: 'Earth attack', power: 1.5, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_017.png`
  },
  {
    id: 'e9',
    name: 'Demon',
    element: 'Dark',
    rarity: 3,
    baseStats: { hp: 1800, atk: 350, def: 180, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es9', name: 'Shadow Slash', type: 'damage', description: 'Dark attack', power: 1.6, cost: 100 },
    spriteUrl: `${BASE_URL}/abbys_sprite_006.png`
  },
  {
    id: 'e10',
    name: 'Dragon',
    element: 'Fire',
    rarity: 4,
    baseStats: { hp: 3500, atk: 450, def: 300, rec: 0 },
    growthRate: { hp: 0, atk: 0, def: 0, rec: 0 },
    maxLevel: 1,
    skill: { id: 'es10', name: 'Dragon Fire', type: 'damage', description: 'Massive fire attack', power: 2.0, cost: 100 },
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
  // Region 1: Mistral (basic areas)
  { id: 1, name: "Mistral", area: "Adventurer's Prairie", energy: 3, description: "Where it all begins.", enemies: ['e1', 'e2', 'e1'], expReward: 50, zelReward: 200, equipmentDrops: ['eq_w1', 'eq_a1'], equipmentDropChance: 0.3 },
  { id: 2, name: "Mistral", area: "Cave of Flames", energy: 4, description: "A hot challenge.", enemies: ['e3', 'e3', 'e1'], expReward: 80, zelReward: 350, equipmentDrops: ['eq_w2', 'eq_ac2'], equipmentDropChance: 0.3 },
  
  // Region 2: Morgan (mid areas)
  { id: 3, name: "Morgan", area: "Destroyed Cathedral", energy: 5, description: "Ruins of the past.", enemies: ['e5', 'e6', 'e5'], expReward: 120, zelReward: 500, equipmentDrops: ['eq_w4', 'eq_ac1'], equipmentDropChance: 0.35 },
  { id: 4, name: "St. Lamia", area: "Blood Forest", energy: 6, description: "Beware the harpies.", enemies: ['e4', 'e2', 'e4'], expReward: 180, zelReward: 800, equipmentDrops: ['eq_a2', 'eq_ac3'], equipmentDropChance: 0.4 },
  
  // Region 3: New areas (expansion)
  { id: 5, name: "Mysras", area: "Frozen Wasteland", energy: 7, description: "Endless ice plains.", enemies: ['e1', 'e7', 'e1'], expReward: 250, zelReward: 1200, equipmentDrops: ['eq_a3', 'eq_ac4'], equipmentDropChance: 0.45 },
  { id: 6, name: "Mysras", area: "Crystal Caverns", energy: 8, description: "Beautiful but dangerous.", enemies: ['e7', 'e7', 'e3'], expReward: 350, zelReward: 1800, equipmentDrops: ['eq_w3', 'eq_ac3'], equipmentDropChance: 0.5 },
  
  // Region 4: Tower/Babel
  { id: 7, name: "Babel", area: "Tower of Babel - Floor 1", energy: 9, description: "The tower rises...", enemies: ['e8', 'e8', 'e1'], expReward: 500, zelReward: 2500, equipmentDrops: ['eq_w4', 'eq_a4'], equipmentDropChance: 0.55 },
  { id: 8, name: "Babel", area: "Tower of Babel - Floor 10", energy: 10, description: "Climb higher!", enemies: ['e8', 'e9', 'e8'], expReward: 700, zelReward: 3500, equipmentDrops: ['eq_ac4'], equipmentDropChance: 0.6 },
  { id: 9, name: "Babel", area: "Tower of Babel - Floor 20", energy: 12, description: "The final challenge nears.", enemies: ['e9', 'e9', 'e8', 'e5'], expReward: 1000, zelReward: 5000, equipmentDrops: [], equipmentDropChance: 0.7 },
  { id: 10, name: "Babel", area: "Tower of Babel - Floor 30", energy: 15, description: "Only the brave survive.", enemies: ['e10', 'e10', 'e9', 'e5', 'e6'], expReward: 1500, zelReward: 8000, equipmentDrops: [], equipmentDropChance: 0.8 },

  // Region 5: Vortex Gates (Special dungeons)
  { id: 11, name: "Vortex", area: "Fire Gate - Trial 1", energy: 5, description: "Endless fire trials", enemies: ['e3', 'e3', 'e3'], expReward: 800, zelReward: 3000, equipmentDrops: ['eq_w2'], equipmentDropChance: 0.5 },
  { id: 12, name: "Vortex", area: "Water Gate - Trial 1", energy: 5, description: "Endless water trials", enemies: ['e1', 'e1', 'e2'], expReward: 800, zelReward: 3000, equipmentDrops: ['eq_a2'], equipmentDropChance: 0.5 },
  { id: 13, name: "Vortex", area: "Earth Gate - Trial 1", energy: 5, description: "Endless earth trials", enemies: ['e2', 'e2', 'e2'], expReward: 800, zelReward: 3000, equipmentDrops: ['eq_ac2'], equipmentDropChance: 0.5 },
  { id: 14, name: "Vortex", area: "Thunder Gate - Trial 1", energy: 6, description: "Endless thunder trials", enemies: ['e4', 'e4', 'e4'], expReward: 1000, zelReward: 4000, equipmentDrops: ['eq_w3'], equipmentDropChance: 0.6 },
  { id: 15, name: "Vortex", area: "Light Gate - Trial 1", energy: 8, description: "Endless light trials", enemies: ['e6', 'e6', 'e6'], expReward: 1500, zelReward: 6000, equipmentDrops: ['eq_a3'], equipmentDropChance: 0.7 },
  { id: 16, name: "Vortex", area: "Dark Gate - Trial 1", energy: 10, description: "Endless dark trials", enemies: ['e5', 'e5', 'e5'], expReward: 2000, zelReward: 8000, equipmentDrops: ['eq_w4'], equipmentDropChance: 0.8 },

  // Arena / Practice Mode (IDs 100-199)
  { id: 100, name: "Arena", area: "Practice - Shadow Knight", energy: 0, description: "Dark elemental challenge", enemies: ['arena_shadow_knight'], expReward: 200, zelReward: 500, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 101, name: "Arena", area: "Practice - Flame Warrior", energy: 0, description: "Fire elemental challenge", enemies: ['arena_flame_warrior'], expReward: 250, zelReward: 600, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 102, name: "Arena", area: "Practice - Ice Mage", energy: 0, description: "Water elemental challenge", enemies: ['arena_ice_mage'], expReward: 300, zelReward: 700, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 103, name: "Arena", area: "Practice - Thunder Lord", energy: 0, description: "Thunder elemental challenge", enemies: ['arena_thunder_lord'], expReward: 500, zelReward: 1000, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 104, name: "Arena", area: "Practice - Light Guardian", energy: 0, description: "Light elemental challenge", enemies: ['arena_light_guardian'], expReward: 600, zelReward: 1200, equipmentDrops: [], equipmentDropChance: 0 },
  { id: 105, name: "Arena", area: "Practice - Dark Emperor", energy: 0, description: "Final arena challenge", enemies: ['arena_dark_emperor'], expReward: 1000, zelReward: 2000, equipmentDrops: [], equipmentDropChance: 0 },
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
  'eq_w1': { id: 'eq_w1', name: 'Brave Sword', type: 'weapon', statsBonus: { atk: 50 }, description: 'A basic sword for brave warriors.', icon: '⚔️' },
  'eq_w2': { id: 'eq_w2', name: 'Flame Blade', type: 'weapon', statsBonus: { atk: 120, hp: 100 }, description: 'A sword imbued with fire.', icon: '🗡️' },
  'eq_w3': { id: 'eq_w3', name: 'Muramasa', type: 'weapon', statsBonus: { atk: 250, def: -50 }, description: 'A cursed blade that grants immense power.', icon: '🗡️' },
  'eq_w4': { id: 'eq_w4', name: 'Holy Lance', type: 'weapon', statsBonus: { atk: 180, rec: 100 }, description: 'A lance blessed by the gods.', icon: '🔱' },
  'eq_a1': { id: 'eq_a1', name: 'Leather Armor', type: 'armor', statsBonus: { def: 50, hp: 200 }, description: 'Basic protection.', icon: '🛡️' },
  'eq_a2': { id: 'eq_a2', name: 'Knight Shield', type: 'armor', statsBonus: { def: 150, hp: 500 }, description: 'Heavy shield for knights.', icon: '🛡️' },
  'eq_a3': { id: 'eq_a3', name: 'Dragon Scale', type: 'armor', statsBonus: { def: 300, hp: 1000 }, description: 'Armor made from dragon scales.', icon: '🐉' },
  'eq_a4': { id: 'eq_a4', name: 'Phantom Cloak', type: 'armor', statsBonus: { def: 100, hp: 300, rec: 200 }, description: 'A cloak that makes the wearer hard to hit.', icon: '🧥' },
  'eq_ac1': { id: 'eq_ac1', name: 'Health Ring', type: 'accessory', statsBonus: { hp: 500, rec: 100 }, description: 'Boosts vitality.', icon: '💍' },
  'eq_ac2': { id: 'eq_ac2', name: 'Power Amulet', type: 'accessory', statsBonus: { atk: 100, def: 50 }, description: 'Increases overall power.', icon: '📿' },
  'eq_ac3': { id: 'eq_ac3', name: 'Heroic Emblem', type: 'accessory', statsBonus: { hp: 1000, atk: 100, def: 100, rec: 100 }, description: 'An emblem given to true heroes.', icon: '🏅' },
  'eq_ac4': { id: 'eq_ac4', name: 'Soul Gem', type: 'accessory', statsBonus: { rec: 500 }, description: 'A gem that vastly improves recovery.', icon: '💎' },
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
