import { useState, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { BattleRewards } from '@/components/BattleRewardsModal';
import { STAGES } from '@/lib/gameData';

export type Screen = 
  | 'home' 
  | 'units' 
  | 'summon' 
  | 'quest' 
  | 'battle' 
  | 'qrhunt' 
  | 'fusion' 
  | 'evolution' 
  | 'arena' 
  | 'shop' 
  | 'craft'
  | 'randall'
  | 'friends';

export function useGameApp(userId?: string | null) {
  const gameState = useGameState({
    userId: userId || undefined,
    autoSave: true,
    saveInterval: 30000
  });
  const {
    isLoaded, 
    timeToNextEnergy,
    spendEnergy, 
    refundEnergy,
    winBattle,
    addUnit,
    setTeamMember,
    spendGems,
    rollGacha,
    equipItem,
    unequipItem,
    fuseUnits,
    updateState,
    processQrScan,
    evolveUnit,
    craftItem,
    purchaseShopUnit,
    purchaseShopEquipment,
    purchaseConsumable,
  } = gameState;
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [battleStage, setBattleStage] = useState<number | null>(null);
  const [fusionTargetId, setFusionTargetId] = useState<string | null>(null);
  const [evolutionTargetId, setEvolutionTargetId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [battleRewards, setBattleRewards] = useState<BattleRewards | null>(null);

  const triggerAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  }, []);

  const startBattle = useCallback((stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) return;

    if (spendEnergy(stage.energy)) {
      setBattleStage(stageId);
      setCurrentScreen('battle');
    } else {
      triggerAlert(`Not enough energy! You need ${stage.energy} ⚡ to start this quest.`);
    }
  }, [spendEnergy, triggerAlert]);

  const endBattle = useCallback((victory: boolean) => {
    const completedStageId = battleStage;
    
    if (victory && completedStageId !== null) {
      const rewards = winBattle(completedStageId);
      if (rewards) {
        setBattleRewards(rewards);
      }
    } else if (completedStageId !== null) {
      const stage = STAGES.find(s => s.id === completedStageId);
      if (stage) {
        refundEnergy(stage.energy);
      }
    }
    
    setCurrentScreen('home');
    setBattleStage(null);
  }, [battleStage, winBattle, refundEnergy]);

  const dismissBattleRewards = useCallback(() => {
    setBattleRewards(null);
  }, []);

  const navigateToFusion = useCallback((id: string) => {
    setFusionTargetId(id);
    setCurrentScreen('fusion');
  }, []);

  const navigateToEvolution = useCallback((id: string) => {
    setEvolutionTargetId(id);
    setCurrentScreen('evolution');
  }, []);

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const goBack = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handlePurchase = useCallback((price: number, currency: 'zel' | 'gems') => {
    const state = gameState.state;
    if (currency === 'zel' && state.zel >= price) {
      updateState({ zel: state.zel - price });
      return true;
    }
    if (currency === 'gems' && state.gems >= price) {
      updateState({ gems: state.gems - price });
      return true;
    }
    return false;
  }, [gameState.state, updateState]);

  const setFusionTargetIdState = useCallback((id: string | null) => {
    setFusionTargetId(id);
  }, []);

  const setEvolutionTargetIdState = useCallback((id: string | null) => {
    setEvolutionTargetId(id);
  }, []);

  return {
    gameState,
    isLoaded,
    timeToNextEnergy,
    currentScreen,
    setCurrentScreen: navigate,
    battleStage,
    fusionTargetId,
    evolutionTargetId,
    setFusionTargetId: setFusionTargetIdState,
    setEvolutionTargetId: setEvolutionTargetIdState,
    setShowAlert,
    showAlert,
    alertMessage,
    battleRewards,
    startBattle,
    endBattle,
    dismissBattleRewards,
    navigateToFusion,
    navigateToEvolution,
    navigate,
    goBack,
    triggerAlert,
    handlePurchase,
    addUnit,
    setTeamMember,
    spendGems,
    rollGacha,
    equipItem,
    unequipItem,
    fuseUnits,
    processQrScan,
    evolveUnit,
    craftItem,
    purchaseShopUnit,
    purchaseShopEquipment,
    purchaseConsumable,
  };
}
