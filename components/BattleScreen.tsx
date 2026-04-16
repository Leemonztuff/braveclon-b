'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlayerState } from '@/lib/gameState';
import { useBattle } from '@/hooks/useBattle';
import { STAGES } from '@/lib/gameData';
import { motion, AnimatePresence } from 'motion/react';

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Earth: 'bg-green-600',
  Thunder: 'bg-yellow-400',
  Light: 'bg-yellow-100',
  Dark: 'bg-purple-700',
};

const ELEMENT_ICONS: Record<string, string> = {
  Fire: '🔥',
  Water: '💧',
  Earth: '🪨',
  Thunder: '⚡',
  Light: '✨',
  Dark: '🌑',
};

const BF_GOLD = '#b89947';

function EnemyUnitCard({ unit, onClick, isSelected }: { 
  unit: any; 
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const bbPercent = (unit.bbGauge / unit.maxBb) * 100;

  return (
    <motion.div
      className={`
        relative w-14 h-14 rounded-full overflow-hidden
        border-2 cursor-pointer transition-all duration-150
        ${unit.isDead 
          ? 'border-zinc-700 bg-zinc-900/50 opacity-40' 
          : unit.actionState === 'hurt' || unit.actionState === 'bb_hurt'
            ? 'border-red-500 bg-red-500/20 animate-pulse'
            : 'border-amber-600/60 bg-[#1a1a2e]'
        }
        ${unit.isWeaknessHit ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}
        ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50' : ''}
      `}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: unit.actionState === 'attacking' ? -15 : unit.actionState === 'hurt' || unit.actionState === 'bb_hurt' ? 5 : 0,
        scale: unit.actionState === 'bb_hurt' ? 1.1 : 1,
      }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#252a4a] to-[#1a1a2e]">
        <span className="text-2xl">{unit.isDead ? '💀' : unit.template.element === 'Fire' ? '🔥' : 
         unit.template.element === 'Water' ? '💧' : 
         unit.template.element === 'Earth' ? '🪨' : 
         unit.template.element === 'Thunder' ? '⚡' : 
         unit.template.element === 'Light' ? '✨' : '🌑'}</span>
      </div>
      
      {!unit.isDead && (
        <div className={`absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${ELEMENT_COLORS[unit.template.element]} border border-white/20`}>
          {ELEMENT_ICONS[unit.template.element]}
        </div>
      )}

      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14">
        <div className="h-1.5 bg-red-950 rounded-full overflow-hidden border border-red-900/50">
          <div 
            className="h-full bg-gradient-to-b from-green-400 to-green-600 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14">
        <div className="h-1 bg-blue-950 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              unit.bbGauge >= unit.maxBb 
                ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 animate-pulse' 
                : 'bg-gradient-to-b from-blue-400 to-blue-600'
            }`}
            style={{ width: `${bbPercent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function PlayerUnitCard({ unit, idx, onClick, isSelected }: { 
  unit: any; 
  idx: number;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const bbPercent = (unit.bbGauge / unit.maxBb) * 100;
  const bbReady = unit.bbGauge >= unit.maxBb;

  return (
    <motion.div
      className={`
        relative w-16 h-16 rounded-full overflow-hidden
        border-2 cursor-pointer transition-all duration-150
        ${unit.isDead 
          ? 'border-zinc-700 bg-zinc-900/50 opacity-40' 
          : unit.actionState === 'hurt'
            ? 'border-red-500 bg-red-500/20 animate-pulse'
            : unit.queuedBb
              ? 'border-purple-400 bg-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'border-amber-600/60 bg-[#1a1a2e]'
        }
        ${unit.isWeaknessHit ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}
        ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50' : ''}
      `}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: unit.actionState === 'attacking' ? 15 : unit.actionState === 'hurt' ? -5 : 0,
        scale: unit.actionState === 'skill' ? 1.1 : 1,
      }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#252a4a] to-[#1a1a2e]">
        <span className="text-2xl">{unit.isDead ? '💀' : unit.template.element === 'Fire' ? '🔥' : 
         unit.template.element === 'Water' ? '💧' : 
         unit.template.element === 'Earth' ? '🪨' : 
         unit.template.element === 'Thunder' ? '⚡' : 
         unit.template.element === 'Light' ? '✨' : '🌑'}</span>
      </div>

      {idx === 0 && !unit.isDead && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] font-bold text-black">
          L
        </div>
      )}

      {!unit.isDead && (
        <div className={`absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${ELEMENT_COLORS[unit.template.element]} border border-white/20`}>
          {ELEMENT_ICONS[unit.template.element]}
        </div>
      )}

      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16">
        <div className="h-1.5 bg-red-950 rounded-full overflow-hidden border border-red-900/50">
          <div 
            className="h-full bg-gradient-to-b from-green-400 to-green-600 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16">
        <div className="h-1 bg-blue-950 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              bbReady 
                ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 animate-pulse' 
                : 'bg-gradient-to-b from-blue-400 to-blue-600'
            }`}
            style={{ width: `${bbPercent}%` }}
          />
        </div>
      </div>

      {bbReady && !unit.isDead && (
        <>
          <div className="absolute inset-[-4px] rounded-full border-2 border-purple-400 animate-pulse opacity-50" />
          <div className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-purple-500 text-white px-1.5 rounded-full">
            BB
          </div>
        </>
      )}

      {unit.queuedBb && (
        <div className="absolute inset-0 rounded-full border-2 border-purple-400 bg-purple-500/20" />
      )}
    </motion.div>
  );
}

function BBButton({ unit, onClick, disabled }: { 
  unit: any; 
  onClick?: () => void;
  disabled?: boolean;
}) {
  const bbReady = unit.bbGauge >= unit.maxBb;

  return (
    <motion.button
      className={`
        relative w-14 h-14 rounded-full
        ${unit.isDead 
          ? 'bg-zinc-800 opacity-40 cursor-not-allowed' 
          : bbReady
            ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.6)]'
            : 'bg-gradient-to-b from-blue-600 to-blue-800 cursor-pointer hover:scale-105 active:scale-95'
        }
        transition-all duration-200 flex items-center justify-center
        border-2 ${bbReady ? 'border-white' : 'border-amber-600/50'}
        ${disabled ? 'pointer-events-none' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      animate={bbReady && !unit.isDead ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-[#1a1a2e] flex items-center justify-center">
        <span className="text-xl">{unit.isDead ? '💀' : unit.template.element === 'Fire' ? '🔥' : 
         unit.template.element === 'Water' ? '💧' : 
         unit.template.element === 'Earth' ? '🪨' : 
         unit.template.element === 'Thunder' ? '⚡' : 
         unit.template.element === 'Light' ? '✨' : '🌑'}</span>
      </div>

      {!bbReady && !unit.isDead && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-400">
          {Math.floor(unit.bbGauge)}
        </div>
      )}

      {bbReady && !unit.isDead && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-bounce">
          BB
        </div>
      )}

      {unit.queuedBb && (
        <div className="absolute inset-0 rounded-full border-2 border-purple-400 bg-purple-500/30" />
      )}
    </motion.button>
  );
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const stage = STAGES.find(s => s.id === stageId);
  
  const handleVictory = useCallback((victory: boolean) => {
    setTimeout(() => onEnd(victory), 2000);
  }, [onEnd]);

  const handleDefeat = useCallback((victory: boolean) => {
    setTimeout(() => onEnd(victory), 2000);
  }, [onEnd]);

  const {
    playerUnits,
    enemyUnits,
    turnCount,
    turnState,
    combatLog,
    executeTurn,
    handleUnitClick,
    floatingTexts,
  } = useBattle(state, stageId, (victory) => {
    handleVictory(victory);
  });

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const handleEnemyClick = (enemyId: string) => {
    if (turnState === 'player_input' && selectedTarget) {
      // Execute attack on selected enemy
      setSelectedTarget(null);
    } else if (turnState === 'player_input') {
      setSelectedTarget(enemyId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0d0d1a] via-[#16213e] to-[#1a1a2e] overflow-hidden select-none">
      {/* Stage Header */}
      <div className="h-12 flex items-center justify-between px-4 bg-gradient-to-b from-[#1a1a2e]/95 to-[#0d0d1a]/95 border-b border-amber-600/30">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            {stage?.name || 'Battle'}
          </span>
          <span className="text-[10px] text-zinc-400">
            {stage?.area || 'Unknown Area'}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-zinc-500 font-mono">
            TURN {turnCount}
          </div>
          <div className={`
            text-xs font-bold px-2 py-0.5 rounded
            ${turnState === 'player_input' ? 'bg-emerald-500/20 text-emerald-400' : ''}
            ${turnState === 'player_executing' || turnState === 'enemy_executing' ? 'bg-red-500/20 text-red-400' : ''}
            ${turnState === 'victory' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : ''}
            ${turnState === 'defeat' ? 'bg-zinc-500/20 text-zinc-400' : ''}
          `}>
            {turnState === 'player_input' ? 'YOUR TURN' : 
             turnState === 'player_executing' || turnState === 'enemy_executing' ? 'EXECUTING' :
             turnState === 'victory' ? 'VICTORY!' : 'DEFEAT'}
          </div>
        </div>
      </div>

      {/* Enemy Row - Top */}
      <div className="h-[30%] min-h-[120px] flex items-end justify-center px-2 pb-2 relative">
        <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
        <div className="flex gap-2 justify-center items-end">
          {enemyUnits.map((enemy) => (
            <EnemyUnitCard 
              key={enemy.id} 
              unit={enemy} 
              onClick={() => handleEnemyClick(enemy.id)}
              isSelected={selectedTarget === enemy.id}
            />
          ))}
        </div>
      </div>

      {/* Battle Arena - Middle */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-black text-amber-600/10 select-none">VS</span>
        </div>

        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ 
                opacity: ft.type === 'heal' || ft.type === 'bc' || ft.type === 'bb' ? 0 : 1,
                y: ft.type === 'heal' || ft.type === 'bc' || ft.type === 'bb' ? 30 : -40,
                scale: ft.type === 'weak' ? 1.5 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute text-2xl font-black ${
                ft.type === 'damage' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' :
                ft.type === 'heal' ? 'text-green-400' :
                ft.type === 'weak' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' :
                ft.type === 'bc' ? 'text-cyan-400' :
                ft.type === 'bb' ? 'text-purple-400' :
                'text-white'
              }`}
              style={{ left: ft.x, top: ft.y }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Command Buttons */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <motion.button
            onClick={executeTurn}
            disabled={turnState !== 'player_input'}
            className={`
              px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider
              transition-all duration-200
              ${turnState === 'player_input'
                ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-black hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }
            `}
            whileTap={turnState === 'player_input' ? { scale: 0.95 } : {}}
          >
            ⚔️ Attack
          </motion.button>
        </div>

        {/* Combat Log */}
        <div className="absolute top-2 left-2 right-2 text-xs text-zinc-400 bg-black/30 p-1 rounded text-center">
          {combatLog[combatLog.length - 1] || 'Battle Started!'}
        </div>
      </div>

      {/* Player Row */}
      <div className="h-[25%] min-h-[100px] flex items-start justify-center px-2 pt-2">
        <div className="flex gap-2 justify-center items-start">
          {playerUnits.map((unit, idx) => (
            <PlayerUnitCard 
              key={unit.id} 
              unit={unit}
              idx={idx}
              onClick={() => turnState === 'player_input' && !unit.isDead && handleUnitClick(unit.id)}
            />
          ))}
        </div>
      </div>

      {/* BB Buttons Row */}
      <div className="h-20 bg-gradient-to-t from-[#0d0d1a] to-[#1a1a2e] border-t border-amber-600/30 px-2 py-2">
        <div className="flex justify-center gap-2 h-full">
          {playerUnits.map((unit) => (
            <BBButton 
              key={unit.id}
              unit={unit}
              disabled={turnState !== 'player_input' || unit.isDead}
              onClick={() => turnState === 'player_input' && !unit.isDead && handleUnitClick(unit.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}