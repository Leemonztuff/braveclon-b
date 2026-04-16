'use client';

import { useState, useCallback, useEffect } from 'react';
import { PlayerState } from '@/lib/gameState';
import { useBattle } from '@/hooks/useBattle';
import { STAGES } from '@/lib/gameData';
import { motion, AnimatePresence } from 'motion/react';

// Brave Frontier Color Palette
const BF_COLORS = {
  gold: '#b89947',
  goldDark: '#8a7035',
  goldLight: '#d4af37',
  bgDark: '#0a0a12',
  bgMid: '#1a1a2e',
  bgLight: '#2a2a4a',
  hpGreen: '#4ade80',
  hpGreenDark: '#22c55e',
  bbBlue: '#3b82f6',
  bbBlueGlow: '#60a5fa',
  elementFire: '#ef4444',
  elementWater: '#3b82f6',
  elementEarth: '#22c55e',
  elementThunder: '#eab308',
  elementLight: '#fef08a',
  elementDark: '#a855f7',
};

// Element colors mapping
const ELEMENT_COLORS: Record<string, string> = {
  Fire: BF_COLORS.elementFire,
  Water: BF_COLORS.elementWater,
  Earth: BF_COLORS.elementEarth,
  Thunder: BF_COLORS.elementThunder,
  Light: BF_COLORS.elementLight,
  Dark: BF_COLORS.elementDark,
};

// Element icons mapping
const ELEMENT_ICONS: Record<string, string> = {
  Fire: '🔥',
  Water: '💧',
  Earth: '🌲',
  Thunder: '⚡',
  Light: '☀️',
  Dark: '🌙',
};

// Element weakness mapping for reference display
const ELEMENT_WEAKNESS: Record<string, string> = {
  Fire: 'Earth',
  Earth: 'Water',
  Water: 'Fire',
  Thunder: 'Light',
  Light: 'Dark',
  Dark: 'Thunder',
};

interface BattleUnitData {
  id: string;
  template: any;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  bbGauge: number;
  maxBb: number;
  isDead: boolean;
  queuedBb: boolean;
  actionState: string;
  isWeaknessHit?: boolean;
}

function UnitFrame({ 
  unit, 
  idx, 
  isPlayer, 
  onClick, 
  isTargeting,
  canUseBb 
}: { 
  unit: BattleUnitData;
  idx: number;
  isPlayer: boolean;
  onClick?: () => void;
  isTargeting?: boolean;
  canUseBb: boolean;
}) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const isLeader = isPlayer && idx === 0;
  const filledCrystals = Math.floor((unit.bbGauge / unit.maxBb) * 5);
  const isBbReady = unit.bbGauge >= unit.maxBb;

  // Determine frame border color based on state
  const getBorderColor = () => {
    if (unit.isDead) return '#4b5563';
    if (unit.actionState === 'hurt' || unit.actionState === 'bb_hurt') return '#ef4444';
    if (isTargeting) return '#22d3ee';
    if (unit.isWeaknessHit) return '#facc15';
    return BF_COLORS.gold;
  };

  const getFrameGradient = () => {
    if (unit.isDead) return 'from-gray-800 to-gray-900';
    if (unit.actionState === 'hurt' || unit.actionState === 'bb_hurt') return 'from-red-900/50 to-red-950/50';
    return 'from-slate-700 to-slate-900';
  };

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, x: isPlayer ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.15, duration: 0.3 }}
    >
      {/* Leader crown */}
      {isLeader && !unit.isDead && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative -mb-1 z-10"
        >
          <div className="w-6 h-5 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-full flex items-center justify-center shadow-lg" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}>
            <span className="text-[10px] font-bold text-yellow-900">L</span>
          </div>
        </motion.div>
      )}

      {/* Main unit frame */}
      <motion.div
        className={`
          relative w-20 h-20 rounded-full overflow-hidden
          cursor-pointer transition-all duration-200
          border-3 shadow-xl
        `}
        style={{ 
          borderColor: getBorderColor(),
          borderWidth: '3px',
          boxShadow: isTargeting 
            ? `0 0 20px rgba(34, 211, 238, 0.6)` 
            : unit.isWeaknessHit
              ? `0 0 15px rgba(250, 204, 21, 0.6)`
              : unit.isDead
                ? 'none'
                : `0 0 10px ${BF_COLORS.gold}40`,
        }}
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        animate={{
          x: unit.actionState === 'attacking' ? (isPlayer ? 30 : -30) : 0,
          scale: unit.actionState === 'bb_hurt' ? 1.1 : 1,
          rotate: unit.actionState === 'hurt' || unit.actionState === 'bb_hurt' ? [-3, 3, 0] : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Frame background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${getFrameGradient()}`} />
        
        {/* Inner circle border */}
        <div className="absolute inset-1 rounded-full border border-white/10" />

        {/* Unit sprite/icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-4xl filter drop-shadow-xl"
            animate={unit.actionState === 'skill' ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
          >
            {unit.isDead ? '☠️' : ELEMENT_ICONS[unit.template.element]}
          </motion.span>
        </div>

        {/* Element indicator (top right) */}
        {!unit.isDead && (
          <motion.div 
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center border border-white/30"
            style={{ backgroundColor: ELEMENT_COLORS[unit.template.element] }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <span className="text-[8px]">
              {ELEMENT_ICONS[unit.template.element]}
            </span>
          </motion.div>
        )}

        {/* BB Ready indicator */}
        {isBbReady && !unit.isDead && (
          <motion.div 
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] border-2 z-10"
            style={{ 
              backgroundColor: '#9333ea',
              borderColor: '#c084fc',
              color: '#fff',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            BB
          </motion.div>
        )}

        {/* BB Queue indicator */}
        {unit.queuedBb && !unit.isDead && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-full border-3 border-purple-500 bg-purple-500/20"
          />
        )}
      </motion.div>

      {/* HP Bar */}
      <div className="mt-1.5 w-24">
        <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700 shadow-inner">
          <motion.div 
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(180deg, ${BF_COLORS.hpGreen} 0%, ${BF_COLORS.hpGreenDark} 100%)`,
              boxShadow: `inset 0 1px 0 ${BF_COLORS.hpGreen}, 0 0 8px ${BF_COLORS.hpGreen}60`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-0.5 px-0.5">
          <span className="text-[9px] font-mono font-bold text-green-400 drop-shadow">
            {Math.floor(unit.hp)}
          </span>
          <span className="text-[8px] text-gray-500">
            / {Math.floor(unit.maxHp)}
          </span>
        </div>
      </div>

      {/* BB Crystal Gauge - 5 crystals like BF */}
      {!unit.isDead && (
        <div className="mt-1 flex gap-0.5 items-center">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-3 rounded-sm"
                style={{
                  backgroundColor: i < filledCrystals ? BF_COLORS.bbBlue : '#1f2937',
                  boxShadow: i < filledCrystals ? `0 0 6px ${BF_COLORS.bbBlueGlow}` : 'none',
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: idx * 0.1 + i * 0.05 }}
              />
            ))}
          </div>
          {/* BB number */}
          <span className="text-[8px] text-blue-400 ml-1 font-mono">
            {unit.bbGauge}/{unit.maxBb}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Floating damage text component
function FloatingDamage({ 
  text, 
  type, 
  x, 
  y,
  delay 
}: { 
  text: string; 
  type: string; 
  x: string | number; 
  y: string | number;
  delay?: number;
}) {
  // Convert to string for style
  const xPos = typeof x === 'number' ? `${x}%` : x;
  const yPos = typeof y === 'number' ? `${y}%` : y;
  const getStyle = () => {
    switch (type) {
      case 'damage':
        return {
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)',
          fontSize: '2rem',
        };
      case 'heal':
        return {
          color: '#4ade80',
          textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(74,222,128,0.5)',
          fontSize: '1.75rem',
        };
      case 'weak':
        return {
          color: '#facc15',
          textShadow: '0 0 15px rgba(250,204,21,0.8), 0 2px 4px rgba(0,0,0,0.8)',
          fontSize: '1.5rem',
        };
      case 'bc':
        return {
          color: '#22d3ee',
          textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(34,211,238,0.5)',
          fontSize: '1.25rem',
        };
      case 'bb':
        return {
          color: '#c084fc',
          textShadow: '0 0 15px rgba(192,132,252,0.8), 0 2px 4px rgba(0,0,0,0.8)',
          fontSize: '1.25rem',
        };
      default:
        return { color: '#fff' };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.5, rotate: -10 }}
      animate={{ 
        opacity: 0, 
        y: -60, 
        scale: type === 'weak' ? 1.2 : 1,
        rotate: type === 'weak' ? 5 : 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: delay || 0 }}
      className="absolute font-black z-50 pointer-events-none"
      style={{ left: xPos, top: yPos, ...style }}
    >
      {text}
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
  const [showElementWheel, setShowElementWheel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getTurnButtonState = () => {
    if (turnState === 'player_input') {
      return {
        text: '⚔ ATTACK',
        gradient: 'from-orange-500 to-red-600',
        hover: 'hover:scale-105',
        active: 'active:scale-95',
        disabled: false,
      };
    }
    if (turnState === 'victory') {
      return {
        text: '★ VICTORY ★',
        gradient: 'from-yellow-400 to-amber-500',
        hover: '',
        active: 'animate-pulse',
        disabled: true,
      };
    }
    if (turnState === 'defeat') {
      return {
        text: '… DEFEAT …',
        gradient: 'from-gray-700 to-gray-800',
        hover: '',
        active: '',
        disabled: true,
      };
    }
    return {
      text: '…',
      gradient: 'from-gray-800 to-gray-900',
      hover: '',
      active: '',
      disabled: true,
    };
  };

  const btnState = getTurnButtonState();
  const hasBbReady = playerUnits.some(u => u.bbGauge >= u.maxBb && !u.isDead);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0f0f1a] via-[#0a0a12] to-[#050508] overflow-hidden select-none">
      {/* Top Bar - Zel & Karma & Turn */}
      <div className="h-12 flex items-center justify-between px-4 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-b-2" style={{ borderColor: `${BF_COLORS.gold}30` }}>
        <div className="flex items-center gap-6">
          {/* Zel */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-[10px]">♦</span>
            </div>
            <span className="text-sm font-bold text-yellow-400 drop-shadow">{stage?.zelReward || 0}</span>
          </div>
          {/* Karma */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-b from-pink-400 to-pink-600 flex items-center justify-center">
              <span className="text-[10px]">★</span>
            </div>
            <span className="text-sm font-bold text-pink-400 drop-shadow">0</span>
          </div>
        </div>

        {/* Turn indicator */}
        <div className="flex items-center gap-2">
          <motion.div 
            className="px-4 py-1 rounded-full border-2 font-bold text-sm"
            style={{ 
              borderColor: BF_COLORS.gold,
              backgroundColor: `${BF_COLORS.gold}20`,
              color: BF_COLORS.gold,
            }}
            animate={turnState === 'player_input' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            TURN {turnCount}
          </motion.div>
        </div>

        {/* Element wheel button */}
        <button 
          onClick={() => setShowElementWheel(!showElementWheel)}
          className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-gray-600 flex items-center justify-center text-xs"
        >
          ⚡
        </button>
      </div>

      {/* Element Wheel Popup */}
      <AnimatePresence>
        {showElementWheel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 right-4 z-40 bg-black/90 p-3 rounded-lg border-2"
            style={{ borderColor: BF_COLORS.gold }}
          >
            <div className="text-[10px] text-gray-400 mb-2 text-center">ELEMENT WEAKNESS</div>
            <div className="grid grid-cols-3 gap-1 text-[9px]">
              {Object.entries(ELEMENT_WEAKNESS).map(([elem, weak]) => (
                <div key={elem} className="flex flex-col items-center">
                  <span style={{ color: ELEMENT_COLORS[elem] }}>{ELEMENT_ICONS[elem]}</span>
                  <span className="text-gray-500">→</span>
                  <span style={{ color: ELEMENT_COLORS[weak] }}>{ELEMENT_ICONS[weak]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map((ft, i) => (
            <FloatingDamage
              key={ft.id}
              text={ft.text}
              type={ft.type}
              x={ft.x}
              y={ft.y}
              delay={i * 0.05}
            />
          ))}
        </AnimatePresence>

        {/* VS Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[150px] font-black text-[#b89947]/5 select-none tracking-tighter">VS</span>
        </div>

        {/* Enemy Row - LEFT SIDE */}
        <div className="absolute left-3 top-[15%] flex flex-col gap-4">
          <div className="text-[10px] uppercase tracking-widest ml-1" style={{ color: BF_COLORS.gold }}>ENEMY</div>
          <div className="flex flex-col gap-4">
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
                canUseBb={false}
              />
            ))}
          </div>
        </div>

        {/* Player Row - RIGHT SIDE */}
        <div className="absolute right-3 top-[15%] flex flex-col gap-4 items-end">
          <div className="text-[10px] uppercase tracking-widest mr-1" style={{ color: BF_COLORS.gold }}>YOUR UNIT</div>
          <div className="flex flex-col gap-4">
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
                canUseBb={unit.bbGauge >= unit.maxBb}
              />
            ))}
          </div>
        </div>

        {/* Combat Log */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="text-xs text-center p-2 rounded-lg bg-black/60 border" style={{ borderColor: `${BF_COLORS.gold}30` }}>
            <span className="text-gray-300">
              {combatLog[combatLog.length - 1] || 'Tap your units to queue Brave Burst!'}
            </span>
          </div>
        </div>

        {/* BB Ready indicator */}
        {hasBbReady && turnState === 'player_input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold text-sm"
            style={{
              backgroundColor: 'rgba(147, 51, 234, 0.9)',
              color: '#fff',
              boxShadow: `0 0 20px rgba(147, 51, 234, 0.6)`,
            }}
          >
            ✨ BRAVE BURST READY! ✨
          </motion.div>
        )}

        {/* ATTACK Button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <motion.button
            onClick={executeTurn}
            disabled={btnState.disabled}
            className={`
              min-w-[180px] px-10 py-4 rounded-full 
              font-bold text-sm uppercase tracking-widest
              transition-all duration-200 shadow-xl
              border-2 border-white/20
              ${btnState.gradient}
              ${btnState.hover}
              ${btnState.active}
              ${btnState.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileTap={!btnState.disabled ? { scale: 0.95 } : {}}
          >
            {btnState.text}
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
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] p-6 rounded-2xl border-2 max-w-[300px]"
              style={{ borderColor: BF_COLORS.gold }}
            >
              <h3 className="text-lg font-bold text-center mb-4" style={{ color: BF_COLORS.gold }}>
                ⚔ BATTLE GUIDE ⚔
              </h3>
              <div className="text-xs text-gray-300 space-y-2.5">
                <p>• <span style={{ color: BF_COLORS.gold }}>Tap your units</span> to queue Brave Burst</p>
                <p>• When BB gauge is <span className="text-purple-400">full</span>, tap to use it!</p>
                <p>• Tap <span style={{ color: BF_COLORS.gold }}>ATTACK</span> to execute turn</p>
                <p>• <span className="text-red-400">Fire</span> &gt; <span className="text-green-400">Earth</span> &gt; <span className="text-blue-400">Water</span> &gt; <span className="text-red-400">Fire</span></p>
                <p>• <span className="text-yellow-400">Thunder</span> &gt; <span className="text-yellow-200">Light</span> &gt; <span className="text-purple-400">Dark</span></p>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-4">Tap anywhere to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}