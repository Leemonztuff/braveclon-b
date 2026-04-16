import { motion, AnimatePresence } from 'motion/react';
import { FloatingText, FloatingTextData } from '../FloatingText';
import { BattleUnit } from '@/lib/battleTypes';
import { UnitSprite } from '../UnitSprite';
import { BF_COLORS } from '@/lib/design-tokens';

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
      {/* Background de battle con sprites - FULL VISIBLE */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('${BASE_URL}/file_0000000071b471f5851dd21e1a9fc22e.png')`,
          opacity: 0.85 
        }}
      />

      {/* Overlay degradado para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1a2e]/60 pointer-events-none" />

      {/* Ground/Piso - thinner, near bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#2d1f0f]/80 to-transparent pointer-events-none" />
      
      {/* Combat Log - compact, floating */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1a1a2e]/70 border border-[#b89947]/30 px-3 py-0.5 rounded-full z-10"
        >
          <span className="text-[10px] text-zinc-300 font-mono drop-shadow-md">
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

      {/* ========== ENEMY ROW - TOP of arena, centered horizontally ========== */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 right-4 flex justify-end items-center gap-3">
        {enemyUnits.slice(0, 5).map((unit) => (
          <UnitSprite 
            key={unit.id} 
            unit={unit}
            hideStats={true}
            interactive={false}
            hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
            scale={1.1}
          />
        ))}
      </div>

      {/* VS - Center of arena */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black select-none" 
        style={{ color: BF_COLORS.gold.primary, opacity: 0.3 }}
      >
        VS
      </div>

      {/* ========== PLAYER ROW - BOTTOM of arena, centered horizontally ========== */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 right-4 flex justify-end items-center gap-3">
        {playerUnits.slice(0, 5).map((unit) => (
          <UnitSprite 
            key={unit.id} 
            unit={unit}
            hideStats={true}
            onClick={() => turnState === 'player_input' && !unit.isDead && handleUnitClick(unit.id)}
            interactive={turnState === 'player_input' && !unit.isDead}
            isItemSelected={!!selectedItem}
            hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
            scale={1.1}
          />
        ))}
      </div>
    </motion.div>
  );
}