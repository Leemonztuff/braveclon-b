// ============================================================================
// GAME TYPES - Re-exports from economyTypes for backward compatibility
// ============================================================================

// Re-export all economy types for use throughout the app
export {
  type PlayerState,
  type UnitInstance,
  type EquipInstance,
  type CurrencyType,
  type MaterialType,
  type DailyQuest,
  type WeeklyQuest,
  type SummonResult,
  type GachaBanner,
  type BattlePassState,
  type SubscriptionTier,
  type SubscriptionState,
  type BattlePassTier,
  type PlayerStats,
  type Achievement,
  type DailyState,
  type WeeklyState,
  INITIAL_STATE,
  INITIAL_CURRENCY,
  INITIAL_MATERIALS,
  INITIAL_SUMMON_PITY,
  INITIAL_DAILY_STATE,
  INITIAL_WEEKLY_STATE,
  INITIAL_BATTLE_PASS,
  INITIAL_SUBSCRIPTION,
  INITIAL_STATS,
  INITIAL_QR_STATE,
  CURRENCY_CONFIG,
  MATERIAL_CONFIG,
} from './economyTypes';

// Re-export gameData types
export type { Stats, EquipSlot, Element, EquipmentTemplate, StageTemplate, Skill, LeaderSkill, UnitTemplate } from './gameData';
