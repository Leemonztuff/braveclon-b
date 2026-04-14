import { motion, AnimatePresence } from 'motion/react';
import { UnitSprite } from '../UnitSprite';
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
      animate={screenShake ? { x: [-15, 15, -15, 15, -10, 10, 0], y: [-10, 10, -10, 10, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/Leem0nGames/gameassets@main/file_0000000071b471f5851dd21e1a9fc22e.png')] opacity-80 bg-cover bg-center" />

      {/* Combat Log */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 left-2 right-2 bg-black/50 p-1 rounded text-[10px] font-mono pointer-events-none z-10 flex flex-col items-center"
        >
          {combatLog.slice(-1).map((log: string, i: number) => (
            <div key={i} className="text-zinc-300">{log}</div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map((ft) => (
          <FloatingText key={ft.id} data={ft} />
        ))}
      </AnimatePresence>

      {/* Players */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-x-2 gap-y-1">
        {playerUnits.map((unit) => (
          <div key={unit.id} className="flex justify-center w-[64px]">
            <UnitSprite 
              unit={unit} 
              hideStatusBars={true}
              onClick={() => handleUnitClick(unit.id)}
              interactive={turnState === 'player_input'}
              isItemSelected={!!selectedItem}
              hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
            />
          </div>
        ))}
      </div>

      {/* Enemies */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-x-2 gap-y-1">
        {enemyUnits.map((unit) => (
          <div key={unit.id} className="flex flex-col items-center w-[64px]">
            <div className="text-[8px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] mb-1 text-center leading-tight">
              {unit.template.name}
            </div>
            <UnitSprite 
              unit={unit} 
              hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
