import { useState, useEffect, useCallback, useRef } from 'react';
import { UnitTemplate, UNIT_DATABASE, Stats, QR_REWARD_TABLE, GACHA_POOL, EQUIPMENT_DATABASE, EquipSlot, STAGES, getExpForLevel, getFusionCost, getFusionExpGain, getEvolutionCost, getActiveSetBonuses } from './gameData';
import { 
  PlayerState, 
  INITIAL_STATE,
  UnitInstance,
  EquipInstance,
  CurrencyType,
  SummonResult,
  DailyQuest,
  WeeklyQuest,
  MaterialType,
  SubscriptionTier,
  SummonPity,
  GachaBanner,
  CraftRecipe,
  MATERIAL_CONFIG,
} from './economyTypes';
import {
  ENERGY_CONFIG,
  ZEL_COSTS,
  GEM_COSTS,
  GACHA_CONFIG,
  EQUIPMENT_COSTS,
  ENHANCEMENT_RATES,
  BALANCE_TARGETS,
  IAP_TIERS,
  SUBSCRIPTION_CONFIG,
  BATTLE_PASS_CONFIG,
  CONSUMABLE_ITEMS,
  CRAFT_RECIPES,
  SHOP_UNITS,
  SHOP_EQUIPMENT,
  SHOP_CONSUMABLES,
} from './economyData';
import { saveGameState, loadGameState } from './auth';
import { queueSave, initSaveQueue, isOnline, getQueueLength } from './save-queue';

export * from './gameTypes';
export * from './economyTypes';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENERGY_REGEN_MS = ENERGY_CONFIG.REGEN_MS;

// ============================================================================
// MAIN HOOK
// ============================================================================

interface UseGameStateOptions {
  userId?: string | null;
  autoSave?: boolean;
  saveInterval?: number;
}

export function useGameState(options: UseGameStateOptions = {}) {
  const { userId, autoSave = true, saveInterval = 30000 } = options;
  const [state, setState] = useState<PlayerState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeToNextEnergy, setTimeToNextEnergy] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Track spendEnergy result - avoids closure issue
  const energyResultRef = useRef<{ success: boolean; energy: number }>({ success: false, energy: 0 });

  // ============================================================================
  // STATE LOADING
  // ============================================================================

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const loadState = async () => {
      const saved = localStorage.getItem('rpg_game_state');
      let loadedState: PlayerState | null = null;
      
      if (saved) {
        try {
          loadedState = JSON.parse(saved);
          loadedState = migrateState(loadedState);
        } catch (e) {
          console.error('Failed to parse save data', e);
        }
      }

      if (userId && loadedState) {
        const cloudState = await loadGameState(userId);
        if (cloudState) {
          loadedState = migrateState(cloudState);
          localStorage.setItem('rpg_game_state', JSON.stringify(cloudState));
        }
      }

      setState(loadedState || INITIAL_STATE);
      setIsLoaded(true);
      
      // Initialize save queue after loading state
      initSaveQueue();
    };

    loadState();
  }, [userId]);

  // ============================================================================
  // STATE MIGRATION (Handle version updates)
  // ============================================================================

  function migrateState(oldState: any): PlayerState {
    let migrated = { ...INITIAL_STATE, ...oldState };
    
    // Ensure required fields exist and are iterables (Set doesn't stringify well)
    if (!migrated.ownedUnitIds || !(migrated.ownedUnitIds instanceof Set)) {
      const parsedIds = oldState?.ownedUnitIds ? (Array.isArray(oldState.ownedUnitIds) ? oldState.ownedUnitIds : Object.keys(oldState.ownedUnitIds)) : [];
      migrated.ownedUnitIds = new Set([
        ...parsedIds,
        ...(migrated.inventory?.map((u: any) => u.templateId) || [])
      ]);
    }
    
    if (!migrated.materials) {
      migrated.materials = INITIAL_STATE.materials;
    }
    
    if (!migrated.dailyState) {
      migrated.dailyState = INITIAL_STATE.dailyState;
    }
    
    if (!migrated.weeklyState) {
      migrated.weeklyState = INITIAL_STATE.weeklyState;
    }
    
    if (!migrated.battlePass) {
      migrated.battlePass = INITIAL_STATE.battlePass;
    }
    
    if (!migrated.subscription) {
      migrated.subscription = INITIAL_STATE.subscription;
    }
    
    if (!migrated.achievements) {
      migrated.achievements = [];
    }
    
    if (!migrated.stats) {
      migrated.stats = INITIAL_STATE.stats;
    }
    
    if (!migrated.arenaMedals) {
      migrated.arenaMedals = 0;
    }
    
    if (!migrated.guildCoins) {
      migrated.guildCoins = 0;
    }
    
    if (!migrated.honorPoints) {
      migrated.honorPoints = 0;
    }
    
    if (!migrated.summonPity) {
      migrated.summonPity = INITIAL_STATE.summonPity;
    }
    
    if (!migrated.qrState?.lifetimeScans) {
      migrated.qrState = { ...INITIAL_STATE.qrState, ...migrated.qrState, lifetimeScans: migrated.qrState?.scansToday || 0 };
    }
    
    // Check for daily/weekly reset
    migrated = checkDailyReset(migrated);
    migrated = checkWeeklyReset(migrated);
    
    return migrated;
  }

  // ============================================================================
  // AUTO SAVE
  // ============================================================================

  useEffect(() => {
    if (isLoaded && state) {
      localStorage.setItem('rpg_game_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !userId || !autoSave) return;

    const interval = setInterval(async () => {
      setIsSaving(true);
      // Use queue for offline-first saves
      queueSave(userId, state);
      setIsSaving(false);
      setLastSaved(new Date());
    }, saveInterval);

    return () => clearInterval(interval);
  }, [userId, isLoaded, autoSave, saveInterval, state]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userId) {
        saveGameState(userId, state);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userId, state]);

  const saveToCloud = useCallback(async () => {
    if (!userId) return false;
    setIsSaving(true);
    const success = await saveGameState(userId, state);
    setIsSaving(false);
    if (success) setLastSaved(new Date());
    return success;
  }, [userId, state]);

  // ============================================================================
  // ENERGY REGENERATION
  // ============================================================================

  useEffect(() => {
    if (!isLoaded) return;

    const tick = () => {
      setState(prev => {
        if (prev.energy >= prev.maxEnergy) {
          setTimeToNextEnergy(0);
          return { ...prev, lastEnergyUpdateTime: Date.now() };
        }

        const now = Date.now();
        const timePassed = now - prev.lastEnergyUpdateTime;
        
        if (timePassed >= ENERGY_REGEN_MS) {
          const energyToAdd = Math.floor(timePassed / ENERGY_REGEN_MS);
          const subscriptionBonus = SUBSCRIPTION_CONFIG[prev.subscription.tier]?.dailyEnergyBonus || 0;
          const effectiveMax = Math.min(prev.maxEnergy + subscriptionBonus, ENERGY_CONFIG.EMERGENCY_CAP);
          const newEnergy = Math.min(effectiveMax, prev.energy + energyToAdd);
          const remainder = timePassed % ENERGY_REGEN_MS;
          
          setTimeToNextEnergy(ENERGY_REGEN_MS - remainder);
          return {
            ...prev,
            energy: newEnergy,
            lastEnergyUpdateTime: now - remainder
          };
        }

        setTimeToNextEnergy(ENERGY_REGEN_MS - timePassed);
        return prev;
      });
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  // ============================================================================
  // DAILY/WEEKLY RESET CHECKS
  // ============================================================================

  function checkDailyReset(currentState: PlayerState): PlayerState {
    const today = new Date().toISOString().split('T')[0];
    
    if (currentState.dailyState.lastResetDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const isConsecutive = currentState.dailyState.lastLoginDate === yesterdayStr;
      const newStreak = isConsecutive ? currentState.dailyState.loginStreak + 1 : 1;
      
      // Check for weekly login bonus (day 7)
      const weeklyBonus = newStreak % 7 === 0 ? 50 : 0;
      
      return {
        ...currentState,
        energy: Math.min(currentState.energy + ENERGY_CONFIG.DAILY_BONUS_ENERGY + weeklyBonus, currentState.maxEnergy),
        gems: currentState.gems + 5 + weeklyBonus, // Daily login bonus
        dailyState: {
          ...currentState.dailyState,
          lastResetDate: today,
          lastLoginDate: today,
          loginStreak: newStreak,
          quests: currentState.dailyState.quests.map(q => ({ ...q, current: 0, claimed: false })),
        },
      };
    }
    
    return currentState;
  }

  function checkWeeklyReset(currentState: PlayerState): PlayerState {
    const now = new Date();
    const weekStart = getWeekStart();
    const lastReset = new Date(currentState.weeklyState.lastResetDate);
    
    if (weekStart > lastReset) {
      return {
        ...currentState,
        weeklyState: {
          ...currentState.weeklyState,
          lastResetDate: weekStart.toISOString(),
          quests: currentState.weeklyState.quests.map(q => ({ ...q, current: 0, claimed: false })),
        },
      };
    }
    
    return currentState;
  }

  // ============================================================================
  // CURRENCY OPERATIONS
  // ============================================================================

  const addCurrency = useCallback((type: CurrencyType, amount: number) => {
    setState(prev => {
      const multiplier = type === 'zel' ? (1 + SUBSCRIPTION_CONFIG[prev.subscription.tier]?.zelBonus || 0) : 1;
      const actualAmount = Math.floor(amount * multiplier);
      
      return {
        ...prev,
        [type]: prev[type as keyof PlayerState] as number + actualAmount,
        stats: type === 'zel' ? { ...prev.stats, totalZelEarned: prev.stats.totalZelEarned + actualAmount } : prev.stats,
      };
    });
  }, []);

  const spendCurrency = useCallback((type: CurrencyType, amount: number): boolean => {
    let success = false;
    setState(prev => {
      const current = prev[type as keyof PlayerState] as number;
      if (current >= amount) {
        success = true;
        return {
          ...prev,
          [type]: current - amount,
          stats: type === 'gems' ? { ...prev.stats, totalGemsSpent: prev.stats.totalGemsSpent + amount } : prev.stats,
        };
      }
      return prev;
    });
    return success;
  }, []);

  const refundCurrency = useCallback((type: CurrencyType, amount: number): void => {
    setState(prev => ({
      ...prev,
      [type]: prev[type as keyof PlayerState] as number + amount,
    }));
  }, []);

  const hasCurrency = useCallback((type: CurrencyType, amount: number): boolean => {
    let result = false;
    setState(prev => {
      result = (prev[type as keyof PlayerState] as number) >= amount;
      return prev;
    });
    return result;
  }, []);

  // ============================================================================
  // ENERGY OPERATIONS
  // ============================================================================

  const spendEnergy = useCallback((amount: number): boolean => {
    // Use ref to avoid closure issue - store result outside the callback scope
    let canAfford = false;
    let beforeEnergy = 0;
    
    setState(prev => {
      beforeEnergy = prev.energy;
      canAfford = prev.energy >= amount;
      
      if (canAfford) {
        console.log(`[spendEnergy] ✅ SPEND: ${prev.energy} - ${amount} = ${prev.energy - amount}`);
        // Update ref for external access
        energyResultRef.current = { success: true, energy: prev.energy - amount };
        return { ...prev, energy: prev.energy - amount };
      }
      console.log(`[spendEnergy] ❌ NOT ENOUGH: have ${prev.energy}, need ${amount}`);
      // Update ref for external access
      energyResultRef.current = { success: false, energy: prev.energy };
      return prev;
    });
    
    // Read from ref which was updated synchronously in setState callback
    console.log('[spendEnergy] REF result:', energyResultRef.current.success, 'energy:', energyResultRef.current.energy);
    return energyResultRef.current.success;
  }, []);

  const refundEnergy = useCallback((amount: number): void => {
    setState(prev => ({
      ...prev,
      energy: prev.energy + amount,
    }));
  }, []);

  const refillEnergy = useCallback((amount: number, useGems: boolean = false): boolean => {
    let success = false;
    setState(prev => {
      const energyNeeded = prev.maxEnergy - prev.energy;
      const toRefill = Math.min(amount, energyNeeded);
      const cost = toRefill * ENERGY_CONFIG.REFILL_COST_PER_ENERGY;
      
      if (useGems) {
        if (prev.gems >= cost) {
          success = true;
          return {
            ...prev,
            energy: Math.min(prev.energy + toRefill, ENERGY_CONFIG.EMERGENCY_CAP),
            gems: prev.gems - cost,
            stats: { ...prev.stats, totalGemsSpent: prev.stats.totalGemsSpent + cost },
          };
        }
        return prev;
      }
      
      // Free refill
      success = true;
      return {
        ...prev,
        energy: Math.min(prev.energy + toRefill, ENERGY_CONFIG.EMERGENCY_CAP),
      };
    });
    return success;
  }, []);

  // ============================================================================
  // DAILY QUESTS
  // ============================================================================

  const updateDailyQuest = useCallback((questId: string, progress: number) => {
    setState(prev => ({
      ...prev,
      dailyState: {
        ...prev.dailyState,
        quests: prev.dailyState.quests.map(q => {
          if (q.id === questId) {
            return { ...q, current: Math.min(q.current + progress, q.requirement) };
          }
          return q;
        }),
      },
    }));
  }, []);

  const claimDailyQuest = useCallback((questId: string): { success: boolean; reward?: { type: CurrencyType; amount: number } } => {
    let result: { success: boolean; reward?: { type: CurrencyType; amount: number } } = { success: false };
    
    setState(prev => {
      const quest = prev.dailyState.quests.find(q => q.id === questId);
      if (!quest || quest.claimed || quest.current < quest.requirement) {
        return prev;
      }
      
      result = { success: true, reward: quest.reward };
      
      return {
        ...prev,
        [quest.reward.type]: (prev[quest.reward.type as keyof PlayerState] as number) + quest.reward.amount,
        dailyState: {
          ...prev.dailyState,
          quests: prev.dailyState.quests.map(q => 
            q.id === questId ? { ...q, claimed: true } : q
          ),
        },
      };
    });
    
    return result;
  }, []);

  const claimAllDailyQuests = useCallback(() => {
    let rewards: { type: CurrencyType; amount: number }[] = [];
    
    setState(prev => {
      let zel = prev.zel;
      let gems = prev.gems;
      let arenaMedals = prev.arenaMedals;
      let guildCoins = prev.guildCoins;
      
      prev.dailyState.quests.forEach(q => {
        if (!q.claimed && q.current >= q.requirement) {
          rewards.push(q.reward);
          switch (q.reward.type) {
            case 'zel': zel += q.reward.amount; break;
            case 'gems': gems += q.reward.amount; break;
            case 'arenaMedals': arenaMedals += q.reward.amount; break;
            case 'guildCoins': guildCoins += q.reward.amount; break;
          }
        }
      });
      
      return {
        ...prev,
        zel,
        gems,
        arenaMedals,
        guildCoins,
        dailyState: {
          ...prev.dailyState,
          quests: prev.dailyState.quests.map(q => ({ ...q, claimed: true })),
        },
      };
    });
    
    return rewards;
  }, []);

  // ============================================================================
  // WEEKLY QUESTS
  // ============================================================================

  const updateWeeklyQuest = useCallback((questId: string, progress: number) => {
    setState(prev => ({
      ...prev,
      weeklyState: {
        ...prev.weeklyState,
        quests: prev.weeklyState.quests.map(q => {
          if (q.id === questId) {
            return { ...q, current: Math.min(q.current + progress, q.requirement) };
          }
          return q;
        }),
      },
    }));
  }, []);

  const claimWeeklyQuest = useCallback((questId: string): { success: boolean; reward?: { type: CurrencyType; amount: number } } => {
    let result: { success: boolean; reward?: { type: CurrencyType; amount: number } } = { success: false };
    
    setState(prev => {
      const quest = prev.weeklyState.quests.find(q => q.id === questId);
      if (!quest || quest.claimed || quest.current < quest.requirement) {
        return prev;
      }
      
      result = { success: true, reward: quest.reward };
      
      return {
        ...prev,
        [quest.reward.type]: (prev[quest.reward.type as keyof PlayerState] as number) + quest.reward.amount,
        weeklyState: {
          ...prev.weeklyState,
          quests: prev.weeklyState.quests.map(q => 
            q.id === questId ? { ...q, claimed: true } : q
          ),
        },
      };
    });
    
    return result;
  }, []);

  // ============================================================================
  // MATERIALS
  // ============================================================================

  const addMaterials = useCallback((materials: Record<MaterialType, number>) => {
    setState(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        ...Object.fromEntries(
          Object.entries(materials).map(([k, v]) => [k, prev.materials[k as MaterialType] + v])
        ),
      },
    }));
  }, []);

  const spendMaterials = useCallback((materials: Record<MaterialType, number>): boolean => {
    let success = false;
    setState(prev => {
      // Check if we have enough
      for (const [type, amount] of Object.entries(materials)) {
        if (prev.materials[type as MaterialType] < amount) {
          return prev;
        }
      }
      
      success = true;
      return {
        ...prev,
        materials: {
          ...prev.materials,
          ...Object.fromEntries(
            Object.entries(materials).map(([k, v]) => [k, prev.materials[k as MaterialType] - v])
          ),
        },
      };
    });
    return success;
  }, []);

  // ============================================================================
  // BATTLE RESULTS
  // ============================================================================

  const winBattle = useCallback((stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) return null;

    let battleResult: {
      zel: number;
      exp: number;
      playerLeveledUp: boolean;
      leveledUpUnits: { name: string; oldLevel: number; newLevel: number }[];
      equipmentDropped: EquipInstance[];
      arenaScoreGain: number;
    } = {
      zel: 0,
      exp: 0,
      playerLeveledUp: false,
      leveledUpUnits: [],
      equipmentDropped: [],
      arenaScoreGain: 0,
    };

    setState(prev => {
      const zelReward = Math.floor(stage.zelReward * (1 + (SUBSCRIPTION_CONFIG[prev.subscription.tier]?.zelBonus || 0)));
      const expReward = stage.expReward;
      const teamInstanceIds = prev.team.filter(id => id !== null) as string[];
      
      const leveledUp: { name: string; oldLevel: number; newLevel: number }[] = [];
      
      const newInventory = prev.inventory.map(unit => {
        if (!teamInstanceIds.includes(unit.instanceId)) return unit;
        
        const template = UNIT_DATABASE[unit.templateId];
        if (!template) return unit;
        
        let newExp = unit.exp + expReward;
        let newLevel = unit.level;
        const expNeeded = getExpForLevel(newLevel);
        
        if (newExp >= expNeeded && newLevel < template.maxLevel) {
          const oldLevel = newLevel;
          newLevel = Math.min(template.maxLevel, newLevel + 1);
          newExp = newExp - expNeeded;
          leveledUp.push({ name: template.name, oldLevel, newLevel });
        }
        
        return { ...unit, level: newLevel, exp: newExp };
      });

      const playerExpGain = expReward * teamInstanceIds.length;
      const playerNewExp = prev.exp + playerExpGain;
      const playerExpNeeded = prev.playerLevel * 100;
      const playerLeveledUp = playerNewExp >= playerExpNeeded;
      const newPlayerLevel = playerLeveledUp ? prev.playerLevel + 1 : prev.playerLevel;
      const newPlayerExp = playerLeveledUp ? playerNewExp - playerExpNeeded : playerNewExp;

      let arenaScoreGain = 0;
      if (stage.id >= 100 && stage.id < 200) {
        arenaScoreGain = 50 + Math.floor(Math.random() * 20); // random gain between 50-70
      }

      const equipmentDrops: EquipInstance[] = [];
      if (stage.equipmentDrops?.length && stage.equipmentDropChance && Math.random() < stage.equipmentDropChance) {
        const dropIndex = Math.floor(Math.random() * stage.equipmentDrops.length);
        const equipTemplateId = stage.equipmentDrops[dropIndex];
        if (equipTemplateId) {
          equipmentDrops.push({
            instanceId: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            templateId: equipTemplateId,
            enhancementLevel: 0,
            sockets: equipTemplateId.includes('ac') ? [] : [null, null],
          });
        }
      }

      battleResult = {
        zel: zelReward,
        exp: playerExpGain,
        playerLeveledUp,
        leveledUpUnits: leveledUp,
        equipmentDropped: equipmentDrops,
        arenaScoreGain,
      };

      return {
        ...prev,
        zel: prev.zel + zelReward,
        exp: newPlayerExp,
        playerLevel: newPlayerLevel,
        arenaScore: (prev.arenaScore || 0) + arenaScoreGain,
        energy: playerLeveledUp ? prev.maxEnergy : prev.energy,
        inventory: newInventory,
        equipmentInventory: [...prev.equipmentInventory, ...equipmentDrops],
        stats: {
          ...prev.stats,
          totalBattlesWon: prev.stats.totalBattlesWon + 1,
          totalZelEarned: prev.stats.totalZelEarned + zelReward,
          highestPlayerLevel: Math.max(prev.stats.highestPlayerLevel, newPlayerLevel),
        },
        dailyState: {
          ...prev.dailyState,
          quests: prev.dailyState.quests.map(q => {
            if (q.id === 'daily_battle') return { ...q, current: q.current + 1 };
            if (q.id === 'daily_zel') return { ...q, current: q.current + 1 };
            return q;
          }),
        },
        weeklyState: {
          ...prev.weeklyState,
          quests: prev.weeklyState.quests.map(q => {
            if (q.id === 'weekly_battles') return { ...q, current: q.current + 1 };
            if (q.id === 'weekly_zel') return { ...q, current: Math.min(q.current + zelReward, q.requirement) };
            return q;
          }),
        },
      };
    });

    return battleResult;
  }, []);

  // ============================================================================
  // FUSION & EVOLUTION
  // ============================================================================

  const fuseUnits = useCallback((targetInstanceId: string, materialInstanceIds: string[]) => {
    let result: { success: boolean; expGained: number; leveledUp: boolean; oldLevel: number; newLevel: number; message: string } = 
      { success: false, expGained: 0, leveledUp: false, oldLevel: 0, newLevel: 0, message: '' };

    setState(prev => {
      const targetUnit = prev.inventory.find(u => u.instanceId === targetInstanceId);
      if (!targetUnit) {
        result = { success: false, expGained: 0, leveledUp: false, oldLevel: 0, newLevel: 0, message: 'Target unit not found' };
        return prev;
      }

      const template = UNIT_DATABASE[targetUnit.templateId];
      if (!template) {
        result = { success: false, expGained: 0, leveledUp: false, oldLevel: 0, newLevel: 0, message: 'Unit template not found' };
        return prev;
      }
      if (targetUnit.level >= template.maxLevel) {
        result = { success: false, expGained: 0, leveledUp: false, oldLevel: 0, newLevel: 0, message: 'Unit is already at max level' };
        return prev;
      }

      const materialUnits = materialInstanceIds
        .map(id => prev.inventory.find(u => u.instanceId === id))
        .filter((u): u is UnitInstance => u !== undefined);

      if (materialUnits.length === 0) {
        result = { success: false, expGained: 0, leveledUp: false, oldLevel: 0, newLevel: 0, message: 'No materials selected' };
        return prev;
      }

      const maxRarity = Math.max(...materialUnits.map(u => UNIT_DATABASE[u.templateId]?.rarity || 1));
      const fusionCost = getFusionCost(targetUnit.level, materialUnits.length) * 
        (maxRarity >= 5 ? 5 : maxRarity >= 4 ? 2 : 1);
      
      if (prev.zel < fusionCost) {
        result = { success: false, expGained: 0, leveledUp: false, oldLevel: 0, newLevel: 0, message: 'Not enough zel' };
        return prev;
      }

      const targetElement = template.element;
      let totalExpGained = 0;
      materialUnits.forEach(material => {
        const materialTemplate = UNIT_DATABASE[material.templateId];
        const isSameElement = materialTemplate.element === targetElement;
        totalExpGained += getFusionExpGain(materialTemplate.rarity, material.level, isSameElement);
      });

      let newExp = targetUnit.exp + totalExpGained;
      let newLevel = targetUnit.level;
      const expNeeded = getExpForLevel(newLevel);
      const oldLevel = newLevel;

      while (newExp >= expNeeded && newLevel < template.maxLevel) {
        newExp -= expNeeded;
        newLevel++;
      }

      const timesFused = (targetUnit.timesFused || 0) + materialUnits.length;
      
      result = { 
        success: true, 
        expGained: totalExpGained, 
        leveledUp: newLevel > oldLevel, 
        oldLevel, 
        newLevel, 
        message: 'Fusion complete!' 
      };

      return {
        ...prev,
        zel: prev.zel - fusionCost,
        inventory: prev.inventory
          .filter(u => !materialInstanceIds.includes(u.instanceId))
          .map(u => u.instanceId === targetInstanceId ? { ...u, level: newLevel, exp: newExp, timesFused } : u),
        stats: {
          ...prev.stats,
          totalFusionPerformed: prev.stats.totalFusionPerformed + 1,
        },
        dailyState: {
          ...prev.dailyState,
          quests: prev.dailyState.quests.map(q => {
            if (q.id === 'daily_fusion') return { ...q, current: q.current + materialUnits.length };
            return q;
          }),
        },
      };
    });

    return result;
  }, []);

  const evolveUnit = useCallback((targetInstanceId: string) => {
    let result: { success: boolean; newTemplateId?: string; message: string } = { success: false, message: '' };

    setState(prev => {
      const targetUnit = prev.inventory.find(u => u.instanceId === targetInstanceId);
      if (!targetUnit) {
        result = { success: false, message: 'Unit not found' };
        return prev;
      }

      const template = UNIT_DATABASE[targetUnit.templateId];
      if (!template?.evolutionTarget) {
        result = { success: false, message: 'This unit cannot evolve' };
        return prev;
      }

      const evolutionCost = getEvolutionCost(template.rarity);
      if (prev.zel < evolutionCost) {
        result = { success: false, message: 'Not enough zel' };
        return prev;
      }

      const evolutionMaterials = template.evolutionMaterials || [];
      for (const mat of evolutionMaterials) {
        if (prev.materials[mat as MaterialType] < 1) {
          const config = MATERIAL_CONFIG[mat as MaterialType];
          result = { success: false, message: `Missing ${config?.name || mat}` };
          return prev;
        }
      }

      result = { success: true, newTemplateId: template.evolutionTarget, message: 'Evolution complete!' };

      return {
        ...prev,
        zel: prev.zel - evolutionCost,
        materials: evolutionMaterials.reduce((acc, mat) => {
          acc[mat as MaterialType] = (acc[mat as MaterialType] || 0) - 1;
          return acc;
        }, { ...prev.materials }),
        inventory: prev.inventory.map(u => 
          u.instanceId === targetInstanceId ? { ...u, templateId: template.evolutionTarget!, level: 1, exp: 0 } : u
        ),
        stats: {
          ...prev.stats,
          totalEvolutionPerformed: prev.stats.totalEvolutionPerformed + 1,
        },
      };
    });

    return result;
  }, []);

  // ============================================================================
  // CRAFTING SYSTEM
  // ============================================================================

  const craftItem = useCallback((recipeId: string): { success: boolean; message: string } => {
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Recipe not found' };
    
    if (state.playerLevel < recipe.requiredLevel) {
      return { success: false, message: `Requires level ${recipe.requiredLevel}` };
    }
    
    // Check zel cost
    if (state.zel < recipe.zelCost) {
      return { success: false, message: 'Not enough Zel' };
    }
    
    // Check materials
    for (const [material, amount] of Object.entries(recipe.materials)) {
      if (amount > 0 && state.materials[material as MaterialType] < amount) {
        const config = MATERIAL_CONFIG[material as MaterialType];
        return { success: false, message: `Need more ${config?.name || material}` };
      }
    }
    
    // All checks passed - execute craft
    setState(prev => {
      const newMaterials = { ...prev.materials };
      for (const [material, amount] of Object.entries(recipe.materials)) {
        if (amount > 0) {
          newMaterials[material as MaterialType] -= amount;
        }
      }
      
      let newInventory = [...prev.inventory];
      let newEquipmentInventory = [...prev.equipmentInventory];
      
      if (recipe.outputType === 'equipment') {
        newEquipmentInventory.push({
          instanceId: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          templateId: recipe.outputId,
          enhancementLevel: 0,
          sockets: recipe.outputId.includes('ac') ? [] : [null, null],
        });
      } else if (recipe.outputType === 'material') {
        newMaterials[recipe.outputId as MaterialType] = (newMaterials[recipe.outputId as MaterialType] || 0) + recipe.outputQuantity;
      }
      
      return {
        ...prev,
        zel: prev.zel - recipe.zelCost,
        materials: newMaterials,
        inventory: newInventory,
        equipmentInventory: newEquipmentInventory,
      };
    });
    
    return { success: true, message: `Crafted ${recipe.name}!` };
  }, [state]);

  // ============================================================================
  // SHOP PURCHASE SYSTEM
  // ============================================================================

  const purchaseShopUnit = useCallback((listingId: string): { success: boolean; message: string } => {
    const listing = SHOP_UNITS.find(l => l.id === listingId);
    if (!listing) return { success: false, message: 'Item not found' };
    
    if (state.playerLevel < listing.requiredLevel) {
      return { success: false, message: `Requires level ${listing.requiredLevel}` };
    }
    
    const currencyKey = listing.currency;
    const currentCurrency = state[currencyKey as keyof PlayerState] as number;
    if (currentCurrency < listing.price) {
      return { success: false, message: `Not enough ${listing.currency}` };
    }
    
    setState(prev => ({
      ...prev,
      [currencyKey]: (prev[currencyKey as keyof PlayerState] as number) - listing.price,
      inventory: [...prev.inventory, {
        instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId: listing.templateId,
        level: 1,
        exp: 0,
        equipment: { weapon: null, armor: null, accessory: null },
        timesFused: 0,
      }],
    }));
    
    return { success: true, message: 'Unit acquired!' };
  }, [state]);

  const purchaseShopEquipment = useCallback((listingId: string): { success: boolean; message: string } => {
    const listing = SHOP_EQUIPMENT.find(l => l.id === listingId);
    if (!listing) return { success: false, message: 'Item not found' };
    
    if (listing.stock <= 0) return { success: false, message: 'Out of stock' };
    
    const currencyKey = listing.currency;
    const currentCurrency = state[currencyKey as keyof PlayerState] as number;
    if (currentCurrency < listing.price) {
      return { success: false, message: `Not enough ${listing.currency}` };
    }
    
    setState(prev => ({
      ...prev,
      [currencyKey]: (prev[currencyKey as keyof PlayerState] as number) - listing.price,
      equipmentInventory: [...prev.equipmentInventory, {
        instanceId: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId: listing.templateId,
        enhancementLevel: 0,
        sockets: listing.templateId.includes('ac') ? [] : [null, null],
      }],
    }));
    
    return { success: true, message: 'Equipment acquired!' };
  }, [state]);

  const purchaseConsumable = useCallback((listingId: string): { success: boolean; message: string } => {
    const listing = SHOP_CONSUMABLES.find(l => l.id === listingId);
    if (!listing) return { success: false, message: 'Item not found' };
    
    if (listing.stock <= 0) return { success: false, message: 'Out of stock' };
    
    const currencyKey = listing.currency;
    const currentCurrency = state[currencyKey as keyof PlayerState] as number;
    if (currentCurrency < listing.price) {
      return { success: false, message: `Not enough ${listing.currency}` };
    }
    
    const item = CONSUMABLE_ITEMS[listing.consumableId];
    if (!item) return { success: false, message: 'Item not found' };
    
    const now = Date.now();
    
    setState(prev => {
      const newState: Partial<PlayerState> = {
        [currencyKey]: (prev[currencyKey as keyof PlayerState] as number) - listing.price,
      };
      
      // Apply immediate effects
      if (item.type === 'energy') {
        newState.energy = Math.min(prev.energy + item.value, prev.maxEnergy);
      } else if (item.type === 'special' && (item.id === 'qr_scan_small' || item.id === 'qr_scan_medium' || item.id === 'qr_scan_large')) {
        // QR Scan boosters
        const bonusScans = item.value;
        const durationHours = item.duration || 24;
        const expiresAt = now + (durationHours * 60 * 60 * 1000);
        
        newState.qrState = {
          ...prev.qrState,
          maxDailyScans: prev.qrState.maxDailyScans + bonusScans,
          tempBonusScans: (prev.qrState.tempBonusScans || 0) + bonusScans,
          tempBonusExpiresAt: prev.qrState.tempBonusExpiresAt && prev.qrState.tempBonusExpiresAt > now
            ? Math.max(prev.qrState.tempBonusExpiresAt, expiresAt)
            : expiresAt,
        };
      }
      
      return { ...prev, ...newState };
    });
    
    const effectMsg = item.type === 'special' && item.id?.includes('qr_scan') 
      ? `+${item.value} QR scans for ${item.duration || 24}h` 
      : item.type === 'energy' 
        ? `+${item.value} energy` 
        : '';
    
    return { success: true, message: `Used ${item.name}! ${effectMsg}` };
  }, [state]);

  // ============================================================================
  // GACHA / SUMMON SYSTEM
  // ============================================================================

  const rollGacha = useCallback((bannerId: string, count: number = 1): SummonResult[] => {
    const banner = GACHA_CONFIG.BANNERS[bannerId as keyof typeof GACHA_CONFIG.BANNERS];
    if (!banner) return [];
    
    const totalCost = banner.cost * count;
    const results: SummonResult[] = [];
    const pool = GACHA_POOL;
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    
    // Update state with gem deduction
    setState(prev => {
      if (prev.gems < totalCost) return prev;
      
      let newPity = { ...prev.summonPity };
      const bannerPity = newPity.bannerPulls[bannerId] || 0;
      const newInventory = [...prev.inventory];
      const newOwnedIds = new Set(prev.ownedUnitIds);
      
      for (let i = 0; i < count; i++) {
        const currentPity = bannerPity + i;
        let selected = pool[0];
        
        // Pity system check
        if (currentPity >= banner.pityPulls) {
          // Guaranteed rare on pity
          const rarity = banner.pityRarity;
          const rareUnits = pool.filter(u => {
            const rarityCheck = u.weight >= 100 ? 3 : u.weight >= 20 ? 4 : 5;
            return rarityCheck === rarity;
          });
          selected = rareUnits[Math.floor(Math.random() * rareUnits.length)];
        } else {
          // Normal roll
          const rand = Math.random() * totalWeight;
          let cumulative = 0;
          
          // Check for featured unit rate up
          if (banner.featuredUnits?.length && Math.random() < banner.featuredRate) {
            const featuredId = banner.featuredUnits[Math.floor(Math.random() * banner.featuredUnits.length)];
            const featuredUnit = pool.find(u => u.unitId === featuredId);
            if (featuredUnit) selected = featuredUnit;
          } else {
            for (const item of pool) {
              cumulative += item.weight;
              if (rand <= cumulative) {
                selected = item;
                break;
              }
            }
          }
        }
        
        // Determine rarity based on weight
        let rarity = 1;
        if (selected.weight >= 100) rarity = 3;
        else if (selected.weight >= 20) rarity = 4;
        else if (selected.weight >= 5) rarity = 5;
        else rarity = 1;
        
        // Check if unit is new
        const isNew = !prev.ownedUnitIds.has(selected.unitId);
        
        // Calculate duplicate value
        const duplicateValues = GACHA_CONFIG.DUPLICATE_VALUES[
          `STAR${rarity}` as keyof typeof GACHA_CONFIG.DUPLICATE_VALUES
        ];
        
        results.push({
          templateId: selected.unitId,
          rarity,
          isNew,
          duplicate: !isNew,
          prismValue: isNew ? 0 : duplicateValues.prism,
          zelValue: isNew ? 0 : duplicateValues.zel,
        });
        
        // Update pity
        newPity = {
          ...newPity,
          star5Pulls: rarity === 5 ? 0 : newPity.star5Pulls + 1,
          star4Pulls: rarity === 4 ? 0 : newPity.star4Pulls + 1,
          lastStar5Pull: rarity === 5 ? currentPity : newPity.lastStar5Pull,
          lastStar4Pull: rarity === 4 ? currentPity : newPity.lastStar4Pull,
          totalPulls: newPity.totalPulls + 1,
          bannerPulls: {
            ...newPity.bannerPulls,
            [bannerId]: currentPity + 1,
          },
        };
        
        // Add to owned units if new
        if (isNew) {
          newOwnedIds.add(selected.unitId);
        }
      }
      
      // Add units to inventory
      results.forEach(result => {
        newInventory.push({
          instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          templateId: result.templateId,
          level: 1,
          exp: 0,
          equipment: { weapon: null, armor: null, accessory: null },
          timesFused: 0,
        });
      });
      
      return {
        ...prev,
        gems: prev.gems - totalCost,
        inventory: newInventory,
        summonPity: newPity,
        ownedUnitIds: newOwnedIds,
        stats: {
          ...prev.stats,
          totalGemsSpent: prev.stats.totalGemsSpent + totalCost,
          totalSummons: prev.stats.totalSummons + count,
          totalUnitsCollected: prev.stats.totalUnitsCollected + results.filter(r => r.isNew).length,
        },
        weeklyState: {
          ...prev.weeklyState,
          quests: prev.weeklyState.quests.map(q => {
            if (q.id === 'weekly_summon') {
              return { ...q, current: q.current + count };
            }
            return q;
          }),
        },
      };
    });
    
    return results;
  }, []);

  const convertDuplicate = useCallback((instanceId: string): { prism: number; zel: number } | null => {
    const unit = state.inventory.find(u => u.instanceId === instanceId);
    if (!unit) return null;
    
    const template = UNIT_DATABASE[unit.templateId];
    const rarity = template?.rarity || 3;
    const duplicateValues = GACHA_CONFIG.DUPLICATE_VALUES[`STAR${rarity}` as keyof typeof GACHA_CONFIG.DUPLICATE_VALUES];
    
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(u => u.instanceId !== instanceId),
      materials: {
        ...prev.materials,
        [`prism${rarity}` as MaterialType]: prev.materials[`prism${rarity}` as MaterialType] + duplicateValues.prism,
      },
      zel: prev.zel + duplicateValues.zel,
    }));
    
    return duplicateValues;
  }, [state.inventory]);

  // ============================================================================
  // EQUIPMENT ENHANCEMENT
  // ============================================================================

  const enhanceEquipment = useCallback((instanceId: string, useProtection: boolean = false): {
    success: boolean;
    broke: boolean;
    newLevel: number;
    message: string;
  } => {
    const equipment = state.equipmentInventory.find(e => e.instanceId === instanceId);
    if (!equipment) return { success: false, broke: false, newLevel: 0, message: 'Equipment not found' };
    
    const currentLevel = equipment.enhancementLevel;
    if (currentLevel >= 20) return { success: false, broke: false, newLevel: 20, message: 'Already at max level' };
    
    // Calculate cost
    const cost = EQUIPMENT_COSTS.ENHANCE.BASE + (currentLevel * EQUIPMENT_COSTS.ENHANCE.PER_LEVEL);
    const materialCost = Math.ceil((currentLevel + 1) / 5); // Iron ore per level
    
    // Check resources
    if (state.zel < cost) return { success: false, broke: false, newLevel: currentLevel, message: 'Not enough zel' };
    if (state.materials.ironOre < materialCost) return { success: false, broke: false, newLevel: currentLevel, message: 'Not enough materials' };
    
    // Check protection for risky levels
    let needsProtection = currentLevel >= 10;
    if (needsProtection && !useProtection) {
      // Check if player has gems for protection
      const protectionCost = currentLevel >= 15 
        ? EQUIPMENT_COSTS.ENHANCE.PROTECTION.HIGH 
        : (currentLevel >= 10 
          ? EQUIPMENT_COSTS.ENHANCE.PROTECTION.MEDIUM 
          : EQUIPMENT_COSTS.ENHANCE.PROTECTION.LOW);
      if (state.gems < protectionCost) {
        return { success: false, broke: false, newLevel: currentLevel, message: `Protection costs ${protectionCost} gems` };
      }
    }
    
    // Calculate success rate
    const successRate = ENHANCEMENT_RATES[currentLevel as keyof typeof ENHANCEMENT_RATES] / 100;
    const roll = Math.random();
    const succeeded = roll < successRate;
    
    if (succeeded) {
      setState(prev => ({
        ...prev,
        zel: prev.zel - cost,
        materials: {
          ...prev.materials,
          ironOre: prev.materials.ironOre - materialCost,
        },
        equipmentInventory: prev.equipmentInventory.map(e =>
          e.instanceId === instanceId
            ? { ...e, enhancementLevel: e.enhancementLevel + 1 }
            : e
        ),
        dailyState: {
          ...prev.dailyState,
          quests: prev.dailyState.quests.map(q => {
            if (q.id === 'daily_enhance') {
              return { ...q, current: q.current + 1 };
            }
            return q;
          }),
        },
      }));
      
      return { success: true, broke: false, newLevel: currentLevel + 1, message: `Enhanced to +${currentLevel + 1}!` };
    } else {
      // Enhancement failed, check protection
      if (useProtection || !needsProtection) {
        setState(prev => ({
          ...prev,
          zel: prev.zel - cost,
          materials: {
            ...prev.materials,
            ironOre: prev.materials.ironOre - materialCost,
          },
        }));
        return { success: false, broke: false, newLevel: currentLevel, message: 'Enhancement failed (protected)' };
      } else {
        // Broke the equipment
        const protectionCost = currentLevel >= 15 
          ? EQUIPMENT_COSTS.ENHANCE.PROTECTION.HIGH 
          : (currentLevel >= 10 
            ? EQUIPMENT_COSTS.ENHANCE.PROTECTION.MEDIUM 
            : EQUIPMENT_COSTS.ENHANCE.PROTECTION.LOW);
        
        setState(prev => ({
          ...prev,
          zel: prev.zel - cost,
          gems: prev.gems - protectionCost,
          equipmentInventory: prev.equipmentInventory.map(e =>
            e.instanceId === instanceId
              ? { ...e, enhancementLevel: Math.max(0, e.enhancementLevel - 3) }
              : e
          ),
        }));
        return { success: false, broke: true, newLevel: Math.max(0, currentLevel - 3), message: 'Enhancement failed! Equipment downgraded!' };
      }
    }
  }, [state]);

  // ============================================================================
  // BATTLE PASS
  // ============================================================================

  const addBattlePassXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.battlePass.currentXP + amount;
      const newTier = Math.floor(newXP / 400) + 1;
      const maxTier = Math.min(newTier, 50);
      
      return {
        ...prev,
        battlePass: {
          ...prev.battlePass,
          currentXP: newXP,
          tierUnlocked: Math.max(prev.battlePass.tierUnlocked, maxTier),
        },
      };
    });
  }, []);

  const claimBattlePassReward = useCallback((tier: number, isPremium: boolean): { success: boolean; reward?: { type: CurrencyType; amount: number } } => {
    let result: { success: boolean; reward?: { type: CurrencyType; amount: number } } = { success: false };
    
    setState(prev => {
      if (tier > prev.battlePass.tierUnlocked) {
        return prev;
      }
      
      if (prev.battlePass.claimedTiers.includes(tier)) {
        return prev;
      }
      
      if (isPremium && !prev.battlePass.premiumPurchased) {
        return prev;
      }
      
      const tierData = BATTLE_PASS_CONFIG.TIERS[tier - 1]; // Battle Pass tiers are 0-indexed
      const reward = isPremium 
        ? { type: 'gems' as CurrencyType, amount: 10 + tier * 2 }
        : { type: 'zel' as CurrencyType, amount: 500 * tier };
      
      result = { success: true, reward };
      
      return {
        ...prev,
        [reward.type]: (prev[reward.type as keyof PlayerState] as number) + reward.amount,
        battlePass: {
          ...prev.battlePass,
          claimedTiers: [...prev.battlePass.claimedTiers, tier],
        },
      };
    });
    
    return result;
  }, []);

  // ============================================================================
  // SUBSCRIPTION
  // ============================================================================

  const purchaseSubscription = useCallback((tier: SubscriptionTier): boolean => {
    if (state.subscription.tier !== 'none') return false;
    
    setState(prev => {
      const benefits = SUBSCRIPTION_CONFIG[tier];
      const nextRefresh = new Date();
      nextRefresh.setDate(nextRefresh.getDate() + 30);
      
      return {
        ...prev,
        subscription: {
          tier,
          startDate: new Date().toISOString(),
          nextRefreshDate: nextRefresh.toISOString(),
          totalClaimed: 0,
        },
        maxEnergy: prev.maxEnergy + benefits.dailyEnergyBonus,
        gems: prev.gems + benefits.weeklyGems,
      };
    });
    
    return true;
  }, [state.subscription.tier]);

  const claimSubscriptionWeekly = useCallback(() => {
    if (state.subscription.tier === 'none') return 0;
    
    const benefits = SUBSCRIPTION_CONFIG[state.subscription.tier];
    
    setState(prev => ({
      ...prev,
      gems: prev.gems + benefits.weeklyGems,
      subscription: {
        ...prev.subscription,
        totalClaimed: prev.subscription.totalClaimed + benefits.weeklyGems,
      },
    }));
    
    return benefits.weeklyGems;
  }, [state.subscription.tier]);

  // ============================================================================
  // QR SCANNING
  // ============================================================================

  const processQrScan = useCallback((qrHash: string) => {
    const today = new Date().toISOString().split('T')[0];
    const qrState = state.qrState;
    const maxScans = qrState.maxDailyScans || 5;
    
    if (qrState.scansToday >= maxScans) {
      return { success: false, message: `Daily scan limit reached (${maxScans}/${maxScans}).`, rewardType: undefined, rewardValue: undefined };
    }
    
    if (qrState.scannedHashes.includes(qrHash)) {
      return { success: false, message: "This QR code has already been scanned!", rewardType: undefined, rewardValue: undefined };
    }
    
    // Weighted random selection
    const totalWeight = QR_REWARD_TABLE.reduce((sum, r) => sum + r.chance, 0);
    let rand = Math.random() * totalWeight;
    let selectedReward = QR_REWARD_TABLE[0];
    
    for (const reward of QR_REWARD_TABLE) {
      rand -= reward.chance;
      if (rand <= 0) {
        selectedReward = reward;
        break;
      }
    }
    
    let zelReward = 0;
    let gemsReward = 0;
    let energyReward = 0;
    let materialReward: MaterialType | null = null;
    let unitFragReward: string | null = null;
    let materialAmount = 0;
    
    switch (selectedReward.type) {
      case 'zel':
        zelReward = Math.floor(Math.random() * ((selectedReward.max || 2000) - (selectedReward.min || 500) + 1)) + (selectedReward.min || 500);
        break;
      case 'gems':
        gemsReward = Math.floor(Math.random() * ((selectedReward.max || 3) - (selectedReward.min || 1) + 1)) + (selectedReward.min || 1);
        break;
      case 'energy':
        energyReward = Math.floor(Math.random() * ((selectedReward.max || 7) - (selectedReward.min || 3) + 1)) + (selectedReward.min || 3);
        break;
      case 'material':
        materialReward = (selectedReward.materialType || 'ironOre') as MaterialType;
        materialAmount = selectedReward.materialType === 'mythril' ? 1 : selectedReward.materialType === 'orichalcum' ? 1 : Math.floor(Math.random() * 3) + 1;
        break;
      case 'unit_frag':
        unitFragReward = selectedReward.unitFrag || 'u1';
        break;
      default:
        zelReward = 500;
    }
    
    const newScannedHashes = [...qrState.scannedHashes, qrHash];
    
    setState(prev => {
      const updates: Partial<PlayerState> = {
        qrState: {
          scansToday: qrState.lastScanDate === today ? qrState.scansToday + 1 : 1,
          lastScanDate: today,
          scannedHashes: newScannedHashes,
          lifetimeScans: prev.qrState.lifetimeScans + 1,
          maxDailyScans: prev.qrState.maxDailyScans || 5,
        },
        zel: prev.zel + zelReward,
        gems: prev.gems + gemsReward,
        energy: Math.min(prev.maxEnergy, prev.energy + energyReward),
      };
      
      if (materialReward) {
        updates.materials = {
          ...prev.materials,
          [materialReward]: (prev.materials[materialReward] || 0) + materialAmount,
        };
      }
      
      if (unitFragReward) {
        const existingFrag = prev.unitFragments?.[unitFragReward] || 0;
        updates.unitFragments = {
          ...prev.unitFragments,
          [unitFragReward]: existingFrag + 1,
        };
      }
      
      return { ...prev, ...updates };
    });
    
    let message = '';
    let rewardType = selectedReward.type;
    let rewardValue: number | string = 0;
    
    if (zelReward > 0) {
      message = `+${zelReward} zel`;
      rewardValue = zelReward;
    } else if (gemsReward > 0) {
      message = `+${gemsReward} gems`;
      rewardValue = gemsReward;
    } else if (energyReward > 0) {
      message = `+${energyReward} energy`;
      rewardValue = energyReward;
    } else if (materialReward) {
      message = `+${materialAmount} ${materialReward}`;
      rewardValue = materialReward;
    } else if (unitFragReward) {
      message = `+1 ${unitFragReward} fragment`;
      rewardValue = unitFragReward;
    }
    
    return { success: true, message, rewardType, rewardValue };
  }, [state.qrState]);

  // ============================================================================
  // LEGACY FUNCTIONS (Backward Compatibility)
  // ============================================================================

  const updateState = (updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addUnit = (templateId: string): UnitInstance => {
    const newUnit: UnitInstance = {
      instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      level: 1,
      exp: 0,
      equipment: { weapon: null, armor: null, accessory: null },
      timesFused: 0,
    };
    setState(prev => ({ ...prev, inventory: [...prev.inventory, newUnit] }));
    return newUnit;
  };

  const setTeamMember = (slot: number, unitInstanceId: string | null) => {
    setState(prev => {
      const newTeam = [...prev.team];
      newTeam[slot] = unitInstanceId;
      return { ...prev, team: newTeam };
    });
  };

  const spendGems = (amount: number): boolean => {
    return spendCurrency('gems', amount);
  };

  const equipItem = (unitInstanceId: string, slot: EquipSlot, itemInstanceId: string | null) => {
    setState(prev => {
      const newInventory = prev.inventory.map(u => {
        if (u.instanceId === unitInstanceId) {
          return { ...u, equipment: { ...u.equipment, [slot]: itemInstanceId } };
        }
        return u;
      });
      return { ...prev, inventory: newInventory };
    });
  };

  const unequipItem = (unitInstanceId: string, slot: EquipSlot) => {
    setState(prev => {
      const newInventory = prev.inventory.map(u => {
        if (u.instanceId === unitInstanceId) {
          return { ...u, equipment: { ...u.equipment, [slot]: null } };
        }
        return u;
      });
      return { ...prev, inventory: newInventory };
    });
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  // Create backward-compatible state with both 'level' and 'playerLevel'
  const stateWithLevel: PlayerState & { level: number } = {
    ...state,
    level: state.playerLevel,
  };

  return {
    // State (backward compatible with 'level' property)
    state: stateWithLevel,
    isLoaded,
    timeToNextEnergy,
    isSaving,
    lastSaved,
    
    // Currency operations
    addCurrency,
    spendCurrency,
    refundCurrency,
    hasCurrency,
    
    // Energy operations
    spendEnergy,
    refundEnergy,
    refillEnergy,
    
    // Daily/Weekly quests
    updateDailyQuest,
    claimDailyQuest,
    claimAllDailyQuests,
    updateWeeklyQuest,
    claimWeeklyQuest,
    
    // Materials
    addMaterials,
    spendMaterials,
    
    // Battle results
    winBattle,
    
    // Fusion & Evolution
    fuseUnits,
    evolveUnit,
    
    // Crafting & Shop
    craftItem,
    purchaseShopUnit,
    purchaseShopEquipment,
    purchaseConsumable,
    
    // Gacha
    rollGacha,
    convertDuplicate,
    
    // Equipment
    enhanceEquipment,
    
    // Battle Pass
    addBattlePassXP,
    claimBattlePassReward,
    
    // Subscription
    purchaseSubscription,
    claimSubscriptionWeekly,
    
    // QR
    processQrScan,
    
    // Legacy compatibility
    updateState,
    addUnit,
    setTeamMember,
    spendGems,
    equipItem,
    unequipItem,
    unitTemplates: UNIT_DATABASE,
    saveToCloud,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export function calculateStats(template: UnitTemplate, level: number, equipment?: UnitInstance['equipment'], equipInventory?: EquipInstance[]): Stats {
  const base = {
    hp: template.baseStats.hp + template.growthRate.hp * (level - 1),
    atk: template.baseStats.atk + template.growthRate.atk * (level - 1),
    def: template.baseStats.def + template.growthRate.def * (level - 1),
    rec: template.baseStats.rec + template.growthRate.rec * (level - 1),
  };

  if (equipment && equipInventory) {
    const equipIds = [equipment.weapon, equipment.armor, equipment.accessory].filter(Boolean);
    const equippedItems: { templateId: string }[] = [];
    
    equipIds.forEach(eqInstId => {
      const eqInst = equipInventory.find(e => e.instanceId === eqInstId);
      if (eqInst) {
        const eqTemplate = EQUIPMENT_DATABASE[eqInst.templateId];
        if (eqTemplate && eqTemplate.statsBonus) {
          // Apply enhancement bonus (roughly +5% per level)
          const enhancementMultiplier = 1 + (eqInst.enhancementLevel * 0.05);
          base.hp += Math.floor((eqTemplate.statsBonus.hp || 0) * enhancementMultiplier);
          base.atk += Math.floor((eqTemplate.statsBonus.atk || 0) * enhancementMultiplier);
          base.def += Math.floor((eqTemplate.statsBonus.def || 0) * enhancementMultiplier);
          base.rec += Math.floor((eqTemplate.statsBonus.rec || 0) * enhancementMultiplier);
        }
        equippedItems.push({ templateId: eqInst.templateId });
      }
    });

    // Apply set bonuses
    const setBonuses = getActiveSetBonuses(equippedItems);
    for (const bonus of setBonuses) {
      if (bonus.statBonuses) {
        base.hp = Math.floor(base.hp * (1 + (bonus.statBonuses.hp || 0)));
        base.atk = Math.floor(base.atk * (1 + (bonus.statBonuses.atk || 0)));
        base.def = Math.floor(base.def * (1 + (bonus.statBonuses.def || 0)));
        base.rec = Math.floor(base.rec * (1 + (bonus.statBonuses.rec || 0)));
      }
    }
  }
  return base;
}
