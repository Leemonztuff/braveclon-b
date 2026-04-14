import { useState } from 'react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, ENEMIES, STAGES, getElementMultiplier } from '@/lib/gameData';
import { playSound } from '@/lib/audio';
import { BattleUnit } from '@/lib/battleTypes';
import { FloatingTextData } from '@/components/FloatingText';

export function useBattle(state: PlayerState, stageId: number, onEnd: (victory: boolean) => void) {
  const [playerUnits, setPlayerUnits] = useState<BattleUnit[]>(() => {
    return state.team
      .filter(id => id !== null)
      .map((instanceId, idx) => {
        const inst = state.inventory.find(u => u.instanceId === instanceId)!;
        const template = UNIT_DATABASE[inst.templateId];
        const stats = calculateStats(template, inst.level, inst.equipment, state.equipmentInventory);
        return {
          id: `p_${idx}`,
          template,
          isPlayer: true,
          hp: stats.hp,
          maxHp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          bbGauge: 0,
          maxBb: template.skill.cost,
          isDead: false,
          queuedBb: false,
          actionState: 'idle'
        };
      });
  });

  const [enemyUnits, setEnemyUnits] = useState<BattleUnit[]>(() => {
    const stageData = STAGES.find(s => s.id === stageId) || STAGES[0];
    return stageData.enemies.map((enemyId, idx) => {
      const template = ENEMIES.find(e => e.id === enemyId) || ENEMIES[0];
      return {
        id: `e_${idx}`,
        template,
        isPlayer: false,
        hp: template.baseStats.hp,
        maxHp: template.baseStats.hp,
        atk: template.baseStats.atk,
        def: template.baseStats.def,
        bbGauge: 0,
        maxBb: 100,
        isDead: false,
        queuedBb: false,
        actionState: 'idle'
      };
    });
  });

  const [turnState, setTurnState] = useState<'player_input' | 'player_executing' | 'enemy_executing' | 'victory' | 'defeat'>('player_input');
  const [combatLog, setCombatLog] = useState<string[]>(['Battle Started!']);
  const [bbFlash, setBbFlash] = useState(false);
  const [bbCutInUnit, setBbCutInUnit] = useState<BattleUnit | null>(null);
  const [bbHitEffect, setBbHitEffect] = useState<{ targetId: string, element: string } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);

  const [inventoryItems, setInventoryItems] = useState([
    { id: 'cure', name: 'Cure', count: 10, icon: '🧪', type: 'heal', value: 1000 },
    { id: 'high_cure', name: 'High Cure', count: 5, icon: '🧪', type: 'heal', value: 2500 },
    { id: 'divine_light', name: 'Divine Light', count: 3, icon: '✨', type: 'heal_all', value: 2000 },
    { id: 'fujin', name: 'Fujin Potion', count: 2, icon: '⚡', type: 'bb_fill', value: 100 },
    { id: 'revive', name: 'Revive', count: 1, icon: '👼', type: 'revive', value: 0.5 },
  ]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setCombatLog(prev => [...prev.slice(-4), msg]);
  };

  const addFloatingText = (text: string, type: FloatingTextData['type'], targetId: string, isPlayer: boolean) => {
    const isLeft = isPlayer;
    const idx = parseInt(targetId.split('_')[1]);
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    
    // Use percentages for better responsive positioning
    const baseX = isLeft ? 15 + (col * 15) : 70 + (col * 15);
    const baseY = 40 + (row * 15);
    
    // Add some randomness
    const x = `calc(${baseX}% + ${Math.random() * 20 - 10}px)`;
    const y = `calc(${baseY}% + ${Math.random() * 20 - 10}px)`;

    const id = Math.random().toString(36).substr(2, 9);
    setFloatingTexts(prev => [...prev, { id, text, type, x, y }]);
    
    // Remove after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1000);
  };

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  const applyItem = (itemId: string, targetId: string) => {
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
          return { ...u, isDead: false, hp: u.maxHp * item.value, bbGauge: 0, actionState: 'idle' };
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
  };

  const toggleBb = (id: string) => {
    setPlayerUnits(prev => prev.map(u => {
      if (u.id === id && u.bbGauge >= u.maxBb && !u.isDead) {
        return { ...u, queuedBb: !u.queuedBb };
      }
      return u;
    }));
  };

  const handleUnitClick = (id: string) => {
    if (turnState !== 'player_input') return;

    if (selectedItem) {
      applyItem(selectedItem, id);
      setSelectedItem(null);
    } else {
      toggleBb(id);
    }
  };

  const executeTurn = async () => {
    if (turnState !== 'player_input') return;
    setTurnState('player_executing');
    
    let currentEnemies = [...enemyUnits];
    let currentPlayer = [...playerUnits];

    // Player attacks
    for (let i = 0; i < currentPlayer.length; i++) {
      const attacker = currentPlayer[i];
      if (attacker.isDead) continue;

      // Find alive enemy
      const targetIdx = currentEnemies.findIndex(e => !e.isDead);
      if (targetIdx === -1) break; // All enemies dead
      const target = currentEnemies[targetIdx];

      // Calculate damage
      const isBb = attacker.queuedBb;
      const powerMultiplier = isBb ? attacker.template.skill.power : 1.0;
      const elementMultiplier = getElementMultiplier(attacker.template.element, target.template.element);
      const isWeakness = elementMultiplier > 1.0;
      
      let rawDamage = Math.max(1, (attacker.atk * powerMultiplier) - (target.def * 0.5));
      let finalDamage = Math.floor(rawDamage * elementMultiplier);

      // ANIMATION: Attacker moves
      currentPlayer[i] = { ...attacker, actionState: isBb ? 'skill' : 'attacking' };
      setPlayerUnits([...currentPlayer]);
      
      if (isBb) {
        setBbCutInUnit(attacker);
        playSound('bb_cast');
        await new Promise(r => setTimeout(r, 1500)); // Wait for cut-in
        setBbCutInUnit(null);
        setBbFlash(true);
        triggerScreenShake();
        setTimeout(() => setBbFlash(false), 150);
        await new Promise(r => setTimeout(r, 200));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }

      // Apply damage & ANIMATION: Target hurt
      currentEnemies[targetIdx] = {
        ...target,
        hp: Math.max(0, target.hp - finalDamage),
        isDead: target.hp - finalDamage <= 0,
        actionState: isBb ? 'bb_hurt' : 'hurt',
        isWeaknessHit: isWeakness
      };
      setEnemyUnits([...currentEnemies]);

      if (isBb) {
        setBbHitEffect({ targetId: target.id, element: attacker.template.element });
        playSound('bb_hit');
        if (isWeakness) setTimeout(() => playSound('weakness'), 100);
        setTimeout(() => setBbHitEffect(null), 800);
      } else {
        if (isWeakness) {
          playSound('weakness');
          triggerScreenShake();
        } else {
          playSound('hit');
        }
      }

      addFloatingText(finalDamage.toString(), 'damage', target.id, false);
      if (isWeakness) {
        setTimeout(() => addFloatingText('WEAK', 'weak', target.id, false), 100);
      }

      addLog(`${attacker.template.name} ${isBb ? 'uses BB!' : 'attacks'} ${target.template.name} for ${finalDamage} dmg! ${isWeakness ? '(Weakness!)' : ''}`);
      
      await new Promise(r => setTimeout(r, 400));

      // Reset states and BC Distribution
      const bcDrops = isBb ? 0 : Math.floor(Math.random() * 5) + 3; // 3-7 BC dropped by enemy
      
      if (bcDrops > 0) {
        addFloatingText(`+${bcDrops} BC`, 'bc', target.id, false);
        const alivePlayers = currentPlayer.filter(p => !p.isDead);
        if (alivePlayers.length > 0) {
          for (let b = 0; b < bcDrops; b++) {
            const rp = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            const pIdx = currentPlayer.findIndex(p => p.id === rp.id);
            if (currentPlayer[pIdx].bbGauge < currentPlayer[pIdx].maxBb) {
              currentPlayer[pIdx].bbGauge += 1;
              if (currentPlayer[pIdx].bbGauge === currentPlayer[pIdx].maxBb) {
                playSound('bb_ready');
              }
            }
          }
        }
      }

      currentPlayer[i] = {
        ...currentPlayer[i],
        queuedBb: false,
        bbGauge: isBb ? 0 : currentPlayer[i].bbGauge, // Only reset if BB was used, otherwise keep accumulated BC
        actionState: 'idle'
      };
      currentEnemies[targetIdx] = {
        ...currentEnemies[targetIdx],
        actionState: currentEnemies[targetIdx].isDead ? 'dead' : 'idle',
        isWeaknessHit: false
      };
      setPlayerUnits([...currentPlayer]);
      setEnemyUnits([...currentEnemies]);
      
      // Small delay between attacks
      await new Promise(r => setTimeout(r, 100));
    }

    // Check win condition
    if (currentEnemies.every(e => e.isDead)) {
      setTurnState('victory');
      addLog("Victory!");
      setTimeout(() => onEnd(true), 2000);
      return;
    }

    setTurnState('enemy_executing');

    // Enemy attacks
    for (let i = 0; i < currentEnemies.length; i++) {
      const attacker = currentEnemies[i];
      if (attacker.isDead) continue;

      // Find alive player
      const targetIdx = currentPlayer.findIndex(p => !p.isDead);
      if (targetIdx === -1) break; // All players dead
      const target = currentPlayer[targetIdx];

      const elementMultiplier = getElementMultiplier(attacker.template.element, target.template.element);
      const isWeakness = elementMultiplier > 1.0;
      let rawDamage = Math.max(1, attacker.atk - (target.def * 0.5));
      let finalDamage = Math.floor(rawDamage * elementMultiplier);

      // ANIMATION: Attacker moves
      currentEnemies[i] = { ...attacker, actionState: 'attacking' };
      setEnemyUnits([...currentEnemies]);
      await new Promise(r => setTimeout(r, 200));

      // Apply damage & ANIMATION: Target hurt
      const bcGenerated = Math.floor(Math.random() * 3) + 1; // 1-3 BC generated on hit
      
      if (currentPlayer[targetIdx].bbGauge < currentPlayer[targetIdx].maxBb) {
        currentPlayer[targetIdx].bbGauge = Math.min(currentPlayer[targetIdx].maxBb, currentPlayer[targetIdx].bbGauge + bcGenerated);
        if (currentPlayer[targetIdx].bbGauge === currentPlayer[targetIdx].maxBb) {
          playSound('bb_ready');
        }
      }

      currentPlayer[targetIdx] = {
        ...currentPlayer[targetIdx],
        hp: Math.max(0, target.hp - finalDamage),
        isDead: target.hp - finalDamage <= 0,
        actionState: 'hurt',
        isWeaknessHit: isWeakness
      };
      setPlayerUnits([...currentPlayer]);

      if (isWeakness) {
        playSound('weakness');
        triggerScreenShake();
      } else {
        playSound('hit');
      }

      addFloatingText(finalDamage.toString(), 'damage', target.id, true);
      if (isWeakness) {
        setTimeout(() => addFloatingText('WEAK', 'weak', target.id, true), 100);
      }

      addLog(`${attacker.template.name} attacks ${target.template.name} for ${finalDamage} dmg! ${isWeakness ? '(Weakness!)' : ''}`);
      
      await new Promise(r => setTimeout(r, 400));

      // Reset states
      currentEnemies[i] = {
        ...currentEnemies[i],
        actionState: 'idle'
      };
      currentPlayer[targetIdx] = {
        ...currentPlayer[targetIdx],
        actionState: currentPlayer[targetIdx].isDead ? 'dead' : 'idle',
        isWeaknessHit: false
      };
      setEnemyUnits([...currentEnemies]);
      setPlayerUnits([...currentPlayer]);

      await new Promise(r => setTimeout(r, 100));
    }

    // Check lose condition
    if (currentPlayer.every(p => p.isDead)) {
      setTurnState('defeat');
      addLog("Defeat...");
      setTimeout(() => onEnd(false), 2000);
      return;
    }

    setTurnState('player_input');
  };

  return {
    playerUnits,
    enemyUnits,
    turnState,
    combatLog,
    bbFlash,
    bbCutInUnit,
    bbHitEffect,
    inventoryItems,
    selectedItem,
    setSelectedItem,
    handleUnitClick,
    executeTurn,
    screenShake,
    floatingTexts
  };
}
