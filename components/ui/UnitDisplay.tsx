/* eslint-disable @next/next/no-img-element */
import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { COLORS, BORDERS, SIZES, ANIMATION } from '@/lib/design-tokens';
import { ELEMENT_ICONS } from '@/lib/gameData';
import { StatBar } from './StatBar';

interface UnitDisplayProps {
  spriteUrl?: string;
  name?: string;
  rarity?: number;
  element?: string;
  level?: number;
  maxLevel?: number;
  hp?: number;
  maxHp?: number;
  bbGauge?: number;
  maxBb?: number;
  isDead?: boolean;
  isLeader?: boolean;
  isInTeam?: boolean;
  bbReady?: boolean;
  isQueuedBb?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'frame' | 'portrait' | 'compact' | 'fullbody';
  showStats?: boolean;
  showElement?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onTouchStart?: (e?: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  onTouchMove?: (e?: React.TouchEvent) => void;
  onTouchCancel?: () => void;
  interactive?: boolean;
  className?: string;
}

// Minimum 44px touch target for mobile
const SIZE_MAP = {
  xs: { container: 'w-11 h-11 min-w-[44px] min-h-[44px]', sprite: '[&]:scale-[1.5]' },
  sm: { container: 'w-12 h-12 min-w-[44px] min-h-[44px]', sprite: '[&]:scale-[2.0]' },
  md: { container: 'w-16 h-16', sprite: '[&]:scale-[2.5]' },
  lg: { container: 'w-20 h-20', sprite: '[&]:scale-[3.0]' },
  xl: { container: 'w-24 h-24', sprite: '[&]:scale-[3.5]' },
  '2xl': { container: 'w-32 h-32', sprite: '[&]:scale-[4.0]' },
  '3xl': { container: 'w-40 h-40', sprite: '[&]:scale-[4.5]' },
  full: { container: 'w-full h-full', sprite: '[&]:scale-[1]' },
};

const RARITY_COLORS = {
  1: COLORS.rarity[1],
  2: COLORS.rarity[2],
  3: COLORS.rarity[3],
  4: COLORS.rarity[4],
  5: COLORS.rarity[5],
};

const RARITY_GLOW = {
  1: COLORS.rarityGlow[1],
  2: COLORS.rarityGlow[2],
  3: COLORS.rarityGlow[3],
  4: COLORS.rarityGlow[4],
  5: COLORS.rarityGlow[5],
};

export function UnitDisplay({
  spriteUrl,
  name,
  rarity = 1,
  element,
  level,
  maxLevel,
  hp,
  maxHp,
  bbGauge = 0,
  maxBb = 100,
  isDead = false,
  isLeader = false,
  isInTeam = false,
  bbReady = false,
  isQueuedBb = false,
  size = 'md',
  variant = 'frame',
  showStats = false,
  showElement = false,
  onClick,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
  interactive = false,
  className = ''
}: UnitDisplayProps) {
  const r = Math.min(rarity, 5);
  const sizeClasses = SIZE_MAP[size];
  const rarityColor = RARITY_COLORS[r as keyof typeof RARITY_COLORS];
  const rarityGlow = RARITY_GLOW[r as keyof typeof RARITY_GLOW];

  // Touch event handlers for long press
  const handleTouchStartInternal = (e: React.TouchEvent) => {
    onTouchStart?.(e);
  };
  const handleTouchMoveInternal = (e: React.TouchEvent) => {
    onTouchMove?.(e);
  };

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={onClick}
        onTouchStart={handleTouchStartInternal}
        onTouchEnd={onTouchEnd}
        onTouchMove={handleTouchMoveInternal}
        onTouchCancel={onTouchCancel}
        whileTap={onClick && interactive ? { scale: 0.95 } : undefined}
        className={`
          relative ${sizeClasses.container} ${BORDERS.radius.md} border-2 overflow-hidden flex items-center justify-center
          ${rarityColor} ${onClick ? 'cursor-pointer active:brightness-110' : ''}
          ${isDead ? 'opacity-50 grayscale' : ''}
          bg-zinc-900 transition-all touch-manipulation select-none
          ${isQueuedBb ? rarityGlow : ''}
          ${className}
        `}
        disabled={!onClick}
      >
        <img 
          src={spriteUrl} 
          alt={name}
          className={`w-full h-full object-contain ${sizeClasses.sprite}`}
          style={{ imageRendering: 'pixelated' }}
        />
      </motion.button>
    );
  }

  if (variant === 'portrait') {
    return (
      <motion.button
        onClick={onClick}
        onTouchStart={handleTouchStartInternal}
        onTouchEnd={onTouchEnd}
        onTouchMove={handleTouchMoveInternal}
        onTouchCancel={onTouchCancel}
        whileTap={onClick && interactive ? { scale: 0.95 } : undefined}
        className={`
          relative ${sizeClasses.container} ${BORDERS.radius.lg} border-2 overflow-hidden flex items-center justify-center
          ${rarityColor} ${onClick ? 'cursor-pointer active:brightness-110' : ''}
          ${isDead ? 'opacity-50 grayscale' : ''}
          bg-zinc-900 transition-all touch-manipulation select-none
          ${isQueuedBb ? rarityGlow : ''}
          ${className}
        `}
        disabled={!onClick}
      >
        <img 
          src={spriteUrl} 
          alt={name}
          className={`w-full h-full object-cover ${sizeClasses.sprite} origin-[50%_20%]`}
          style={{ imageRendering: 'pixelated' }}
        />
        {showElement && (
          <div className="absolute bottom-1 right-1 text-[8px]">
            {ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}
          </div>
        )}
      </motion.button>
    );
  }

  if (variant === 'fullbody') {
    return (
      <motion.button
        onClick={onClick}
        onTouchStart={handleTouchStartInternal}
        onTouchEnd={onTouchEnd}
        onTouchMove={handleTouchMoveInternal}
        onTouchCancel={onTouchCancel}
        whileTap={onClick && interactive ? { scale: 0.95 } : undefined}
        disabled={!onClick}
        className={`
          relative ${sizeClasses.container} ${BORDERS.radius.xl} border-2 overflow-hidden
          ${rarityColor} ${rarityGlow} ${onClick ? 'cursor-pointer active:brightness-110' : ''}
          bg-zinc-900 transition-all touch-manipulation select-none
          ${className}
        `}
      >
        <div className={`absolute inset-0 opacity-15 ${
          r === 5 ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500' :
          r === 4 ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500' :
          r === 3 ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500' :
          r === 2 ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500' :
          'bg-gradient-to-br from-zinc-600 to-zinc-700'
        }`} />
        <img 
          src={spriteUrl} 
          alt={name}
          className={`w-full h-full object-contain ${sizeClasses.sprite} origin-bottom`}
          style={{ imageRendering: 'pixelated' }}
        />
        {showElement && (
          <div className={`absolute top-2 left-2 ${COLORS.element[element as keyof typeof COLORS.element] || 'text-zinc-400'}`}>
            {ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}
          </div>
        )}
        {level !== undefined && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
            Lv.{level}
          </div>
        )}
      </motion.button>
    );
  }

  // Frame variant (default)
  return (
    <motion.button
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={handleTouchStartInternal}
      onTouchEnd={onTouchEnd}
      onTouchMove={handleTouchMoveInternal}
      onTouchCancel={onTouchCancel}
      whileTap={onClick && interactive ? { scale: 0.95 } : undefined}
      className={`
        relative ${sizeClasses.container} ${BORDERS.radius.lg} border-2 overflow-hidden flex flex-col items-center justify-center
        ${rarityColor} ${isQueuedBb ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-zinc-900' : ''}
        ${onClick && interactive ? 'cursor-pointer active:brightness-110' : 'cursor-default'}
        ${isDead ? 'opacity-50 grayscale' : ''}
        bg-zinc-900 border-2 transition-all touch-manipulation select-none
        ${rarityGlow}
        ${className}
      `}
      disabled={!onClick}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 opacity-10 ${
        r === 5 ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500' :
        r === 4 ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500' :
        r === 3 ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500' :
        r === 2 ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500' :
        'bg-gradient-to-br from-zinc-600 to-zinc-700'
      }`} />

      {/* Main sprite */}
      <img 
        src={spriteUrl} 
        alt={name}
        className={`w-full h-full object-contain ${sizeClasses.sprite}`}
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Level badge */}
      {level !== undefined && (
        <div className="absolute bottom-0.5 right-0.5 bg-black/70 px-1 py-0.5 rounded text-[8px] font-bold text-white">
          Lv.{level}
        </div>
      )}

      {/* Leader badge */}
      {isLeader && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg z-10">
          L
        </div>
      )}

      {/* Team badge */}
      {isInTeam && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] font-bold text-black z-10">
          ✓
        </div>
      )}

      {/* BB Ready indicator */}
      {bbReady && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[6px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
          BB
        </div>
      )}

      {/* Stats (HP + BB) */}
      {showStats && (hp !== undefined || bbGauge !== undefined) && (
        <div className="absolute -bottom-8 left-0 right-0 flex flex-col gap-0.5">
          {hp !== undefined && maxHp !== undefined && (
            <StatBar current={hp} max={maxHp} type="hp" size="sm" compact />
          )}
          {bbGauge !== undefined && (
            <StatBar current={bbGauge} max={maxBb} type="bb" size="sm" compact />
          )}
        </div>
      )}

      {/* Element badge */}
      {showElement && (
        <div className="absolute -bottom-3 bg-zinc-900/80 border border-zinc-700 text-[8px] font-bold px-1.5 py-0.5 rounded text-zinc-300 backdrop-blur-sm flex items-center gap-1">
          <span>{ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}</span>
          <span>{element}</span>
        </div>
      )}
    </motion.button>
  );
}

interface UnitCardProps {
  spriteUrl?: string;
  name?: string;
  rarity?: number;
  element?: string;
  level?: number;
  maxLevel?: number;
  exp?: number;
  stats?: { hp: number; atk: number; def: number; rec: number };
  inTeam?: boolean;
  onClick?: () => void;
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
  inTeam,
  onClick
}: UnitCardProps) {
  const expPercent = (maxLevel || 1) > 0 ? ((exp || 0) / ((level || 1) >= (maxLevel || 1) ? 1 : (level || 1) * 100)) * 100 : 100;
  const rarityColor = RARITY_COLORS[Math.min(rarity || 1, 5) as keyof typeof RARITY_COLORS];

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-3 rounded-xl border-2 bg-zinc-900 flex items-center gap-3
        ${rarityColor} ${inTeam ? 'ring-1 ring-yellow-500/50' : ''}
        ${onClick ? 'cursor-pointer hover:border-zinc-500' : ''}
        transition-all
      `}
    >
      <UnitDisplay
        spriteUrl={spriteUrl}
        name={name}
        rarity={rarity}
        element={element}
        size="md"
        variant="portrait"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">
            {'★'.repeat(Math.max(1, rarity || 1))}
          </span>
          <span className="font-bold text-sm text-white truncate">{name || 'Unknown'}</span>
        </div>
        <div className="text-xs text-zinc-400">{element || ''} · Lv.{level}/{maxLevel || 1}</div>
        
        <div className="flex gap-2 text-[10px] font-mono mt-1">
          <span className="text-red-400">HP{stats?.hp}</span>
          <span className="text-orange-400">AT{stats?.atk}</span>
          <span className="text-blue-400">DF{stats?.def}</span>
        </div>
      </div>
    </div>
  );
}