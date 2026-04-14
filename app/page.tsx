'use client';

import HomeScreen from '@/components/HomeScreen';
import SummonScreen from '@/components/SummonScreen';
import UnitsScreen from '@/components/UnitsScreen';
import QuestScreen from '@/components/QuestScreen';
import BattleScreen from '@/components/BattleScreen';
import QRHuntScreen from '@/components/QRHuntScreen';
import FusionScreen from '@/components/FusionScreen';
import EvolutionScreen from '@/components/EvolutionScreen';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { AlertModal } from '@/components/AlertModal';
import { BattleRewardsModal } from '@/components/BattleRewardsModal';
import { useGameApp } from '@/hooks/useGameApp';

export default function GameApp() {
  const {
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
  } = useGameApp();

  const { state, timeToNextEnergy, addUnit, setTeamMember, spendGems, processQrScan, rollGacha, equipItem, unequipItem, fuseUnits, evolveUnit } = gameState;

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-zinc-950 text-zinc-100 sm:items-center sm:justify-center">
      {/* Mobile container constraint for desktop viewing */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-900 sm:h-[844px] sm:w-[390px] sm:rounded-[40px] sm:border-[8px] sm:border-zinc-800 sm:shadow-2xl">
        
        {/* Top Bar (Header) */}
        {currentScreen !== 'battle' && (
          <TopBar state={state} timeToNextEnergy={timeToNextEnergy} />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {currentScreen === 'home' && <HomeScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'units' && <UnitsScreen state={state} setTeamMember={setTeamMember} equipItem={equipItem} unequipItem={unequipItem} onNavigateToFusion={navigateToFusion} onNavigateToEvolution={navigateToEvolution} />}
          {currentScreen === 'summon' && <SummonScreen state={state} spendGems={spendGems} addUnit={addUnit} rollGacha={rollGacha} onAlert={setAlertMessage} />}
          {currentScreen === 'quest' && <QuestScreen onStartBattle={startBattle} />}
          {currentScreen === 'battle' && <BattleScreen state={state} stageId={battleStage!} onEnd={endBattle} />}
          {currentScreen === 'qrhunt' && <QRHuntScreen state={state} onBack={() => setCurrentScreen('home')} onScan={processQrScan} />}
          {currentScreen === 'fusion' && fusionTargetId && <FusionScreen state={state} targetInstanceId={fusionTargetId} onBack={() => setCurrentScreen('units')} fuseUnits={fuseUnits} onAlert={setAlertMessage} />}
          {currentScreen === 'evolution' && evolutionTargetId && <EvolutionScreen state={state} targetInstanceId={evolutionTargetId} onBack={() => setCurrentScreen('units')} evolveUnit={evolveUnit} onAlert={setAlertMessage} />}
        </main>

        {/* Bottom Navigation Bar */}
        {currentScreen !== 'battle' && (
          <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
        )}

        {/* Global Alert Modal */}
        {alertMessage && (
          <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
        )}
        
        {/* Battle Rewards Modal */}
        {battleRewards && (
          <BattleRewardsModal rewards={battleRewards} onClose={() => setBattleRewards(null)} />
        )}

      </div>
    </div>
  );
}
