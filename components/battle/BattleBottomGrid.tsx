import { BattleUnit } from '@/lib/battleTypes';
import { BF_COLORS, ELEMENT_COLORS } from '@/lib/design-tokens';

interface BattleBottomGridProps {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  turnState: string;
  onUnitClick: (id: string) => void;
}

function BBIndicator({ unit }: { unit: BattleUnit }) {
  const fillCount = Math.floor((unit.bbGauge / unit.maxBb) * 5);
  const isReady = unit.bbGauge >= unit.maxBb;

  return (
    <div className="flex gap-px">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className={`w-1.5 h-2 rounded-sm transition-colors ${
            i < fillCount 
              ? isReady
                ? 'bg-purple-500 animate-pulse' 
                : 'bg-cyan-400'
              : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

function UnitMini({ unit, onClick, turnState, isPlayer }: { 
  unit: BattleUnit | null; 
  onClick?: () => void;
  turnState: string;
  isPlayer: boolean;
}) {
  if (!unit) {
    return (
      <div 
        className="w-14 h-16 flex flex-col items-center justify-center rounded"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <span className="text-zinc-600 text-xs">?</span>
        </div>
        <div className="h-1 w-10 bg-gray-800/50 rounded-full mt-1" />
        <div className="flex gap-px mt-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-2 rounded-sm bg-gray-800/50" />
          ))}
        </div>
      </div>
    );
  }

  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const isSelectable = turnState === 'player_input' && !unit.isDead && isPlayer;
  const isQueued = unit.queuedBb && !unit.isDead;
  const isLowHp = hpPercent < 30 && !unit.isDead;

  return (
    <button 
      className={`
        w-14 h-16 flex flex-col items-center justify-center rounded transition-all duration-200
        ${isSelectable ? 'cursor-pointer hover:bg-white/10 active:scale-[0.95]' : ''}
        ${unit.isDead ? 'opacity-40 grayscale animate-pulse' : 'opacity-100'}
        ${isQueued ? 'ring-2 ring-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : ''}
        ${isLowHp ? 'animate-pulse' : ''}
      `}
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClick}
      disabled={!isSelectable}
    >
      {/* Unit Icon */}
      <div 
        className="w-8 h-8 rounded flex items-center justify-center text-lg transition-all duration-200"
        style={{ 
          background: unit.isDead ? 'rgba(30,30,40,1)' : isPlayer ? 'rgba(30,60,120,1)' : 'rgba(120,30,30,1)',
          border: `2px solid ${unit.isDead ? '#4a4a5a' : isPlayer ? '#3b82f6' : '#dc2626'}`,
          boxShadow: isQueued ? '0 0 10px rgba(168,85,247,0.5)' : 'none'
        }}
      >
        {unit.isDead ? '☠' : 
         unit.template.element === 'Fire' ? '🔥' : 
         unit.template.element === 'Water' ? '💧' : 
         unit.template.element === 'Earth' ? '🌲' : 
         unit.template.element === 'Thunder' ? '⚡' : 
         unit.template.element === 'Light' ? '☀' : '🌙'}
      </div>

      {/* HP Bar */}
      <div className="w-10 h-1.5 bg-gray-900 rounded-full overflow-hidden mt-1">
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${hpPercent}%`,
            background: hpPercent > 50 ? BF_COLORS.health : hpPercent > 25 ? '#eab308' : '#dc2626',
            boxShadow: isLowHp ? '0 0 5px #dc2626' : 'none'
          }}
        />
      </div>

      {/* BB Gauge */}
      <BBIndicator unit={unit} />
    </button>
  );
}

export function BattleBottomGrid({ playerUnits, enemyUnits, turnState, onUnitClick }: BattleBottomGridProps) {
  // Pad to 6 units for player
  const playerDisplay = [...playerUnits, ...Array(Math.max(0, 6 - playerUnits.length)).fill(null)];

  return (
    <div 
      className="h-20 flex items-center px-2 gap-1.5 overflow-x-auto"
      style={{ background: `linear-gradient(to top, ${BF_COLORS.navy.deep}, #0d0d1a)` }}
    >
      {playerDisplay.map((unit, idx) => (
        <UnitMini 
          key={unit?.id || `p-empty-${idx}`} 
          unit={unit}
          onClick={() => unit && turnState === 'player_input' && !unit.isDead && onUnitClick(unit.id)}
          turnState={turnState}
          isPlayer={true}
        />
      ))}
    </div>
  );
}