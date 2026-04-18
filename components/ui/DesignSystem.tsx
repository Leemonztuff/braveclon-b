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

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'silver' | 'green' | 'classic';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
}

const HS_STYLES = {
  classic: {
    wrapper: 'bg-gradient-to-b from-[#9b7ba8] via-[#6f4a7b] to-[#3d2a4a]',
    border: 'border-t-[#bc8cc8] border-b-[#2a1a3a]',
    inner: 'bg-gradient-to-b from-[#d49fe8] via-[#9b5bb8] to-[#5a2a6a]',
    text: 'text-white',
  },
  gold: {
    wrapper: 'bg-gradient-to-b from-[#d4a01c] via-[#a07810] to-[#5a4010]',
    border: 'border-t-[#f4c02c] border-b-[#3a2808]',
    inner: 'bg-gradient-to-b from-[#f4c82c] via-[#c09020] to-[#705010]',
    text: 'text-white',
  },
  silver: {
    wrapper: 'bg-gradient-to-b from-[#9a9aa8] via-[#6a6a78] to-[#3a3a48]',
    border: 'border-t-[#bcbcc8] border-b-[#282830]',
    inner: 'bg-gradient-to-b from-[#d4d4e8] via-[#909098] to-[#505058]',
    text: 'text-white',
  },
  green: {
    wrapper: 'bg-gradient-to-b from-[#40a878] via-[#287848] to-[#184828]',
    border: 'border-t-[#50c898] border-b-[#083018]',
    inner: 'bg-gradient-to-b from-[#60e898] via-[#38a868] to-[#186838]',
    text: 'text-white',
  },
  primary: {
    wrapper: 'bg-gradient-to-b from-amber-500 to-amber-700',
    border: 'border-t-amber-300 border-b-amber-800',
    inner: 'bg-gradient-to-b from-yellow-400 via-amber-400 to-amber-600',
    text: 'text-amber-900',
  },
};

export function Button({ 
  variant = 'secondary', 
  size = 'md', 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-bold rounded-lg transition-all touch-manipulation active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs min-h-[36px]',
    md: 'px-4 py-3 text-sm min-h-[44px]',
    lg: 'px-6 py-4 text-base min-h-[52px]',
  };

  // HearthStone style buttons
  if (['classic', 'gold', 'silver', 'green', 'primary'].includes(variant)) {
    const hs = HS_STYLES[variant as keyof typeof HS_STYLES];
    return (
      <button 
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {/* Wrapper - top/bottom borders */}
        <span className={`absolute inset-x-0 top-0 bottom-0 rounded-lg border-t-2 border-b-2 ${hs.border} ${hs.wrapper}`} />
        {/* Inner gradient */}
        <span className={`absolute inset-x-0 top-0 bottom-0 rounded-md mx-0.5 my-0.5 ${hs.inner}`} />
        {/* Text */}
        <span className={`relative z-10 font-bold uppercase tracking-wider ${hs.text} drop-shadow-md`}>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </span>
      </button>
    );
  }

  // Regular buttons
  const variantClasses = {
    primary: `${COLORS.primary} ${COLORS.primaryText} shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40`,
    secondary: `${COLORS.bg.elevated} ${COLORS.border.base} ${COLORS.text.secondary} hover:${COLORS.bg.hover} hover:${COLORS.text.primary}`,
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800',
    danger: `${COLORS.danger} text-white`,
    gold: `${COLORS.primary} ${COLORS.primaryText}`,
    silver: 'bg-zinc-300 text-zinc-800',
    green: 'bg-emerald-500 text-white',
    classic: 'bg-purple-600 text-white',
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

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'gold';
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const variantClasses = {
    default: `${COLORS.bg.elevated} ${COLORS.border.base}`,
    elevated: `${COLORS.bg.surface} ${COLORS.border.light}`,
    gold: `${COLORS.gold.bg} ${COLORS.gold.border}`,
  };

  return (
    <div 
      className={`
        rounded-xl border p-4 transition-all duration-200
        ${variantClasses[variant]} 
        ${onClick ? 'cursor-pointer hover:border-amber-500/50 hover:bg-zinc-800/80 active:scale-[0.98] active:bg-zinc-800' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface TabProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabProps) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 py-2.5 text-xs font-bold rounded-md transition-all min-h-[44px]
            ${activeTab === tab.id 
              ? `${COLORS.primary} ${COLORS.primaryText}` 
              : `${COLORS.bg.elevated} ${COLORS.text.muted} hover:${COLORS.text.primary}`
            }
          `}
        >
          {tab.icon && <span className="mr-1">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface HeaderProps {
  title: string;
  icon?: string;
  onBack?: () => void;
  rightContent?: ReactNode;
}

export function Header({ title, icon, onBack, rightContent }: HeaderProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-4 border-b ${EFFECTS.glass} sticky top-0 z-20`}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack} 
            className="text-zinc-400 hover:text-white p-2.5 bg-zinc-800/80 rounded-xl active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center border border-zinc-700/50"
          >
            ←
          </button>
        )}
        <div>
          <h2 className="text-xl font-black italic text-amber-400 uppercase tracking-widest flex items-center gap-2">
            {icon && <span className="opacity-80 grayscale-[0.5]">{icon}</span>}
            {title}
          </h2>
          <div className="h-0.5 w-1/2 bg-gradient-to-r from-amber-400 to-transparent mt-0.5" />
        </div>
      </div>
      {rightContent && <div className="animate-fadeIn">{rightContent}</div>}
    </div>
  );
}

interface CurrencyDisplayProps {
  gems?: number;
  zel?: number;
  energy?: { current: number; max: number };
}

export function CurrencyDisplay({ gems, zel, energy }: CurrencyDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      {energy && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${COLORS.energy.bg} ${COLORS.energy.border} border`}>
          <span>⚡</span>
          <span className={`text-sm font-bold ${COLORS.energy.text}`}>
            {energy.current}/{energy.max}
          </span>
        </div>
      )}
      {zel !== undefined && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${COLORS.zel.bg} ${COLORS.zel.border} border`}>
          <span>💰</span>
          <span className={`text-sm font-bold ${COLORS.zel.text}`}>
            {zel.toLocaleString()}
          </span>
        </div>
      )}
      {gems !== undefined && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${COLORS.gem.bg} ${COLORS.gem.border} border`}>
          <span>💎</span>
          <span className={`text-sm font-bold ${COLORS.gem.text}`}>
            {gems}
          </span>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-bold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
