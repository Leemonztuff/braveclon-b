'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Fire: '#ff4444',
  Water: '#4488ff',
  Earth: '#44cc44',
  Thunder: '#ffcc00',
  Light: '#ffffaa',
  Dark: '#aa44ff',
};

function UnitFrame({ unit, idx, isPlayer, onClick, isTargeting }: { 
  unit: any; 
  idx: number;
  isPlayer: boolean;
  onClick?: () => void;
  isTargeting?: boolean;
}) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const isLeader = isPlayer && idx === 0;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, x: isPlayer ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
    >
      <motion.div
        className={`
          relative w-16 h-16 rounded-full overflow-hidden
          border-2 cursor-pointer transition-all duration-150
          ${unit.isDead 
            ? 'border-gray-600 bg-gray-800 opacity-40' 
            : unit.actionState === 'hurt'
              ? 'border-red-500 bg-red-500/30 animate-pulse'
              : 'border-amber-500 bg-gradient-to-b from-gray-700 to-gray-900'
          }
          ${unit.isWeaknessHit ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}
          ${isTargeting ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110' : ''}
        `}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        animate={{
          x: unit.actionState === 'attacking' ? (isPlayer ? 20 : -20) : 0,
          scale: unit.actionState === 'bb_hurt' ? 1.15 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl filter drop-shadow-lg">
            {unit.isDead ? '☠️' : unit.template.element === 'Fire' ? '🔥' : 
             unit.template.element === 'Water' ? '💧' : 
             unit.template.element === 'Earth' ? '🌲' : 
             unit.template.element === 'Thunder' ? '⚡' : 
             unit.template.element === 'Light' ? '☀️' : '🌙'}
          </span>
        </div>

        {isLeader && !unit.isDead && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-white">
            L
          </div>
        )}

        {!unit.isDead && (
          <div 
            className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/30"
            style={{ backgroundColor: ELEMENT_COLORS[unit.template.element] }}
          >
          </div>
        )}

        {unit.queuedBb && !unit.isDead && (
          <div className="absolute inset-0 rounded-full border-2 border-purple-500 bg-purple-500/20" />
        )}

        {unit.bbGauge >= unit.maxBb && !unit.isDead && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-purple-400 animate-bounce">
            BB
          </div>
        )}
      </motion.div>

      <div className="mt-1 w-20">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-gray-400 font-mono">
            {Math.floor(unit.hp)}
          </span>
          <span className="text-[8px] text-gray-500">
            {Math.floor(unit.maxHp)}
          </span>
        </div>
      </div>

      {!unit.isDead && (
        <div className="mt-0.5 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-2 rounded-sm ${
                (unit.bbGauge / unit.maxBb) * 5 > i 
                  ? 'bg-cyan-400 animate-pulse' 
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const stage = STAGES.find(s => s.id === stageId);

  const handleVictory = useCallback(() => {
    setTimeout(() => onEnd(true), 2500);
  }, [onEnd]);

  const handleDefeat = useCallback(() => {
    setTimeout(() => onEnd(false), 2500);
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
    if (victory) handleVictory();
    else handleDefeat();
  });

  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#1a1a2e] via-[#0f0f1a] to-[#0a0a12] overflow-hidden select-none">
      {/* Top Bar - Zel & Karma */}
      <div className="h-10 flex items-center justify-between px-4 bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] border-b border-[#b89947]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">♦</span>
            <span className="text-xs font-bold text-yellow-500">{stage?.zelReward || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-pink-400">★</span>
            <span className="text-xs font-bold text-pink-400">0</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">TURN {turnCount}</span>
        </div>
      </div>

      {/* Battle Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ 
                opacity: 0,
                y: -50,
                scale: ft.type === 'weak' ? 1.3 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`absolute text-3xl font-black z-50 ${
                ft.type === 'damage' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' :
                ft.type === 'heal' ? 'text-green-400' :
                ft.type === 'weak' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' :
                ft.type === 'bc' ? 'text-cyan-300' :
                ft.type === 'bb' ? 'text-purple-400' :
                'text-white'
              }`}
              style={{ left: ft.x, top: ft.y }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* VS */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-8xl font-black text-[#b89947]/5 select-none">VS</span>
        </div>

        {/* Enemy Row - LEFT SIDE */}
        <div className="absolute left-2 top-1/4 flex flex-col gap-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider ml-1">ENEMY</div>
          <div className="flex flex-col gap-3">
            {enemyUnits.map((enemy, idx) => (
              <UnitFrame 
                key={enemy.id} 
                unit={enemy} 
                idx={idx}
                isPlayer={false}
                onClick={() => {
                  if (turnState === 'player_input' && !enemy.isDead) {
                    handleUnitClick(enemy.id);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Player Row - RIGHT SIDE */}
        <div className="absolute right-2 top-1/4 flex flex-col gap-2 items-end">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mr-1">YOUR UNIT</div>
          <div className="flex flex-col gap-3">
            {playerUnits.map((unit, idx) => (
              <UnitFrame 
                key={unit.id} 
                unit={unit} 
                idx={idx}
                isPlayer={true}
                onClick={() => {
                  if (turnState === 'player_input' && !unit.isDead) {
                    handleUnitClick(unit.id);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Battle Log */}
        <div className="absolute bottom-16 left-2 right-2">
          <div className="text-xs text-gray-400 bg-black/40 p-2 rounded text-center">
            {combatLog[combatLog.length - 1] || 'Tap your units to attack!'}
          </div>
        </div>

        {/* Attack Button */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <motion.button
            onClick={executeTurn}
            disabled={turnState !== 'player_input'}
            className={`
              px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider
              transition-all duration-200 shadow-lg
              ${turnState === 'player_input'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:scale-105 active:scale-95'
                : turnState === 'victory'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black animate-pulse'
                  : turnState === 'defeat'
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
            whileTap={turnState === 'player_input' ? { scale: 0.95 } : {}}
          >
            {turnState === 'player_input' ? '⚔️ ATTACK' : 
             turnState === 'victory' ? '🎉 VICTORY!' :
             turnState === 'defeat' ? '💀 DEFEAT...' :
             'Wait...'}
          </motion.button>
        </div>
      </div>

      {/* Help Overlay */}
      <AnimatePresence>
        {showHelp && turnState === 'player_input' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e] p-6 rounded-2xl border border-amber-500/30 max-w-[280px]"
            >
              <h3 className="text-lg font-bold text-amber-400 text-center mb-3">How to Play</h3>
              <div className="text-xs text-gray-300 space-y-2">
                <p>• <span className="text-amber-400">Tap your units</span> to queue Brave Burst</p>
                <p>• When BB gauge is <span className="text-purple-400">purple</span>, tap to use it!</p>
                <p>• Tap <span className="text-amber-400">ATTACK</span> to execute turn</p>
                <p>• Element advantage: <span className="text-red-400">Fire</span> &gt; <span className="text-green-400">Earth</span> &gt; <span className="text-blue-400">Water</span> &gt; <span className="text-red-400">Fire</span></p>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-4">Tap to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}