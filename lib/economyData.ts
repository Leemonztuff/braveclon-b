// ============================================================================
// ECONOMY CONFIGURATION CONSTANTS
// ============================================================================

import { GachaBanner, BattlePassTier, SubscriptionBenefits, CurrencyType, SubscriptionTier } from './economyTypes';

// ============================================================================
// ENERGY SYSTEM
// ============================================================================

export const ENERGY_CONFIG = {
  REGEN_MS: 3 * 60 * 1000,           // 3 minutes per energy
  MAX_ENERGY: 30,                    // Base max energy
  EMERGENCY_CAP: 50,                // Can store up to 50
  DAILY_BONUS_ENERGY: 15,           // From daily quest
  REFILL_COST_PER_ENERGY: 1,        // Gems per energy refilled
  FULL_REFILL_COST: 30,             // 30 gems for full refill
  SUBSCRIPTION_ENERGY_BONUS: {
    none: 0,
    bronze: 5,
    silver: 10,
    gold: 20,
  },
} as const;

// ============================================================================
// CURRENCY ACQUISITION RATES
// ============================================================================

export const ZEL_ACQUISITION = {
  // Base zel per stage area (multiplier by area)
  STAGE_BASE: 200,
  AREA_MULTIPLIERS: {
    'Adventurer\'s Prairie': 1.0,
    'Cave of Flames': 1.2,
    'Destroyed Cathedral': 1.5,
    'Blood Forest': 1.8,
    'Frozen Wasteland': 2.2,
    'Crystal Caverns': 2.5,
    'Tower of Babel': 3.0,
  } as Record<string, number>,
  
  // Daily quest rewards
  DAILY_QUESTS: {
    'Zel Rush': 5000,           // Complete 10 battles
    'Boss Hunter': 2000,        // Defeat 3 bosses
    'Fusion Master': 2000,      // Fuse 3 units
  },
  
  // Achievement milestones
  ACHIEVEMENTS: {
    firstClear: 500,            // First stage clear
    clear10: 2000,
    clear50: 10000,
    clear100: 25000,
  },
  
  // Fusion refund percentage
  FUSION_REFUND_PERCENT: 20,
} as const;

export const GEM_ACQUISITION = {
  // Free sources - MORE GENEROUS!
  DAILY_LOGIN: 10,  // Increased from 5!
  FIRST_CLEAR: {
    easy: 10,    // Increased from 5
    medium: 25,   // Increased from 15
    hard: 50,    // Increased from 30
    boss: 100,   // Increased from 50
  },
  AREA_COMPLETE_BONUS: {
    1: 5,   // Clear an area = 5 gems bonus
    2: 10,
    3: 15,
    4: 25,
    5: 50,
    6: 100,
  },
  DAILY_QUESTS: {
    'Battle On': 10,   // Increased from 5!
    'Equipment Expert': 5,
  },
  WEEKLY_QUESTS: {
    'Battle Hardened': 100,   // Increased from 50!
    'Summoner': 50,
  },
  ACHIEVEMENTS: {
    level10: 100,
    level25: 100,
    level50: 250,
    collect10: 50,
    collect30: 200,
    collect50: 500,
  },
  ARENA_SEASON_END: {
    bronze: 50,
    silver: 150,
    gold: 300,
    platinum: 500,
    diamond: 1000,
  },
} as const;

export const ARENA_ACQUISITION = {
  VICTORY: 50,
  DEFEAT: 20,
  DAILY_BONUS: 150,
  SEASON_BONUS: {
    bronze: 100,
    silver: 250,
    gold: 500,
    platinum: 1000,
    diamond: 2000,
  },
} as const;

export const GUILD_ACQUISITION = {
  BATTLE_VICTORY: 200,
  BATTLE_DEFEAT: 100,
  DONATION_MATCH: 0.5,        // 50% match on donations
  QUEST_COMPLETION: 500,
  RAID_KILLS: 500,
  WEEKLY_BONUS: 2000,
} as const;

// ============================================================================
// CURRENCY SINK COSTS
// ============================================================================

export const ZEL_COSTS = {
  FUSION: {
    BASE_MULTIPLIER: 100,
    FOUR_STAR_MULTIPLIER: 2,   // 4★ materials cost 2x
    FIVE_STAR_MULTIPLIER: 5,   // 5★ materials cost 5x
  },
  EVOLUTION: {
    '3star_to_4star': 30000,
    '4star_to_5star': 100000,
    '5star_to_6star': 500000,  // Future expansion
  },
  SKILL_ENHANCE: {
    BASE: 10000,
    PER_LEVEL: 5000,
  },
  ARENA_ENTRY: 500,
  SHOP: {
    COMMON_ITEM: 500,
    UNCOMMON_ITEM: 2000,
    RARE_ITEM: 5000,
  },
} as const;

export const GEM_COSTS = {
  SUMMON: {
    SINGLE: 50,
    MULTI: 450,               // 10 pulls = 10% discount
  },
  SKIP: {
    STAGE_SKIP: 5,
    ARENA_SKIP: 5,
  },
  COSMETICS: {
    NAME_CHANGE: 100,
    FRAME: 200,
    ICON: 150,
  },
  QoL: {
    ENERGY_FULL: 30,
    STORAGE_EXPAND_10: 50,
    TEAM_SLOT_UNLOCK: 200,
  },
} as const;

export const EQUIPMENT_COSTS = {
  ENHANCE: {
    BASE: 500,
    PER_LEVEL: 100,
    PROTECTION: {
      LOW: 10,      // Steps 6-10
      MEDIUM: 25,   // Steps 11-15
      HIGH: 50,     // Steps 16-20
    },
  },
  SOCKET: {
    OPEN: 500,           // Zel per socket
    GEM_SLOT: 1000,     // Zel per gem slot
  },
  CRAFT: {
    BASIC_RECIPE: 5000,
    ADVANCED_RECIPE: 20000,
    EXPERT_RECIPE: 50000,
  },
} as const;

// ============================================================================
// ENHANCEMENT SUCCESS RATES
// ============================================================================

export const ENHANCEMENT_RATES = {
  0: 100,  // +0 to +1
  1: 100,
  2: 100,
  3: 100,
  4: 100,
  5: 100,
  6: 90,
  7: 85,
  8: 80,
  9: 75,
  10: 70,
  11: 60,
  12: 50,
  13: 45,
  14: 40,
  15: 35,
  16: 30,
  17: 20,
  18: 15,
  19: 10,
  20: 5,   // Max level
} as const;

// ============================================================================
// GACHA SYSTEM CONFIGURATION
// ============================================================================

export const GACHA_CONFIG = {
  RATES: {
    STAR5_BASE: 0.02,      // 2%
    STAR4_BASE: 0.12,      // 12%
    STAR3_BASE: 0.86,      // 86%
    STAR5_FEATURED: 0.05,   // 5% on featured banners
  },
  PITY: {
    STAR5_PULLS: 50,  // Reduced from 100 - faster pity!
    STAR4_PULLS: 15,  // Reduced from 25
  },
BANNERS: {
    standard: {
      id: 'standard',
      name: 'Standard Summon',
      type: 'standard' as const,
      cost: 5,  // Reduced from 50 - now affordable!
      pullCount: 1,
      featuredUnits: [],
      featuredRate: 0,
      pityPulls: 50,  // Faster pity
      pityRarity: 5,
    } satisfies GachaBanner,
    featured: {
      id: 'featured',
      name: 'Featured Summon',
      type: 'featured' as const,
      cost: 5,
      pullCount: 1,
      featuredUnits: ['u1_4'],
      featuredRate: 0.10,  // 10% featured rate!
      pityPulls: 30,  // Faster pity
      pityRarity: 5,
    } satisfies GachaBanner,
    multi: {
      id: 'multi',
      name: 'Multi Summon',
      type: 'multi' as const,
      cost: 50,  // 10 pulls for price of 10
      pullCount: 10,
      featuredUnits: [],
      featuredRate: 0,
      pityPulls: 50,
      pityRarity: 5,
    } satisfies GachaBanner,
  },
  DUPLICATE_VALUES: {
    STAR5: { prism: 100, zel: 10000 },
    STAR4: { prism: 25, zel: 3000 },
    STAR3: { prism: 5, zel: 500 },
  },
} as const;

// ============================================================================
// DAILY/WEEKLY QUESTS
// ============================================================================

export const DAILY_QUEST_CONFIG = {
  RESET_HOUR: 4, // 4 AM server time
  LOGIN_BONUS: {
    DAY_1: { type: 'gems' as CurrencyType, amount: 5 },
    DAY_7: { type: 'gems' as CurrencyType, amount: 50 },
  },
} as const;

export const WEEKLY_QUEST_CONFIG = {
  RESET_DAY: 0, // Sunday
  DURATION_DAYS: 7,
} as const;

// ============================================================================
// BATTLE PASS CONFIGURATION
// ============================================================================

export const BATTLE_PASS_CONFIG = {
  DURATION_DAYS: 56, // 8 weeks
  TOTAL_TIERS: 50,
  XP_PER_TIER: 400,
  DAILY_XP: 100,
  
  TIERS: generateBattlePassTiers(),
} as const;

function generateBattlePassTiers(): BattlePassTier[] {
  const tiers: BattlePassTier[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const isMilestone = i % 10 === 0;
    const isKeyTier = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].includes(i);
    
    // Free rewards
    let freeReward: BattlePassTier['freeReward'];
    if (isKeyTier) {
      freeReward = { type: 'zel', amount: i * 1000 };
    } else if (isMilestone) {
      freeReward = { type: 'gems', amount: 10 };
    } else {
      freeReward = { type: 'zel', amount: 500 * i };
    }
    
    // Premium rewards
    let premiumReward: BattlePassTier['premiumReward'];
    if (i === 50) {
      premiumReward = { type: 'gems', amount: 200, itemId: 'exclusive_unit' };
    } else if (isKeyTier) {
      premiumReward = { type: 'gems', amount: 50 };
    } else if (isMilestone) {
      premiumReward = { type: 'gems', amount: 25 };
    } else {
      premiumReward = { type: 'gems', amount: 10 + i };
    }
    
    tiers.push({ level: i, freeReward, premiumReward });
  }
  
  return tiers;
}

// ============================================================================
// SUBSCRIPTION BENEFITS
// ============================================================================

export const SUBSCRIPTION_CONFIG: Record<SubscriptionTier, SubscriptionBenefits> = {
  none: {
    weeklyGems: 0,
    dailyEnergyBonus: 0,
    zelBonus: 0,
    allBonus: 0,
    exclusiveShop: false,
  },
  bronze: {
    weeklyGems: 150,
    dailyEnergyBonus: 5,
    zelBonus: 0.10,
    allBonus: 0.10,
    exclusiveShop: false,
  },
  silver: {
    weeklyGems: 350,
    dailyEnergyBonus: 10,
    zelBonus: 0.15,
    allBonus: 0.15,
    exclusiveShop: false,
  },
  gold: {
    weeklyGems: 800,
    dailyEnergyBonus: 20,
    zelBonus: 0.25,
    allBonus: 0.25,
    exclusiveShop: true,
  },
};

export const SUBSCRIPTION_PRICES = {
  bronze: 4.99,
  silver: 9.99,
  gold: 19.99,
};

// ============================================================================
// IAP PRICING TIERS
// ============================================================================

export const IAP_TIERS = [
  {
    id: 'starter',
    gems: 80,
    price: 0.99,
    bonusPercent: 0,
    firstOnly: true,
    label: 'Starter Pack',
  },
  {
    id: 'light',
    gems: 400,
    price: 4.99,
    bonusPercent: 0,
    label: 'Light Pack',
  },
  {
    id: 'medium',
    gems: 850,
    price: 9.99,
    bonusPercent: 6,
    label: 'Standard Pack',
  },
  {
    id: 'heavy',
    gems: 1800,
    price: 19.99,
    bonusPercent: 11,
    label: 'Value Pack',
  },
  {
    id: 'bundle',
    gems: 4500,
    price: 49.99,
    bonusPercent: 11,
    label: 'Bundle Pack',
  },
  {
    id: 'whale',
    gems: 10000,
    price: 99.99,
    bonusPercent: 15,
    label: 'Ultimate Pack',
  },
];

// ============================================================================
// PROGRESSION FORMULAS
// ============================================================================

export const PROGRESSION_FORMULAS = {
  // Player level XP requirement
  PLAYER_XP_FOR_LEVEL: (level: number): number => {
    return Math.floor(100 * Math.pow(1.12, level));
  },
  
  // Unit level XP requirement
  UNIT_XP_FOR_LEVEL: (level: number): number => {
    return Math.floor(100 * Math.pow(1.15, level));
  },
  
  // Energy from player level
  MAX_ENERGY_FROM_LEVEL: (level: number): number => {
    return 30 + Math.floor(level / 5);
  },
  
  // Zel reward from stage
  ZEL_FROM_STAGE: (
    baseZel: number,
    areaMultiplier: number,
    playerLevel: number
  ): number => {
    return Math.floor(baseZel * areaMultiplier * (1 + playerLevel * 0.05));
  },
  
  // Equipment enhancement cost
  ENHANCE_COST: (currentLevel: number, step: number): number => {
    return (currentLevel + 1) * 500 + step * 100;
  },
  
  // Fusion cost
  FUSION_COST: (
    targetLevel: number,
    materialCount: number,
    materialRarity: number
  ): number => {
    const baseCost = targetLevel * 100 * materialCount;
    const rarityMultiplier = materialRarity >= 5 ? 5 : materialRarity >= 4 ? 2 : 1;
    return baseCost * rarityMultiplier;
  },
};

// ============================================================================
// ECONOMY BALANCE TARGETS
// ============================================================================

export const BALANCE_TARGETS = {
  // Average zel earned per hour of gameplay
  ZEL_PER_HOUR: {
    early: 10000,    // Levels 1-10
    mid: 25000,      // Levels 11-25
    late: 50000,     // Levels 26-50
    endgame: 100000, // Levels 51+
  },
  
  // Average gems earned per day (excluding IAP)
  GEMS_PER_DAY: {
    casual: 10,
    active: 20,
    hardcore: 35,
  },
  
  // Session length targets (minutes)
  SESSION_LENGTH: {
    minimum: 5,
    target: 15,
    maximum: 30,
  },
  
  // Conversion rates
  GEM_VALUE: {
    toZel: 100,       // 1 gem = 100 zel (shop purchase)
    toEnergy: 10,      // 1 gem = 10 energy refills
    toSummon: 50,      // 1 summon = 50 gems
  },
};
