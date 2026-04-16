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
    <div className="flex gap-0.5 mt-0.5">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className={`w-1.5 h-2 rounded-sm transition-colors ${
            i < fillCount 
              ? isReady
                ? 'bg-purple-500 animate-pulse' 
                : 'bg-cyan-500'
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
        className="flex items-center gap-2 p-1.5 rounded h-14"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-zinc-600">?</span>
        </div>
        <div className="flex-1">
          <div className="text-[8px] text-zinc-600 font-bold">---</div>
          <div className="h-1.5 bg-gray-800/50 rounded-full mt-0.5" />
          <div className="flex gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-2 rounded-sm bg-gray-800/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const elementColor = ELEMENT_COLORS[unit.template.element as keyof typeof ELEMENT_COLORS] || '#ef4444';
  const isSelectable = turnState === 'player_input' && !unit.isDead && isPlayer;
  const isQueued = unit.queuedBb && !unit.isDead;

  return (
    <button 
      className={`
        flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all min-h-14
        ${isSelectable ? 'hover:bg-white/10 active:scale-[0.98]' : ''}
        ${unit.isDead ? 'opacity-40' : 'opacity-100'}
        ${isQueued ? 'ring-1 ring-purple-500 bg-purple-500/10' : ''}
        disabled:cursor-default w-full text-left
      `}
      onClick={onClick}
      disabled={!isSelectable}
    >
      {/* Unit Icon */}
      <div 
        className="w-10 h-10 rounded flex items-center justify-center text-xl"
        style={{ 
          background: unit.isDead ? 'rgba(30,30,40,1)' : isPlayer ? 'rgba(30,60,120,1)' : 'rgba(120,30,30,1)',
          border: `2px solid ${unit.isDead ? '#4a4a5a' : isPlayer ? '#3b82f6' : '#dc2626'}`
        }}
      >
        {unit.isDead ? '☠' : 
         unit.template.element === 'Fire' ? '🔥' : 
         unit.template.element === 'Water' ? '💧' : 
         unit.template.element === 'Earth' ? '🌲' : 
         unit.template.element === 'Thunder' ? '⚡' : 
         unit.template.element === 'Light' ? '☀' : '🌙'}
      </div>

      {/* Stats */}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-white truncate font-bold drop-shadow-md">
          {unit.template.name.substring(0, 9)}
        </div>
        
        {/* HP Bar */}
        <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden mt-0.5">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${hpPercent}%`,
              background: hpPercent > 50 ? BF_COLORS.health : hpPercent > 25 ? '#eab308' : '#dc2626'
            }}
          />
        </div>

        {/* BB Gauge */}
        <BBIndicator unit={unit} />
      </div>
    </button>
  );
}

export function BattleBottomGrid({ playerUnits, enemyUnits, turnState, onUnitClick }: BattleBottomGridProps) {
  // Pad to 6 units each side
  const playerDisplay = [...playerUnits, ...Array(Math.max(0, 6 - playerUnits.length)).fill(null)];
  const enemyDisplay = [...enemyUnits, ...Array(Math.max(0, 6 - enemyUnits.length)).fill(null)];

  return (
    <div className="grid grid-cols-2 gap-2 p-1.5" style={{ background: `linear-gradient(to top, ${BF_COLORS.navy.deep}, #0d0d1a)` }}>
      {/* Player Units - Left */}
      <div className="flex flex-col gap-1">
        <div 
          className="text-[8px] font-black text-center py-0.5 rounded" 
          style={{ color: BF_COLORS.gold.primary, background: 'rgba(0,0,0,0.3)' }}
        >
          PLAYER
        </div>
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

      {/* Enemy Units - Right */}
      <div className="flex flex-col gap-1">
        <div 
          className="text-[8px] font-black text-center py-0.5 rounded" 
          style={{ color: BF_COLORS.gold.primary, background: 'rgba(0,0,0,0.3)' }}
        >
          ENEMY
        </div>
        {enemyDisplay.map((unit, idx) => (
          <UnitMini 
            key={unit?.id || `e-empty-${idx}`} 
            unit={unit}
            turnState={turnState}
            isPlayer={false}
          />
        ))}
      </div>
    </div>
  );
}