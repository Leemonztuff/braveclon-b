import { useState, useEffect } from 'react';
import { UnitTemplate, UNIT_DATABASE, Stats, QR_REWARD_TABLE, GACHA_POOL, EQUIPMENT_DATABASE, EquipSlot, STAGES, getExpForLevel, getFusionCost, getFusionExpGain, getEvolutionCost } from './gameData';
import { UnitInstance, EquipInstance, QRState, PlayerState, INITIAL_STATE } from './gameTypes';

export * from './gameTypes';

const ENERGY_REGEN_MS = 3 * 60 * 1000; // 3 minutes in ms

export function calculateStats(template: UnitTemplate, level: number, equipment?: UnitInstance['equipment'], equipInventory?: EquipInstance[]): Stats {
  const base = {
    hp: template.baseStats.hp + template.growthRate.hp * (level - 1),
    atk: template.baseStats.atk + template.growthRate.atk * (level - 1),
    def: template.baseStats.def + template.growthRate.def * (level - 1),
    rec: template.baseStats.rec + template.growthRate.rec * (level - 1),
  };

  if (equipment && equipInventory) {
    const equipIds = [equipment.weapon, equipment.armor, equipment.accessory].filter(Boolean);
    equipIds.forEach(eqInstId => {
      const eqInst = equipInventory.find(e => e.instanceId === eqInstId);
      if (eqInst) {
        const eqTemplate = EQUIPMENT_DATABASE[eqInst.templateId];
        if (eqTemplate && eqTemplate.statsBonus) {
          base.hp += eqTemplate.statsBonus.hp || 0;
          base.atk += eqTemplate.statsBonus.atk || 0;
          base.def += eqTemplate.statsBonus.def || 0;
          base.rec += eqTemplate.statsBonus.rec || 0;
        }
      }
    });
  }
  return base;
}

// A simple local storage hook for persistence
export function useGameState() {
  const [state, setState] = useState<PlayerState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeToNextEnergy, setTimeToNextEnergy] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('rpg_game_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.lastEnergyUpdateTime) {
          parsed.lastEnergyUpdateTime = Date.now();
        }
        if (!parsed.qrState) {
          parsed.qrState = INITIAL_STATE.qrState;
        } else if (!parsed.qrState.scannedHashes) {
          parsed.qrState.scannedHashes = [];
        }
        if (!parsed.equipmentInventory) {
          parsed.equipmentInventory = INITIAL_STATE.equipmentInventory;
        }
        parsed.inventory.forEach((unit: UnitInstance) => {
          if (!unit.equipment) {
            unit.equipment = { weapon: null, armor: null, accessory: null };
          }
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse save data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('rpg_game_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Energy regeneration logic
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
          const newEnergy = Math.min(prev.maxEnergy, prev.energy + energyToAdd);
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
    tick(); // Run immediately on mount
    return () => clearInterval(interval);
  }, [isLoaded]);

  const updateState = (updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addUnit = (templateId: string) => {
    const unit = UNIT_DATABASE[templateId];
    const rarity = unit?.rarity || 1;
    const newUnit: UnitInstance = {
      instanceId: `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      templateId,
      level: 1,
      exp: 0,
      equipment: { weapon: null, armor: null, accessory: null }
    };
    // Update pity counters
    const pity = state.summonPity || { star5Pulls: 0, star4Pulls: 0, lastStar5Pull: 0 };
    const newPity = {
      star5Pulls: rarity >= 5 ? 0 : pity.star5Pulls + 1,
      star4Pulls: rarity >= 4 ? 0 : pity.star4Pulls + 1,
      lastStar5Pull: rarity >= 5 ? rarity : pity.lastStar5Pull,
    };
    
    setState(prev => ({
      ...prev,
      inventory: [...prev.inventory, newUnit],
      summonPity: newPity
    }));
    return newUnit;
  };

  const setTeamMember = (index: number, instanceId: string | null) => {
    setState(prev => {
      const newTeam = [...prev.team];
      newTeam[index] = instanceId;
      return { ...prev, team: newTeam };
    });
  };

  const spendGems = (amount: number): boolean => {
    if (state.gems >= amount) {
      setState(prev => ({ ...prev, gems: prev.gems - amount }));
      return true;
    }
    return false;
  };
  
  const spendEnergy = (amount: number): boolean => {
    if (state.energy >= amount) {
      setState(prev => ({ 
        ...prev, 
        energy: prev.energy - amount,
        lastEnergyUpdateTime: prev.energy >= prev.maxEnergy ? Date.now() : prev.lastEnergyUpdateTime
      }));
      return true;
    }
    return false;
  }

  // Simple string hash function
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const processQrScan = (qrData: string) => {
    const today = new Date().toISOString().split('T')[0];
    let currentQrState = state.qrState ? { ...state.qrState } : {
      scansToday: 0,
      lastScanDate: today,
      scannedHashes: []
    };

    if (!currentQrState.scannedHashes) {
      currentQrState.scannedHashes = [];
    }

    // Reset daily scans if it's a new day
    if (currentQrState.lastScanDate !== today) {
      currentQrState.scansToday = 0;
      currentQrState.lastScanDate = today;
      currentQrState.scannedHashes = []; // Optional: clear hashes on a new day so they can scan the same code tomorrow?
    }

    if (currentQrState.scansToday >= 5) {
      return { success: false, message: "Daily scan limit reached (5/5)." };
    }

    const hash = hashString(qrData).toString();
    if (currentQrState.scannedHashes.includes(hash)) {
      return { success: false, message: "This QR code has already been scanned!" };
    }

    // Determine reward based on hash and data-driven table
    const rewardRoll = hashString(hash + "salt") % 100;
    let cumulativeChance = 0;
    let selectedReward = QR_REWARD_TABLE[0];

    for (const reward of QR_REWARD_TABLE) {
      cumulativeChance += reward.chance;
      if (rewardRoll < cumulativeChance) {
        selectedReward = reward;
        break;
      }
    }

    let rewardType = selectedReward.type;
    let rewardValue: number | string = 0;
    let rewardMessage = '';

    if (rewardType === 'zel') {
      const range = (selectedReward.max || 1000) - (selectedReward.min || 100);
      rewardValue = (selectedReward.min || 100) + (hashString(hash + "zel") % range);
      rewardMessage = `Found ${rewardValue} Zel!`;
    } else if (rewardType === 'energy') {
      const range = (selectedReward.max || 5) - (selectedReward.min || 1);
      rewardValue = (selectedReward.min || 1) + (hashString(hash + "energy") % range);
      rewardMessage = `Recovered ${rewardValue} Energy!`;
    } else if (rewardType === 'gems') {
      const range = (selectedReward.max || 3) - (selectedReward.min || 1);
      rewardValue = (selectedReward.min || 1) + (hashString(hash + "gems") % range);
      rewardMessage = `Discovered ${rewardValue} Gems!`;
    } else if (rewardType === 'unit') {
      // Use gacha pool logic for QR unit reward
      const totalWeight = GACHA_POOL.reduce((sum, item) => sum + item.weight, 0);
      let roll = hashString(hash + "unit") % totalWeight;
      let selectedUnitId = GACHA_POOL[0].unitId;
      
      for (const item of GACHA_POOL) {
        if (roll < item.weight) {
          selectedUnitId = item.unitId;
          break;
        }
        roll -= item.weight;
      }
      
      rewardValue = selectedUnitId;
      rewardMessage = `Summoned a new unit: ${UNIT_DATABASE[selectedUnitId].name}!`;
    } else if (rewardType === 'equipment') {
      const equipKeys = Object.keys(EQUIPMENT_DATABASE);
      const selectedEquipId = equipKeys[hashString(hash + "equip") % equipKeys.length];
      rewardValue = selectedEquipId;
      rewardMessage = `Found equipment: ${EQUIPMENT_DATABASE[selectedEquipId].name}!`;
    }

    // Apply updates
    setState(prev => {
      const newState = { ...prev, qrState: {
        ...currentQrState,
        scansToday: currentQrState.scansToday + 1,
        scannedHashes: [...currentQrState.scannedHashes, hash]
      }};

      if (rewardType === 'zel') newState.zel += Number(rewardValue);
      if (rewardType === 'energy') newState.energy = Math.min(newState.maxEnergy, newState.energy + Number(rewardValue));
      if (rewardType === 'gems') newState.gems += Number(rewardValue);
      if (rewardType === 'unit') {
        newState.inventory = [...newState.inventory, {
          instanceId: `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          templateId: rewardValue as string,
          level: 1,
          exp: 0,
          equipment: { weapon: null, armor: null, accessory: null }
        }];
      }
      if (rewardType === 'equipment') {
        newState.equipmentInventory = [...newState.equipmentInventory, {
          instanceId: `eq_inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          templateId: rewardValue as string
        }];
      }

      return newState;
    });

    return { success: true, message: rewardMessage, rewardType, rewardValue };
  };

  const rollGacha = (): string => {
    // Get pity counters from current state
    const pity = state.summonPity || { star5Pulls: 0, star4Pulls: 0, lastStar5Pull: 0 };
    
    // Pity thresholds
    const STAR5_PITY_THRESHOLD = 50;
    const STAR4_PITY_THRESHOLD = 20;
    
    // Check for pitytriggered guaranteed
    const pity5Active = pity.star5Pulls >= STAR5_PITY_THRESHOLD;
    const pity4Active = pity.star4Pulls >= STAR4_PITY_THRESHOLD;
    
    // Determine if we get a guaranteed high rarity from pity
    let guaranteedRarity = 0;
    if (pity5Active) {
      guaranteedRarity = 5;
    } else if (pity4Active && Math.random() < 0.5) {
      guaranteedRarity = 4;
    }
    
    // Roll for rarity if not pity-triggered
    let rolledRarity: number;
    if (guaranteedRarity > 0) {
      rolledRarity = guaranteedRarity;
    } else {
      // Normal weighted roll: ★1=50%, ★2=30%, ★3=15%, ★4=4%, ★5=1%
      const roll = Math.random() * 100;
      if (roll < 1) rolledRarity = 5;
      else if (roll < 5) rolledRarity = 4;
      else if (roll < 20) rolledRarity = 3;
      else if (roll < 50) rolledRarity = 2;
      else rolledRarity = 1;
    }
    
    // Select unit by rarity from pool
    const rarityUnits = GACHA_POOL.filter(item => {
      const unit = UNIT_DATABASE[item.unitId];
      return unit && unit.rarity === rolledRarity;
    });
    
    if (rarityUnits.length === 0) {
      // Fallback to any 3+ star
      const fallback = GACHA_POOL.filter(item => UNIT_DATABASE[item.unitId]?.rarity >= 3);
      if (fallback.length > 0) {
        const idx = Math.floor(Math.random() * fallback.length);
        return fallback[idx].unitId;
      }
      return GACHA_POOL[0].unitId;
    }
    
    const idx = Math.floor(Math.random() * rarityUnits.length);
    return rarityUnits[idx].unitId;
  };

  const equipItem = (unitInstanceId: string, equipInstanceId: string, slot: EquipSlot) => {
    setState(prev => {
      // Unequip from anyone else who has it
      const newInventory = prev.inventory.map(u => {
        const newEquip = { ...u.equipment };
        if (u.equipment.weapon === equipInstanceId) newEquip.weapon = null;
        if (u.equipment.armor === equipInstanceId) newEquip.armor = null;
        if (u.equipment.accessory === equipInstanceId) newEquip.accessory = null;
        
        if (u.instanceId === unitInstanceId) {
          newEquip[slot] = equipInstanceId;
        }
        return { ...u, equipment: newEquip };
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

  const winBattle = (stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) return null;

    let leveledUpUnits: { name: string, oldLevel: number, newLevel: number }[] = [];
    let playerLeveledUp = false;
    let equipmentDropped: string[] = [];

    setState(prev => {
      const newState = { ...prev };
      newState.zel += stage.zelReward;
      newState.exp += stage.expReward;

      // Equipment drops
      if (stage.equipmentDrops && stage.equipmentDrops.length > 0) {
        const dropChance = stage.equipmentDropChance ?? 0.3;
        stage.equipmentDrops.forEach(dropId => {
          if (Math.random() < dropChance) {
            equipmentDropped.push(dropId);
            newState.equipmentInventory = [
              ...newState.equipmentInventory,
              { instanceId: `eq_inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`, templateId: dropId }
            ];
          }
        });
      }

      // Level up player if needed
      while (newState.exp >= getExpForLevel(newState.level)) {
        newState.exp -= getExpForLevel(newState.level);
        newState.level++;
        newState.maxEnergy += 2;
        newState.energy = newState.maxEnergy;
        playerLeveledUp = true;
      }

      // Add EXP to team units
      const newInventory = [...prev.inventory];
      prev.team.forEach(instanceId => {
        if (!instanceId) return;
        const unitIndex = newInventory.findIndex(u => u.instanceId === instanceId);
        if (unitIndex !== -1) {
          const unit = { ...newInventory[unitIndex] };
          const template = UNIT_DATABASE[unit.templateId];
          const oldLevel = unit.level;
          
          if (unit.level < template.maxLevel) {
            unit.exp += stage.expReward;
            while (unit.exp >= getExpForLevel(unit.level) && unit.level < template.maxLevel) {
              unit.exp -= getExpForLevel(unit.level);
              unit.level++;
            }
            if (unit.level === template.maxLevel) {
              unit.exp = 0;
            }
            newInventory[unitIndex] = unit;
            
            if (unit.level > oldLevel) {
              leveledUpUnits.push({ name: template.name, oldLevel, newLevel: unit.level });
            }
          }
        }
      });
      newState.inventory = newInventory;

      return newState;
    });

    return {
      zel: stage.zelReward,
      exp: stage.expReward,
      playerLeveledUp,
      leveledUpUnits,
      equipmentDropped
    };
  };

  const fuseUnits = (targetInstanceId: string, materialInstanceIds: string[]) => {
    let success = false;
    let expGained = 0;
    let leveledUp = false;
    let oldLevel = 0;
    let newLevel = 0;

    setState(prev => {
      const targetIndex = prev.inventory.findIndex(u => u.instanceId === targetInstanceId);
      if (targetIndex === -1) return prev;
      
      const targetUnit = prev.inventory[targetIndex];
      const targetTemplate = UNIT_DATABASE[targetUnit.templateId];
      
      if (targetUnit.level >= targetTemplate.maxLevel) return prev;

      const materials = prev.inventory.filter(u => materialInstanceIds.includes(u.instanceId));
      if (materials.length === 0) return prev;

      const cost = getFusionCost(targetUnit.level, materials.length);
      if (prev.zel < cost) return prev;

      // Calculate EXP
      materials.forEach(mat => {
        const matTemplate = UNIT_DATABASE[mat.templateId];
        let exp = getFusionExpGain(matTemplate.rarity, mat.level, matTemplate.element === targetTemplate.element);
        expGained += exp;
      });

      const newState = { ...prev };
      newState.zel -= cost;

      // Remove materials from inventory and team
      newState.inventory = newState.inventory.filter(u => !materialInstanceIds.includes(u.instanceId));
      newState.team = newState.team.map(id => materialInstanceIds.includes(id!) ? null : id);

      // Apply EXP to target
      const updatedTarget = { ...targetUnit };
      oldLevel = updatedTarget.level;
      updatedTarget.exp += expGained;

      while (updatedTarget.exp >= getExpForLevel(updatedTarget.level) && updatedTarget.level < targetTemplate.maxLevel) {
        updatedTarget.exp -= getExpForLevel(updatedTarget.level);
        updatedTarget.level++;
      }
      if (updatedTarget.level === targetTemplate.maxLevel) {
        updatedTarget.exp = 0;
      }
      
      newLevel = updatedTarget.level;
      if (newLevel > oldLevel) leveledUp = true;

      // Re-insert target unit
      const newTargetIndex = newState.inventory.findIndex(u => u.instanceId === targetInstanceId);
      if (newTargetIndex !== -1) {
        newState.inventory[newTargetIndex] = updatedTarget;
      }

      success = true;
      return newState;
    });

    return { success, expGained, leveledUp, oldLevel, newLevel, message: success ? 'Fusion complete!' : 'Fusion failed' };
  };

  const evolveUnit = (targetInstanceId: string, materialInstanceIds: string[]) => {
    let success = false;
    let newTemplateId = '';

    setState(prev => {
      const targetIndex = prev.inventory.findIndex(u => u.instanceId === targetInstanceId);
      if (targetIndex === -1) return prev;
      
      const targetUnit = prev.inventory[targetIndex];
      const targetTemplate = UNIT_DATABASE[targetUnit.templateId];
      
      if (targetUnit.level < targetTemplate.maxLevel) return prev;
      if (!targetTemplate.evolutionTarget || !targetTemplate.evolutionMaterials) return prev;

      const materials = prev.inventory.filter(u => materialInstanceIds.includes(u.instanceId));
      if (materials.length !== targetTemplate.evolutionMaterials.length) return prev;

      // Verify materials match required templates
      const requiredMats = [...targetTemplate.evolutionMaterials];
      const providedMats = materials.map(m => m.templateId);
      
      let matsMatch = true;
      for (const req of requiredMats) {
        const idx = providedMats.indexOf(req);
        if (idx !== -1) {
          providedMats.splice(idx, 1);
        } else {
          matsMatch = false;
          break;
        }
      }

      if (!matsMatch) return prev;

      // Evolution cost
      const cost = getEvolutionCost(targetTemplate.rarity);
      if (prev.zel < cost) return prev;

      const newState = { ...prev };
      newState.zel -= cost;

      // Remove materials
      newState.inventory = newState.inventory.filter(u => !materialInstanceIds.includes(u.instanceId));
      newState.team = newState.team.map(id => materialInstanceIds.includes(id!) ? null : id);

      // Evolve target
      const updatedTarget = { ...targetUnit };
      updatedTarget.templateId = targetTemplate.evolutionTarget;
      updatedTarget.level = 1;
      updatedTarget.exp = 0;
      newTemplateId = targetTemplate.evolutionTarget;

      const newTargetIndex = newState.inventory.findIndex(u => u.instanceId === targetInstanceId);
      if (newTargetIndex !== -1) {
        newState.inventory[newTargetIndex] = updatedTarget;
      }

      success = true;
      return newState;
    });

    return { success, newTemplateId, message: success ? 'Evolution complete!' : 'Evolution failed' };
  };

  return {
    state,
    isLoaded,
    timeToNextEnergy,
    updateState,
    addUnit,
    setTeamMember,
    spendGems,
    spendEnergy,
    processQrScan,
    rollGacha,
    equipItem,
    unequipItem,
    winBattle,
    fuseUnits,
    evolveUnit,
    unitTemplates: UNIT_DATABASE
  };
}
