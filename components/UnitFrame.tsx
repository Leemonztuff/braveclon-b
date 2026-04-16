/* eslint-disable @next/next/no-img-element */
import { motion } from 'motion/react';
import { getExpForLevel } from '@/lib/gameData';

interface UnitFrameProps {
  unit?: { name: string; rarity: number; element: string; spriteUrl?: string } | null;
  spriteUrl?: string;
  rarity?: number;
  element?: string;
  level?: number;
  isSelected?: boolean;
  isInTeam?: boolean;
  isLeader?: boolean;
  bbReady?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const RARITY_COLORS = {
  5: { border: 'border-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.8)]', bg: 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500' },
  4: { border: 'border-purple-400', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.7)]', bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500' },
  3: { border: 'border-blue-400', glow: 'shadow-[0_0_12px_rgba(96,165,250,0.6)]', bg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500' },
  2: { border: 'border-green-400', glow: 'shadow-[0_0_10px_rgba(74,222,128,0.5)]', bg: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500' },
  1: { border: 'border-zinc-400', glow: 'shadow-[0_0_8px_rgba(161,161,170,0.4)]', bg: 'bg-gradient-to-br from-zinc-600 to-zinc-700' },
};

const RARITY_STAR_COLORS = {
  5: 'text-yellow-300',
  4: 'text-purple-300',
  3: 'text-blue-300',
  2: 'text-green-300',
  1: 'text-zinc-300',
};

// Minimum 44px touch target for mobile
const SIZES = {
  sm: { container: 'w-16 h-16 min-w-[44px] min-h-[44px]', sprite: '[&]:scale-[2.0]' },
  md: { container: 'w-20 h-20 min-w-[44px] min-h-[44px]', sprite: '[&]:scale-[2.5]' },
  lg: { container: 'w-24 h-24 min-w-[44px] min-h-[44px]', sprite: '[&]:scale-[3.0]' },
};

export function UnitFrame({ 
  unit,
  spriteUrl, 
  rarity: rarityProp, 
  element: elementProp, 
  level, 
  isSelected, 
  isInTeam,
  isLeader,
  bbReady,
  size = 'md',
  onClick
}: UnitFrameProps) {
  const r = (unit?.rarity ?? rarityProp ?? 1);
  const colors = RARITY_COLORS[r as keyof typeof RARITY_COLORS] || RARITY_COLORS[1];
  const s = SIZES[size];
  const finalSpriteUrl = unit?.spriteUrl ?? spriteUrl;

  return (
    <motion.button
      onClick={onClick}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={`
        relative ${s.container} rounded-xl flex items-center justify-center overflow-hidden
        ${colors.border} ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-zinc-900' : ''}
        ${onClick ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        bg-zinc-900 border-2 transition-all
        ${colors.glow}
      `}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 opacity-20 ${colors.bg}`} />
      
      {/* Main sprite */}
      {finalSpriteUrl ? (
        <img 
          src={finalSpriteUrl} 
          alt="" 
          className={`
            w-full h-full object-contain drop-shadow-lg
            ${s.sprite}
          `}
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
          EMPTY
        </div>
      )}
      
      {/* Level badge */}
      {level !== undefined && (
        <div className="absolute bottom-0.5 right-0.5 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
          Lv.{level}
        </div>
      )}
      
      {/* Leader indicator */}
      {isLeader && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg">
          L
        </div>
      )}
      
      {/* BB Ready indicator */}
      {bbReady && (
        <div className="absolute -top-2 -left-1/2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[6px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
          BB
        </div>
      )}
    </motion.button>
  );
}

interface UnitCardProps {
  spriteUrl: string;
  name: string;
  rarity: number;
  element: string;
  level: number;
  maxLevel: number;
  exp: number;
  stats: { hp: number; atk: number; def: number; rec: number };
  inTeam?: boolean;
}

export function UnitCard({ 
  spriteUrl, 
  name, 
  rarity, 
  element, 
  level, 
  maxLevel, 
  exp, 
  stats,
  inTeam
}: UnitCardProps) {
  const r = Math.min(rarity, 5);
  const colors = RARITY_COLORS[r as keyof typeof RARITY_COLORS] || RARITY_COLORS[1];
  const expPercent = maxLevel > 0 ? (exp / (level >= maxLevel ? 1 : getExpForLevel(level))) * 100 : 100;
  
  return (
    <div className={`
      relative p-3 rounded-xl border-2 bg-zinc-900 flex items-center gap-3
      ${colors.border} ${inTeam ? 'ring-1 ring-yellow-500/50' : ''}
    `}>
      {/* Unit sprite */}
      <div className={`relative w-20 h-20 ${colors.border} rounded-lg border-2 overflow-hidden bg-zinc-800`}>
        <img 
          src={spriteUrl} 
          alt={name}
          className="w-full h-full object-cover scale-[2.5] origin-[50%_20%]"
          style={{ imageRendering: 'pixelated' }}
        />
        {inTeam && (
          <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center text-[8px] font-bold text-yellow-400">
            TEAM
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">
            {'★'.repeat(Math.max(1, rarity))}
          </span>
          <span className="font-bold text-sm text-white truncate">{name}</span>
        </div>
        <div className="text-xs text-zinc-400">{element} · Lv.{level}/{maxLevel}</div>
        
        {/* Stats */}
        <div className="flex gap-2 text-[10px] font-mono mt-1">
          <span className="text-red-400">HP{stats.hp}</span>
          <span className="text-orange-400">AT{stats.atk}</span>
          <span className="text-blue-400">DF{stats.def}</span>
        </div>
      </div>
    </div>
  );
}

