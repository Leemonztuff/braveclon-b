import { EQUIPMENT_DATABASE } from '@/lib/gameData';
import { Modal, ModalActionButton } from './ui/Modal';
import { COLORS, BORDERS } from '@/lib/design-tokens';

export interface BattleRewards {
  zel: number;
  exp: number;
  playerLeveledUp: boolean;
  leveledUpUnits: { name: string; oldLevel: number; newLevel: number }[];
  equipmentDropped: string[] | { templateId: string }[];
  arenaScoreGain?: number;
}

export function BattleRewardsModal({ rewards, onClose }: { rewards: BattleRewards, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-yellow-500/50 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
        <h2 className="text-2xl font-black text-yellow-400 mb-6 uppercase tracking-wider">Quest Cleared!</h2>
        
        <div className="flex gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">💰</span>
            <span className="text-yellow-400 font-bold">+{rewards.zel} Zel</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">✨</span>
            <span className="text-blue-400 font-bold">+{rewards.exp} EXP</span>
          </div>
        </div>

        {rewards.playerLeveledUp && (
          <div className="w-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold py-2 px-4 rounded-xl mb-4 animate-pulse">
            Player Leveled Up! Energy Refilled!
          </div>
        )}

        {rewards.leveledUpUnits && rewards.leveledUpUnits.length > 0 && (
          <div className={`w-full bg-zinc-800 ${BORDERS.radius.lg} p-4 mb-4`}>
            <h3 className="text-sm font-bold text-zinc-400 mb-2 uppercase">Units Leveled Up</h3>
            <div className="flex flex-col gap-2">
              {rewards.leveledUpUnits.map((u, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm font-bold">
                  <span className="text-white">{u.name}</span>
                  <span className="text-emerald-400">Lv.{u.oldLevel} ➔ Lv.{u.newLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rewards.equipmentDropped && rewards.equipmentDropped.length > 0 && (
          <div className={`w-full bg-zinc-800 ${BORDERS.radius.lg} p-4 mb-6`}>
            <h3 className="text-sm font-bold text-zinc-400 mb-2 uppercase">Equipment Found</h3>
            <div className="flex flex-col gap-2">
              {rewards.equipmentDropped.map((eq, i: number) => {
                const eqId = typeof eq === 'string' ? eq : eq.templateId;
                const template = EQUIPMENT_DATABASE[eqId];
                return (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold text-white bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                    <span className="text-xl">{template?.icon || '⚔️'}</span>
                    <span>{template?.name || eqId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <ModalActionButton onClick={onClose} label="CONTINUE" variant="primary" />
      </div>
    </div>
  );
}
