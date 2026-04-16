import { BattleUnit } from '@/lib/battleTypes';

interface BattleBottomGridProps {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  turnState: string;
  onUnitClick: (id: string) => void;
}

function BBIndicator({ unit }: { unit: BattleUnit }) {
  const fillCount = Math.floor((unit.bbGauge / unit.maxBb) * 5);

  return (
    <div className="flex gap-0.5 mt-0.5">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className={`w-1.5 h-2 rounded-sm ${
            i < fillCount 
              ? unit.bbGauge >= unit.maxBb 
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
  unit: BattleUnit; 
  onClick?: () => void;
  turnState: string;
  isPlayer: boolean;
}) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;

  return (
    <div 
      className={`
        flex items-center gap-2 p-1 rounded cursor-pointer
        ${turnState === 'player_input' && !unit.isDead ? 'hover:bg-white/10' : ''}
        ${unit.isDead ? 'opacity-40' : ''}
        ${unit.queuedBb && !unit.isDead ? 'ring-1 ring-purple-500 bg-purple-500/10' : ''}
      `}
      onClick={onClick}
    >
      {/* Unit Icon */}
      <div className={`
        w-8 h-8 rounded flex items-center justify-center text-lg
        ${unit.isDead 
          ? 'bg-gray-800' 
          : isPlayer 
            ? 'bg-blue-700 border border-blue-500' 
            : 'bg-red-800 border border-red-600'
        }
      `}>
        {unit.isDead ? '☠' : 
         unit.template.element === 'Fire' ? '🔥' : 
         unit.template.element === 'Water' ? '💧' : 
         unit.template.element === 'Earth' ? '🌲' : 
         unit.template.element === 'Thunder' ? '⚡' : 
         unit.template.element === 'Light' ? '☀' : '🌙'}
      </div>

      {/* Stats */}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-white truncate font-bold">
          {unit.template.name.substring(0, 8)}
        </div>
        
        {/* HP Bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
          <div 
            className={`h-full ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* BB Gauge */}
        <BBIndicator unit={unit} />
      </div>
    </div>
  );
}

export function BattleBottomGrid({ playerUnits, enemyUnits, turnState, onUnitClick }: BattleBottomGridProps) {
  const allUnits = [...playerUnits, ...Array(Math.max(0, 6 - playerUnits.length)).fill(null)];

  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-gradient-to-t from-[#1a1a2e] to-[#0d0d1a] border-t border-[#b89947]/20">
      {allUnits.map((unit, idx) => (
        unit ? (
          <UnitMini 
            key={unit.id} 
            unit={unit}
            onClick={() => turnState === 'player_input' && !unit.isDead && onUnitClick(unit.id)}
            turnState={turnState}
            isPlayer={true}
          />
        ) : (
          <div key={`empty-${idx}`} className="h-12 bg-gray-900/30 rounded" />
        )
      ))}
    </div>
  );
}