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

  // Obtener leader skill del líder
  const leader = getLeader(playerUnits);
  const leaderSkill = leader?.template.leaderSkill;

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
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-2 text-[10px] font-mono text-slate-300 shadow-lg shadow-black/20">
          {combatLog.map((log, i) => (
            <div key={i} className="truncate">{log}</div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BATTLEFIELD - Side-scroller style (Brave Frontier)
          Players on LEFT, Enemies on RIGHT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative z-20 px-3 pb-3">
        <div className="relative mx-auto flex max-w-[400px] flex-col h-full gap-2">
          
          {/* Battle Area - Side scroller battlefield */}
          <div className="relative flex-1 min-h-[200px] rounded-[28px] border border-white/10 bg-[#0a1220] overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]">
            
            {/* Background layers for parallax feel */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1a2d] via-[#0a1428] to-[#0d1a2d]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_70%_50%,rgba(40,80,140,0.3),transparent_50%)]" />
            
            {/* Ground line */}
            <div className="absolute bottom-[15%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
            
            {/* Player zone indicator (left) */}
            <div className="absolute left-2 top-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1">
              <span className="text-[8px] uppercase tracking-widest text-emerald-400/60">Your Party</span>
            </div>
            
            {/* Enemy zone indicator (right) */}
            <div className="absolute right-2 top-2 rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1">
              <span className="text-[8px] uppercase tracking-widest text-red-400/60">Enemies</span>
            </div>

            {/* ════ ENEMIES (Right side) ════ */}
            <div className="absolute right-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-4">
              {enemyUnits.map((unit, idx) => (
                <div
                  key={unit.id}
                  className={`relative cursor-pointer transition-all duration-200 ${selectedEnemy === unit.id ? 'scale-110 z-10' : ''} ${unit.isDead ? 'opacity-30 grayscale' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (turnState === 'player_input' && !unit.isDead) selectEnemyTarget(unit.id);
                  }}
                >
                  {/* Selection ring */}
                  {selectedEnemy === unit.id && (
                    <div className="absolute -inset-3 rounded-full border-2 border-yellow-400/60 animate-pulse" />
                  )}
                  <UnitSprite
                    unit={unit}
                    hideStats
                    hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
                    scale={0.9}
                  />
                  {/* HP bar below enemy */}
                  <div className="mt-1 mx-auto w-14">
                    <div className="h-1.5 rounded-full bg-black/50 overflow-hidden border border-red-900/30">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                        style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ════ PLAYERS (Left side) ════ */}
            <div className="absolute left-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-4">
              {playerUnits.map((unit, idx) => (
                <div
                  key={unit.id}
                  className={`relative transition-all duration-200 ${unit.isDead ? 'opacity-30 grayscale' : ''}`}
                >
                  <UnitSprite
                    unit={unit}
                    hideStats
                    scale={0.9}
                  />
                  {/* HP bar below player */}
                  <div className="mt-1 mx-auto w-14">
                    <div className="h-1.5 rounded-full bg-black/50 overflow-hidden border border-emerald-900/30">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                        style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ════ Floating damages & effects (center area) ════ */}
            {floatingDamages.map(damage => (
              <motion.div
                key={damage.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -50, scale: 1.2 }}
                exit={{ opacity: 0, y: -80, scale: 1.4 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`pointer-events-none absolute font-black ${damage.isCrit ? 'text-yellow-300 text-2xl' : 'text-white text-xl'} drop-shadow-[0_0_10px_rgba(0,0,0,1)]`}
                style={{ left: damage.left, top: damage.top }}
              >
                {damage.value}
              </motion.div>
            ))}

            {combatCrystals.map(crystal => (
              <motion.div
                key={crystal.id}
                initial={{ opacity: 0, scale: 0.3, x: 0 }}
                animate={{ opacity: 1, scale: 1, x: 50 }}
                exit={{ opacity: 0, scale: 0.5, x: 100 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`pointer-events-none absolute rounded-full border border-white/30 px-2 py-1 text-[9px] font-bold ${crystal.type === 'BC' ? 'bg-sky-500/90 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-emerald-500/90 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
                style={{ left: crystal.left, top: crystal.top }}
              >
                {crystal.type}
              </motion.div>
            ))}
          </div>

          {/* ════ Player Unit Selector (Bottom) ════ */}
          <div className="grid grid-cols-3 gap-2">
            {playerUnits.map((unit, idx) => (
              <div key={unit.id} className="rounded-[18px] border border-white/10 bg-slate-950/80 p-2 shadow-[0_8px_25px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400">{idx === 5 ? 'Friend' : `Unit ${idx + 1}`}</span>
                  <span className="text-[9px] font-bold text-slate-100">{unit.hp}/{unit.maxHp}</span>
                </div>
                <button
                  onClick={() => toggleBb(unit.id)}
                  className={`w-full rounded-xl bg-slate-900/90 p-1.5 transition hover:brightness-110 ${turnState === 'player_input' && unit.bbGauge >= unit.maxBb ? 'ring-2 ring-sky-400/60' : ''} ${unit.isDead ? 'opacity-50' : ''}`}
                  disabled={turnState !== 'player_input' || unit.isDead}
                >
                  <UnitSprite unit={unit} hideStats scale={0.7} />
                </button>
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 rounded-full bg-slate-900/80 overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-900/80 overflow-hidden border border-slate-800">
                    <div className={`h-full transition-all ${unit.bbGauge >= unit.maxBb ? 'bg-cyan-400 animate-pulse' : 'bg-sky-500'}`} style={{ width: `${(unit.bbGauge / unit.maxBb) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-20 bg-[#07101c] border-t border-white/10 px-3 py-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => setAutoBattle(prev => !prev)}
            className={`flex-1 rounded-2xl border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${autoBattle ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-slate-700 text-slate-300'}`}
          >
            Auto
          </button>
          <button
            onClick={() => setBattleSpeed(prev => prev === 'x1' ? 'x2' : 'x1')}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-300"
          >
            Speed {battleSpeed}
          </button>
          <button className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-300">
            Pause
          </button>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-3 border border-white/10">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
            <span>Team HP</span>
            <span>{totalHp}/{totalMaxHp}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300" style={{ width: `${Math.min(100, (totalHp / totalMaxHp) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}