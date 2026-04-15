/* eslint-disable @next/next/no-img-element */
import { BattleUnit } from '@/lib/battleTypes';
import { ELEMENT_ICONS, Element } from '@/lib/gameData';

interface UnitStatusBoxProps {
  unit?: BattleUnit;
  onClick?: () => void;
  interactive?: boolean;
}

export function UnitStatusBox({ unit, onClick, interactive }: UnitStatusBoxProps) {
  if (!unit) {
    return (
      <div className="border-2 border-zinc-800/50 bg-zinc-900/50 rounded-lg aspect-[3/2]" />
    );
  }

  const isBbReady = unit.bbGauge >= unit.maxBb;
  const isSelected = unit.queuedBb;
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const bbPercent = (unit.bbGauge / unit.maxBb) * 100;

  const elementColors: Record<Element, string> = {
    Fire: 'text-red-400 border-red-500 bg-red-500/20',
    Water: 'text-blue-400 border-blue-500 bg-blue-500/20',
    Earth: 'text-green-400 border-green-500 bg-green-500/20',
    Thunder: 'text-yellow-400 border-yellow-500 bg-yellow-500/20',
    Light: 'text-yellow-200 border-yellow-300 bg-yellow-300/20',
    Dark: 'text-purple-400 border-purple-500 bg-purple-500/20',
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative border-2 rounded-lg bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] p-1.5 flex items-center gap-2 
        ${interactive && isBbReady ? 'cursor-pointer hover:brightness-110' : ''}
        ${isSelected ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-[#4a4a6a]'}
        ${unit.isDead ? 'opacity-40 grayscale' : ''}
        transition-all
      `}
    >
      {/* Thumbnail Frame - Estilo BF2 */}
      <div className="w-10 h-10 bg-[#1a1a2e] rounded border-2 border-[#3a3a5a] shrink-0 relative overflow-hidden">
        <img 
          src={unit.template.spriteUrl} 
          className="w-full h-full object-cover scale-[2.5] origin-[50%_20%]" 
          style={{ imageRendering: 'pixelated' }} 
          alt={unit.template.name}
        />
        {/* Element Badge */}
        <div className={`absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded-full ${elementColors[unit.template.element as Element]}`}>
          {ELEMENT_ICONS[unit.template.element as Element]}
        </div>
      </div>
      
      {/* Info Bars */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        {/* Unit Name */}
        <div className="text-[9px] font-bold text-white truncate drop-shadow-md leading-none">
          {unit.template.name}
        </div>
        
        {/* HP Bar */}
        <div className="flex items-center gap-1">
          <div className="flex-1 h-1.5 bg-[#0a0a14] rounded-full overflow-hidden border border-[#2a2a4a]">
            <div 
              className={`h-full transition-all ${
                hpPercent > 50 ? 'bg-gradient-to-r from-green-600 to-green-500' : 
                hpPercent > 25 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 
                'bg-gradient-to-r from-red-600 to-red-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-[7px] font-mono text-zinc-400 w-8 text-right">
            {unit.hp}/{unit.maxHp}
          </span>
        </div>
        
        {/* BB Bar */}
        <div className="flex items-center gap-1">
          <div className="flex-1 h-1 bg-[#0a0a14] rounded-full overflow-hidden border border-[#2a2a4a]">
            <div 
              className={`h-full transition-all ${
                isBbReady 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse' 
                  : 'bg-gradient-to-r from-blue-700 to-blue-600'
              }`}
              style={{ width: `${bbPercent}%` }}
            />
          </div>
          <span className={`text-[7px] font-mono ${isBbReady ? 'text-cyan-400' : 'text-zinc-500'}`}>
            {unit.bbGauge}
          </span>
        </div>
      </div>
      
      {/* BB Ready Indicator */}
      {isBbReady && !unit.isDead && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]">
          <span className="text-[8px] font-black text-black">BB</span>
        </div>
      )}
    </div>
  );
}
