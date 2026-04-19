'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import type { PlayerState } from '@/lib/gameTypes';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="text-4xl mb-3 opacity-60">{icon}</div>}
      <h3 className="text-lg font-bold text-zinc-400 mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-500 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

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
  gothic: 'gothic-paper-gradient gothic-border-gold',
  epicGlow: 'glow-epic',
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
 * Premium Gothic Metal-style buttons with:
 * - Metallic texture gradients
 * - Ornate border effects
 * - Shine animations
 * - Touch-optimized with native-tap
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

  // Premium Gothic Metal style buttons
  const isPremium = ['gold', 'ruby', 'diamond', 'green', 'silver'].includes(variant);
  
  if (isPremium) {
    const premiumClasses = {
      gold: 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 border-2 border-amber-300 text-amber-950 metal-texture shine-effect',
      ruby: 'bg-gradient-to-b from-red-500 via-red-600 to-red-700 border-2 border-red-400 text-white metal-texture shine-effect',
      diamond: 'bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 border-2 border-sky-300 text-white metal-texture shine-effect',  
      green: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border-2 border-emerald-300 text-white metal-texture shine-effect',
      silver: 'bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 border-2 border-zinc-200 text-zinc-900 metal-texture shine-effect',
    };
    
    return (
      <button 
        className={`relative font-bold rounded-lg transition-all duration-200 native-tap active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${sizeClasses[size]} ${premiumClasses[variant as keyof typeof premiumClasses]} ${className}`}
        {...props}
      >
        <span className="relative z-10 font-black uppercase tracking-wider drop-shadow-sm">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </span>
      </button>
    );
  }

  // Regular buttons with gothic styling
  const baseClasses = 'font-bold rounded-lg transition-all native-tap active:scale-95 flex items-center justify-center gap-2 gothic-paper-gradient border border-zinc-700';
  
  const variantClasses = {
    primary: 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:border-amber-400',
    secondary: 'bg-zinc-800/80 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white',
    ghost: 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50',
    danger: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-400',
    gold: 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30',
    silver: 'bg-zinc-500/20 border-zinc-500/50 text-zinc-300 hover:bg-zinc-500/30',
    green: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30',
    ruby: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30',
    diamond: 'bg-sky-500/20 border-sky-500/50 text-sky-400 hover:bg-sky-500/30',
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
    1: { borderClass: 'gothic-border', glowClass: '', bgClass: 'gothic-paper' },
    2: { borderClass: 'gothic-border-silver', glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]', bgClass: 'gothic-paper-gradient bg-blue-900/10' },
    3: { borderClass: 'gothic-border-silver', glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]', bgClass: 'gothic-paper-gradient bg-purple-900/10' },
    4: { borderClass: 'gothic-border-amber', glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]', bgClass: 'gothic-paper-gradient bg-amber-900/20' },
    5: { borderClass: 'gothic-border-gold', glowClass: 'glow-epic', bgClass: 'gothic-paper-gradient bg-gradient-to-br from-amber-900/40 to-purple-900/40' },
  };

  const style = rarity ? rarityStyles[rarity] : rarityStyles[1];

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-lg p-4 transition-all duration-200 relative
        ${style.bgClass} ${style.borderClass} ${style.glowClass}
        ${onClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.98] native-tap' : ''}
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
    default: { bg: 'bg-zinc-900', fill: 'from-amber-600 to-amber-500', border: 'border-amber-900/50' },
    health: { bg: 'bg-red-950', fill: 'from-red-600 via-red-500 to-red-400', border: 'border-red-900/50' },
    mana: { bg: 'bg-blue-950', fill: 'from-sky-500 via-cyan-500 to-sky-400', border: 'border-sky-900/50' },
    exp: { bg: 'bg-purple-950', fill: 'from-purple-500 via-pink-500 to-purple-400', border: 'border-purple-900/50' },
    gold: { bg: 'bg-amber-950', fill: 'from-yellow-500 via-amber-500 to-orange-500', border: 'border-amber-900/50' },
  };

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-5',
  };

  const style = variantStyles[variant];

  return (
    <div className="w-full">
      <div className={`relative ${sizeStyles[size]} ${style.bg} rounded-full overflow-hidden border ${style.border}`}>
        <div 
          className={`h-full ${style.fill} bg-gradient-to-r transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 rounded-t-full" />
      </div>
      {showLabel && (
        <div className="text-xs text-amber-500/70 mt-1 text-center font-mono">
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
      <div className="flex items-center gap-3 text-xs gothic-paper px-2 py-1 rounded border border-amber-900/30">
        {zel !== undefined && (
          <span className="text-amber-400 drop-shadow-md">💰 <span className="font-bold">{zel >= 1000 ? `${(zel/1000).toFixed(1)}k` : zel}</span></span>
        )}
        {gems !== undefined && (
          <span className="text-sky-400 drop-shadow-md">💎 <span className="font-bold">{gems}</span></span>
        )}
        {energy !== undefined && (
          <span className="text-emerald-400 drop-shadow-md">⚡ <span className="font-bold">{energy}/{maxEnergy}</span></span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {zel !== undefined && (
        <div className="flex items-center gap-1.5 gothic-paper px-3 py-1.5 rounded-lg border border-amber-500/30">
          <span className="text-lg filter drop-shadow-lg">💰</span>
          <span className="text-amber-400 font-bold drop-shadow-md">{zel.toLocaleString()}</span>
        </div>
      )}
      {gems !== undefined && (
        <div className="flex items-center gap-1.5 gothic-paper px-3 py-1.5 rounded-lg border border-sky-500/30">
          <span className="text-lg filter drop-shadow-lg">💎</span>
          <span className="text-sky-400 font-bold drop-shadow-md">{gems.toLocaleString()}</span>
        </div>
      )}
      {energy !== undefined && (
        <div className="flex items-center gap-1.5 gothic-paper px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <span className="text-lg filter drop-shadow-lg">⚡</span>
          <span className="text-emerald-400 font-bold drop-shadow-md">{energy}/{maxEnergy}</span>
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
    <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/30 gothic-paper-gradient">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-amber-500/70 hover:text-amber-400 native-tap min-w-[44px] min-h-[44px] flex items-center justify-center">
            ←
          </button>
        )}
        {icon && <span className="text-2xl filter drop-shadow-lg">{icon}</span>}
        <div>
          <h1 className="text-lg font-bold text-amber-400 drop-shadow-md tracking-wide">{title}</h1>
          {subtitle && <p className="text-xs text-amber-500/50">{subtitle}</p>}
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
    <div className="flex gap-1 p-1 gothic-paper rounded-lg border border-amber-900/30">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 px-4 py-2.5 text-sm font-bold rounded-md transition-all native-tap min-h-[44px]
            ${activeTab === tab.id 
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/30' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 gothic-text'}
          `}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}