import { PlayerState } from '@/lib/gameState';
import { motion, AnimatePresence } from 'motion/react';
import { BBCutIn } from './BBCutIn';
import { useBattle } from '@/hooks/useBattle';
import { BattleTopHud } from './battle/BattleTopHud';
import { BattleArena } from './battle/BattleArena';
import { BattleBottomGrid } from './battle/BattleBottomGrid';
import { BattleControlsBar } from './battle/BattleControlsBar';

export default function BattleScreen({ state, stageId, onEnd }: { state: PlayerState, stageId: number, onEnd: (victory: boolean) => void }) {
  const battleState = useBattle(state, stageId, onEnd);
  const { bbFlash, bbCutInUnit } = battleState;

  return (
    <div className="flex flex-col h-[100dvh] bg-black relative overflow-hidden font-sans">
      {/* BB Cut-in Overlay */}
      <AnimatePresence>
        {bbCutInUnit && <BBCutIn unit={bbCutInUnit} />}
      </AnimatePresence>

      {/* BB Flash Overlay */}
      <AnimatePresence>
        {bbFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/40 z-40 pointer-events-none mix-blend-overlay" 
          />
        )}
      </AnimatePresence>

      <BattleTopHud zel={state.zel} gems={state.gems} />
      
      <BattleArena battleState={battleState} />

      <div className="shrink-0 bg-zinc-900 border-t-2 border-yellow-600 flex flex-col relative z-20">
        <BattleBottomGrid battleState={battleState} />
        <BattleControlsBar battleState={battleState} />
      </div>
    </div>
  );
}
