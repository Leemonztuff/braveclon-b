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
    wrapper: 'bg-gradient-to-b from-[#c1b3b0] to-[#1c140d] border-t-[#AD9A90] border-b-[#1c140d]',
    border: 'bg-gradient-to-b from-[#f756fe] via-[#c84bd6] to-[#661f91] shadow-[0_2px_6px_#331e0b]',
    text: 'bg-gradient-to-b from-[#bc22c7] via-[#7c1693] to-[#5c1096]',
    textHover: 'bg-gradient-to-b from-[#e235ee] via-[#981cb4] to-[#661f91]',
  },
  gold: {
    wrapper: 'bg-gradient-to-b from-[#d8be52] to-[#1c140d] border-t-[#d8be52] border-b-[#1c140d]',
    border: 'bg-gradient-to-b from-[#d8be52] via-[#d5b631] to-[#362c26] shadow-[0_2px_6px_#362c26]',
    text: 'bg-gradient-to-b from-[#edca37] via-[#a77d33] to-[#5f3f1d]',
    textHover: 'bg-gradient-to-b from-[#fed83b] via-[#dba23e] to-[#9d6224]',
  },
  silver: {
    wrapper: 'bg-gradient-to-b from-[#d8be52] to-[#1c140d] border-t-[#d8be52] border-b-[#1c140d]',
    border: 'bg-gradient-to-b from-[#bfcce6] via-[#a1b9e8] to-[#3a4663] shadow-[0_2px_6px_#3a4663]',
    text: 'bg-gradient-to-b from-[#b6c2dd] via-[#838da5] to-[#43506e]',
    textHover: 'bg-gradient-to-b from-[#cfdbf5] via-[#a3afcc] to-[#697da9]',
  },
  green: {
    wrapper: 'bg-gradient-to-b from-[#d8be52] to-[#1c140d] border-t-[#d8be52] border-b-[#1c140d]',
    border: 'bg-gradient-to-b from-[#18e9d5] via-[#13bcab] to-[#014640] shadow-[0_2px_6px_#014640]',
    text: 'bg-gradient-to-b from-[#05c4b2] via-[#009688] to-[#015f57]',
    textHover: 'bg-gradient-to-b from-[#18e9d5] via-[#05a193] to-[#028277]',
  },
  classicPlain: {
    wrapper: 'bg-gradient-to-b from-[#c1b3b0] to-[#1c140d] border-t-[#AD9A90] border-b-[#1c140d]',
    border: 'bg-gradient-to-b from-[#f756fe] via-[#c84bd6] to-[#661f91]',
    text: 'from-[#e235ee] via-[#981cb4] to-[#661f91]',
    textHover: 'from-[#e235ee] via-[#981cb4] to-[#661f91]',
  },
  primary: {
    wrapper: 'bg-gradient-to-b from-amber-400 to-amber-600 border-t-amber-300 border-b-amber-700',
    border: 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600',
    text: 'from-yellow-100 via-amber-200 to-amber-500',
    textHover: 'from-white via-yellow-200 to-amber-400',
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
    const hs = HS_STYLES[variant === 'primary' ? 'primary' : 'classicPlain'];
    return (
      <button 
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {/* Wrapper layer */}
        <span className={`absolute inset-0 rounded-lg border-t-2 border-b-2 ${hs.wrapper}`} />
        {/* Border layer */}
        <span className={`absolute inset-0.5 rounded-md ${hs.border}`} />
        {/* Text layer */}
        <span className={`relative z-10 bg-gradient-to-b ${hs.text} bg-clip-text text-transparent font-bold uppercase tracking-wider drop-shadow-md`}>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </span>
        {/* Hover glow effect */}
        <span className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
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
