import { useState, useEffect, useCallback } from 'react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, ENEMIES, STAGES, getElementMultiplier, ELEMENT_ICONS, Element, LeaderSkill } from '@/lib/gameData';
import { BattleUnit } from '@/lib/battleTypes';
import { playSound } from '@/lib/audio';
import { UnitSprite } from './UnitSprite';
import { motion, AnimatePresence } from 'motion/react';
import { BBCutIn } from './BBCutIn';

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

  let rawDamage = Math.max(1, (attacker.atk * basePower) - (target.def * 0.5));
  let finalDamage = Math.floor(rawDamage * elementMultiplier);

  let elementalBonus = 0;
  if (leaderSkill?.elementBoost) {
    const boost = leaderSkill.elementBoost[attacker.template.element as Element] || 0;
    elementalBonus = Math.floor(finalDamage * boost);
    finalDamage += elementalBonus;
  }

  if (leaderSkill?.statBoost?.atk) {
    finalDamage = Math.floor(finalDamage * (1 + leaderSkill.statBoost.atk));
  }

  return { damage: finalDamage, isWeakness, elementalBonus };
}

function getLeader(units: BattleUnit[]): BattleUnit | undefined {
  return units.find(u => u.isPlayer && !u.isDead);
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const [turnCount, setTurnCount] = useState(1);
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null);

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
  const [bbHitEffect, setBbHitEffect] = useState<{ targetId: string; element: string } | null>(null);
  const [floatingDamages, setFloatingDamages] = useState<Array<{ id: string; targetId: string; value: number; left: string; top: string; element: string; isCrit: boolean }>>([]);
  const [combatCrystals, setCombatCrystals] = useState<Array<{ id: string; type: 'BC' | 'HC'; left: string; top: string; element: string }>>([]);
  const [autoBattle, setAutoBattle] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState<'x1' | 'x2'>('x1');

  const totalBB = playerUnits.reduce((sum, u) => sum + u.bbGauge, 0);
  const totalMaxBB = playerUnits.reduce((sum, u) => sum + u.maxBb, 0);
  const overdrivePercent = totalMaxBB ? Math.min(100, Math.floor((totalBB / totalMaxBB) * 100)) : 0;

  const leader = getLeader(playerUnits);
  const leaderSkill = leader?.template.leaderSkill;

  const speedFactor = battleSpeed === 'x2' ? 0.65 : 1;
  const wait = useCallback((ms: number) => new Promise<void>(resolve => setTimeout(resolve, Math.max(30, ms * speedFactor))), [speedFactor]);

  const getTargetPosition = useCallback((targetId: string, isEnemy: boolean) => {
    const list = isEnemy ? enemyUnits : playerUnits;
    const idx = list.findIndex(u => u.id === targetId);
    const baseLeft = idx === -1 ? 75 : Math.max(70, 88 - idx * 10);
    const top = 35 + (idx * 15);
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

  const toggleBb = useCallback((id: string) => {
    if (turnState !== 'player_input') return;
    setPlayerUnits(prev => prev.map(u => {
      if (u.id === id && u.bbGauge >= u.maxBb && !u.isDead) {
        return { ...u, queuedBb: !u.queuedBb };
      }
      return u;
    }));
  }, [turnState]);

  const selectEnemyTarget = useCallback((id: string) => {
    if (turnState !== 'player_input') return;
    setSelectedEnemy(prev => prev === id ? null : id);
  }, [turnState]);

  const executeTurn = useCallback(async () => {
    if (turnState !== 'player_input') return;
    setTurnState('player_executing');

    let currentEnemies = [...enemyUnits];
    let currentPlayer = [...playerUnits];
    let targetingEnemy = selectedEnemy;

    for (let i = 0; i < currentPlayer.length; i++) {
      const attacker = currentPlayer[i];
      if (attacker.isDead) continue;

      let targetIdx: number;
      if (targetingEnemy) {
        targetIdx = currentEnemies.findIndex(e => e.id === targetingEnemy && !e.isDead);
        if (targetIdx === -1) targetIdx = currentEnemies.findIndex(e => !e.isDead);
      } else {
        targetIdx = currentEnemies.findIndex(e => !e.isDead);
      }

      if (targetIdx === -1) break;
      const target = currentEnemies[targetIdx];

      const isBb = attacker.queuedBb;
      const { damage, isWeakness, elementalBonus } = calculateDamage(attacker, target, isBb, leaderSkill);

      currentPlayer[i] = { ...attacker, actionState: isBb ? 'skill' : 'attacking' };
      setPlayerUnits([...currentPlayer]);

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
      if (!isBb) spawnCrystal('BC', attacker.template.element);

      if (isBb) {
        setBbHitEffect({ targetId: target.id, element: attacker.template.element });
        playSound('bb_hit');
        if (isWeakness) window.setTimeout(() => playSound('weakness'), 100);
        window.setTimeout(() => setBbHitEffect(null), 800);
      } else {
        if (isWeakness) playSound('weakness'); else playSound('hit');
      }

      let logMsg = `${attacker.template.name} ${isBb ? 'uses ' + attacker.template.skill.name + '!' : 'attacks'} ${target.template.name} for ${damage} damage!`;
      if (isWeakness) logMsg += ' (Weakness!)';
      if (elementalBonus > 0) logMsg += ` (+${elementalBonus} leader bonus!)`;
      addLog(logMsg);

      await wait(380);

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

    if (currentEnemies.every(e => e.isDead)) {
      setTurnState('victory');
      addLog('VICTORY! Stage cleared!');
      playSound('victory');
      setTimeout(() => onEnd(true), 2500);
      return;
    }

    setTurnState('enemy_executing');

    for (let i = 0; i < currentEnemies.length; i++) {
      const attacker = currentEnemies[i];
      if (attacker.isDead) continue;

      const targetIdx = currentPlayer.findIndex(p => !p.isDead);
      if (targetIdx === -1) break;
      const target = currentPlayer[targetIdx];

      const { damage, isWeakness } = calculateDamage(attacker, target, false);
      currentEnemies[i] = { ...attacker, actionState: 'attacking' };
      setEnemyUnits([...currentEnemies]);
      await wait(220);

      const newTargetHp = Math.max(0, target.hp - damage);
      currentPlayer[targetIdx] = {
        ...target,
        hp: newTargetHp,
        isDead: newTargetHp <= 0,
        bbGauge: Math.min(target.maxBb, target.bbGauge + 2),
        actionState: 'hurt',
        isWeaknessHit: isWeakness
      };
      setPlayerUnits([...currentPlayer]);
      spawnDamageNumber(target.id, damage, isWeakness, attacker.template.element, false);
      spawnCrystal('BC', attacker.template.element);

      if (isWeakness) playSound('weakness'); else playSound('hit');
      addLog(`${attacker.template.name} attacks ${target.template.name} for ${damage} damage!${isWeakness ? ' (Weakness!)' : ''}`);
      await wait(360);

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

    if (currentPlayer.every(p => p.isDead)) {
      setTurnState('defeat');
      addLog('DEFEAT! Your party has fallen...');
      setTimeout(() => onEnd(false), 2500);
      return;
    }

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
    <div className="flex flex-col h-full bg-[#02050f] relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(180deg,rgba(4,9,22,0.95),rgba(2,4,13,1))]" />
      <div className="relative z-20 flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#080f1e]/90 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-[24px] bg-[#0d1728]/95 px-3 py-2 border border-white/10 text-sm text-slate-200 shadow-[inset_0_0_10px_rgba(255,255,255,0.04)]">
              <span>💰</span>
              <span className="font-semibold tabular-nums">{state.zel.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 rounded-[24px] bg-[#0d1728]/95 px-3 py-2 border border-white/10 text-sm text-slate-200 shadow-[inset_0_0_10px_rgba(255,255,255,0.04)]">
              <span>💎</span>
              <span className="font-semibold tabular-nums">{state.gems}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-300">
            <span className={`rounded-full px-3 py-1 font-bold ${turnState === 'player_input' ? 'bg-emerald-500/10 text-emerald-200' : turnState === 'player_executing' ? 'bg-amber-500/10 text-amber-200' : turnState === 'enemy_executing' ? 'bg-rose-500/10 text-rose-200' : turnState === 'victory' ? 'bg-yellow-500/10 text-yellow-200' : 'bg-red-500/10 text-red-200'}`}>
              {turnState === 'player_input' ? 'YOUR TURN' : turnState === 'player_executing' ? 'ATTACKING' : turnState === 'enemy_executing' ? 'ENEMY TURN' : turnState === 'victory' ? 'VICTORY' : 'DEFEAT'}
            </span>
            <span className="rounded-full bg-[#0d1728]/95 px-3 py-1 text-slate-300">TURN {turnCount}</span>
          </div>

          <button className="rounded-[24px] border border-white/10 bg-[#0d1728]/95 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-200 hover:bg-[#12203a]/90">
            MENU
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-4">
            <div className="rounded-[34px] border border-white/10 bg-[#091528]/95 p-4 shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">BATTLE</div>
                  <div className="mt-2 text-2xl font-black text-white">{enemyBossName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Location</div>
                  <div className="mt-2 text-sm font-semibold text-slate-100">{stageData.area || stageData.name}</div>
                </div>
              </div>

              <div className="mt-6 rounded-[26px] bg-[#061126] border border-white/10 p-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-slate-400 mb-3">
                  <span>HP</span>
                  <span>{bossHpPercent}%</span>
                </div>
                <div className="relative h-5 overflow-hidden rounded-full bg-[#091520] border border-white/10">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 shadow-[0_0_20px_rgba(251,113,133,0.6)] transition-all" style={{ width: `${bossHpPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[34px] border border-white/10 bg-[#081429]/95 p-4 shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-4">
                  <span>Enemy Field</span>
                  <span>{enemyUnits.length} Targets</span>
                </div>
                <div className="relative h-[280px] overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_45%)] border border-white/10 p-4">
                  <div className="absolute inset-x-0 top-4 mx-auto h-1 w-24 rounded-full bg-white/10" />
                  <div className="absolute inset-x-0 top-16 flex justify-center gap-4">
                    {enemyUnits.map((unit) => (
                      <div key={unit.id} className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-3xl border border-white/10 bg-[#0d1728]/80 p-3">
                          <UnitSprite unit={unit} hideStats scale={0.9} />
                        </div>
                        <div className="text-[9px] text-slate-200">{unit.template.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[34px] border border-white/10 bg-[#081429]/95 p-4 shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mb-4">Battle Log</div>
                <div className="flex h-[280px] flex-col gap-2 overflow-y-auto rounded-[28px] bg-[#061126]/95 p-3 border border-white/10 text-[11px] text-slate-300">
                  {combatLog.length > 0 ? combatLog.map((log, i) => (
                    <div key={i} className="rounded-2xl bg-white/5 px-3 py-2">{log}</div>
                  )) : (
                    <div className="text-slate-500">Waiting for action...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {playerSlots.map((unit, idx) => (
                <div key={idx} className="rounded-[30px] border border-white/10 bg-[#081428]/95 p-4 shadow-[0_25px_50px_rgba(0,0,0,0.3)]">
                  {unit ? (
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-[#0d1728]/90 p-2">
                          <UnitSprite unit={unit} hideStats scale={0.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-white">{unit.template.name}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">HP {unit.hp}/{unit.maxHp}</div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-2 rounded-full bg-[#091426] border border-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300" style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
                        </div>
                        <div className="h-2 rounded-full bg-[#091426] border border-slate-800 overflow-hidden">
                          <div className={`h-full ${unit.bbGauge >= unit.maxBb ? 'bg-fuchsia-500 animate-pulse' : 'bg-cyan-400'}`} style={{ width: `${(unit.bbGauge / unit.maxBb) * 100}%` }} />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBb(unit.id)}
                        disabled={turnState !== 'player_input' || unit.isDead}
                        className={`w-full rounded-[22px] border px-3 py-2 text-[11px] uppercase tracking-[0.28em] font-bold transition ${turnState === 'player_input' && unit.bbGauge >= unit.maxBb ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/15' : 'border-slate-800 bg-[#0c1a2e] text-slate-300 hover:bg-[#12203e]'} ${unit.isDead ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {unit.bbGauge >= unit.maxBb ? (unit.queuedBb ? 'Cancel BB' : 'Brave Burst') : 'Charge BB'}
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[26px] border border-dashed border-slate-700 bg-[#091426]/90 p-4 text-center text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      Empty Slot
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-[34px] border border-white/10 bg-[#091526]/95 p-4 shadow-[0_25px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-slate-400 mb-3">
                <span>Overdrive</span>
                <span className="font-semibold text-white">{totalBB}/{totalMaxBB}</span>
              </div>
              <div className="h-3 rounded-full bg-[#061026] border border-white/10 overflow-hidden">
                <div className={`h-full bg-cyan-400 transition-all duration-500 ${overdrivePercent >= 100 ? 'animate-pulse bg-fuchsia-500' : ''}`} style={{ width: `${overdrivePercent}%` }} />
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-[#091526]/95 p-4 shadow-[0_25px_50px_rgba(0,0,0,0.35)]">
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setAutoBattle(prev => !prev)}
                className={`flex-1 rounded-[24px] border px-4 py-3 text-[12px] uppercase tracking-[0.3em] font-bold transition ${autoBattle ? 'border-emerald-300 bg-emerald-500/10 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'border-slate-800 bg-[#0c1a2e] text-slate-300 hover:bg-[#12203e]'}`}
              >
                🤖 Auto
              </button>
              <button
                onClick={() => setBattleSpeed(prev => prev === 'x1' ? 'x2' : 'x1')}
                className="flex-1 rounded-[24px] border border-slate-800 bg-[#0c1a2e] px-4 py-3 text-[12px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:bg-[#12203e]"
              >
                ⚡ Speed {battleSpeed}
              </button>
              <button
                className="flex-1 rounded-[24px] border border-slate-800 bg-[#0c1a2e] px-4 py-3 text-[12px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:bg-[#12203e]"
              >
                🪩 Menu
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
