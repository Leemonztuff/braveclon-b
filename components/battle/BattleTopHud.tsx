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
    player_input: '#22c55e',
    player_executing: '#eab308',
    enemy_executing: '#ef4444',
    victory: '#eab308',
    defeat: '#ef4444'
  };

  const phaseLabels: Record<string, string> = {
    player_input: 'YOUR TURN',
    player_executing: 'ATTACK',
    enemy_executing: 'ENEMY',
    victory: 'VICTORY',
    defeat: 'DEFEAT'
  };

  return (
    <div 
      className="relative z-20 h-10 shrink-0 flex items-center px-3 justify-between text-xs font-bold"
      style={{ 
        background: `linear-gradient(to bottom, ${BF_COLORS.navy.mid}, ${BF_COLORS.navy.deep})`,
        borderBottom: `1px solid ${BF_COLORS.gold.dim}` 
      }}
    >
      {/* Left: Resources */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">💰</span> 
          <span className="text-zinc-100 text-[10px] tabular-nums">{zel.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-cyan-400 text-sm">💎</span> 
          <span className="text-zinc-100 text-[10px]">{gems}</span>
        </div>
      </div>

      {/* Center: Turn & Phase */}
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px]" 
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <span className="text-zinc-400 font-bold">TURN</span>
          <span className="text-white font-bold tabular-nums">{turnCount}</span>
        </div>
        <div 
          className="font-black tracking-wider text-[9px] px-2 py-0.5 rounded"
          style={{ color: phaseColors[battlePhase], background: 'rgba(0,0,0,0.4)' }}
        >
          {phaseLabels[battlePhase]}
        </div>
      </div>

      {/* Right: Menu Button */}
      <button 
        onClick={onMenuClick}
        className="px-2 py-1 rounded text-[9px] uppercase font-bold transition-all active:scale-95"
        style={{ 
          background: `linear-gradient(to bottom, ${BF_COLORS.navy.mid}, ${BF_COLORS.navy.deep})`,
          border: `1px solid ${BF_COLORS.gold.dim}`
        }}
      >
        MENU
      </button>
    </div>
  );
}