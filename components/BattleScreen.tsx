import { useState, useEffect, useCallback } from 'react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, ENEMIES, STAGES, getElementMultiplier, ELEMENT_ICONS, Element, LeaderSkill } from '@/lib/gameData';
import { BattleUnit } from '@/lib/battleTypes';
import { playSound } from '@/lib/audio';
import { UnitSprite } from './UnitSprite';
import { motion, AnimatePresence } from 'motion/react';
import { BBCutIn } from './BBCutIn';
import { UnitStatusBox } from './UnitStatusBox';

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}

// Calcular daño con fórmula BF2 mejorada
function calculateDamage(
  attacker: BattleUnit, 
  target: BattleUnit, 
  isBb: boolean,
  leaderSkill?: LeaderSkill
): { damage: number; isWeakness: boolean; elementalBonus: number } {
  const basePower = isBb ? attacker.template.skill.power : 1.0;
  const elementMultiplier = getElementMultiplier(attacker.template.element as Element, target.template.element as Element);
  const isWeakness = elementMultiplier > 1.0;
  
  // Fórmula de daño BF2: (ATK * Power - DEF * 0.5) * Elemental
  let rawDamage = Math.max(1, (attacker.atk * basePower) - (target.def * 0.5));
  let finalDamage = Math.floor(rawDamage * elementMultiplier);
  
  // Aplicar leader skill bonus
  let elementalBonus = 0;
  if (leaderSkill?.elementBoost) {
    const boost = leaderSkill.elementBoost[attacker.template.element as Element] || 0;
    elementalBonus = Math.floor(finalDamage * boost);
    finalDamage += elementalBonus;
  }
  
  // Bonus de leader skill de stat
  if (leaderSkill?.statBoost?.atk) {
    finalDamage = Math.floor(finalDamage * (1 + leaderSkill.statBoost.atk));
  }
  
  return { damage: finalDamage, isWeakness, elementalBonus };
}

// Obtener líder del equipo
function getLeader(units: BattleUnit[]): BattleUnit | undefined {
  return units.find(u => u.isPlayer && !u.isDead);
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const [turnCount, setTurnCount] = useState(1);
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null);
  
  // Inicializar unidades del jugador desde el equipo
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

  // Inicializar enemigos del stage
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
  const [floatingDamages, setFloatingDamages] = useState<Array<{ id: string; targetId: string; value: number; left: string; top: string; element: string; isCrit: boolean }>>([]);
  const [combatCrystals, setCombatCrystals] = useState<Array<{ id: string; type: 'BC' | 'HC'; left: string; top: string; element: string }>>([]);
  const [autoBattle, setAutoBattle] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState<'x1' | 'x2'>('x1');

  const totalBB = playerUnits.reduce((sum, u) => sum + u.bbGauge, 0);
  const totalMaxBB = playerUnits.reduce((sum, u) => sum + u.maxBb, 0);
  const overdrivePercent = totalMaxBB ? Math.min(100, Math.floor((totalBB / totalMaxBB) * 100)) : 0;

  // Obtener leader skill del líder
  const leader = getLeader(playerUnits);
  const leaderSkill = leader?.template.leaderSkill;

  const elementColorClass: Record<Element, string> = {
    Fire: 'bg-red-500',
    Water: 'bg-blue-500',
    Earth: 'bg-emerald-500',
    Thunder: 'bg-yellow-400',
    Light: 'bg-amber-200',
    Dark: 'bg-violet-500'
  };

  const speedFactor = battleSpeed === 'x2' ? 0.65 : 1;
  const wait = useCallback((ms: number) => new Promise<void>(resolve => setTimeout(resolve, Math.max(30, ms * speedFactor))), [speedFactor]);

  const getTargetPosition = useCallback((targetId: string, isEnemy: boolean) => {
    const list = isEnemy ? enemyUnits : playerUnits;
    const idx = list.findIndex(u => u.id === targetId);
    // Side-scroller: Enemies on RIGHT (75-88%), Players on LEFT (12-25%)
    // Damage numbers appear in center-right area near enemies
    const baseLeft = idx === -1 ? 75 : Math.max(70, 88 - idx * 10);
    const top = 35 + (idx * 15); // Stack vertically like units
    return { left: `${baseLeft}%`, top: `${top}%` };
  }, [enemyUnits, playerUnits]);

  const spawnDamageNumber = useCallback((targetId: string, value: number, isCrit: boolean, element: string, isEnemy: boolean) => {
    const position = getTargetPosition(targetId, isEnemy);
    const id = `${targetId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setFloatingDamages(prev => [...prev.slice(-4), { id, targetId, value, left: position.left, top: position.top, element, isCrit }]);
    window.setTimeout(() => {
      setFloatingDamages(prev => prev.filter(item => item.id !== id));
    }, 900);
  }, [getTargetPosition]);

  const spawnCrystal = useCallback((type: 'BC' | 'HC', element: string) => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    // Side-scroller: crystals spawn in center area (between players and enemies)
    const left = `${40 + Math.random() * 30}%`;
    const top = `${25 + Math.random() * 40}%`;
    setCombatCrystals(prev => [...prev.slice(-6), { id, type, left, top, element }]);
    window.setTimeout(() => {
      setCombatCrystals(prev => prev.filter(item => item.id !== id));
    }, 900);
  }, []);

  const addLog = useCallback((msg: string) => {
    setCombatLog(prev => [...prev.slice(-4), msg]);
  }, []);

  // Toggle BB para una unidad
  const toggleBb = useCallback((id: string) => {
    if (turnState !== 'player_input') return;
    setPlayerUnits(prev => prev.map(u => {
      if (u.id === id && u.bbGauge >= u.maxBb && !u.isDead) {
        return { ...u, queuedBb: !u.queuedBb };
      }
      return u;
    }));
  }, [turnState]);

  // Seleccionar enemigo como target
  const selectEnemyTarget = useCallback((id: string) => {
    if (turnState !== 'player_input') return;
    setSelectedEnemy(prev => prev === id ? null : id);
  }, [turnState]);

  // Ejecutar turno completo
  const executeTurn = useCallback(async () => {
    if (turnState !== 'player_input') return;
    setTurnState('player_executing');
    
    let currentEnemies = [...enemyUnits];
    let currentPlayer = [...playerUnits];
    let targetingEnemy = selectedEnemy; // Usar enemigo seleccionado o el primero vivo

    // ═══════════════════════════════════════════════════════════════
    // FASE 1: ATAQUES DEL JUGADOR
    // ═══════════════════════════════════════════════════════════════
    for (let i = 0; i < currentPlayer.length; i++) {
      const attacker = currentPlayer[i];
      if (attacker.isDead) continue;

      // Determinar objetivo
      let targetIdx: number;
      if (targetingEnemy) {
        targetIdx = currentEnemies.findIndex(e => e.id === targetingEnemy && !e.isDead);
        if (targetIdx === -1) targetIdx = currentEnemies.findIndex(e => !e.isDead);
      } else {
        targetIdx = currentEnemies.findIndex(e => !e.isDead);
      }
      
      if (targetIdx === -1) break; // Todos muertos
      const target = currentEnemies[targetIdx];

      const isBb = attacker.queuedBb;
      
      // Calcular daño con leader skill
      const { damage, isWeakness, elementalBonus } = calculateDamage(
        attacker, target, isBb, leaderSkill
      );

      // Animación: atacante se mueve
      currentPlayer[i] = { ...attacker, actionState: isBb ? 'skill' : 'attacking' };
      setPlayerUnits([...currentPlayer]);
      
      // Cut-in para BB
      if (isBb) {
        setBbCutInUnit(attacker);
        playSound('bb_cast');
        await wait(1400);
        setBbCutInUnit(null);
        setBbFlash(true);
        window.setTimeout(() => setBbFlash(false), 150);
        await wait(180);
      } else {
        await wait(220);
      }

      // Aplicar daño
      const newTargetHp = Math.max(0, target.hp - damage);
      currentEnemies[targetIdx] = {
        ...target,
        hp: newTargetHp,
        isDead: newTargetHp <= 0,
        actionState: isBb ? 'bb_hurt' : 'hurt',
        isWeaknessHit: isWeakness
      };
      setEnemyUnits([...currentEnemies]);
      spawnDamageNumber(target.id, damage, isWeakness, attacker.template.element, true);
      if (!isBb) {
        spawnCrystal('BC', attacker.template.element);
      }

      // Efectos visuales y sonido
      if (isBb) {
        setBbHitEffect({ targetId: target.id, element: attacker.template.element });
        playSound('bb_hit');
        if (isWeakness) window.setTimeout(() => playSound('weakness'), 100);
        window.setTimeout(() => setBbHitEffect(null), 800);
      } else {
        if (isWeakness) playSound('weakness');
        else playSound('hit');
      }

      // Log
      let logMsg = `${attacker.template.name} ${isBb ? 'uses ' + attacker.template.skill.name + '!' : 'attacks'} ${target.template.name} for ${damage} damage!`;
      if (isWeakness) logMsg += ' (Weakness!)';
      if (elementalBonus > 0) logMsg += ` (+${elementalBonus} leader bonus!)`;
      addLog(logMsg);
      
      await wait(380);

      // Reset y BB gauge gain
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
      
      await wait(100);
    }

    // Verificar Victoria
    if (currentEnemies.every(e => e.isDead)) {
      setTurnState('victory');
      addLog("VICTORY! Stage cleared!");
      playSound('victory');
      setTimeout(() => onEnd(true), 2500);
      return;
    }

    // ═══════════════════════════════════════════════════════════════
    // FASE 2: ATAQUES DEL ENEMIGO
    // ═══════════════════════════════════════════════════════════════
    setTurnState('enemy_executing');
    
    for (let i = 0; i < currentEnemies.length; i++) {
      const attacker = currentEnemies[i];
      if (attacker.isDead) continue;

      const targetIdx = currentPlayer.findIndex(p => !p.isDead);
      if (targetIdx === -1) break;
      const target = currentPlayer[targetIdx];

      const { damage, isWeakness } = calculateDamage(attacker, target, false);

      // Animación enemigo
      currentEnemies[i] = { ...attacker, actionState: 'attacking' };
      setEnemyUnits([...currentEnemies]);
      await wait(220);

      // Daño al jugador
      const newTargetHp = Math.max(0, target.hp - damage);
      currentPlayer[targetIdx] = {
        ...target,
        hp: newTargetHp,
        isDead: newTargetHp <= 0,
        bbGauge: Math.min(target.maxBb, target.bbGauge + 2), // BB gauge por recibir daño
        actionState: 'hurt',
        isWeaknessHit: isWeakness
      };
      setPlayerUnits([...currentPlayer]);
      spawnDamageNumber(target.id, damage, isWeakness, attacker.template.element, false);
      spawnCrystal('BC', attacker.template.element);

      if (isWeakness) playSound('weakness');
      else playSound('hit');
      
      addLog(`${attacker.template.name} attacks ${target.template.name} for ${damage} damage!${isWeakness ? ' (Weakness!)' : ''}`);
      await wait(360);

      // Reset estados
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

    // Verificar Derrota
    if (currentPlayer.every(p => p.isDead)) {
      setTurnState('defeat');
      addLog("DEFEAT! Your party has fallen...");
      setTimeout(() => onEnd(false), 2500);
      return;
    }

    // Siguiente turno
    setTurnCount(prev => prev + 1);
    setSelectedEnemy(null);
    setTurnState('player_input');
  }, [turnState, enemyUnits, playerUnits, selectedEnemy, leaderSkill, addLog, onEnd, wait, spawnCrystal, spawnDamageNumber]);

  useEffect(() => {
    if (!autoBattle || turnState !== 'player_input') return;
    const timer = window.setTimeout(() => {
      executeTurn();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoBattle, turnState, executeTurn]);

  const totalHp = playerUnits.reduce((sum, u) => sum + u.hp, 0);
  const totalMaxHp = playerUnits.reduce((sum, u) => sum + u.maxHp, 0);
  const stageData = STAGES.find(s => s.id === stageId) || STAGES[0];
  const enemyBossName = enemyUnits[0]?.template.name || stageData.name;
  const bossHp = enemyUnits.reduce((sum, u) => sum + u.hp, 0);
  const bossMaxHp = enemyUnits.reduce((sum, u) => sum + u.maxHp, 0);
  const bossHpPercent = bossMaxHp ? Math.max(0, Math.min(100, Math.round((bossHp / bossMaxHp) * 100))) : 0;
  const battleItems = [
    { id: 'cure', name: 'Cure', icon: '⚗️', count: 10 },
    { id: 'crescent', name: 'Crescent Dew', icon: '🌙', count: 2 },
    { id: 'stimulant', name: 'Stimulant', icon: '🔥', count: 10 },
    { id: 'holy', name: 'Holy Water', icon: '✨', count: 10 },
    { id: 'revive', name: 'Revive', icon: '⚕️', count: 1 },
  ];

  const playerSlots = Array.from({ length: 6 }, (_, idx) => playerUnits[idx] || null);

  return (
    <div className="flex flex-col h-full bg-[#080b13] relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,146,255,0.15),transparent_38%),linear-gradient(180deg,#121c32_0%,#05070e_100%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle,_rgba(137,199,255,0.12),transparent_35%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(16,38,66,0.85)_0%,rgba(9,10,19,0.02)_60%)] pointer-events-none" />

      <div className="relative z-20 h-12 shrink-0 bg-gradient-to-b from-[#2d4f7d] to-[#15203b] border-b border-white/10 flex items-center px-3 justify-between text-xs font-bold text-white shadow-xl shadow-slate-950/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-yellow-300">
            <span>💰</span>
            <span className="tabular-nums">{state.zel.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-sky-300">
            <span>💎</span>
            <span>{state.gems}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black/30 px-2 py-1 text-[10px] tracking-[0.2em] uppercase text-white/80">
            Turn {turnCount}
          </div>
          <div className={`rounded-xl px-2 py-1 text-[10px] font-bold tracking-[0.22em] ${
            turnState === 'player_input' ? 'bg-emerald-500/20 text-emerald-200' :
            turnState === 'player_executing' ? 'bg-amber-500/20 text-amber-200' :
            turnState === 'enemy_executing' ? 'bg-rose-500/20 text-rose-200' :
            turnState === 'victory' ? 'bg-yellow-500/20 text-yellow-200' :
            'bg-red-500/20 text-red-200'
          }`}>
            {turnState === 'player_input' ? 'YOUR TURN' :
             turnState === 'player_executing' ? 'ATTACKING' :
             turnState === 'enemy_executing' ? 'ENEMY TURN' :
             turnState === 'victory' ? 'VICTORY' :
             'DEFEAT'}
          </div>
        </div>

        <button className="rounded-xl bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-200 border border-white/10 shadow-inner hover:bg-slate-800">
          MENU
        </button>
      </div>

      <AnimatePresence>
        {bbCutInUnit && <BBCutIn unit={bbCutInUnit} />}
      </AnimatePresence>

      <AnimatePresence>
        {bbFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/25 z-[60] pointer-events-none mix-blend-screen"
          />
        )}
      </AnimatePresence>

      <div className="relative z-20 px-3 py-2">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-slate-200 flex items-center gap-2 border border-white/10">
                <span className="text-sky-300">⚔️</span>
                <span>x{state.zel.toLocaleString().padStart(3, '0')}</span>
              </div>
              <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-slate-200 flex items-center gap-2 border border-white/10">
                <span className="text-blue-300">💧</span>
                <span>x{state.gems.toString().padStart(3, '0')}</span>
              </div>
            </div>
            <button className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-200 hover:bg-slate-800">
              MENU
            </button>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">TURN</span>
                <span className="text-sm font-bold text-white">{turnCount}</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">BATTLE</div>
                <div className="text-base font-bold text-white leading-tight">{enemyBossName}</div>
              </div>
            </div>
            <div className="mt-4 h-4 rounded-full bg-slate-900/70 border border-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 transition-all duration-500" style={{ width: `${bossHpPercent}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-slate-400">
              <span>{stageData.area || 'Boss Stage'}</span>
              <span>{bossHpPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-20 px-3 pb-3">
        <div className="relative mx-auto flex max-w-[560px] flex-col gap-3">
          <div className="rounded-[32px] border border-white/10 bg-[#09101c]/95 p-4 shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-[26px] border border-white/10 bg-slate-900/90 p-3">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-3">Enemies</div>
                <div className="grid grid-cols-3 gap-2">
                  {enemyUnits.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => selectEnemyTarget(unit.id)}
                      className={`group rounded-3xl border border-white/10 bg-slate-950/90 p-2 transition ${turnState === 'player_input' && !unit.isDead ? 'hover:border-sky-400/40 hover:bg-slate-800' : ''} ${unit.isDead ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className="relative flex items-center justify-center rounded-3xl bg-slate-900/80 p-2">
                        <UnitSprite unit={unit} hideStats scale={0.8} />
                      </div>
                      <div className="mt-2 text-[9px] font-semibold text-slate-100 text-center truncate">{unit.template.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-slate-900/90 p-3">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-3">Party</div>
                <div className="grid grid-cols-3 gap-2">
                  {playerUnits.map((unit) => (
                    <div key={unit.id} className="rounded-3xl border border-white/10 bg-slate-950/90 p-2">
                      <div className="relative flex items-center justify-center rounded-3xl bg-slate-900/80 p-2">
                        <UnitSprite unit={unit} hideStats scale={0.8} />
                      </div>
                      <div className="mt-2 text-[9px] font-semibold text-slate-100 text-center truncate">{unit.template.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {playerSlots.map((unit, idx) => (
                <div key={idx} className={`relative rounded-[26px] border border-white/10 bg-slate-950/90 p-3 shadow-[0_20px_40px_rgba(0,0,0,0.25)] ${unit?.isDead ? 'opacity-40 grayscale' : ''}`}>
                  {unit ? (
                    <>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{unit.template.name}</div>
                          <div className="text-[9px] uppercase tracking-[0.24em] text-slate-500">Lv. {unit.level ?? 1}</div>
                        </div>
                        <div className={`rounded-full px-2 py-1 text-[10px] font-bold ${unit.bbGauge >= unit.maxBb ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                          {unit.bbGauge >= unit.maxBb ? 'READY' : 'BB'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-20 w-20 rounded-3xl bg-slate-900/80 p-2 flex items-center justify-center">
                          <UnitSprite unit={unit} hideStats scale={0.8} />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>HP</span>
                            <span>{unit.hp}/{unit.maxHp}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300" style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>BB</span>
                            <span>{unit.bbGauge}/{unit.maxBb}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                            <div className={`h-full transition-all ${unit.bbGauge >= unit.maxBb ? 'bg-cyan-400 animate-pulse' : 'bg-sky-500'}`} style={{ width: `${(unit.bbGauge / unit.maxBb) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBb(unit.id)}
                        disabled={turnState !== 'player_input' || unit.isDead}
                        className={`w-full rounded-2xl border px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-bold transition ${turnState === 'player_input' && unit.bbGauge >= unit.maxBb ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15' : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:bg-slate-800'} ${unit.isDead ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {unit.bbGauge >= unit.maxBb ? (unit.queuedBb ? 'Cancel BB' : 'Use BB') : 'Charge BB'}
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 text-[10px] text-slate-500 uppercase tracking-[0.24em]">
                      Empty Slot
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-4">
            <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-3">
              <span>OVERDRIVE</span>
              <span className="font-semibold text-white">{totalBB}/{totalMaxBB}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div className={`h-full transition-all duration-500 ${overdrivePercent >= 100 ? 'bg-fuchsia-500 animate-pulse' : 'bg-cyan-400'}`} style={{ width: `${overdrivePercent}%` }} />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-4">
            <div className="grid grid-cols-5 gap-2">
              {battleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="rounded-[24px] border border-white/10 bg-slate-900/85 p-3 text-center text-[10px] uppercase tracking-[0.24em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  <div className="mb-2 text-2xl">{item.icon}</div>
                  <div className="text-[9px] font-semibold">{item.name}</div>
                  <div className="text-[10px] text-slate-400">x{item.count}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setAutoBattle(prev => !prev)}
              className={`flex-1 rounded-2xl border px-3 py-2 text-[11px] uppercase tracking-[0.22em] transition ${autoBattle ? 'border-emerald-300 bg-emerald-500/10 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-500 hover:bg-slate-800'}`}
            >
              🤖 Auto
            </button>
            <button
              onClick={() => setBattleSpeed(prev => prev === 'x1' ? 'x2' : 'x1')}
              className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-300 hover:border-slate-500 hover:bg-slate-800"
            >
              ⚡ Speed {battleSpeed}
            </button>
            <button
              className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-300 hover:border-slate-500 hover:bg-slate-800"
            >
              🪩 Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}