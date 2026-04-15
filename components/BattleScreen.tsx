import { useState, useEffect } from 'react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, ENEMIES, STAGES, getElementMultiplier, ELEMENT_ICONS } from '@/lib/gameData';
import { BattleUnit } from '@/lib/battleTypes';
import { playSound } from '@/lib/audio';
import { UnitSprite } from './UnitSprite';
import { motion, AnimatePresence } from 'motion/react';
import { BBCutIn } from './BBCutIn';
import { UnitStatusBox } from './UnitStatusBox';
import { StatBar } from './ui/StatBar';

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const [turnCount, setTurnCount] = useState(1);
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
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const totalBB = playerUnits.reduce((sum, u) => sum + u.bbGauge, 0);
  const totalMaxBB = playerUnits.reduce((sum, u) => sum + u.maxBb, 0);

  const addLog = (msg: string) => {
    setCombatLog(prev => [...prev.slice(-4), msg]);
  };

  const toggleBb = (id: string) => {
    if (turnState !== 'player_input') return;
    setPlayerUnits(prev => prev.map(u => {
      if (u.id === id && u.bbGauge >= u.maxBb && !u.isDead) {
        return { ...u, queuedBb: !u.queuedBb };
      }
      return u;
    }));
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

      const targetIdx = currentEnemies.findIndex(e => !e.isDead);
      if (targetIdx === -1) break;
      const target = currentEnemies[targetIdx];

      const isBb = attacker.queuedBb;
      const powerMultiplier = isBb ? attacker.template.skill.power : 1.0;
      const elementMultiplier = getElementMultiplier(attacker.template.element, target.template.element);
      const isWeakness = elementMultiplier > 1.0;
      
      let rawDamage = Math.max(1, (attacker.atk * powerMultiplier) - (target.def * 0.5));
      let finalDamage = Math.floor(rawDamage * elementMultiplier);

      currentPlayer[i] = { ...attacker, actionState: isBb ? 'skill' : 'attacking' };
      setPlayerUnits([...currentPlayer]);
      
      if (isBb) {
        setBbCutInUnit(attacker);
        playSound('bb_cast');
        await new Promise(r => setTimeout(r, 1500));
        setBbCutInUnit(null);
        setBbFlash(true);
        setTimeout(() => setBbFlash(false), 150);
        await new Promise(r => setTimeout(r, 200));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }

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
        } else {
          playSound('hit');
        }
      }

      addLog(`${attacker.template.name} ${isBb ? 'uses BB!' : 'attacks'} ${target.template.name} for ${finalDamage} dmg! ${isWeakness ? '(Weakness!)' : ''}`);
      
      await new Promise(r => setTimeout(r, 400));

      currentPlayer[i] = {
        ...currentPlayer[i],
        queuedBb: false,
        bbGauge: isBb ? 0 : Math.min(attacker.maxBb, attacker.bbGauge + 5),
        actionState: 'idle'
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

    if (currentEnemies.every(e => e.isDead)) {
      setTurnState('victory');
      addLog("Victory!");
      setTimeout(() => onEnd(true), 2000);
      return;
    }

    setTurnState('enemy_executing');

    for (let i = 0; i < currentEnemies.length; i++) {
      const attacker = currentEnemies[i];
      if (attacker.isDead) continue;

      const targetIdx = currentPlayer.findIndex(p => !p.isDead);
      if (targetIdx === -1) break;
      const target = currentPlayer[targetIdx];

      const elementMultiplier = getElementMultiplier(attacker.template.element, target.template.element);
      const isWeakness = elementMultiplier > 1.0;
      let rawDamage = Math.max(1, attacker.atk - (target.def * 0.5));
      let finalDamage = Math.floor(rawDamage * elementMultiplier);

      currentEnemies[i] = { ...attacker, actionState: 'attacking' };
      setEnemyUnits([...currentEnemies]);
      await new Promise(r => setTimeout(r, 200));

      currentPlayer[targetIdx] = {
        ...target,
        hp: Math.max(0, target.hp - finalDamage),
        isDead: target.hp - finalDamage <= 0,
        bbGauge: Math.min(target.maxBb, target.bbGauge + 2),
        actionState: 'hurt',
        isWeaknessHit: isWeakness
      };
      setPlayerUnits([...currentPlayer]);

      if (isWeakness) {
        playSound('weakness');
      } else {
        playSound('hit');
      }
      addLog(`${attacker.template.name} attacks ${target.template.name} for ${finalDamage} dmg! ${isWeakness ? '(Weakness!)' : ''}`);
      
      await new Promise(r => setTimeout(r, 400));

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

    if (currentPlayer.every(p => p.isDead)) {
      setTurnState('defeat');
      addLog("Defeat...");
      setTimeout(() => onEnd(false), 2000);
      return;
    }

    setTurnCount(prev => prev + 1);
    setTurnState('player_input');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]" />

      {/* Top HUD - Estilo BF2 */}
      <div className="relative z-20 h-12 shrink-0 bg-gradient-to-b from-[#4a78a6] to-[#2b4c7e] border-b-2 border-[#b89947] flex items-center px-3 justify-between text-xs font-bold text-white shadow-md">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-base drop-shadow-md">💰</span> 
            <span className="drop-shadow-md tabular-nums text-white">{state.zel.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400 text-base drop-shadow-md">💎</span> 
            <span className="drop-shadow-md text-white">{state.gems}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded">
            <span className="text-zinc-300 text-[10px] font-bold">TURN</span>
            <span className="text-white font-black tabular-nums text-sm">{turnCount}</span>
          </div>
          <div className={`font-black tracking-widest text-[11px] px-2 py-0.5 rounded ${
            turnState === 'player_input' ? 'bg-green-600 text-white' :
            turnState === 'player_executing' ? 'bg-yellow-600 text-white' :
            turnState === 'enemy_executing' ? 'bg-red-600 text-white' :
            turnState === 'victory' ? 'bg-yellow-500 text-black' :
            'bg-red-800 text-white'
          }`}>
            {turnState === 'player_input' ? 'YOUR TURN' :
             turnState === 'player_executing' ? 'ATTACKING...' :
             turnState === 'enemy_executing' ? 'ENEMY TURN' :
             turnState === 'victory' ? 'VICTORY!' :
             'DEFEAT'}
          </div>
        </div>

        <button className="bg-gradient-to-b from-[#2b4c7e] to-[#1a2e4c] border border-[#b89947] px-3 py-1 rounded shadow-inner text-[10px] uppercase tracking-wider drop-shadow-md text-white hover:brightness-110">
          MENU
        </button>
      </div>

      {/* BB Cut-in Overlay */}
      <AnimatePresence>
        {bbCutInUnit && <BBCutIn unit={bbCutInUnit} />}
      </AnimatePresence>

      <AnimatePresence>
        {bbFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/30 z-[60] pointer-events-none mix-blend-screen"
          />
        )}
      </AnimatePresence>

      {/* Combat Log */}
      <div className="relative z-10 px-2 py-1">
        <div className="bg-black/50 p-1.5 rounded text-[10px] font-mono max-h-16 overflow-hidden">
          {combatLog.map((log, i) => (
            <div key={i} className="text-zinc-300 truncate">{log}</div>
          ))}
        </div>
      </div>

      {/* Battle Area */}
      <div className="flex-1 relative z-10 flex flex-col justify-between py-2 px-2">
        
        {/* Enemies - Top Area */}
        <div className="flex justify-center gap-2 flex-wrap max-w-[320px] mx-auto">
          {enemyUnits.map(unit => (
            <div key={unit.id} className="flex flex-col items-center">
              <UnitSprite 
                unit={unit} 
                hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
              />
              {/* Enemy HP Bar */}
              <div className="w-14 h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-700">
                <div 
                  className={`h-full transition-all ${unit.hp / unit.maxHp > 0.5 ? 'bg-green-500' : unit.hp / unit.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* VS Text */}
        <div className="text-center py-1">
          <span className="text-2xl font-black text-white/20 tracking-widest">VS</span>
        </div>

        {/* Players - Bottom Area */}
        <div className="flex justify-center flex-wrap gap-x-2 gap-y-2 mt-auto max-w-[360px] mx-auto">
          {playerUnits.map((unit) => (
            <div key={unit.id} className="flex flex-col items-center">
              <UnitSprite 
                unit={unit} 
                onClick={() => toggleBb(unit.id)} 
                interactive={turnState === 'player_input'}
                hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
              />
              {/* Player Mini HP/BB Bar */}
              <div className="w-14 mt-1 space-y-0.5">
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className={`h-full transition-all ${unit.hp / unit.maxHp > 0.5 ? 'bg-green-500' : unit.hp / unit.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                  />
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                    style={{ width: `${(unit.bbGauge / unit.maxBb) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Panel - Unit Status Grid + BB Total + Action */}
      <div className="relative z-20 bg-gradient-to-b from-[#1e3a5f] to-[#0d1b2a] border-t-2 border-[#b89947] flex flex-col">
        
        {/* Unit Status Grid - 6 slots BF2 style */}
        <div className="grid grid-cols-6 gap-1 p-1">
          {Array.from({ length: 6 }).map((_, idx) => {
            const unit = playerUnits[idx];
            return (
              <UnitStatusBox 
                key={idx} 
                unit={unit} 
                onClick={() => unit && toggleBb(unit.id)}
                interactive={turnState === 'player_input'} 
              />
            );
          })}
        </div>

        {/* BB Gauge Total + Action Button */}
        <div className="flex items-center gap-2 px-2 pb-2">
          {/* Total BB Gauge */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 font-bold">BB GAUGE</span>
              <span className="text-cyan-400 font-bold">{totalBB}/{totalMaxBB}</span>
            </div>
            <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 transition-all relative"
                style={{ width: `${Math.min(100, (totalBB / totalMaxBB) * 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-24 shrink-0">
            {turnState === 'player_input' ? (
              <button 
                onClick={executeTurn}
                className="w-full h-12 bg-gradient-to-b from-[#2563eb] to-[#1e40af] border-2 border-[#60a5fa] rounded-lg font-black text-sm text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] active:scale-95 transition-transform tracking-widest"
              >
                FIGHT
              </button>
            ) : turnState === 'victory' ? (
              <div className="w-full h-12 bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-200 text-black flex items-center justify-center rounded-lg font-black text-xs shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                STAGE CLEARED!
              </div>
            ) : turnState === 'defeat' ? (
              <div className="w-full h-12 bg-gradient-to-b from-red-600 to-red-900 border-2 border-red-400 text-white flex items-center justify-center rounded-lg font-black text-xs shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                GAME OVER
              </div>
            ) : (
              <div className="w-full h-12 bg-zinc-800 border-2 border-zinc-600 text-zinc-400 flex items-center justify-center rounded-lg font-bold text-[10px]">
                EXECUTING...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
