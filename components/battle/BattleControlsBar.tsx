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

  const readyUnits = playerUnits.filter(u => u.bbGauge >= u.maxBb && !u.isDead).length;

  const getButtonContent = () => {
    switch (turnState) {
      case 'player_input':
        return (
          <button 
            onClick={executeTurn}
            className={`w-full h-9 rounded font-black text-xs text-white transition-all active:scale-95 ${
              readyUnits > 0 ? 'animate-pulse' : ''
            }`}
            style={{ 
              background: `linear-gradient(to bottom, #3b82f6, #1d4ed8)`,
              border: '2px solid #60a5fa',
              boxShadow: readyUnits > 0 
                ? '0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.4)' 
                : '0 0 10px rgba(59,130,246,0.4)'
            }}
          >
            ATTACK
          </button>
        );
      case 'victory':
        return (
          <div 
            className="w-full h-9 rounded flex items-center justify-center font-black text-xs animate-pulse"
            style={{ 
              background: `linear-gradient(to bottom, ${BF_COLORS.gold.bright}, ${BF_COLORS.gold.dim})`,
              border: '2px solid #fde047',
              color: '#1a1a2e',
              boxShadow: '0 0 30px rgba(250,204,21,0.6)'
            }}
          >
            CLEARED
          </div>
        );
      case 'defeat':
        return (
          <div 
            className="w-full h-9 rounded flex items-center justify-center font-black text-xs text-white"
            style={{ 
              background: 'linear-gradient(to bottom, #dc2626, #991b1b)',
              border: '2px solid #f87171'
            }}
          >
            DEFEAT
          </div>
        );
      default:
        return (
          <div 
            className="w-full h-9 rounded flex items-center justify-center font-bold text-[10px]"
            style={{ 
              background: BF_COLORS.navy.deep,
              border: `1px solid ${BF_COLORS.gold.dim}`,
              color: '#71717a'
            }}
          >
            WAIT
          </div>
        );
    }
  };

  return (
    <div 
      className="h-12 shrink-0 flex items-center gap-2 px-2 py-1"
      style={{ 
        background: `linear-gradient(to bottom, ${BF_COLORS.navy.deep}, #0a0a14)`,
        borderTop: `1px solid ${BF_COLORS.gold.dim}`
      }}
    >
      {/* Item Buttons - Compact */}
      <div className="flex gap-1 flex-1">
        {inventoryItems.slice(0, 3).map((item, i: number) => {
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
                w-10 h-9 rounded flex flex-col items-center justify-center transition-all duration-100
                ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:brightness-125 active:brightness-75 active:scale-90'}
                ${isSelected ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
              `}
              style={{ 
                background: 'linear-gradient(to bottom, #27272a, #18181b)',
                border: `2px solid ${isSelected ? '#facc15' : '#3f3f46'}`,
                boxShadow: isSelected ? '0 0 15px rgba(250,204,21,0.5)' : 'none'
              }}
            >
              <div className="text-xs font-bold text-white self-start leading-none">{item.icon}</div>
              <div className={`text-[8px] font-bold ${item.count > 0 ? 'text-cyan-400' : 'text-zinc-500'}`}>
                {item.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* BB Ready Indicator */}
      {turnState === 'player_input' && (
        <div className={`flex items-center gap-0.5 text-[9px] font-bold transition-all ${readyUnits > 0 ? 'animate-pulse' : ''}`}>
          <span className={readyUnits > 0 ? 'text-cyan-400' : 'text-zinc-500'}>
            {readyUnits}
          </span>
          <span className={readyUnits > 0 ? 'text-cyan-300' : 'text-zinc-500'}>BB</span>
        </div>
      )}

      {/* Attack Button */}
      <div className={`w-20 shrink-0 ${readyUnits > 0 ? 'animate-pulse' : ''}`}>
        {getButtonContent()}
      </div>
    </div>
  );
}