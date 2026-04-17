/**
 * Battle Hook - UI State Management + Animation Control
 * 
 * Delegates pure battle logic to lib/combat-engine.ts
 * This hook only manages UI state, animations, and user interaction.
 * All combat calculations are pure functions in combat-engine.ts
 * 
 * Complexity: LOW
 * Public API:
 * - useBattle(state, stageId, onEnd) → BattleState & Actions
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { PlayerState } from '@/lib/gameTypes';
import { UNIT_DATABASE, ENEMIES, STAGES, UnitTemplate } from '@/lib/gameData';
import { playSound } from '@/lib/audio';
import { BattleUnit, StatusEffect } from '@/lib/battleTypes';
import { FloatingTextData } from '@/components/FloatingText';

// ============================================================================
// COMBAT ENGINE IMPORTS
// ============================================================================

import {
  calculateUnitStats,
  createDefaultBuffState,
  calculateDamage,
  calculateEnemyStats,
  resolvePlayerAttack,
  resolveEnemyAttack,
  distributeBcDrops,
  grantEnemyBcGauge,
  applyBattleItem,
  calculateFloatingTextPosition,
  checkVictoryConditions,
  VictoryState,
  OD_GAUGE_THRESHOLD,
  BATTLE_ITEMS,
  type BattleItem,
} from '@/lib/combat-engine';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TurnPhase = 'player_input' | 'player_executing' | 'enemy_executing' | 'victory' | 'defeat';

interface BattleState {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  turnCount: number;
  turnState: TurnPhase;
  combatLog: string[];
  bbFlash: boolean;
  bbCutInUnit: BattleUnit | null;
  bbHitEffect: { targetId: string; element: string } | null;
  screenShake: boolean;
  floatingTexts: FloatingTextData[];
  inventoryItems: BattleItem[];
  selectedItem: string | null;
  guardActive: Record<string, boolean>;
}

interface BattleActions {
  setSelectedItem: (id: string | null) => void;
  handleUnitClick: (id: string) => void;
  executeTurn: () => Promise<void>;
  toggleGuard: (id: string) => void;
}

export type UseBattleReturn = BattleState & BattleActions;

// ============================================================================
// PURE FUNCTIONS - Unit Creation
// ============================================================================

/**
 * Create a battle unit from template and stats
 */
function createBattleUnit(
  id: string,
  template: UnitTemplate,
  isPlayer: boolean,
  hp: number,
  maxHp: number,
  atk: number,
  def: number,
  maxBb: number
): BattleUnit {
  return {
    id,
    template,
    isPlayer,
    hp,
    maxHp,
    atk,
    def,
    bbGauge: 0,
    maxBb,
    isDead: false,
    queuedBb: false,
    actionState: 'idle',
    statusEffects: [] as StatusEffect[],
    buff: createDefaultBuffState(),
    hitCount: 0,
    totalDamageDealt: 0,
    comboChain: 0,
    isGuarding: false,
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Main battle hook - delegates calculations to combat-engine
 */
export function useBattle(
  state: PlayerState,
  stageId: number,
  onEnd: (victory: boolean) => void
): UseBattleReturn {
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // -------------------------------------------------------------------------
  // Helper Functions (UI/Audio + Timing only)
  // -------------------------------------------------------------------------

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(id => clearTimeout(id));
    timeoutRefs.current = [];
  }, []);

  // -------------------------------------------------------------------------
  // Initialize Units from State
  // -------------------------------------------------------------------------

  const initialPlayerUnits = useMemo(() => {
    const units: BattleUnit[] = [];
    for (let idx = 0; idx < state.team.length; idx++) {
      const instanceId = state.team[idx];
      if (!instanceId) continue;

      const inst = state.inventory.find(u => u.instanceId === instanceId);
      if (!inst) continue;

      const template = UNIT_DATABASE[inst.templateId];
      if (!template) continue;

      const stats = calculateUnitStats(template, inst.level, inst.equipment, state.equipmentInventory);
      let atkBonus = 1.0;

      if (idx === 0 && template.leaderSkill) {
        if (template.leaderSkill.statBoost?.atk) {
          atkBonus += template.leaderSkill.statBoost.atk;
        }
      }

      units.push(createBattleUnit(
        `p_${idx}`,
        template,
        true,
        stats.hp,
        stats.hp,
        Math.floor(stats.atk * atkBonus),
        stats.def,
        template.skill.cost
      ));
    }
    return units;
  }, [state.team, state.inventory, state.equipmentInventory]);

  const initialEnemyUnits = useMemo(() => {
    const stageData = STAGES.find(s => s.id === stageId);
    if (!stageData) return [];

    const hpMultiplier = 1 + (stageId * 0.1);
    const units: BattleUnit[] = [];

    for (let idx = 0; idx < stageData.enemies.length; idx++) {
      const enemyId = stageData.enemies[idx];
      const template = ENEMIES.find(e => e.id === enemyId);
      if (!template) continue;

      const scaledStats = calculateEnemyStats(
        template.baseStats,
        stageId,
        'tier1'
      );

      units.push(createBattleUnit(
        `e_${idx}`,
        template,
        false,
        scaledStats.hp,
        scaledStats.hp,
        scaledStats.atk,
        scaledStats.def,
        template.skill.cost
      ));
    }
    return units;
  }, [stageId]);

  // -------------------------------------------------------------------------
  // React State for UI
  // -------------------------------------------------------------------------

  const [playerUnits, setPlayerUnits] = useState<BattleUnit[]>(initialPlayerUnits);
  const [enemyUnits, setEnemyUnits] = useState<BattleUnit[]>(initialEnemyUnits);
  const [turnState, setTurnState] = useState<TurnPhase>('player_input');
  const [turnCount, setTurnCount] = useState(1);
  const [combatLog, setCombatLog] = useState<string[]>(['Battle Started!']);
  const [bbFlash, setBbFlash] = useState(false);
  const [bbCutInUnit, setBbCutInUnit] = useState<BattleUnit | null>(null);
  const [bbHitEffect, setBbHitEffect] = useState<{ targetId: string; element: string } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);
  const [inventoryItems, setInventoryItems] = useState([...BATTLE_ITEMS]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [guardActive, setGuardActive] = useState<Record<string, boolean>>({});

  // -------------------------------------------------------------------------
  // UI Actions
  // -------------------------------------------------------------------------

  const addLog = useCallback((msg: string) => {
    setCombatLog(prev => [...prev.slice(-4), msg]);
  }, []);

  const addFloatingText = useCallback((
    text: string,
    type: FloatingTextData['type'],
    targetId: string,
    isPlayer: boolean,
    damage?: number
  ) => {
    const pos = calculateFloatingTextPosition(targetId, isPlayer);
    const id = Math.random().toString(36).substr(2, 9);

    setFloatingTexts(prev => [...prev, { id, text, type, x: pos.x, y: pos.y, damage }]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1100);
  }, []);

  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, []);

  const toggleGuard = useCallback((id: string) => {
    setGuardActive(prev => ({ ...prev, [id]: !prev[id] }));
    setPlayerUnits(prev => prev.map(u => {
      if (u.id === id && !u.isDead) {
        return { ...u, isGuarding: !u.isGuarding, actionState: u.isGuarding ? 'idle' : 'guarding' };
      }
      return u;
    }));
  }, []);

  const applyItem = useCallback((itemId: string, targetId: string) => {
    const itemIdx = inventoryItems.findIndex(i => i.id === itemId);
    if (itemIdx === -1 || inventoryItems[itemIdx].count <= 0) return;

    const item = inventoryItems[itemIdx];
    let itemUsed = false;

    setPlayerUnits(prev => prev.map(u => {
      if (item.type === 'heal_all' && !u.isDead) {
        itemUsed = true;
        const healAmount = Math.min(u.maxHp - u.hp, item.value);
        if (healAmount > 0) addFloatingText(`+${healAmount}`, 'heal', u.id, true);
        return { ...u, hp: Math.min(u.maxHp, u.hp + item.value) };
      }
      if (u.id === targetId) {
        if (item.type === 'heal' && !u.isDead && u.hp < u.maxHp) {
          itemUsed = true;
          const healAmount = Math.min(u.maxHp - u.hp, item.value);
          addFloatingText(`+${healAmount}`, 'heal', u.id, true);
          return { ...u, hp: Math.min(u.maxHp, u.hp + item.value) };
        }
        if (item.type === 'bb_fill' && !u.isDead && u.bbGauge < u.maxBb) {
          itemUsed = true;
          playSound('bb_ready');
          addFloatingText('BB FILL', 'bb', u.id, true);
          return { ...u, bbGauge: u.maxBb };
        }
        if (item.type === 'revive' && u.isDead) {
          itemUsed = true;
          addFloatingText('REVIVED', 'heal', u.id, true);
          return { ...u, isDead: false, hp: Math.floor(u.maxHp * item.value), bbGauge: 0, actionState: 'idle' };
        }
      }
      return u;
    }));

    if (itemUsed) {
      playSound('heal');
      const newItems = [...inventoryItems];
      newItems[itemIdx].count -= 1;
      setInventoryItems(newItems);
      addLog(`Used ${item.name}!`);
    } else {
      addLog(`Cannot use ${item.name} on that target.`);
    }
  }, [inventoryItems, addFloatingText, addLog]);

  const toggleBb = useCallback((id: string) => {
    setPlayerUnits(prev => prev.map(u => {
      if (u.id === id && u.bbGauge >= u.maxBb && !u.isDead) {
        return { ...u, queuedBb: !u.queuedBb };
      }
      return u;
    }));
  }, []);

  const handleUnitClick = useCallback((id: string) => {
    if (turnState !== 'player_input') return;

    if (selectedItem) {
      applyItem(selectedItem, id);
      setSelectedItem(null);
    } else {
      toggleBb(id);
    }
  }, [turnState, selectedItem, applyItem, toggleBb]);

  // -------------------------------------------------------------------------
  // Get Leader Element Boost (memoized)
  // -------------------------------------------------------------------------

  const leaderElementBoost = useMemo(() => {
    const leaderUnit = state.team[0] ? state.inventory.find(u => u.instanceId === state.team[0]) : null;
    if (!leaderUnit) return undefined;

    const leaderTemplate = UNIT_DATABASE[leaderUnit.templateId];
    return leaderTemplate?.leaderSkill?.elementBoost;
  }, [state.team, state.inventory]);

  // -------------------------------------------------------------------------
  // Battle Execution - Delegates to Combat Engine
  // -------------------------------------------------------------------------

  const executeTurn = useCallback(async () => {
    if (turnState !== 'player_input') return;
    setTurnState('player_executing');

    let currentEnemies = [...enemyUnits];
    let currentPlayer = [...playerUnits];

    // ---------------------------------------------------------------------
    // Player Attacks Phase
    // ---------------------------------------------------------------------

    for (let i = 0; i < currentPlayer.length; i++) {
      const attacker = currentPlayer[i];
      if (attacker.isDead) continue;

      // Find alive enemy target
      const targetIdx = currentEnemies.findIndex(e => !e.isDead);
      if (targetIdx === -1) break; // All enemies dead
      const target = currentEnemies[targetIdx];

      const isBb = attacker.queuedBb;

      // Calculate damage using COMBAT ENGINE pure function
      const damageResult = calculateDamage(attacker, target, {
        isBb,
        isPlayerAttack: true,
        leaderElementBoost,
      });

      const isOD = damageResult.isOD;
      const isWeakness = damageResult.isWeakness;

      // ANIMATION: Attacker moves
      currentPlayer[i] = {
        ...attacker,
        hitCount: attacker.hitCount + 1,
        actionState: isBb ? 'skill' : 'attacking'
      };
      setPlayerUnits([...currentPlayer]);

      // OD notification
      if (isOD) {
        addLog(`⚡ OVERDRIVE! ${attacker.template.name}'s BB is ready!`);
        addFloatingText('OD!', 'buff', attacker.id, true);
      }

      // BB Cut-in animation
      if (isBb) {
        setBbCutInUnit(attacker);
        playSound('bb_cast');
        await new Promise(r => setTimeout(r, 1500));
        setBbCutInUnit(null);
        setBbFlash(true);
        triggerScreenShake();
        setTimeout(() => setBbFlash(false), 150);
        await new Promise(r => setTimeout(r, 200));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }

      // Apply damage to enemy
      currentEnemies[targetIdx] = {
        ...target,
        hp: Math.max(0, target.hp - damageResult.finalDamage),
        isDead: target.hp - damageResult.finalDamage <= 0,
        actionState: isBb ? 'bb_hurt' : 'hurt',
        isWeaknessHit: isWeakness
      };
      setEnemyUnits([...currentEnemies]);

      // BB effects
      if (isBb) {
        setBbHitEffect({ targetId: target.id, element: attacker.template.element });
        playSound('bb_hit');
        if (isWeakness) setTimeout(() => playSound('weakness'), 100);
        setTimeout(() => setBbHitEffect(null), 800);

        // Status effect from BB
        if (damageResult.statusEffectApplied) {
          currentEnemies[targetIdx] = {
            ...currentEnemies[targetIdx],
            statusEffects: [
              ...currentEnemies[targetIdx].statusEffects,
              {
                type: damageResult.statusEffectApplied.type as StatusEffect['type'],
                turnsRemaining: damageResult.statusEffectApplied.turns,
                power: damageResult.statusEffectApplied.power,
              }
            ]
          };
          setEnemyUnits([...currentEnemies]);
          addLog(`${target.template.name} is affected by ${damageResult.statusEffectApplied.type}!`);
          await new Promise(r => setTimeout(r, 300));
        }
      } else {
        if (isWeakness) {
          playSound('weakness');
          triggerScreenShake();
        } else {
          playSound('hit');
        }
      }

      // Floating text feedback
      addFloatingText(damageResult.finalDamage.toString(), 'damage', target.id, false, damageResult.finalDamage);

      if (isWeakness) {
        addFloatingText('WEAK!', 'weak', target.id, false);
        triggerScreenShake();
        playSound('weakness');
      } else if (isBb) {
        addFloatingText('CRITICAL!', 'critical', target.id, false);
        triggerScreenShake();
        playSound('bb_hit');
      } else {
        playSound('hit');
      }

      if (isOD) {
        addFloatingText(`${attacker.hitCount + 1}x COMBO!`, 'combo', attacker.id, true);
      }

      addLog(`${attacker.template.name} ${isBb ? 'uses BB!' : 'attacks'} ${target.template.name} for ${damageResult.finalDamage} dmg! ${isWeakness ? '(Weakness!)' : ''}`);

      const impactDelay = isBb || isWeakness ? 150 : 80;
      await new Promise(r => setTimeout(r, impactDelay));

      // BC Distribution using COMBAT ENGINE pure function
      if (damageResult.bcDrops > 0) {
        playSound('bc_drop');
        addFloatingText(`+${damageResult.bcDrops} BC`, 'bc', target.id, false);

        // Distribute BC drops
        const alivePlayers = currentPlayer.filter(p => !p.isDead);
        currentPlayer = distributeBcDrops(currentPlayer, damageResult.bcDrops);
        setPlayerUnits([...currentPlayer]);
      }

      // Reset attacker state
      currentPlayer[i] = {
        ...currentPlayer[i],
        queuedBb: isOD ? true : currentPlayer[i].queuedBb,
        bbGauge: isBb ? 0 : (isOD ? currentPlayer[i].maxBb : currentPlayer[i].bbGauge),
        actionState: 'idle',
        hitCount: 0
      };
      currentEnemies[targetIdx] = {
        ...currentEnemies[targetIdx],
        actionState: currentEnemies[targetIdx].isDead ? 'dead' : 'idle',
        isWeaknessHit: false
      };
      setPlayerUnits([...currentPlayer]);
      setEnemyUnits([...currentEnemies]);

      await new Promise(r => setTimeout(r, 100));
    }

    // Check victory using COMBAT ENGINE pure function
    const victoryState = checkVictoryConditions(currentPlayer, currentEnemies);
    if (victoryState === 'victory') {
      setTurnState('victory');
      addLog("Victory!");
      setTimeout(() => onEnd(true), 2000);
      return;
    }

    // ---------------------------------------------------------------------
    // Enemy Attacks Phase
    // ---------------------------------------------------------------------

    setTurnState('enemy_executing');

    for (let i = 0; i < currentEnemies.length; i++) {
      const attacker = currentEnemies[i];
      if (attacker.isDead) continue;

      // Find alive player target
      const targetIdx = currentPlayer.findIndex(p => !p.isDead);
      if (targetIdx === -1) break;
      const target = currentPlayer[targetIdx];

      // Calculate enemy damage using COMBAT ENGINE's damage calculation (passing false for isPlayerAttack)
      const enemyDamageResult = calculateDamage(attacker, target, {
        isBb: false,
        isPlayerAttack: false,
      });

      const isWeakness = enemyDamageResult.isWeakness;
      const guardReduction = target.isGuarding ? 0.5 : 0;
      const finalDamage = Math.floor(enemyDamageResult.finalDamage * (1 - guardReduction));

      // ANIMATION: Enemy attacks
      currentEnemies[i] = { ...attacker, actionState: 'attacking' };
      setEnemyUnits([...currentEnemies]);
      await new Promise(r => setTimeout(r, 200));

      // Grant BC from enemy attack
      const bcGenerated = Math.floor(Math.random() * 3) + 1;
      currentPlayer = grantEnemyBcGauge(currentPlayer, bcGenerated);
      setPlayerUnits([...currentPlayer]);

      const bcReady = currentPlayer[targetIdx].bbGauge >= currentPlayer[targetIdx].maxBb;
      if (bcReady) playSound('bb_ready');

      // Apply damage to player
      currentPlayer[targetIdx] = {
        ...currentPlayer[targetIdx],
        hp: Math.max(0, target.hp - finalDamage),
        isDead: target.hp - finalDamage <= 0,
        actionState: target.isGuarding ? 'guarding' : 'hurt',
        isWeaknessHit: isWeakness
      };
      setPlayerUnits([...currentPlayer]);

      if (target.isGuarding) {
        addLog(`${target.template.name} guards! Damage reduced to ${finalDamage}!`);
        addFloatingText('GUARD!', 'buff', target.id, true);
      } else if (isWeakness) {
        playSound('weakness');
        triggerScreenShake();
      } else {
        playSound('hit');
      }

      addFloatingText(finalDamage.toString(), 'damage', target.id, true);
      if (isWeakness) {
        setTimeout(() => addFloatingText('WEAK', 'weak', target.id, true), 100);
      }

      addLog(`${attacker.template.name} attacks ${target.template.name} for ${finalDamage} dmg!${target.isGuarding ? ' (Guarded!)' : ''}${isWeakness ? ' (Weakness!)' : ''}`);

      await new Promise(r => setTimeout(r, 400));

      // Reset states
      currentEnemies[i] = { ...currentEnemies[i], actionState: 'idle' };
      currentPlayer[targetIdx] = {
        ...currentPlayer[targetIdx],
        actionState: currentPlayer[targetIdx].isDead ? 'dead' : 'idle',
        isWeaknessHit: false
      };
      setEnemyUnits([...currentEnemies]);
      setPlayerUnits([...currentPlayer]);

      await new Promise(r => setTimeout(r, 100));
    }

    // Check defeat using COMBAT ENGINE pure function
    const postBattleState = checkVictoryConditions(currentPlayer, currentEnemies);
    if (postBattleState === 'defeat') {
      setTurnState('defeat');
      addLog("Defeat...");
      setTimeout(() => onEnd(false), 2000);
      return;
    }

    setTurnState('player_input');
    setTurnCount(prev => prev + 1);
  }, [turnState, enemyUnits, playerUnits, leaderElementBoost, onEnd, addLog, addFloatingText, triggerScreenShake]);

  return {
    // State
    playerUnits,
    enemyUnits,
    turnCount,
    turnState,
    combatLog,
    bbFlash,
    bbCutInUnit,
    bbHitEffect,
    screenShake,
    floatingTexts,
    inventoryItems,
    selectedItem,
    guardActive,
    // Actions
    setSelectedItem,
    handleUnitClick,
    executeTurn,
    toggleGuard,
  };
}