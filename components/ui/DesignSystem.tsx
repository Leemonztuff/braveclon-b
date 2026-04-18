'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import type { PlayerState } from '@/lib/gameTypes';

export const COLORS = {
  primary: 'bg-amber-400',
  primaryHover: 'hover:bg-amber-300',
  primaryText: 'text-zinc-900',
  secondary: 'bg-zinc-800',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-yellow-500',
  bg: {
    base: 'bg-zinc-950',
    elevated: 'bg-zinc-900',
    surface: 'bg-zinc-800',
    hover: 'bg-zinc-700',
  },
  border: {
    base: 'border-zinc-800',
    light: 'border-zinc-700',
    accent: 'border-amber-500/50',
  },
  text: {
    primary: 'text-zinc-100',
    secondary: 'text-zinc-400',
    muted: 'text-zinc-500',
    accent: 'text-amber-400',
  },
  gold: {
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
  },
  gem: {
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    text: 'text-sky-400',
  },
  energy: {
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-400',
  },
  zel: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
} as const;

export const EFFECTS = {
  glass: 'backdrop-blur-md bg-zinc-900/60 border-zinc-800/50',
  glassElevated: 'backdrop-blur-lg bg-zinc-800/40 border-zinc-700/30',
  glowAmber: 'shadow-[0_0_15px_rgba(251,191,36,0.15)]',
  glowEmerald: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]',
};

export const RARITY = {
  1: { bg: 'bg-zinc-600', border: 'border-zinc-500', text: 'text-zinc-400', stars: 1 },
  2: { bg: 'bg-zinc-700', border: 'border-zinc-600', text: 'text-zinc-300', stars: 2 },
  3: { bg: 'bg-sky-900/50', border: 'border-sky-500', text: 'text-sky-400', stars: 3 },
  4: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-400', stars: 4 },
  5: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400', stars: 5 },
} as const;

// ============================================================================
// HEARTHSTONE-STYLE BUTTONS - Premium RPG/CG Style
// ============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'silver' | 'green' | 'ruby' | 'diamond';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
  rarity?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Premium HearthStone-style buttons with:
 * - Multi-layer gradient textures
 * - Foil/reflection effects  
 * - Rarity-based glow animations
 * - Premium card game aesthetic
 */
export function Button({ 
  variant = 'secondary', 
  size = 'md', 
  icon, 
  children, 
  className = '', 
  rarity,
  ...props 
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-8 py-4 text-base min-h-[56px]',
  };

  // Premium HearthStone style buttons (simplified for compatibility)
  const isPremium = ['gold', 'ruby', 'diamond', 'green', 'silver'].includes(variant);
  
  if (isPremium) {
    const premiumClasses = {
      gold: 'bg-gradient-to-b from-yellow-500 via-amber-500 to-amber-700 border-t-yellow-400 border-b-amber-800 text-black',
      ruby: 'bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-t-red-400 border-b-red-900 text-white',
      diamond: 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 border-t-sky-300 border-b-blue-900 text-white',  
      green: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 border-t-emerald-300 border-b-emerald-900 text-white',
      silver: 'bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 border-t-zinc-200 border-b-zinc-800 text-black',
    };
    
    return (
      <button 
        className={`relative font-bold rounded-xl transition-all duration-200 touch-manipulation active:scale-95 flex items-center justify-center gap-2 shadow-lg ${sizeClasses[size]} ${premiumClasses[variant as keyof typeof premiumClasses]} ${className}`}
        {...props}
      >
        <span className="relative z-10 font-black uppercase tracking-wider drop-shadow-md">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </span>
      </button>
    );
  }

  // Regular buttons
  const baseClasses = 'font-bold rounded-lg transition-all touch-manipulation active:scale-95 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: `${COLORS.primary} ${COLORS.primaryText} shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40`,
    secondary: `${COLORS.bg.elevated} ${COLORS.border.base} ${COLORS.text.secondary} hover:${COLORS.bg.hover} hover:${COLORS.text.primary}`,
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800',
    danger: `${COLORS.danger} text-white`,
    gold: `${COLORS.primary} ${COLORS.primaryText}`,
    silver: 'bg-zinc-300 text-zinc-800',
    green: 'bg-emerald-500 text-white',
    ruby: 'bg-red-600 text-white',
    diamond: 'bg-sky-500 text-white',
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}

// ============================================================================
// RPG CARD COMPONENT - Premium card style
// ============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  rarity?: 1 | 2 | 3 | 4 | 5;
}

export function Card({ children, className = '', onClick, rarity }: CardProps) {
  const rarityStyles = {
    1: { border: 'border-zinc-600', glow: 'shadow-none', bg: 'bg-zinc-800' },
    2: { border: 'border-blue-500/40', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]', bg: 'bg-blue-900/20' },
    3: { border: 'border-purple-500/40', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]', bg: 'bg-purple-900/20' },
    4: { border: 'border-amber-500/50', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]', bg: 'bg-amber-900/20' },
    5: { border: 'border-amber-400', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]', bg: 'bg-gradient-to-br from-amber-900/40 to-purple-900/40' },
  };

  const style = rarity ? rarityStyles[rarity] : rarityStyles[1];

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-xl border-2 p-4 transition-all duration-200
        ${style.border} ${style.glow} ${style.bg}
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="text-xs text-zinc-400 uppercase tracking-wide">{label}</label>}
      <input 
        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
        {...props}
      />
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'rare' | 'epic' | 'legendary';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-zinc-700 text-zinc-300 border-zinc-600',
    success: 'bg-emerald-900/50 text-emerald-400 border-emerald-600',
    warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-600',
    danger: 'bg-red-900/50 text-red-400 border-red-600',
    info: 'bg-sky-900/50 text-sky-400 border-sky-600',
    rare: 'bg-blue-900/50 text-blue-400 border-blue-500',
    epic: 'bg-purple-900/50 text-purple-400 border-purple-500',
    legendary: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-amber-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ============================================================================
// PROGRESS BAR - RPG Style
// ============================================================================

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'health' | 'mana' | 'exp' | 'gold';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({ value, max = 100, variant = 'default', showLabel = false, size = 'md' }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantStyles = {
    default: { bg: 'bg-zinc-800', fill: 'from-cyan-500 to-blue-500' },
    health: { bg: 'bg-red-900/30', fill: 'from-red-500 via-red-400 to-green-500' },
    mana: { bg: 'bg-blue-900/30', fill: 'from-blue-400 via-cyan-400 to-sky-500' },
    exp: { bg: 'bg-purple-900/30', fill: 'from-purple-400 via-pink-400 to-purple-600' },
    gold: { bg: 'bg-amber-900/30', fill: 'from-yellow-400 via-amber-500 to-orange-500' },
  };

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const style = variantStyles[variant];

  return (
    <div className="w-full">
      <div className={`relative ${sizeStyles[size]} ${style.bg} rounded-full overflow-hidden border border-white/10`}>
        <div 
          className={`h-full ${style.fill} bg-gradient-to-r transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 rounded-t-full" />
      </div>
      {showLabel && (
        <div className="text-xs text-zinc-400 mt-1 text-center font-mono">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CURRENCY DISPLAY
// ============================================================================

interface CurrencyDisplayProps {
  zel?: number;
  gems?: number;
  energy?: number;
  maxEnergy?: number;
  compact?: boolean;
}

export function CurrencyDisplay({ zel, gems, energy, maxEnergy, compact }: CurrencyDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        {zel !== undefined && (
          <span className="text-amber-400">💰 {zel >= 1000 ? `${(zel/1000).toFixed(1)}k` : zel}</span>
        )}
        {gems !== undefined && (
          <span className="text-sky-400">💎 {gems}</span>
        )}
        {energy !== undefined && (
          <span className="text-emerald-400">⚡ {energy}/{maxEnergy}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {zel !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className="text-xl">💰</span>
          <span className="text-amber-400 font-bold">{zel.toLocaleString()}</span>
        </div>
      )}
      {gems !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className="text-xl">💎</span>
          <span className="text-sky-400 font-bold">{gems.toLocaleString()}</span>
        </div>
      )}
      {energy !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className="text-xl">⚡</span>
          <span className="text-emerald-400 font-bold">{energy}/{maxEnergy}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TOP BAR COMPONENT
// ============================================================================

interface TopBarProps {
  state: PlayerState;
  onNavigate?: (screen: string) => void;
}

export function TopBar({ state, onNavigate }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/80 border-b border-zinc-800/50 backdrop-blur">
      <div className="flex items-center gap-4">
        <CurrencyDisplay 
          zel={state.zel} 
          gems={state.gems} 
          energy={state.energy}
          maxEnergy={state.maxEnergy}
          compact
        />
      </div>
      {state.playerLevel !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Lv.</span>
          <span className="text-sm font-bold text-amber-400">{state.playerLevel}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  rightContent?: ReactNode;
}

export function Header({ title, icon, subtitle, onBack, actions, rightContent }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white">
            ←
          </button>
        )}
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {rightContent}
      </div>
    </div>
  );
}

// ============================================================================
// TABS COMPONENT
// ============================================================================

interface TabsProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${activeTab === tab.id 
              ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
          `}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}