import { PlayerState } from '@/lib/gameState';

export function TopBar({ state, timeToNextEnergy }: { state: PlayerState, timeToNextEnergy: number }) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex items-center justify-between bg-zinc-950 px-4 py-3 shadow-md z-10">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Player Lv.{state.level}</span>
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
          <span>{state.zel.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-pink-400">
          <span>💎</span>
          <span>{state.gems}</span>
        </div>
      </div>
    </header>
  );
}
