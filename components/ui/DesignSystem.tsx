'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

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

  // Premium HearthStone style buttons
  const isPremium = ['gold', 'ruby', 'diamond', 'green', 'silver'].includes(variant);
  
  if (isPremium) {
    return (
      <button 
        className={`relative font-bold rounded-xl transition-all duration-200 touch-manipulation active:scale-95 flex items-center justify-center gap-2 ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {/* === HS-GLADER BUTTON === */}
        <div className="relative flex items-center justify-center w-full h-full">
          
          {/* LAYER 1: Outer frame/border - creates depth */}
          <div className="absolute inset-0 rounded-xl" 
            style={{
              background: variant === 'gold' ? 'linear-gradient(135deg, #f4c430 0%, #b8860b 50%, #8b6914 100%)' :
                       variant === 'ruby' ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #922b21 100%)' :
                       variant === 'diamond' ? 'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #1a5276 100%)' :
                       variant === 'green' ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #1e8449 100%)' :
                       'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 50%, #7f8c8d 100%)',
              boxShadow: variant === 'gold' ? '0 4px 15px rgba(244,196,48,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' :
                       variant === 'ruby' ? '0 4px 15px rgba(231,76,60,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' :
                       variant === 'diamond' ? '0 4px 15px rgba(52,152,219,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' :
                       variant === 'green' ? '0 4px 15px rgba(46,204,113,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' :
                       '0 4px 15px rgba(189,195,199,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          />
          
          {/* LAYER 2: Inner shine - top highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl opacity-30"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
            }}
          />
          
          {/* LAYER 3: Main button face */}
          <div 
            className="absolute inset-0.5 -top-0.5 rounded-lg mx-0.5"
            style={{
              background: variant === 'gold' ? 'linear-gradient(180deg, #f9d423 0%, #f39c12 50%, #d68910 100%)' :
                       variant === 'ruby' ? 'linear-gradient(180deg, #e74c3c 0%, #d62c1a 50%, #a93226 100%)' :
                       variant === 'diamond' ? 'linear-gradient(180deg, #5dade2 0%, #3498db 50%, #2471a3 100%)' :
                       variant === 'green' ? 'linear-gradient(180deg, #58d68d 0%, #2ecc71 50%, #239e56 100%)' :
                       'linear-gradient(180deg, #ecf0f1 0%, #bdc3c7 50%, #95a5a6 100%)',
              boxShadow: variant === 'gold' ? 'inset 0 -4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)' :
                       variant === 'ruby' ? 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)' :
                       variant === 'diamond' ? 'inset 0 -4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)' :
                       variant === 'green' ? 'inset 0 -4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)' :
                       'inset 0 -4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          
          {/* LAYER 4: Text highlight/shimmer */}
          <div 
            className="absolute inset-x-0 top-0 h-1/3 rounded-t-md opacity-50"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)'
            }}
          />
          
          {/* LAYER 5: Gem/emblem decoration */}
          {['gold', 'ruby', 'diamond', 'green'].includes(variant) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
              style={{
                background: variant === 'gold' ? 'radial-gradient(circle at 30% 30%, #f4d92c, #b8860b, #8b6508)' :
                         variant === 'ruby' ? 'radial-gradient(circle at 30% 30%, #ec7063, #c0392b, #922b21)' :
                         variant === 'diamond' ? 'radial-gradient(circle at 30% 30%, #85c1e9, #3498db, #1a5276)' :
                         'radial-gradient(circle at 30% 30%, #82e0aa, #27ae60, #1e8449)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)'
              }}
            />
          )}
          
          {/* LAYER 6: Button text */}
          <span 
            className="relative z-10 font-black uppercase tracking-[0.15em] drop-shadow-lg"
            style={{
              color: variant === 'ruby' ? '#fdfefe' : 
                     variant === 'diamond' ? '#fdfefe' : '#1a1a2e',
              textShadow: variant === 'gold' ? '0 2px 4px rgba(139,69,19,0.5)' :
                         variant === 'ruby' ? '0 2px 4px rgba(0,0,0,0.5)' :
                         variant === 'diamond' ? '0 2px 4px rgba(0,0,0,0.5)' :
                         '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: size === 'sm' ? '0.65rem' : size === 'lg' ? '1.1rem' : '0.8rem',
            }}
          >
            {icon && <span className="mr-2" style={{ fontSize: '1.1em' }}>{icon}</span>}
            {children}
          </span>
        </div>
        
        {/* === ANIMATED FOIL EFFECT (subtle shimmer) === */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 25%, transparent 50%, rgba(255,255,255,0.4) 75%, transparent 100%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 3s infinite linear'
            }}
          />
        </div>
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
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export function Header({ title, icon, subtitle, onBack, actions }: HeaderProps) {
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
      {actions && <div className="flex items-center gap-2">{actions}</div>}
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