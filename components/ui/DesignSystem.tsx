import { ReactNode, ButtonHTMLAttributes } from 'react';

export const COLORS = {
  primary: 'bg-amber-400',
  primaryHover: 'hover:bg-amber-300',
  primaryText: 'text-zinc-900',
  secondary: 'bg-cyan-500',
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
    base: 'border-zinc-700',
    light: 'border-zinc-600',
    accent: 'border-amber-500',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-zinc-300',
    muted: 'text-zinc-500',
    accent: 'text-amber-400',
  },
  gold: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
  },
  gem: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
  },
  energy: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
  },
  zel: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
  },
} as const;

export const RARITY = {
  1: { bg: 'bg-zinc-600', border: 'border-zinc-500', text: 'text-zinc-400', stars: 1 },
  2: { bg: 'bg-zinc-700', border: 'border-zinc-600', text: 'text-zinc-300', stars: 2 },
  3: { bg: 'bg-sky-900/50', border: 'border-sky-500', text: 'text-sky-400', stars: 3 },
  4: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-400', stars: 4 },
  5: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400', stars: 5 },
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({ 
  variant = 'secondary', 
  size = 'md', 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-bold rounded-lg transition-all touch-manipulation active:scale-95 flex items-center justify-center gap-2';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs min-h-[36px]',
    md: 'px-4 py-3 text-sm min-h-[44px]',
    lg: 'px-6 py-4 text-base min-h-[52px]',
  };
  
  const variantClasses = {
    primary: `${COLORS.primary} ${COLORS.primaryText} shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40`,
    secondary: `${COLORS.bg.elevated} ${COLORS.border.base} ${COLORS.text.secondary} hover:${COLORS.bg.hover} hover:${COLORS.text.primary}`,
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800',
    danger: `${COLORS.danger} text-white`,
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
      className={`rounded-xl border p-4 ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:border-amber-500/50 active:scale-[0.98] transition-all' : ''} ${className}`}
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
    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack} 
            className="text-zinc-400 hover:text-white p-2 bg-zinc-800 rounded-full active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ←
          </button>
        )}
        <h2 className="text-lg font-black italic text-amber-400 uppercase tracking-wider">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
      </div>
      {rightContent && <div>{rightContent}</div>}
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
