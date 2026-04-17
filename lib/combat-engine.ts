/**
 * COMBAT ENGINE - Pure Battle Resolution Logic
 * 
 * All combat calculations extracted as pure functions for testability and separation.
 * No React dependencies - handles damage calculation, turn resolution, status effects.
 * 
 * Complexity: INTERMEDIATE
 * Public API:
 * - calculateUnitStats(template, level, equipment, equipInventory, leaderSkill?) → Stats
 * - calculateDamage(attacker, target, isBb) → DamageResult
 * - resolvePlayerTurn(state, actions) → TurnResult
 * - resolveEnemyTurn(state, target) → TurnResult
 * - calculateBattleRewards(stage, team) → BattleRewards
 * - checkVictoryConditions(units) → VictoryState
 */

// ============================================================================
// TYPES
// ============================================================================

import { UnitTemplate, EquipmentTemplate, EquipSlot, getElementMultiplier, STAGES, EQUIPMENT_DATABASE, getActiveSetBonuses } from './gameData';
import { BattleUnit, BuffState, StatusEffect, CombatEvent, BattleStats } from './battleTypes';
import { PlayerState } from './gameTypes';
import { PlayerState as PlayerStateType, UnitInstance, EquipInstance } from './economyTypes';

export const OD_GAUGE_THRESHOLD = 8;

export interface BattleItem {
  id: string;
  name: string;
  count: number;
  icon: string;
  type: 'heal' | 'heal_all' | 'bb_fill' | 'revive';
  value: number;
}

export const BATTLE_ITEMS: BattleItem[] = [
  { id: 'cure', name: 'Cure', count: 10, icon: '🧪', type: 'heal', value: 1000 },
  { id: 'high_cure', name: 'High Cure', count: 5, icon: '🧪', type: 'heal', value: 2500 },
  { id: 'divine_light', name: 'Divine Light', count: 3, icon: '✨', type: 'heal_all', value: 2000 },
  { id: 'fujin', name: 'Fujin Potion', count: 2, icon: '⚡', type: 'bb_fill', value: 100 },
  { id: 'revive', name: 'Revive', count: 1, icon: '👼', type: 'revive', value: 0.5 },
];

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  rec: number;
}

export interface DamageResult {
  rawDamage: number;
  finalDamage: number;
  isWeakness: boolean;
  isOD: boolean;
  bcDrops: number;
  statusEffectApplied?: {
    type: string;
    turns: number;
    power: number;
  };
}

export interface TurnResult {
  damageResults: DamageResult[];
  combatEvents: CombatEvent[];
  updatedPlayerUnits: BattleUnit[];
  updatedEnemyUnits: BattleUnit[];
  victory: boolean | null;
  turnComplete: boolean;
}

export interface BattleRewards {
  zel: number;
  exp: number;
  playerLeveledUp: boolean;
  leveledUpUnits: { name: string; oldLevel: number; newLevel: number }[];
  equipmentDropped: EquipInstance[];
}

// ============================================================================
// STAT CALCULATION (Pure Functions)
// ============================================================================

/**
 * Calculate unit stats from template, level, and equipment
 */
export function calculateUnitStats(
  template: UnitTemplate,
  level: number,
  equipment?: UnitInstance['equipment'],
  equipInventory?: EquipInstance[]
): Stats {
  const base: Stats = {
    hp: template.baseStats.hp + template.growthRate.hp * (level - 1),
    atk: template.baseStats.atk + template.growthRate.atk * (level - 1),
    def: template.baseStats.def + template.growthRate.def * (level - 1),
    rec: template.baseStats.rec + template.growthRate.rec * (level - 1),
  };

  if (!equipment || !equipInventory) {
    return base;
  }

  const equipIds = [equipment.weapon, equipment.armor, equipment.accessory].filter(Boolean);
  const equippedItems: { templateId: string }[] = [];

  for (const eqInstId of equipIds) {
    const eqInst = equipInventory.find(e => e.instanceId === eqInstId);
    if (eqInst) {
      const eqTemplate = EQUIPMENT_DATABASE[eqInst.templateId];
      if (eqTemplate?.statsBonus) {
        const enhancementMultiplier = 1 + (eqInst.enhancementLevel * 0.05);
        base.hp += Math.floor((eqTemplate.statsBonus.hp || 0) * enhancementMultiplier);
        base.atk += Math.floor((eqTemplate.statsBonus.atk || 0) * enhancementMultiplier);
        base.def += Math.floor((eqTemplate.statsBonus.def || 0) * enhancementMultiplier);
        base.rec += Math.floor((eqTemplate.statsBonus.rec || 0) * enhancementMultiplier);
      }
      equippedItems.push({ templateId: eqInst.templateId });
    }
  }

  const setBonuses = getActiveSetBonuses(equippedItems);
  for (const bonus of setBonuses) {
    if (bonus.statBonuses) {
      base.hp = Math.floor(base.hp * (1 + (bonus.statBonuses.hp || 0)));
      base.atk = Math.floor(base.atk * (1 + (bonus.statBonuses.atk || 0)));
      base.def = Math.floor(base.def * (1 + (bonus.statBonuses.def || 0)));
      base.rec = Math.floor(base.rec * (1 + (bonus.statBonuses.rec || 0)));
    }
  }

  return base;
}

/**
 * Create initial buff state for a battle unit
 */
export function createDefaultBuffState(): BuffState {
  return {
    atkBoost: 1.0,
    defBoost: 1.0,
    recBoost: 1.0,
    critChance: 0.05,
    critDamage: 1.5,
    damageReduction: 0,
    hpRegen: 0,
    barrier: 0,
    drain: 0,
    counter: 0,
  };
}

// ============================================================================
// DAMAGE CALCULATION (Pure Functions)
// ============================================================================

/**
 * Calculate damage from attacker to target
 * Applies all modifiers: elemental, buff, skill power, etc.
 */
export function calculateDamage(
  attacker: BattleUnit,
  target: BattleUnit,
  options: {
    isBb?: boolean;
    isPlayerAttack?: boolean;
    leaderElementBoost?: Record<string, number>;
  } = {}
): DamageResult {
  const { isBb = false, isPlayerAttack = true, leaderElementBoost } = options;

  // Skill power multiplier
  const powerMultiplier = isBb ? attacker.template.skill.power : 1.0;

  // Element multiplier
  let elementMultiplier = getElementMultiplier(attacker.template.element, target.template.element);
  const isWeakness = elementMultiplier > 1.0;

  // Apply leader skill elemental boost (only for player attacks)
  if (isPlayerAttack && leaderElementBoost) {
    const elementBoost = leaderElementBoost[attacker.template.element];
    if (elementBoost) {
      elementMultiplier *= (1 + elementBoost);
    }
  }

  // Apply buff debuffs
  const atkMultiplier = attacker.buff.atkBoost;
  const defMultiplier = target.buff.defBoost;

  // Calculate damage
  const rawDamage = Math.max(
    1,
    Math.floor(
      (attacker.atk * atkMultiplier * powerMultiplier) -
      (target.def * defMultiplier * 0.5)
    )
  );

  const finalDamage = Math.floor(rawDamage * elementMultiplier * (1 - target.buff.damageReduction));

  // Calculate OD gauge and BC drops
  const newHitCount = attacker.hitCount + 1;
  const isOD = newHitCount >= OD_GAUGE_THRESHOLD;

  // BC drops (only from normal attacks, not BB)
  const bcDrops = isBb ? 0 : Math.floor(Math.random() * 5) + 3;

  // Check for status effect application from BB
  let statusEffectApplied: DamageResult['statusEffectApplied'] | undefined;
  if (isBb && attacker.template.skill.statusEffect && Math.random() < attacker.template.skill.statusEffect.chance) {
    const effect = attacker.template.skill.statusEffect;
    statusEffectApplied = {
      type: effect.type,
      turns: effect.turns,
      power: effect.power,
    };
  }

  return {
    rawDamage,
    finalDamage,
    isWeakness,
    isOD,
    bcDrops,
    statusEffectApplied,
  };
}

/**
 * Calculate damage from enemy attack to player (different formula)
 */
function calculateEnemyDamage(
  attacker: BattleUnit,
  target: BattleUnit,
  guardReduction: number = 0
): DamageResult {
  const elementMultiplier = getElementMultiplier(attacker.template.element, target.template.element);
  const isWeakness = elementMultiplier > 1.0;

  const rawDamage = Math.max(1, Math.floor(attacker.atk - (target.def * 0.5)));
  const finalDamage = Math.floor(rawDamage * elementMultiplier * (1 - guardReduction));

  return {
    rawDamage,
    finalDamage,
    isWeakness,
    isOD: false,
    bcDrops: 0,
  };
}

/**
 * Apply poison damage at start of turn
 */
function applyPoisonDamage(unit: BattleUnit): { hp: number; statusEffects: StatusEffect[] } {
  const poisonEffect = unit.statusEffects.find(e => e.type === 'poison');
  if (!poisonEffect || unit.hp <= 1) {
    return { hp: unit.hp, statusEffects: unit.statusEffects };
  }

  const poisonDamage = Math.floor(unit.maxHp * 0.1 * poisonEffect.power);

  return {
    hp: Math.max(1, unit.hp - poisonDamage),
    statusEffects: unit.statusEffects.map(e =>
      e.type === 'poison' ? { ...e, turnsRemaining: e.turnsRemaining - 1 } : e
    ),
  };
}

// ============================================================================
// TURN RESOLUTION (Pure Functions)
// ============================================================================

/**
 * Resolve a single player unit attack
 */
export function resolvePlayerAttack(
  attacker: BattleUnit,
  target: BattleUnit,
  currentPlayerUnits: BattleUnit[],
  currentEnemyUnits: BattleUnit[],
  options: {
    isBb?: boolean;
    leaderElementBoost?: Record<string, number>;
    targetIndex: number;
    attackerIndex: number;
  }
): {
  updatedAttacker: BattleUnit;
  updatedTarget: BattleUnit;
  damageResult: DamageResult;
  combatEvents: CombatEvent[];
} {
  const { isBb = false, leaderElementBoost, targetIndex, attackerIndex } = options;

  // Apply poison damage first
  let updatedAttacker = { ...attacker };
  if (attacker.isPlayer && attacker.statusEffects.some(e => e.type === 'poison')) {
    const poisonResult = applyPoisonDamage(attacker);
    updatedAttacker = {
      ...updatedAttacker,
      hp: poisonResult.hp,
      statusEffects: poisonResult.statusEffects,
    };
  }

  // Calculate damage
  const damageResult = calculateDamage(updatedAttacker, target, {
    isBb,
    isPlayerAttack: true,
    leaderElementBoost,
  });

  // Apply damage to target
  const newTargetHp = Math.max(0, target.hp - damageResult.finalDamage);
  let updatedTarget: BattleUnit = {
    ...target,
    hp: newTargetHp,
    isDead: newTargetHp <= 0,
    actionState: isBb ? 'bb_hurt' : 'hurt',
    isWeaknessHit: damageResult.isWeakness,
  };

  // Apply status effect if applicable
  if (damageResult.statusEffectApplied) {
    updatedTarget = {
      ...updatedTarget,
      statusEffects: [
        ...updatedTarget.statusEffects,
        {
          type: damageResult.statusEffectApplied.type as StatusEffect['type'],
          turnsRemaining: damageResult.statusEffectApplied.turns,
          power: damageResult.statusEffectApplied.power,
        },
      ],
    };
  }

  // Update attacker after attack
  const newHitCount = attacker.hitCount + 1;
  const newBBGauge = isBb ? 0 : damageResult.isOD ? attacker.maxBb : attacker.bbGauge;
  const newQueuedBb = damageResult.isOD ? true : attacker.queuedBb;

  updatedAttacker = {
    ...updatedAttacker,
    hitCount: newHitCount,
    actionState: isBb ? 'skill' : 'attacking',
    queuedBb: newQueuedBb,
    bbGauge: newBBGauge,
    totalDamageDealt: attacker.totalDamageDealt + damageResult.finalDamage,
  };

  // Generate combat events
  const combatEvents: CombatEvent[] = [
    {
      type: isBb ? 'skill' : 'attack',
      attackerId: attacker.id,
      targetId: target.id,
      damage: damageResult.finalDamage,
      element: attacker.template.element,
      isWeakness: damageResult.isWeakness,
      isCrit: isBb,
      timestamp: Date.now(),
    },
  ];

  if (damageResult.statusEffectApplied) {
    combatEvents.push({
      type: 'debuff',
      targetId: target.id,
      statusEffect: {
        type: damageResult.statusEffectApplied.type as StatusEffect['type'],
        turnsRemaining: damageResult.statusEffectApplied.turns,
        power: damageResult.statusEffectApplied.power,
      },
      timestamp: Date.now(),
    });
  }

  return { updatedAttacker, updatedTarget, damageResult, combatEvents };
}

/**
 * Resolve enemy attack on player
 */
export function resolveEnemyAttack(
  attacker: BattleUnit,
  target: BattleUnit,
  attackerIndex: number,
  targetIndex: number
): {
  updatedAttacker: BattleUnit;
  updatedTarget: BattleUnit;
  damageResult: DamageResult;
  combatEvents: CombatEvent[];
} {
  const guardReduction = target.isGuarding ? 0.5 : 0;
  const damageResult = calculateEnemyDamage(attacker, target, guardReduction);

  const newTargetHp = Math.max(0, target.hp - damageResult.finalDamage);
  const updatedTarget: BattleUnit = {
    ...target,
    hp: newTargetHp,
    isDead: newTargetHp <= 0,
    actionState: target.isGuarding ? 'guarding' : 'hurt',
    isWeaknessHit: damageResult.isWeakness,
  };

  const updatedAttacker: BattleUnit = {
    ...attacker,
    actionState: 'attacking',
  };

  const combatEvents: CombatEvent[] = [
    {
      type: 'attack',
      attackerId: attacker.id,
      targetId: target.id,
      damage: damageResult.finalDamage,
      element: attacker.template.element,
      isWeakness: damageResult.isWeakness,
      isCrit: false,
      timestamp: Date.now(),
    },
  ];

  if (target.isGuarding) {
    combatEvents.push({
      type: 'guard',
      targetId: target.id,
      timestamp: Date.now(),
    });
  }

  return { updatedAttacker, updatedTarget, damageResult, combatEvents };
}

/**
 * Distribute BC drops to alive player units
 */
export function distributeBcDrops(
  playerUnits: BattleUnit[],
  bcDrops: number
): BattleUnit[] {
  if (bcDrops <= 0) return playerUnits;

  const alivePlayers = playerUnits.filter(p => !p.isDead);
  if (alivePlayers.length === 0) return playerUnits;

  return playerUnits.map(unit => {
    if (unit.isDead || unit.bbGauge >= unit.maxBb) return unit;

    const newBcDrops = Math.min(1, bcDrops);
    const newBbGauge = Math.min(unit.maxBb, unit.bbGauge + newBcDrops);

    return { ...unit, bbGauge: newBbGauge };
  });
}

/**
 * Give BC gauge to player from enemy attack
 */
export function grantEnemyBcGauge(playerUnits: BattleUnit[], amount: number = 1): BattleUnit[] {
  return playerUnits.map(unit => {
    if (unit.isDead || unit.bbGauge >= unit.maxBb) return unit;
    return { ...unit, bbGauge: Math.min(unit.maxBb, unit.bbGauge + amount) };
  });
}

// ============================================================================
// BATTLE REWARDS (Pure Function)
// ============================================================================

/**
 * Calculate battle rewards after victory
 */
export function calculateBattleRewards(
  stageId: number,
  playerState: PlayerStateType,
  leveledUpUnits: { name: string; oldLevel: number; newLevel: number }[] = []
): BattleRewards {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) {
    return {
      zel: 0,
      exp: 0,
      playerLeveledUp: false,
      leveledUpUnits: [],
      equipmentDropped: [],
    };
  }

  const { exp: ENERGY_CONFIG } = require('./economyData');
  const subscriptionBonus = 0; // Will be passed from player state
  const zelReward = Math.floor(stage.zelReward * (1 + subscriptionBonus));
  const expReward = stage.expReward;

  // Equipment drops
  const equipmentDropped: EquipInstance[] = [];
  if (stage.equipmentDrops?.length && stage.equipmentDropChance && Math.random() < stage.equipmentDropChance) {
    const dropIndex = Math.floor(Math.random() * stage.equipmentDrops.length);
    const equipTemplateId = stage.equipmentDrops[dropIndex];
    if (equipTemplateId) {
      equipmentDropped.push({
        instanceId: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId: equipTemplateId,
        enhancementLevel: 0,
        sockets: equipTemplateId.includes('ac') ? [] : [null, null],
      });
    }
  }

  return {
    zel: zelReward,
    exp: expReward,
    playerLeveledUp: false, // Calculated in state update
    leveledUpUnits,
    equipmentDropped,
  };
}

// ============================================================================
// VICTORY CONDITIONS (Pure Function)
// ============================================================================

/**
 * Check victory conditions after a turn
 */
export type VictoryState = 'playing' | 'victory' | 'defeat' | 'ongoing';

export function checkVictoryConditions(
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[]
): VictoryState {
  const allEnemiesDead = enemyUnits.every(e => e.isDead);
  const allPlayersDead = playerUnits.every(p => p.isDead);

  if (allEnemiesDead) return 'victory';
  if (allPlayersDead) return 'defeat';
  return 'ongoing';
}

/**
 * Check if battle is over
 */
export function isBattleOver(victoryState: VictoryState): boolean {
  return victoryState === 'victory' || victoryState === 'defeat';
}

// ============================================================================
// EQUIPMENT VALIDATION (Pure Function)
// ============================================================================

/**
 * Validate equipment exists and can be equipped
 */
export function validateEquipment(
  equipment: EquipInstance | null,
  unitTemplateId: string
): boolean {
  if (!equipment) return true;

  const equipTemplate = EQUIPMENT_DATABASE[equipment.templateId];
  if (!equipTemplate) return false;

  // Check type (slot) compatibility using the type field
  if (equipTemplate.type === 'weapon' && !unitTemplateId.includes('wp')) return false;
  if (equipTemplate.type === 'armor' && !unitTemplateId.includes('ar')) return false;
  if (equipTemplate.type === 'accessory' && !unitTemplateId.includes('ac')) return false;

  return true;
}

// ============================================================================
// HEALING & ITEMS (Pure Functions)
// ============================================================================

/**
 * Apply healing item to unit
 */
export function applyBattleItem(
  unit: BattleUnit,
  item: BattleItem,
  options: { healAll?: boolean } = {}
): { success: boolean; hp: number; bbGauge: number; isDead: boolean } {
  if (options.healAll && !unit.isDead) {
    const healAmount = Math.min(unit.maxHp - unit.hp, item.value);
    return {
      success: healAmount > 0,
      hp: Math.min(unit.maxHp, unit.hp + item.value),
      bbGauge: unit.bbGauge,
      isDead: false,
    };
  }

  if (item.type === 'heal' && !unit.isDead && unit.hp < unit.maxHp) {
    const healAmount = Math.min(unit.maxHp - unit.hp, item.value);
    return {
      success: healAmount > 0,
      hp: Math.min(unit.maxHp, unit.hp + item.value),
      bbGauge: unit.bbGauge,
      isDead: false,
    };
  }

  if (item.type === 'bb_fill' && !unit.isDead && unit.bbGauge < unit.maxBb) {
    return {
      success: true,
      hp: unit.hp,
      bbGauge: unit.maxBb,
      isDead: false,
    };
  }

  if (item.type === 'revive' && unit.isDead) {
    return {
      success: true,
      hp: Math.floor(unit.maxHp * item.value),
      bbGauge: 0,
      isDead: false,
    };
  }

  return { success: false, hp: unit.hp, bbGauge: unit.bbGauge, isDead: unit.isDead };
}

// ============================================================================
// FLOATING TEXT POSITIONING (Pure Functions)
// ============================================================================

/**
 * Calculate floating text position for damage/healing
 */
export interface FloatingTextPosition {
  x: string;
  y: string;
}

export function calculateFloatingTextPosition(
  targetId: string,
  isPlayer: boolean
): FloatingTextPosition {
  const idx = parseInt(targetId.split('_')[1]);
  const col = idx % 2;
  const row = Math.floor(idx / 2);

  const baseX = isPlayer ? 15 + (col * 15) : 70 + (col * 15);
  const baseY = 40 + (row * 15);

  const offsetX = Math.random() * 20 - 10;
  const offsetY = Math.random() * 20 - 10;

  return {
    x: `calc(${baseX}% + ${offsetX}px)`,
    y: `calc(${baseY}% + ${offsetY}px)`,
  };
}

// ============================================================================
// EXPORT HELPER FUNCTIONS FROM game-systems
// ============================================================================

// Re-export commonly used functions from game-systems
export {
  calculateEnemyStats,
  ELEMENTAL_MATRIX,
  BATTLE_FORMULAS,
  DIFFICULTY_TUNING,
  getExpRequired,
} from './game-systems';