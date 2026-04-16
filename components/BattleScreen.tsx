'use client';

import { PlayerState } from '@/lib/gameState';
import { useBattle } from '@/hooks/useBattle';
import { STAGES } from '@/lib/gameData';
import { BattleTopHud } from '@/components/battle/BattleTopHud';
import { BattleArena } from '@/components/battle/BattleArena';
import { BattleBottomGrid } from '@/components/battle/BattleBottomGrid';
import { BattleControlsBar } from '@/components/battle/BattleControlsBar';
import { useCallback } from 'react';
import { BattleStateData } from '@/components/battle/BattleArena';
import { BattleUnit } from '@/lib/battleTypes';

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  const stage = STAGES.find(s => s.id === stageId);

  const handleVictory = useCallback(() => {
    setTimeout(() => onEnd(true), 2000);
  }, [onEnd]);

  const handleDefeat = useCallback(() => {
    setTimeout(() => onEnd(false), 2000);
  }, [onEnd]);

  const {
    playerUnits,
    enemyUnits,
    turnCount,
    turnState,
    combatLog,
    executeTurn,
    handleUnitClick,
    screenShake,
    floatingTexts,
    inventoryItems,
    selectedItem,
    setSelectedItem,
  } = useBattle(state, stageId, (victory) => {
    if (victory) handleVictory();
    else handleDefeat();
  });

  const battleState: BattleStateData = {
    playerUnits,
    enemyUnits,
    turnState,
    combatLog,
    bbHitEffect: null,
    selectedItem,
    handleUnitClick,
    screenShake,
    floatingTexts,
  };

  const controlsData = {
    ...battleState,
    inventoryItems: inventoryItems || [],
    setSelectedItem,
    executeTurn,
    playerUnits,
  };

  const gridData = {
    ...battleState,
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a14]">
      <BattleTopHud 
        zel={stage?.zelReward || 0}
        gems={0}
        turnCount={turnCount}
        battlePhase={turnState}
      />

      <BattleArena battleState={battleState} />

      <BattleControlsBar battleState={controlsData} />

      <BattleBottomGrid battleState={gridData} />
    </div>
  );
}