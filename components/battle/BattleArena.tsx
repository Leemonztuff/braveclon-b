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
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('${BASE_URL}/file_0000000071b471f5851dd21e1a9fc22e.png')`,
          opacity: 0.9 
        }}
      />
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#2d1f0f]/90 to-transparent" />

      {/* Combat Log */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full z-20"
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

      {/* SIDE-SCROLLER LAYOUT - All units on SAME horizontal level */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        
        {/* Player Units - LEFT side (facing right) */}
        <div className="flex items-center gap-2 ml-2">
          <AnimatePresence>
            {playerUnits.slice(0, 5).map((unit, idx) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <UnitSprite 
                  unit={unit}
                  hideStats={true}
                  onClick={() => turnState === 'player_input' && !unit.isDead && handleUnitClick(unit.id)}
                  interactive={turnState === 'player_input' && !unit.isDead}
                  isItemSelected={!!selectedItem}
                  hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
                  scale={1.2}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* VS - Center */}
        <div className="text-4xl font-black text-[#b89947]/40 select-none">
          VS
        </div>

        {/* Enemy Units - RIGHT side (facing left) */}
        <div className="flex items-center gap-2 mr-2">
          <AnimatePresence>
            {enemyUnits.slice(0, 5).map((unit, idx) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <UnitSprite 
                  unit={unit}
                  hideStats={true}
                  interactive={false}
                  hitEffectElement={bbHitEffect?.targetId === unit.id ? bbHitEffect.element : null}
                  scale={1.2}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}