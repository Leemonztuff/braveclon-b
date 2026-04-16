'use client';

import { useEffect, useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { useBattle } from '@/hooks/useBattle';
import { STAGES } from '@/lib/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Earth: 'bg-amber-700',
  Thunder: 'bg-yellow-400',
  Light: 'bg-white',
  Dark: 'bg-purple-900',
};

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const stage = STAGES.find(s => s.id === stageId);
  
  const handleVictory = () => {
    setTimeout(() => onEnd(true), 1500);
  };
  
  const handleDefeat = () => {
    setTimeout(() => onEnd(false), 1500);
  };

  const {
    playerUnits,
    enemyUnits,
    turnCount,
    turnState,
    combatLog,
    executeTurn,
    selectedItem,
    setSelectedItem,
    inventoryItems,
    floatingTexts,
    handleUnitClick,
  } = useBattle(state, stageId, (victory) => onEnd(victory));

  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Top Header - Stage Info */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-950/80 border-b border-slate-700">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-amber-400">{stage?.name || 'Battle'}</span>
          <span className="text-xs text-slate-400">{stage?.area || 'Unknown Area'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400">Turn {turnCount}</span>
          <span className={`text-sm font-bold ${turnState === 'player_input' ? 'text-emerald-400' : 'text-red-400'}`}>
            {turnState === 'player_input' ? 'YOUR TURN' : turnState === 'victory' ? 'VICTORY!' : turnState === 'defeat' ? 'DEFEAT...' : 'ENEMY TURN'}
          </span>
        </div>
      </div>

      {/* Enemy Units - Top Row */}
      <div className="flex justify-center items-end h-1/3 px-4 py-2">
        <div className="flex gap-2 justify-center">
          {enemyUnits.map((enemy, idx) => (
            <motion.div
              key={enemy.id}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center ${
                enemy.isDead 
                  ? 'bg-slate-800/50 opacity-30' 
                  : enemy.actionState === 'hurt' || enemy.actionState === 'bb_hurt'
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-slate-700'
              } border-2 ${enemy.isWeaknessHit ? 'border-yellow-400' : 'border-slate-600'}`}
              initial={false}
              animate={{
                x: enemy.actionState === 'attacking' ? -10 : enemy.actionState === 'hurt' ? 5 : 0,
                scale: enemy.actionState === 'bb_hurt' ? 1.2 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <div className="text-2xl sm:text-3xl">
                {enemy.isDead ? '💀' : enemy.template.element === 'Fire' ? '🔥' : 
                 enemy.template.element === 'Water' ? '💧' : 
                 enemy.template.element === 'Earth' ? '🪨' : 
                 enemy.template.element === 'Thunder' ? '⚡' : 
                 enemy.template.element === 'Light' ? '✨' : '🌑'}
              </div>
              <div className="absolute -bottom-8 w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Battle Arena - Middle */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-slate-700 text-6xl font-black opacity-20">VS</div>
        </div>
        
        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ 
                opacity: ft.type === 'heal' || ft.type === 'bc' || ft.type === 'bb' ? 0 : 1,
                y: ft.type === 'heal' || ft.type === 'bc' || ft.type === 'bb' ? 50 : -50,
                scale: ft.type === 'weak' ? 1.5 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute text-2xl font-black ${
                ft.type === 'damage' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' :
                ft.type === 'heal' ? 'text-green-400' :
                ft.type === 'weak' ? 'text-yellow-400' :
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
      </div>

      {/* Player Units - Bottom Area */}
      <div className="flex justify-center items-start h-1/3 px-4 py-2">
        <div className="flex flex-col gap-1 w-full max-w-md">
          <div className="flex gap-2 justify-center">
            {playerUnits.map((unit, idx) => (
              <motion.div
                key={unit.id}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  unit.isDead
                    ? 'bg-slate-800/50 opacity-30'
                    : unit.actionState === 'hurt'
                      ? 'bg-red-500 animate-pulse'
                      : unit.queuedBb
                        ? 'bg-purple-500 border-2 border-purple-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                } border-2 ${unit.isWeaknessHit ? 'border-yellow-400' : 'border-slate-600'}`}
                onClick={() => {
                  if (turnState === 'player_input' && !unit.isDead) {
                    handleUnitClick(unit.id);
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl sm:text-3xl">
                  {unit.isDead ? '💀' : unit.template.element === 'Fire' ? '🔥' : 
                   unit.template.element === 'Water' ? '💧' : 
                   unit.template.element === 'Earth' ? '🪨' : 
                   unit.template.element === 'Thunder' ? '⚡' : 
                   unit.template.element === 'Light' ? '✨' : '🌑'}
                </div>
                
                {/* HP Bar */}
                <div className="absolute -bottom-6 w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                  />
                </div>
                
                {/* BB Gauge */}
                <div className="absolute -bottom-3 w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      unit.bbGauge >= unit.maxBb ? 'bg-purple-500 animate-pulse' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${(unit.bbGauge / unit.maxBb) * 100}%` }}
                  />
                </div>
                
                {/* BB Ready indicator */}
                {unit.bbGauge >= unit.maxBb && !unit.isDead && (
                  <div className="absolute -top-2 -right-2 text-[10px] bg-purple-500 rounded-full px-1 font-bold">
                    BB
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1 mt-2 justify-center">
            {turnState === 'player_input' ? (
              <button
                onClick={executeTurn}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-sm transition-colors"
              >
                ⚔️ ATTACK
              </button>
            ) : (
              <div className="px-4 py-2 bg-slate-700 rounded-lg text-sm text-slate-400">
                {turnState === 'victory' ? '🎉 Victory!' : 
                 turnState === 'defeat' ? '💀 Defeat...' : 
                 '⏳ Executing...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Combat Log - Bottom Overlay */}
      <div className="absolute bottom-20 left-2 right-2 text-xs text-slate-300 bg-slate-950/70 p-2 rounded overflow-hidden h-12">
        {combatLog.slice(-2).map((log, idx) => (
          <div key={idx} className="truncate">{log}</div>
        ))}
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-600">
              <h2 className="text-xl font-bold text-amber-400 mb-4">How to Play</h2>
              <div className="text-left text-sm space-y-2 text-slate-300">
                <p>1. Tap your units to toggle Brave Burst (BB)</p>
                <p>2. When BB gauge is full (purple), tap to queue BB</p>
                <p>3. Tap ATTACK to execute turn</p>
                <p>4. Elements: 🔥 🔥 &gt; 🪨 &gt; 💧 &gt; 🔥</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}