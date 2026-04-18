import { supabase } from './supabase';
import type { UnitTemplate, EquipmentTemplate, StageTemplate, Element, EquipSlot, Stats, Skill, LeaderSkill, SkillType } from './gameData';
import type { MaterialType } from './economyTypes';

const isSupabaseConfigured = () => !!supabase;

export const GameDataCache: {
  unitTemplates: Record<string, UnitTemplate> | null;
  equipmentTemplates: Record<string, EquipmentTemplate> | null;
  stages: StageTemplate[] | null;
  enemies: Record<string, any> | null;
  dungeons: Record<string, any> | null;
  gachaPool: Record<string, number> | null;
  craftingRecipes: any[] | null;
  consumableItems: Record<string, any> | null;
  achievements: Record<string, any> | null;
  dailyQuests: Record<string, any> | null;
  materials: Record<string, any> | null;
  equipmentSets: Record<string, any> | null;
} = {
  unitTemplates: null,
  equipmentTemplates: null,
  stages: null,
  enemies: null,
  dungeons: null,
  gachaPool: null,
  craftingRecipes: null,
  consumableItems: null,
  achievements: null,
  dailyQuests: null,
  materials: null,
  equipmentSets: null,
};

async function fetchFromSupabase<T>(table: string, orderBy?: string): Promise<T[]> {
  if (!supabase) return [];
  
  let query = supabase.from(table).select('*');
  if (orderBy) {
    query = query.order(orderBy, { ascending: true });
  }
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// UNIT TEMPLATES
// ============================================================================

interface DbUnitTemplate {
  id: string;
  name: string;
  element: string;
  rarity: number;
  base_hp: number;
  base_atk: number;
  base_def: number;
  base_rec: number;
  growth_hp: number;
  growth_atk: number;
  growth_def: number;
  growth_rec: number;
  max_level: number;
  sprite_url: string | null;
  description: string | null;
}

function convertDbUnitTemplate(db: DbUnitTemplate): UnitTemplate {
  return {
    id: db.id,
    name: db.name,
    element: db.element as Element,
    rarity: db.rarity,
    baseStats: {
      hp: db.base_hp,
      atk: db.base_atk,
      def: db.base_def,
      rec: db.base_rec,
    },
    growthRate: {
      hp: db.growth_hp,
      atk: db.growth_atk,
      def: db.growth_def,
      rec: db.growth_rec,
    },
    maxLevel: db.max_level,
    skill: {
      id: `s_${db.id}`,
      name: 'Basic Attack',
      type: 'damage' as SkillType,
      description: 'Basic attack',
      power: 1.0,
      cost: 0,
      target: 'enemy',
    },
    leaderSkill: undefined,
    extraSkill: undefined,
    spriteUrl: db.sprite_url || undefined,
    evolutionTarget: undefined,
    evolutionMaterials: undefined,
  };
}

export async function loadUnitTemplates(): Promise<Record<string, UnitTemplate>> {
  if (GameDataCache.unitTemplates) {
    return GameDataCache.unitTemplates;
  }

  const dbUnits = await fetchFromSupabase<DbUnitTemplate>('unit_templates', 'id');
  
  if (dbUnits.length > 0) {
    const templates: Record<string, UnitTemplate> = {};
    for (const db of dbUnits) {
      templates[db.id] = convertDbUnitTemplate(db);
    }
    GameDataCache.unitTemplates = templates;
    return templates;
  }

  const { UNIT_DATABASE } = await import('./gameData');
  GameDataCache.unitTemplates = UNIT_DATABASE;
  return UNIT_DATABASE;
}

export function getUnitTemplates(): Record<string, UnitTemplate> | null {
  return GameDataCache.unitTemplates;
}

// ============================================================================
// EQUIPMENT TEMPLATES
// ============================================================================

interface DbEquipmentTemplate {
  id: string;
  name: string;
  type: string;
  rarity: number;
  atk_bonus: number;
  def_bonus: number;
  hp_bonus: number;
  rec_bonus: number;
  set_id: string | null;
  description: string | null;
  icon: string | null;
}

export async function loadEquipmentTemplates(): Promise<Record<string, EquipmentTemplate>> {
  if (!supabase) {
    const { EQUIPMENT_DATABASE } = await import('./gameData');
    return EQUIPMENT_DATABASE;
  }

  const dbEquipment = await fetchFromSupabase<DbEquipmentTemplate>('equipment_templates', 'id');
  
  if (dbEquipment.length === 0) {
    const { EQUIPMENT_DATABASE } = await import('./gameData');
    return EQUIPMENT_DATABASE;
  }

  const templates: Record<string, EquipmentTemplate> = {};
  for (const db of dbEquipment) {
    templates[db.id] = {
      id: db.id,
      name: db.name,
      type: db.type as EquipSlot,
      rarity: db.rarity,
      statsBonus: {
        atk: db.atk_bonus,
        def: db.def_bonus,
        hp: db.hp_bonus,
        rec: db.rec_bonus,
      },
      description: db.description || '',
      icon: db.icon || '📦',
      setId: db.set_id || undefined,
    };
  }

  GameDataCache.equipmentTemplates = templates;
  return templates;
}

// ============================================================================
// STAGES
// ============================================================================

interface DbStage {
  id: number;
  name: string;
  area: string;
  energy: number;
  exp_reward: number;
  zel_reward: number;
  enemy_ids: string[];
  enemy_counts: number[];
  hp_multiplier: number;
  atk_multiplier: number;
  description: string | null;
}

export async function loadStages(): Promise<StageTemplate[]> {
  if (GameDataCache.stages) {
    return GameDataCache.stages;
  }

  const dbStages = await fetchFromSupabase<DbStage>('stages', 'id');
  
  if (dbStages.length > 0) {
    const stages: StageTemplate[] = dbStages.map(db => ({
      id: db.id,
      name: db.name,
      area: db.area,
      energy: db.energy,
      description: db.description || '',
      enemies: db.enemy_ids,
      expReward: db.exp_reward,
      zelReward: db.zel_reward,
    }));
    GameDataCache.stages = stages;
    return stages;
  }

  const { STAGES } = await import('./gameData');
  GameDataCache.stages = STAGES;
  return STAGES;
}

// ============================================================================
// ENEMIES
// ============================================================================

interface DbEnemy {
  id: string;
  name: string;
  element: string;
  hp: number;
  atk: number;
  def: number;
  exp_value: number;
  zel_value: number;
  drop_material: string | null;
  drop_chance: number;
  sprite_url: string | null;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  element: Element;
  stats: Stats;
  expValue: number;
  zelValue: number;
  dropMaterial?: MaterialType;
  dropChance: number;
  spriteUrl?: string;
}

export async function loadEnemies(): Promise<Record<string, EnemyTemplate>> {
  if (!supabase) {
    const { ENEMIES } = await import('./gameData');
    return ENEMIES as Record<string, EnemyTemplate>;
  }

  const dbEnemies = await fetchFromSupabase<DbEnemy>('enemies', 'id');
  
  if (dbEnemies.length === 0) {
    const { ENEMIES } = await import('./gameData');
    return ENEMIES as Record<string, EnemyTemplate>;
  }

  const enemies: Record<string, EnemyTemplate> = {};
  for (const db of dbEnemies) {
    enemies[db.id] = {
      id: db.id,
      name: db.name,
      element: db.element as Element,
      stats: {
        hp: db.hp,
        atk: db.atk,
        def: db.def,
        rec: 0,
      },
      expValue: db.exp_value,
      zelValue: db.zel_value,
      dropMaterial: db.drop_material as MaterialType | undefined,
      dropChance: db.drop_chance,
      spriteUrl: db.sprite_url || undefined,
    };
  }

  GameDataCache.enemies = enemies;
  return enemies;
}

// ============================================================================
// DUNGEONS
// ============================================================================

interface DbDungeon {
  id: string;
  name: string;
  description: string | null;
  element: string;
  recommended_level: number;
  total_floors: number;
  entry_cost: number;
  base_hp_multiplier: number;
  base_atk_multiplier: number;
  zel_per_floor: number;
  exp_per_floor: number;
}

export async function loadDungeons(): Promise<Record<string, DbDungeon>> {
  if (!supabase) {
    const { DUNGEONS } = await import('./gameData');
    return DUNGEONS as unknown as Record<string, DbDungeon>;
  }

  const dbDungeons = await fetchFromSupabase<DbDungeon>('dungeons', 'id');
  
  if (dbDungeons.length === 0) {
    const { DUNGEONS } = await import('./gameData');
    return DUNGEONS as unknown as Record<string, DbDungeon>;
  }

  const dungeons: Record<string, DbDungeon> = {};
  for (const db of dbDungeons) {
    dungeons[db.id] = db;
  }

  GameDataCache.dungeons = dungeons;
  return dungeons;
}

// ============================================================================
// GACHA POOL
// ============================================================================

interface DbGachaPool {
  unit_id: string;
  weight: number;
  is_available: boolean;
}

export async function loadGachaPool(): Promise<Record<string, number>> {
  if (!supabase) {
    const { GACHA_POOL } = await import('./gameData');
    return GACHA_POOL;
  }

  const dbPool = await fetchFromSupabase<DbGachaPool>('gacha_pool', 'unit_id');
  
  if (dbPool.length === 0) {
    const { GACHA_POOL } = await import('./gameData');
    return GACHA_POOL;
  }

  const pool: Record<string, number> = {};
  for (const db of dbPool) {
    if (db.is_available) {
      pool[db.unit_id] = db.weight;
    }
  }

  GameDataCache.gachaPool = pool;
  return pool;
}

// ============================================================================
// CRAFTING RECIPES
// ============================================================================

interface DbCraftingRecipe {
  id: string;
  name: string;
  description: string | null;
  output_type: string;
  output_id: string;
  output_quantity: number;
  zel_cost: number;
  required_level: number;
  category: string;
  materials: Record<string, number>;
}

export async function loadCraftingRecipes(): Promise<DbCraftingRecipe[]> {
  const dbRecipes = await fetchFromSupabase<DbCraftingRecipe>('crafting_recipes', 'id');
  
  if (dbRecipes.length > 0) {
    GameDataCache.craftingRecipes = dbRecipes;
    return dbRecipes;
  }

  const { CRAFTING_RECIPES } = await import('./gameData');
  GameDataCache.craftingRecipes = CRAFTING_RECIPES;
  return CRAFTING_RECIPES;
}

// ============================================================================
// CONSUMABLE ITEMS
// ============================================================================

interface DbConsumableItem {
  id: string;
  name: string;
  description: string | null;
  item_type: string;
  value: number;
  duration: number | null;
  icon: string | null;
  price_gems: number | null;
}

export async function loadConsumableItems(): Promise<Record<string, DbConsumableItem>> {
  if (!supabase) {
    const { CONSUMABLE_ITEMS } = await import('./gameData');
    return CONSUMABLE_ITEMS;
  }

  const dbItems = await fetchFromSupabase<DbConsumableItem>('consumable_items', 'id');
  
  if (dbItems.length === 0) {
    const { CONSUMABLE_ITEMS } = await import('./gameData');
    return CONSUMABLE_ITEMS;
  }

  const items: Record<string, DbConsumableItem> = {};
  for (const db of dbItems) {
    items[db.id] = db;
  }

  GameDataCache.consumableItems = items;
  return items;
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

interface DbAchievement {
  id: string;
  name: string;
  description: string | null;
  category: string;
  requirement: number;
  reward_gems: number;
  reward_coins: number;
}

export async function loadAchievements(): Promise<Record<string, DbAchievement>> {
  if (!supabase) {
    return {};
  }

  const dbAchievements = await fetchFromSupabase<DbAchievement>('achievements', 'id');
  
  if (dbAchievements.length === 0) {
    return {};
  }

  const achievements: Record<string, DbAchievement> = {};
  for (const db of dbAchievements) {
    achievements[db.id] = db;
  }

  GameDataCache.achievements = achievements;
  return achievements;
}

// ============================================================================
// DAILY QUESTS
// ============================================================================

interface DbDailyQuest {
  id: string;
  name: string;
  description: string | null;
  quest_type: string;
  target: number;
  target_type: string;
  zel_reward: number;
  gem_reward: number;
}

export async function loadDailyQuests(): Promise<Record<string, DbDailyQuest>> {
  if (!supabase) {
    return {};
  }

  const dbQuests = await fetchFromSupabase<DbDailyQuest>('daily_quests', 'id');
  
  if (dbQuests.length === 0) {
    return {};
  }

  const quests: Record<string, DbDailyQuest> = {};
  for (const db of dbQuests) {
    quests[db.id] = db;
  }

  GameDataCache.dailyQuests = quests;
  return quests;
}

// ============================================================================
// MATERIALS
// ============================================================================

interface DbMaterial {
  id: string;
  name: string;
  tier: number;
  description: string | null;
  icon: string | null;
}

export async function loadMaterials(): Promise<Record<string, DbMaterial>> {
  if (!supabase) {
    const { MATERIALS } = await import('./gameData');
    return MATERIALS;
  }

  const dbMaterials = await fetchFromSupabase<DbMaterial>('materials', 'id');
  
  if (dbMaterials.length === 0) {
    const { MATERIALS } = await import('./gameData');
    return MATERIALS;
  }

  const materials: Record<string, DbMaterial> = {};
  for (const db of dbMaterials) {
    materials[db.id] = db;
  }

  GameDataCache.materials = materials;
  return materials;
}

// ============================================================================
// EQUIPMENT SETS
// ============================================================================

interface DbEquipmentSet {
  id: string;
  name: string;
  description: string | null;
  pieces_required: number;
  atk_multiplier: number;
  def_multiplier: number;
  rec_multiplier: number;
  hp_multiplier: number;
  special_effect: string | null;
  special_value: number;
}

export async function loadEquipmentSets(): Promise<Record<string, DbEquipmentSet>> {
  if (!supabase) {
    const { EQUIPMENT_SETS } = await import('./gameData');
    return EQUIPMENT_SETS as unknown as Record<string, DbEquipmentSet>;
  }

  const dbSets = await fetchFromSupabase<DbEquipmentSet>('equipment_sets', 'id');
  
  if (dbSets.length === 0) {
    const { EQUIPMENT_SETS } = await import('./gameData');
    return EQUIPMENT_SETS as unknown as Record<string, DbEquipmentSet>;
  }

  const sets: Record<string, DbEquipmentSet> = {};
  for (const db of dbSets) {
    sets[db.id] = db;
  }

  GameDataCache.equipmentSets = sets;
  return sets;
}

// ============================================================================
// QR REWARDS
// ============================================================================

interface DbQRReward {
  id: number;
  reward_type: string;
  chance: number;
  min_value: number | null;
  max_value: number | null;
  material_id: string | null;
  unit_frag_id: string | null;
}

export async function loadQRRewards(): Promise<DbQRReward[]> {
  return fetchFromSupabase<DbQRReward>('qr_rewards', 'id');
}

// ============================================================================
// GACHA BANNERS
// ============================================================================

interface DbGachaBanner {
  id: string;
  name: string;
  banner_type: string;
  cost: number;
  pull_count: number;
  featured_units: string[] | null;
  featured_rate: number;
  pity_pulls: number;
  pity_rarity: number;
  is_active: boolean;
}

export async function loadGachaBanners(): Promise<DbGachaBanner[]> {
  if (!supabase) return [];
  const banners = await fetchFromSupabase<DbGachaBanner>('gacha_banners', 'id');
  return banners.filter(b => b.is_active);
}

// ============================================================================
// LOAD ALL GAME DATA
// ============================================================================

export async function loadAllGameData(): Promise<void> {
  await Promise.all([
    loadUnitTemplates(),
    loadEquipmentTemplates(),
    loadStages(),
    loadEnemies(),
    loadDungeons(),
    loadGachaPool(),
    loadCraftingRecipes(),
    loadConsumableItems(),
    loadAchievements(),
    loadDailyQuests(),
    loadMaterials(),
    loadEquipmentSets(),
  ]);
}

export function isConfigured(): boolean {
  return isSupabaseConfigured();
}

export function getCache(): typeof GameDataCache {
  return GameDataCache;
}