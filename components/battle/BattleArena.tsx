import { motion, AnimatePresence } from 'motion/react';
import { FloatingText, FloatingTextData } from '../FloatingText';
import { BattleUnit } from '@/lib/battleTypes';

export interface BattleStateData {
  playerUnits: BattleUnit[];
  enemyUnits: BattleUnit[];
  turnState: string;
  combatLog: string[];
  bbHitEffect: { targetId: string; element: string } | null;
  selectedItem: string | null;
  handleUnitClick: (id: string) => void;
  screenShake: boolean;
  floatingTexts: FloatingTextData[];
}

function JRPGUnit({ unit, isPlayer, onClick, turnState }: { 
  unit: BattleUnit; 
  isPlayer: boolean; 
  onClick?: () => void;
  turnState: string;
}) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;

  return (
    <motion.div
      className={`
        flex flex-col items-center
        ${isPlayer ? 'ml-4' : 'mr-4'}
      `}
      initial={{ opacity: 0, x: isPlayer ? -50 : 50 }}
      animate={{ 
        opacity: 1, 
        x: unit.actionState === 'attacking' ? (isPlayer ? 30 : -30) : 0,
        scale: unit.actionState === 'hurt' || unit.actionState === 'bb_hurt' ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* HP Bar Above Sprite */}
      {!unit.isDead && (
        <div className="w-16 mb-1">
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
            <motion.div 
              className={`h-full ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-gray-300 mt-0.5">
            <span>{Math.floor(unit.hp)}</span>
            <span>{Math.floor(unit.maxHp)}</span>
          </div>
        </div>
      )}

      {/* Unit Sprite - Side view as pixel art */}
      <motion.div
        className={`
          relative w-16 h-20 cursor-pointer
          ${!unit.isDead && turnState === 'player_input' && isPlayer ? 'hover:scale-105' : ''}
        `}
        onClick={onClick}
        animate={unit.actionState === 'hurt' || unit.actionState === 'bb_hurt' ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Shadow underneath */}
        <div className="absolute bottom-0 left-2 right-2 h-2 bg-black/30 rounded-full" />

        {/* Unit Body - Side View Pixel Art Style */}
        <div className="absolute bottom-1 left-0 right-0 h-16 flex items-end justify-center">
          {unit.isDead ? (
            <div className="text-2xl opacity-30">💀</div>
          ) : (
            <div className={`
              w-12 h-14 rounded-sm
              ${unit.actionState === 'hurt' || unit.actionState === 'bb_hurt' 
                ? 'bg-red-500 animate-pulse' 
                : unit.queuedBb 
                  ? 'bg-purple-500 border-2 border-purple-400' 
                  : isPlayer 
                    ? 'bg-blue-600 border-2 border-blue-400' 
                    : 'bg-red-700 border-2 border-red-500'
              }
            `}>
              {/* Simple pixel character representation */}
              <div className="w-full h-full flex flex-col items-center justify-center text-2xl">
                {unit.template.element === 'Fire' ? '🔥' : 
                 unit.template.element === 'Water' ? '💧' : 
                 unit.template.element === 'Earth' ? '🌲' : 
                 unit.template.element === 'Thunder' ? '⚡' : 
                 unit.template.element === 'Light' ? '☀��' : '🌙'}
              </div>
            </div>
          )}
        </div>

        {/* Leader indicator */}
        {isPlayer && !unit.isDead && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] font-bold text-black">
            ★
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function BattleArena({ battleState }: { battleState: BattleStateData }) {
  const {
    playerUnits,
    enemyUnits,
    turnState,
    combatLog,
    bbHitEffect,
    selectedItem,
    handleUnitClick,
    screenShake,
    floatingTexts
  } = battleState;

  return (
    <motion.div 
      className="flex-1 relative z-10 overflow-hidden"
      animate={screenShake ? { x: [-8, 8, -8, 8, -4, 4, 0], y: [-4, 4, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* JRPG Side-Scroller Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d0d1a] to-[#0a0a14]">
        {/* Ground/Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#2d1f0f] to-[#1a1408]" />
        
        {/* Background elements - parallax layers */}
        <div className="absolute bottom-1/3 left-1/4 w-20 h-32 bg-[#1a1a2e]/50 rounded-t-full" />
        <div className="absolute bottom-1/4 right-1/3 w-16 h-24 bg-[#1a1a2e]/40 rounded-t-full" />
        
        {/* Decorative elements */}
        <div className="absolute bottom-1/4 left-10 w-2 h-20 bg-[#2a2a1a]" />
        <div className="absolute bottom-1/4 right-10 w-2 h-16 bg-[#2a2a1a]" />
      </div>

      {/* Combat Log */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded text-[10px] text-gray-300 z-10"
        >
          {combatLog[combatLog.length - 1] || 'Battle Start!'}
        </motion.div>
      </AnimatePresence>

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map((ft) => (
          <FloatingText key={ft.id} data={ft} />
        ))}
      </AnimatePresence>

      {/* Enemy Units - RIGHT side ( JRPG style) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-4">
        {enemyUnits.slice(0, 3).map((unit, idx) => (
          <JRPGUnit 
            key={unit.id} 
            unit={unit} 
            isPlayer={false}
            turnState={turnState}
          />
        ))}
      </div>

      {/* Player Units - LEFT side (JRPG style) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex gap-4">
        {playerUnits.slice(0, 3).map((unit, idx) => (
          <JRPGUnit 
            key={unit.id} 
            unit={unit} 
            isPlayer={true}
            onClick={() => turnState === 'player_input' && !unit.isDead && handleUnitClick(unit.id)}
            turnState={turnState}
          />
        ))}
      </div>

      {/* VS Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-[#b89947]/30 select-none">
        VS
      </div>
    </motion.div>
  );
}