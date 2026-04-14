import { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { STAGES } from '@/lib/gameData';
import { BattleRewards } from '@/components/BattleRewardsModal';

export type Screen = 'home' | 'units' | 'summon' | 'quest' | 'battle' | 'qrhunt' | 'fusion' | 'evolution';

export function useGameApp() {
  const gameState = useGameState();
  const { isLoaded, spendEnergy, winBattle } = gameState;
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [battleStage, setBattleStage] = useState<number | null>(null);
  const [fusionTargetId, setFusionTargetId] = useState<string | null>(null);
  const [evolutionTargetId, setEvolutionTargetId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [battleRewards, setBattleRewards] = useState<BattleRewards | null>(null);

  const startBattle = (stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) return;

    if (spendEnergy(stage.energy)) {
      setBattleStage(stageId);
      setCurrentScreen('battle');
    } else {
      setAlertMessage(`Not enough energy! You need ${stage.energy} ⚡ to start this quest.`);
    }
  };

  const endBattle = (victory: boolean) => {
    setCurrentScreen('home');
    if (victory && battleStage !== null) {
      const rewards = winBattle(battleStage);
      setBattleRewards(rewards);
    }
    setBattleStage(null);
  };

  const navigateToFusion = (id: string) => {
    setFusionTargetId(id);
    setCurrentScreen('fusion');
  };

  const navigateToEvolution = (id: string) => {
    setEvolutionTargetId(id);
    setCurrentScreen('evolution');
  };

  return {
    gameState,
    isLoaded,
    currentScreen,
    setCurrentScreen,
    battleStage,
    fusionTargetId,
    evolutionTargetId,
    alertMessage,
    setAlertMessage,
    battleRewards,
    setBattleRewards,
    startBattle,
    endBattle,
    navigateToFusion,
    navigateToEvolution
  };
}
