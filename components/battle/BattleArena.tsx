import { motion, AnimatePresence } from 'motion/react';
import { FloatingText, FloatingTextData } from '../FloatingText';
import { BattleUnit } from '@/lib/battleTypes';
import { UnitSprite } from '../UnitSprite';

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

const BASE_URL = 'https://cdn.jsdelivr.net/gh/Leem0nGames/gameassets@main';

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
      {/* Background de battle con sprites */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('${BASE_URL}/file_0000000071b471f5851dd21e1a9fc22e.png')`,
          opacity: 0.9 
        }}
      />

      {/* Overlay degradado para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1a2e]/80" />

      {/* Ground/Piso */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#2d1f0f]/90 to-transparent" />
      
      {/* Decoraciones del fondo */}
      <div className="absolute bottom-1/4 left-8 w-16 h-32 bg-[#1a1a2e]/40 rounded-t-full blur-sm" />
      <div className="absolute bottom-1/4 right-8 w-12 h-24 bg-[#1a1a2e]/30 rounded-t-full blur-sm" />

      {/* Combat Log */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full z-10"
        >
          <span className="text-xs text-gray-300 font-mono">
            {combatLog[combatLog.length - 1] || 'Battle Start!'}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map((ft) => (
          <FloatingText key={ft.id} data={ft} />
        ))}
      </AnimatePresence>

      {/* Enemy Units - RIGHT side (atacan a izquierda) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2">
        {enemyUnits.slice(0, 5).map((unit) => (
          <UnitSprite 
            key={unit.id} 
            unit={unit}
            hideStats={true}
            interactive={false}
            hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
            scale={0.9}
          />
        ))}
      </div>

      {/* Player Units - LEFT side (atacan a derecha) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex gap-2">
        {playerUnits.slice(0, 5).map((unit) => (
          <UnitSprite 
            key={unit.id} 
            unit={unit}
            hideStats={true}
            onClick={() => turnState === 'player_input' && !unit.isDead && handleUnitClick(unit.id)}
            interactive={turnState === 'player_input' && !unit.isDead}
            isItemSelected={!!selectedItem}
            hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
            scale={0.9}
          />
        ))}
      </div>

      {/* VS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-[#b89947]/40 select-none">
        VS
      </div>
    </motion.div>
  );
}