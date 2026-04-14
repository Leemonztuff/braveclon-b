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

export type SkillType = 'damage' | 'heal' | 'buff';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  power: number; // Multiplier for damage or heal
  cost: number; // BB gauge cost
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

  // Evolved Forms (4-star)
  'u1_4': { id: 'u1_4', name: 'Ignis Vargas', element: 'Fire', rarity: 4, baseStats: { hp: 1800, atk: 600, def: 450, rec: 300 }, growthRate: { hp: 50, atk: 20, def: 15, rec: 10 }, maxLevel: 60, skill: { id: 's1_4', name: 'Burst Flare', type: 'damage', description: 'Strong Fire damage to all enemies', power: 1.8, cost: 24 }, spriteUrl: `${BASE_URL}/abbys_sprite_001.png` },
  'u2_4': { id: 'u2_4', name: 'Aqua Selena', element: 'Water', rarity: 4, baseStats: { hp: 1650, atk: 500, def: 500, rec: 450 }, growthRate: { hp: 45, atk: 16, def: 16, rec: 14 }, maxLevel: 60, skill: { id: 's2_4', name: 'Glacial Dance', type: 'heal', description: 'Greatly heals all allies', power: 1.5, cost: 28 }, spriteUrl: `${BASE_URL}/abbys_sprite_002.png` },
  'u3_4': { id: 'u3_4', name: 'Terra Lance', element: 'Earth', rarity: 4, baseStats: { hp: 1950, atk: 450, def: 600, rec: 250 }, growthRate: { hp: 55, atk: 14, def: 20, rec: 8 }, maxLevel: 60, skill: { id: 's3_4', name: 'Grand Pike', type: 'damage', description: 'Strong Earth damage to all enemies', power: 1.8, cost: 24 }, spriteUrl: `${BASE_URL}/abbys_sprite_003.png` },
  'u4_4': { id: 'u4_4', name: 'Bolt Eze', element: 'Thunder', rarity: 4, baseStats: { hp: 1500, atk: 650, def: 350, rec: 300 }, growthRate: { hp: 40, atk: 24, def: 12, rec: 10 }, maxLevel: 60, skill: { id: 's4_4', name: 'Thunder Storm', type: 'damage', description: 'Strong Thunder damage to all enemies', power: 1.9, cost: 26 }, spriteUrl: `${BASE_URL}/abbys_sprite_004.png` },
  'u5_4': { id: 'u5_4', name: 'Lux Atro', element: 'Light', rarity: 4, baseStats: { hp: 1700, atk: 550, def: 550, rec: 350 }, growthRate: { hp: 48, atk: 18, def: 18, rec: 12 }, maxLevel: 60, skill: { id: 's5_4', name: 'Divine Light', type: 'damage', description: 'Strong Light damage to all enemies', power: 1.8, cost: 24 }, spriteUrl: `${BASE_URL}/abbys_sprite_005.png` },
  'u6_4': { id: 'u6_4', name: 'Nox Magress', element: 'Dark', rarity: 4, baseStats: { hp: 2100, atk: 480, def: 650, rec: 150 }, growthRate: { hp: 60, atk: 15, def: 22, rec: 6 }, maxLevel: 60, skill: { id: 's6_4', name: 'Abyssal Guard', type: 'damage', description: 'Strong Dark damage to all enemies', power: 1.7, cost: 24 }, spriteUrl: `${BASE_URL}/abbys_sprite_006.png` },

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
    skill: { id: 's8', name: 'Tidal Wave', type: 'damage', description: 'Water damage to all enemies', power: 1.6, cost: 22 },
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
    skill: { id: 's9', name: 'Gatling Seed', type: 'damage', description: 'Earth damage to all enemies', power: 1.8, cost: 28 },
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
    skill: { id: 's12', name: 'Blood Drain', type: 'damage', description: 'Dark damage to all enemies', power: 1.6, cost: 22 },
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
  }
];

export const STAGES: StageTemplate[] = [
  { id: 1, name: "Mistral", area: "Adventurer's Prairie", energy: 3, description: "Where it all begins.", enemies: ['e1', 'e2', 'e1'], expReward: 50, zelReward: 200, equipmentDrops: ['eq_w1', 'eq_a1'], equipmentDropChance: 0.3 },
  { id: 2, name: "Mistral", area: "Cave of Flames", energy: 4, description: "A hot challenge.", enemies: ['e3', 'e3', 'e1'], expReward: 80, zelReward: 350, equipmentDrops: ['eq_w2', 'eq_ac2'], equipmentDropChance: 0.3 },
  { id: 3, name: "Morgan", area: "Destroyed Cathedral", energy: 5, description: "Ruins of the past.", enemies: ['e5', 'e6', 'e5'], expReward: 120, zelReward: 500, equipmentDrops: ['eq_w4', 'eq_ac1'], equipmentDropChance: 0.35 },
  { id: 4, name: "St. Lamia", area: "Blood Forest", energy: 6, description: "Beware the harpies.", enemies: ['e4', 'e2', 'e4'], expReward: 180, zelReward: 800, equipmentDrops: ['eq_a2', 'eq_ac3'], equipmentDropChance: 0.4 },
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
  return level * 100;
}

export function getElementMultiplier(attacker: Element, defender: Element): number {
  if (attacker === 'Fire' && defender === 'Earth') return 2.0;
  if (attacker === 'Earth' && defender === 'Thunder') return 2.0;
  if (attacker === 'Thunder' && defender === 'Water') return 2.0;
  if (attacker === 'Water' && defender === 'Fire') return 2.0;
  
  if (attacker === 'Earth' && defender === 'Fire') return 0.5;
  if (attacker === 'Thunder' && defender === 'Earth') return 0.5;
  if (attacker === 'Water' && defender === 'Thunder') return 0.5;
  if (attacker === 'Fire' && defender === 'Water') return 0.5;

  if (attacker === 'Light' && defender === 'Dark') return 2.0;
  if (attacker === 'Dark' && defender === 'Light') return 2.0;

  return 1.0;
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
