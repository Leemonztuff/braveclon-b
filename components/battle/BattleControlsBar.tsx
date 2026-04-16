import { BattleStateData } from './BattleArena';
import { BattleUnit } from '@/lib/battleTypes';
import { BF_COLORS } from '@/lib/design-tokens';

export interface BattleControlsData extends BattleStateData {
  inventoryItems: { id: string; name: string; count: number; icon: string }[];
  setSelectedItem: (id: string | null) => void;
  executeTurn: () => void;
  playerUnits: BattleUnit[];
}

export function BattleControlsBar({ battleState }: { battleState: BattleControlsData }) {
  const { turnState, inventoryItems, selectedItem, setSelectedItem, executeTurn, playerUnits } = battleState;

  const totalBB = playerUnits.reduce((sum, u) => sum + (u.queuedBb ? u.bbGauge : 0), 0);
  const readyUnits = playerUnits.filter(u => u.bbGauge >= u.maxBb && !u.isDead).length;

  const getButtonContent = () => {
    switch (turnState) {
      case 'player_input':
        return (
          <button 
            onClick={executeTurn}
            className="w-full h-10 rounded-lg font-black text-sm text-white transition-all active:scale-95 tracking-widest"
            style={{ 
              background: `linear-gradient(to bottom, #3b82f6, #1d4ed8)`,
              border: '2px solid #60a5fa',
              boxShadow: '0 0 15px rgba(59,130,246,0.6)'
            }}
          >
            AUTO
          </button>
        );
      case 'victory':
        return (
          <div 
            className="w-full h-10 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ 
              background: `linear-gradient(to bottom, ${BF_COLORS.gold.bright}, ${BF_COLORS.gold.dim})`,
              border: '2px solid #fde047',
              color: '#1a1a2e',
              boxShadow: '0 0 15px rgba(250,204,21,0.6)'
            }}
          >
            CLEARED
          </div>
        );
      case 'defeat':
        return (
          <div 
            className="w-full h-10 rounded-lg flex items-center justify-center font-black text-xs text-white"
            style={{ 
              background: 'linear-gradient(to bottom, #dc2626, #991b1b)',
              border: '2px solid #f87171',
              boxShadow: '0 0 15px rgba(220,38,38,0.6)'
            }}
          >
            DEFEAT
          </div>
        );
      default:
        return (
          <div 
            className="w-full h-10 rounded-lg flex items-center justify-center font-bold text-[10px]"
            style={{ 
              background: BF_COLORS.navy.deep,
              border: `2px solid ${BF_COLORS.gold.dim}`,
              color: '#71717a'
            }}
          >
            WAIT...
          </div>
        );
    }
  };

  return (
    <div 
      className="border-t-2 flex flex-col justify-center px-2 py-1.5 gap-1 pb-safe relative"
      style={{ 
        borderColor: BF_COLORS.gold.dim,
        background: `linear-gradient(to bottom, ${BF_COLORS.navy.deep}, #0a0a14)` 
      }}
    >
      {/* BB Gauge Bar */}
      {turnState === 'player_input' && (
        <div className="flex items-center gap-2 px-1">
          <div 
            className="flex-1 h-2.5 rounded-full overflow-hidden"
            style={{ background: '#18181b', border: '1px solid #3f3f46' }}
          >
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, (totalBB / 100) * 100)}%`,
                background: `linear-gradient(to right, #3b82f6, #22d3ee)`
              }}
            />
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold">
            <span className={readyUnits > 0 ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}>
              {readyUnits}
            </span>
            <span className="text-zinc-400 tracking-wider">BB</span>
          </div>
        </div>
      )}
      
      <div 
        className="text-center text-[9px] font-black tracking-widest" 
        style={{ color: BF_COLORS.gold.dim }}
      >
        ITEMS
      </div>
      
      <div className="flex items-center justify-between gap-2">
        {/* Items */}
        <div className="flex gap-1.5 flex-1">
          {inventoryItems.map((item, i: number) => {
            const isSelected = selectedItem === item.id;
            const isDisabled = item.count === 0;
            
            return (
              <button 
                key={i}
                disabled={isDisabled || turnState !== 'player_input'}
                onClick={() => {
                  if (!isDisabled && turnState === 'player_input') {
                    setSelectedItem(isSelected ? null : item.id);
                  }
                }}
                className={`
                  flex-1 aspect-[3/4] max-w-[48px] min-h-[60px] rounded flex flex-col items-center justify-between p-1.5 shadow-inner transition-all
                  ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:scale-95'}
                  ${isSelected ? 'scale-105 ring-2 ring-yellow-400' : ''}
                `}
                style={{ 
                  background: 'linear-gradient(to bottom, #27272a, #18181b)',
                  border: `1px solid ${isSelected ? '#facc15' : '#3f3f46'}`
                }}
              >
                <div className="text-[10px] font-bold text-white self-start leading-none drop-shadow-md">x{item.count}</div>
                <div className="text-2xl drop-shadow-md">{item.icon}</div>
                <div className="text-[7px] font-bold text-zinc-300 text-center leading-tight truncate w-full">{item.name}</div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="w-22 shrink-0">
          {getButtonContent()}
        </div>
      </div>
    </div>
  );
}
