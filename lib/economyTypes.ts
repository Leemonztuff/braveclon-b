import { UnitTemplate, Stats, EquipSlot, Element } from './gameData';

// ============================================================================
// CORE CURRENCY TYPES
// ============================================================================

export type CurrencyType = 'zel' | 'gems' | 'arenaMedals' | 'guildCoins' | 'honorPoints';

export interface CurrencyState {
  zel: number;
  gems: number;
  arenaMedals: number;
  guildCoins: number;
  honorPoints: number;
}

export const CURRENCY_CONFIG: Record<CurrencyType, {
  name: string;
  icon: string;
  color: string;
  softCap?: number;
}> = {
  zel: { name: 'Zel', icon: '💰', color: 'text-yellow-500' },
  gems: { name: 'Gems', icon: '💎', color: 'text-cyan-400' },
  arenaMedals: { name: 'Arena Medals', icon: '🏅', color: 'text-slate-400' },
  guildCoins: { name: 'Guild Coins', icon: '🔰', color: 'text-orange-500' },
  honorPoints: { name: 'Honor', icon: '⭐', color: 'text-rainbow' },
};

// ============================================================================
// ENHANCEMENT MATERIALS
// ============================================================================

export type MaterialType = 
  | 'ironOre' | 'steelIngot' | 'mythril' | 'orichalcum' | 'dragonScale'
  | 'prism5' | 'prism4' | 'prism3';

export interface MaterialInstance {
  id: string;
  type: MaterialType;
  quantity: number;
}

export interface MaterialConfig {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  color: string;
  enhanceValue: number; // Enhancement points provided
  sources: string[];
}

export const MATERIAL_CONFIG: Record<MaterialType, MaterialConfig> = {
  ironOre: { name: 'Iron Ore', rarity: 'common', icon: '🪨', color: 'text-slate-400', enhanceValue: 1, sources: ['stage_drop', 'shop'] },
  steelIngot: { name: 'Steel Ingot', rarity: 'uncommon', icon: '🔩', color: 'text-blue-400', enhanceValue: 5, sources: ['stage_drop', 'craft'] },
  mythril: { name: 'Mythril', rarity: 'rare', icon: '💠', color: 'text-purple-400', enhanceValue: 15, sources: ['boss_drop', 'craft'] },
  orichalcum: { name: 'Orichalcum', rarity: 'epic', icon: '🔮', color: 'text-pink-400', enhanceValue: 30, sources: ['raid_drop'] },
  dragonScale: { name: 'Dragon Scale', rarity: 'legendary', icon: '🐉', color: 'text-red-500', enhanceValue: 50, sources: ['endgame_content'] },
  prism5: { name: '5★ Prism', rarity: 'legendary', icon: '💠', color: 'text-cyan-300', enhanceValue: 0, sources: ['duplicate_5star'] },
  prism4: { name: '4★ Prism', rarity: 'epic', icon: '💎', color: 'text-blue-300', enhanceValue: 0, sources: ['duplicate_4star'] },
  prism3: { name: '3★ Prism', rarity: 'rare', icon: '💧', color: 'text-blue-200', enhanceValue: 0, sources: ['duplicate_3star'] },
};

// ============================================================================
// UNIT INSTANCES & EQUIPMENT
// ============================================================================

export interface UnitInstance {
  instanceId: string;
  templateId: string;
  level: number;
  exp: number;
  equipment: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  // Duplicate tracking for fusion bonus
  timesFused?: number;
  // Prestige system
  isPrestige?: boolean;
}

export interface EquipInstance {
  instanceId: string;
  templateId: string;
  enhancementLevel: number; // 0-20
  sockets: (string | null)[]; // Gem slots (max 4)
}

// ============================================================================
// DAILY & WEEKLY SYSTEMS
// ============================================================================

export interface DailyQuest {
  id: string;
  name: string;
  description: string;
  requirement: number;
  current: number;
  reward: {
    type: CurrencyType;
    amount: number;
  };
  claimed: boolean;
}

export interface WeeklyQuest {
  id: string;
  name: string;
  description: string;
  requirement: number;
  current: number;
  reward: {
    type: CurrencyType;
    amount: number;
  };
  claimed: boolean;
}

export interface DailyState {
  lastResetDate: string;
  quests: DailyQuest[];
  loginStreak: number;
  lastLoginDate: string;
}

export interface WeeklyState {
  lastResetDate: string;
  quests: WeeklyQuest[];
  dayOfWeek: number; // 0-6
}

// ============================================================================
// SUMMON SYSTEM
// ============================================================================

export type BannerType = 'standard' | 'featured' | 'stepup' | 'multi';

export interface GachaBanner {
  id: string;
  name: string;
  type: BannerType;
  cost: number;
  pullCount: number;
  featuredUnits?: string[];
  featuredRate: number; // Extra rate for featured units
  pityPulls: number;
  pityRarity: number; // Which rarity has pity (4 or 5)
  startDate?: string;
  endDate?: string;
}

export interface SummonPity {
  star5Pulls: number;
  star4Pulls: number;
  lastStar5Pull: number;
  lastStar4Pull: number;
  totalPulls: number;
  bannerPulls: Record<string, number>; // Per-banner tracking
}

export interface SummonResult {
  templateId: string;
  rarity: number;
  isNew: boolean;
  duplicate: boolean;
  prismValue: number;
  zelValue: number;
}

// ============================================================================
// BATTLE PASS SYSTEM
// ============================================================================

export interface BattlePassTier {
  level: number;
  freeReward: { type: CurrencyType; amount: number };
  premiumReward: { type: CurrencyType; amount: number; itemId?: string };
}

export interface BattlePassState {
  currentXP: number;
  seasonStart: string;
  seasonEnd: string;
  tierUnlocked: number;
  premiumPurchased: boolean;
  claimedTiers: number[];
}

// ============================================================================
// SUBSCRIPTION SYSTEM
// ============================================================================

export type SubscriptionTier = 'none' | 'bronze' | 'silver' | 'gold';

export interface SubscriptionBenefits {
  weeklyGems: number;
  dailyEnergyBonus: number;
  zelBonus: number;
  allBonus: number;
  exclusiveShop: boolean;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  startDate: string;
  nextRefreshDate: string;
  totalClaimed: number;
}

// ============================================================================
// ACHIEVEMENTS & STATS
// ============================================================================

export interface PlayerStats {
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalZelEarned: number;
  totalGemsSpent: number;
  totalSummons: number;
  highestArenaRank: number;
  totalUnitsCollected: number;
  totalEquipmentCollected: number;
  highestPlayerLevel: number;
  totalFusionPerformed: number;
  totalEvolutionPerformed: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  current: number;
  reward: { type: CurrencyType; amount: number };
  claimed: boolean;
  category: 'battles' | 'collection' | 'progression' | 'social';
}

// ============================================================================
// QR & DAILY REWARD SYSTEM
// ============================================================================

export interface QRState {
  scansToday: number;
  lastScanDate: string;
  scannedHashes: string[];
  lifetimeScans: number;
}

// ============================================================================
// CRAFTING SYSTEM
// ============================================================================

export type CraftOutputType = 'equipment' | 'material' | 'item';

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  outputType: CraftOutputType;
  outputId: string;
  outputQuantity: number;
  materials: Record<MaterialType, number>;
  zelCost: number;
  requiredLevel: number;
  category: 'weapon' | 'armor' | 'accessory' | 'enhancement' | 'consumable';
}

export interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  type: 'energy' | 'buff' | 'battle' | 'special';
  value: number;
  duration?: number;
  icon: string;
}

// ============================================================================
// DUNGEON SYSTEM
// ============================================================================

export type DungeonFloorType = 'normal' | 'elite' | 'boss' | 'treasure' | 'event';

export interface DungeonFloor {
  floorNumber: number;
  type: DungeonFloorType;
  enemies: string[];
  enemyCount: number;
  baseHpMultiplier: number;
  baseAtkMultiplier: number;
  zelReward: number;
  expReward: number;
  materialDrop?: MaterialType[];
  equipmentDropChance?: number;
  specialEvent?: 'heal' | 'treasure' | 'mystery' | 'mini_boss' | 'none';
}

export interface DungeonTemplate {
  id: string;
  name: string;
  description: string;
  element: Element | 'mixed';
  recommendedLevel: number;
  totalFloors: number;
  entryCost: number;
  clearReward: {
    zel: number;
    gems?: number;
    materials?: MaterialType[];
  };
  floors: DungeonFloor[];
}

export const DUNGEON_TYPES = ['Abyss Gate', "Dragon's Lair", 'Ancient Ruins', 'Phantom Forest', 'Volcanic Cave'] as const;

// ============================================================================
// GUILD SYSTEM
// ============================================================================

export type GuildRank = 'leader' | 'officer' | 'member' | 'recruit';

export interface GuildMember {
  userId: string;
  name: string;
  rank: GuildRank;
  contribution: number;
  joinedAt: string;
  weeklyContribution: number;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  leaderId: string;
  members: GuildMember[];
  level: number;
  exp: number;
  totalMembers: number;
  maxMembers: number;
  createdAt: string;
  guildCoins: number;
  dailyDonation: number;
}

export interface GuildActivity {
  id: string;
  guildId: string;
  type: 'donation' | 'upgrade' | 'member_join' | 'member_leave' | 'quest_complete' | 'raid_clear';
  description: string;
  timestamp: string;
  userId?: string;
}

export interface GuildQuest {
  id: string;
  guildId: string;
  name: string;
  description: string;
  requiredContribution: number;
  reward: {
    guildExp: number;
    guildCoins: number;
    memberRewards?: { userId: string; reward: number }[];
  };
  donors: string[];
  completed: boolean;
  expiresAt: string;
}

export type ShopCategory = 'units' | 'equipment' | 'items' | 'materials' | 'craft';

export interface ShopUnitListing {
  id: string;
  templateId: string;
  price: number;
  currency: CurrencyType;
  requiredLevel: number;
}

export interface ShopEquipmentListing {
  id: string;
  templateId: string;
  price: number;
  currency: CurrencyType;
  stock: number;
  maxStock: number;
  refreshesAt?: string;
}

export interface ShopItemListing {
  id: string;
  consumableId: string;
  price: number;
  currency: CurrencyType;
  stock: number;
  maxStock: number;
}

export interface ShopMaterialListing {
  id: string;
  materialType: MaterialType;
  quantity: number;
  price: number;
  currency: CurrencyType;
  stock: number;
  maxStock: number;
}

// ============================================================================
// PLAYER STATE (Complete)
// ============================================================================

export interface PlayerState {
  // Identity
  playerName: string;
  playerLevel: number;
  exp: number;
  rank: number;
  arenaScore: number;
  
  // Core Resources
  energy: number;
  maxEnergy: number;
  lastEnergyUpdateTime: number;
  
  // Currencies
  zel: number;
  gems: number;
  arenaMedals: number;
  guildCoins: number;
  honorPoints: number;
  
  // Materials
  materials: Record<MaterialType, number>;
  
  // Inventory
  inventory: UnitInstance[];
  equipmentInventory: EquipInstance[];
  team: (string | null)[]; // 7 slots (BF style)
  
  // Summon System
  summonPity: SummonPity;
  ownedUnitIds: Set<string>; // Track which units player has ever obtained
  
  // Daily/Weekly Systems
  dailyState: DailyState;
  weeklyState: WeeklyState;
  
  // Premium Systems
  battlePass: BattlePassState;
  subscription: SubscriptionState;
  
  // Achievements
  achievements: Achievement[];
  
  // Stats
  stats: PlayerStats;
  
  // QR System
  qrState: QRState;
  
  // Timestamps
  createdAt: number;
  lastPlayedAt: number;
}

// ============================================================================
// INITIAL STATES
// ============================================================================

export const INITIAL_CURRENCY: CurrencyState = {
  zel: 1000,
  gems: 50,
  arenaMedals: 0,
  guildCoins: 0,
  honorPoints: 0,
};

export const INITIAL_MATERIALS: Record<MaterialType, number> = {
  ironOre: 10,
  steelIngot: 0,
  mythril: 0,
  orichalcum: 0,
  dragonScale: 0,
  prism5: 0,
  prism4: 0,
  prism3: 0,
};

export const INITIAL_SUMMON_PITY: SummonPity = {
  star5Pulls: 0,
  star4Pulls: 0,
  lastStar5Pull: 0,
  lastStar4Pull: 0,
  totalPulls: 0,
  bannerPulls: {},
};

export const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  { id: 'daily_battle', name: 'Battle On', description: 'Complete 5 battles', requirement: 5, current: 0, reward: { type: 'gems', amount: 5 }, claimed: false },
  { id: 'daily_zel', name: 'Zel Rush', description: 'Complete 10 battles', requirement: 10, current: 0, reward: { type: 'zel', amount: 5000 }, claimed: false },
  { id: 'daily_arena', name: 'Arena Fighter', description: 'Win 3 arena matches', requirement: 3, current: 0, reward: { type: 'arenaMedals', amount: 150 }, claimed: false },
  { id: 'daily_fusion', name: 'Fusion Master', description: 'Fuse 3 units', requirement: 3, current: 0, reward: { type: 'zel', amount: 2000 }, claimed: false },
  { id: 'daily_enhance', name: 'Equipment Expert', description: 'Enhance equipment 5 times', requirement: 5, current: 0, reward: { type: 'gems', amount: 3 }, claimed: false },
];

export const INITIAL_WEEKLY_QUESTS: WeeklyQuest[] = [
  { id: 'weekly_battles', name: 'Battle Hardened', description: 'Complete 100 battles', requirement: 100, current: 0, reward: { type: 'gems', amount: 50 }, claimed: false },
  { id: 'weekly_zel', name: 'Zel Tycoon', description: 'Earn 100,000 zel', requirement: 100000, current: 0, reward: { type: 'zel', amount: 30000 }, claimed: false },
  { id: 'weekly_arena', name: 'Colosseum Champion', description: 'Win 30 arena matches', requirement: 30, current: 0, reward: { type: 'arenaMedals', amount: 500 }, claimed: false },
  { id: 'weekly_summon', name: 'Summoner', description: 'Perform 20 summons', requirement: 20, current: 0, reward: { type: 'gems', amount: 30 }, claimed: false },
];

export const INITIAL_DAILY_STATE: DailyState = {
  lastResetDate: new Date().toISOString().split('T')[0],
  quests: INITIAL_DAILY_QUESTS,
  loginStreak: 1,
  lastLoginDate: new Date().toISOString().split('T')[0],
};

export const INITIAL_WEEKLY_STATE: WeeklyState = {
  lastResetDate: getWeekStart().toISOString(),
  quests: INITIAL_WEEKLY_QUESTS,
  dayOfWeek: new Date().getDay(),
};

export const INITIAL_BATTLE_PASS: BattlePassState = {
  currentXP: 0,
  seasonStart: getSeasonStart().toISOString(),
  seasonEnd: getSeasonEnd().toISOString(),
  tierUnlocked: 1,
  premiumPurchased: false,
  claimedTiers: [],
};

export const INITIAL_SUBSCRIPTION: SubscriptionState = {
  tier: 'none',
  startDate: '',
  nextRefreshDate: '',
  totalClaimed: 0,
};

export const INITIAL_STATS: PlayerStats = {
  totalBattlesWon: 0,
  totalBattlesLost: 0,
  totalZelEarned: 0,
  totalGemsSpent: 0,
  totalSummons: 0,
  highestArenaRank: 0,
  totalUnitsCollected: 0,
  totalEquipmentCollected: 0,
  highestPlayerLevel: 0,
  totalFusionPerformed: 0,
  totalEvolutionPerformed: 0,
};

export const INITIAL_QR_STATE: QRState = {
  scansToday: 0,
  lastScanDate: new Date().toISOString().split('T')[0],
  scannedHashes: [],
  lifetimeScans: 0,
};

// ============================================================================
// INITIAL STATE (Complete Player)
// ============================================================================

export const INITIAL_STATE: PlayerState = {
  playerName: 'Summoner',
  playerLevel: 1,
  exp: 0,
  rank: 1,
  arenaScore: 0,
  energy: 30,
  maxEnergy: 30,
  lastEnergyUpdateTime: Date.now(),
  zel: 1000,
  gems: 50,
  arenaMedals: 0,
  guildCoins: 0,
  honorPoints: 0,
  materials: { ...INITIAL_MATERIALS },
  inventory: [
    { instanceId: 'inst_1', templateId: 'u1', level: 1, exp: 0, equipment: { weapon: null, armor: null, accessory: null }, timesFused: 0 },
    { instanceId: 'inst_2', templateId: 'u2', level: 1, exp: 0, equipment: { weapon: null, armor: null, accessory: null }, timesFused: 0 },
  ],
  equipmentInventory: [
    { instanceId: 'eq_inst_1', templateId: 'eq_w1', enhancementLevel: 0, sockets: [null, null] },
    { instanceId: 'eq_inst_2', templateId: 'eq_a1', enhancementLevel: 0, sockets: [null] },
    { instanceId: 'eq_inst_3', templateId: 'eq_ac1', enhancementLevel: 0, sockets: [] },
  ],
  summonPity: { ...INITIAL_SUMMON_PITY },
  ownedUnitIds: new Set(['u1', 'u2']),
  dailyState: { ...INITIAL_DAILY_STATE },
  weeklyState: { ...INITIAL_WEEKLY_STATE },
  battlePass: { ...INITIAL_BATTLE_PASS },
  subscription: { ...INITIAL_SUBSCRIPTION },
  achievements: [],
  stats: { ...INITIAL_STATS },
  qrState: { ...INITIAL_QR_STATE },
  createdAt: Date.now(),
  lastPlayedAt: Date.now(),
  team: ['inst_1', 'inst_2', null, null, null, null, null],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getSeasonStart(): Date {
  // Seasons start on 1st of Jan, Apr, Jul, Oct
  const now = new Date();
  const month = now.getMonth();
  const seasonMonth = Math.floor(month / 3) * 3;
  return new Date(now.getFullYear(), seasonMonth, 1);
}

function getSeasonEnd(): Date {
  const start = getSeasonStart();
  start.setMonth(start.getMonth() + 3);
  return start;
}
