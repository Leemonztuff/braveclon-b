interface BattleTopHudProps {
  zel: number;
  gems: number;
  turnCount?: number;
  battlePhase?: 'player_input' | 'player_executing' | 'enemy_executing' | 'victory' | 'defeat';
  onMenuClick?: () => void;
}

import { BF_COLORS } from '@/lib/design-tokens';

export function BattleTopHud({ zel, gems, turnCount = 1, battlePhase = 'player_input', onMenuClick }: BattleTopHudProps) {
  const phaseColors: Record<string, string> = {
    player_input: 'text-emerald-400',
    player_executing: 'text-yellow-400',
    enemy_executing: 'text-red-400',
    victory: 'text-yellow-400',
    defeat: 'text-red-500'
  };

  const phaseLabels: Record<string, string> = {
    player_input: 'YOUR TURN',
    player_executing: 'ATTACKING...',
    enemy_executing: 'ENEMY TURN',
    victory: 'VICTORY!',
    defeat: 'DEFEAT'
  };

  return (
    <div 
      className="relative z-20 h-12 shrink-0 border-b-2 flex items-center px-3 justify-between text-xs font-bold text-white shadow-md"
      style={{ 
        background: `linear-gradient(to bottom, ${BF_COLORS.navy.mid}, ${BF_COLORS.navy.deep})`,
        borderColor: BF_COLORS.gold.primary 
      }}
    >
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 text-base drop-shadow-md">💰</span> 
          <span className="drop-shadow-md tabular-nums text-zinc-100">{zel.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400 text-base drop-shadow-md">💎</span> 
          <span className="drop-shadow-md text-zinc-100">{gems}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded" 
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-zinc-400 text-[10px] font-bold">TURN</span>
          <span className="text-white font-bold tabular-nums">{turnCount}</span>
        </div>
        <div 
          className="font-black tracking-widest drop-shadow-md text-[10px] px-2 py-1 rounded"
          style={{ color: phaseColors[battlePhase], background: 'rgba(0,0,0,0.3)' }}
        >
          {phaseLabels[battlePhase]}
        </div>
      </div>

      <button 
        onClick={onMenuClick}
        className="px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold drop-shadow-md transition-all active:scale-95"
        style={{ 
          background: `linear-gradient(to bottom, ${BF_COLORS.navy.mid}, ${BF_COLORS.navy.deep})`,
          border: `1px solid ${BF_COLORS.gold.primary}`,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        MENU
      </button>
    </div>
  );
}
