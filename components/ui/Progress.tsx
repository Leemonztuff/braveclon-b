import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'health' | 'mana' | 'exp';
  showLabel?: boolean;
  style?: 'default' | 'rpg';
}

const RPGBAR_STYLES = {
  health: {
    bg: 'bg-gradient-to-b from-[#c1b3b0] to-[#1c140d]',
    fill: 'bg-gradient-to-b from-[#5cba1c] via-[#469216] to-[#2d620d]',
    glow: 'shadow-[0_0_10px_#5cba1c]',
    inner: 'bg-gradient-to-b from-[#8ce85c] via-[#5cba1c] to-[#2d620d]',
  },
  mana: {
    bg: 'bg-gradient-to-b from-[#1c2a4a] to-[#0a1020]',
    fill: 'bg-gradient-to-b from-[#3c7cba] via-[#2c5c8a] to-[#1c3c5a]',
    glow: 'shadow-[0_0_10px_#3c7cba]',
    inner: 'bg-gradient-to-b from-[#6cacfc] via-[#3c7cba] to-[#1c3c5a]',
  },
  exp: {
    bg: 'bg-gradient-to-b from-[#5c4a1a] to-[#2c1a0a]',
    fill: 'bg-gradient-to-b from-[#d4a01c] via-[#a47c16] to-[#645010]',
    glow: 'shadow-[0_0_10px_#d4a01c]',
    inner: 'bg-gradient-to-b from-[#f4c41c] via-[#d4a01c] to-[#645010]',
  },
  healthDark: {
    bg: 'bg-gradient-to-b from-[#3a2a20] to-[#1a1008]',
    fill: 'bg-gradient-to-b from-[#4c8a1c] via-[#2c680c] to-[#1c4808]',
    glow: 'shadow-[0_0_8px_#4c8a1c]',
    inner: 'from-[#6ca83c] to-[#1c4808]',
  },
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, variant = 'default', showLabel = false, style = 'default', className, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantStyles = {
      default: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      success: 'bg-gradient-to-r from-emerald-500 to-green-500',
      warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
      danger: 'bg-gradient-to-r from-red-500 to-rose-500',
      health: 'bg-gradient-to-r from-green-500 to-emerald-600',
      mana: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      exp: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    };

    // RPG Style bars (HearthStone inspired)
    if (style === 'rpg') {
      const rpg = RPGBAR_STYLES[variant as keyof typeof RPGBAR_STYLES] || RPGBAR_STYLES.healthDark;
      
      return (
        <div ref={ref} className={`w-full ${className || ''}`} {...props}>
          <div className={`relative h-5 ${rpg.bg} rounded-sm overflow-hidden border-t border-b border-white/10`}>
            {/* Inner shine */}
            <div 
              className="absolute inset-x-0 top-0 h-1 bg-white/10" 
            />
            {/* Fill */}
            <div
              className={`h-full ${rpg.fill} transition-all duration-500 rounded-sm ${rpg.glow}`}
              style={{ width: `${percentage}%` }}
            >
              {/* Inner gradient for 3D effect */}
              <div className={`h-full w-full ${rpg.inner}`} />
            </div>
            {/* Shimmer animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          </div>
          {showLabel && (
            <div className="text-xs text-zinc-400 mt-1 text-center font-mono">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={`w-full ${className || ''}`} {...props}>
        <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
          <div
            className={`h-full ${variantStyles[variant]} transition-all duration-300 rounded-full shadow-lg shadow-current/30`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="text-xs text-zinc-400 mt-1 text-center">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';
