import { PlayerState } from '@/lib/gameState';
import { formatTime, formatNumber } from './ui/DesignSystem';

export function TopBar({ state, timeToNextEnergy }: { state: PlayerState, timeToNextEnergy: number }) {
  return (
    <header className="flex items-center justify-between bg-zinc-950 px-4 py-3 shadow-md z-10">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Player Lv.{state.playerLevel}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
            <span>⚡</span>
            <span>{state.energy}/{state.maxEnergy}</span>
          </div>
          {state.energy < state.maxEnergy && (
            <span className="text-[10px] text-emerald-500/80 font-mono">
              +{formatTime(timeToNextEnergy)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm font-medium text-yellow-400">
          <span>💰</span>
          <span>{formatNumber(state.zel)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-pink-400">
          <span>💎</span>
          <span>{formatNumber(state.gems)}</span>
        </div>
      </div>
    </header>
  );
}
