'use client';

import { useState, useCallback } from 'react';
import { useGameApp, Screen } from '@/hooks/useGameApp';
import { BattleRewards } from '@/components/BattleRewardsModal';
import { X } from 'lucide-react';
import ViewportWrapper from '@/components/ViewportWrapper';
import AuthScreen from '@/components/AuthScreen';
import HomeScreen from '@/components/HomeScreen';
import RandallScreen from '@/components/RandallScreen';
import SummonScreen from '@/components/SummonScreen';
import UnitsScreen from '@/components/UnitsScreen';
import QuestScreen from '@/components/QuestScreen';
import BattleScreen from '@/components/BattleScreen';
import QRHuntScreen from '@/components/QRHuntScreen';
import FusionScreen from '@/components/FusionScreen';
import EvolutionScreen from '@/components/EvolutionScreen';
import ArenaScreen from '@/components/ArenaScreen';
import ShopScreen from '@/components/ShopScreen';
import CraftScreen from '@/components/CraftScreen';
import { BottomNav } from '@/components/BottomNav';
import { CurrencyDisplay } from '@/components/ui/DesignSystem';

export default function GameApp() {
  const [user] = useState<{ id: string; email: string } | null>({ id: 'guest', email: '' });
  
  const {
    gameState,
    isLoaded,
    timeToNextEnergy,
    currentScreen,
    battleStage,
    fusionTargetId,
    evolutionTargetId,
    showAlert,
    alertMessage,
    battleRewards,
    startBattle,
    endBattle,
    dismissBattleRewards,
    navigate,
    goBack,
    triggerAlert,
    addUnit,
    setTeamMember,
    spendGems,
    rollGacha,
    equipItem,
    unequipItem,
    fuseUnits,
    setFusionTargetId,
    setEvolutionTargetId,
    processQrScan,
    evolveUnit,
    setShowAlert,
    craftItem,
    purchaseShopUnit,
    purchaseShopEquipment,
    purchaseConsumable,
  } = useGameApp(user?.id);

  const state = gameState?.state;
  const isGameLoaded = gameState?.isLoaded ?? isLoaded;

  const handlePurchase = useCallback((price: number, currency: 'zel' | 'gems') => {
    if (!state) return false;
    if (currency === 'zel' && state.zel >= price) {
      gameState?.spendCurrency?.(currency, price);
      return true;
    }
    if (currency === 'gems' && state.gems >= price) {
      gameState?.spendCurrency?.(currency, price);
      return true;
    }
    return false;
  }, [state, gameState]);

  const handleStartBattle = useCallback((stageId: number) => {
    if (startBattle) startBattle(stageId);
  }, [startBattle]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isGameLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="animate-spin mb-4">⚔️</div>
          <p>Loading Game...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    if (!state) return null;

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            state={state} 
            onNavigate={navigate} 
            onStartBattle={handleStartBattle} 
            timeToNextEnergy={timeToNextEnergy}
          />
        );
      case 'units':
        return (
          <UnitsScreen
            state={state}
            setTeamMember={setTeamMember}
            equipItem={equipItem}
            unequipItem={unequipItem}
            onNavigateToFusion={(unitId) => {
              setFusionTargetId?.(unitId);
              navigate('fusion');
            }}
            onNavigateToEvolution={(unitId) => {
              setEvolutionTargetId?.(unitId);
              navigate('evolution');
            }}
            onNavigate={navigate}
            onBack={goBack}
          />
        );
      case 'summon':
        return (
          <SummonScreen
            state={state}
            addUnit={addUnit}
            rollGacha={rollGacha}
            onAlert={triggerAlert}
            onBack={goBack}
          />
        );
      case 'quest':
        return <QuestScreen onStartBattle={handleStartBattle} onBack={goBack} />;
      case 'shop':
        return (
          <ShopScreen
            state={state}
            onBack={goBack}
            onPurchaseUnit={purchaseShopUnit}
            onPurchaseEquipment={purchaseShopEquipment}
            onPurchaseConsumable={purchaseConsumable}
            onAlert={triggerAlert}
          />
        );
      case 'craft':
        return (
          <CraftScreen
            state={state}
            onCraft={craftItem}
            onBack={goBack}
            onAlert={triggerAlert}
          />
        );
      case 'randall':
        return (
          <RandallScreen 
            state={state} 
            onBack={goBack}
            onPurchase={handlePurchase}
          />
        );
      case 'qrhunt':
        return (
          <QRHuntScreen
            state={state}
            onScan={processQrScan}
            onBack={goBack}
          />
        );
      case 'fusion':
        return (
          <FusionScreen
            state={state}
            targetInstanceId={fusionTargetId!}
            fuseUnits={fuseUnits}
            onBack={goBack}
            onAlert={triggerAlert}
          />
        );
      case 'evolution':
        return (
          <EvolutionScreen
            state={state}
            targetInstanceId={evolutionTargetId!}
            onBack={goBack}
            evolveUnit={evolveUnit}
            onAlert={triggerAlert}
          />
        );
      case 'battle':
        return battleStage !== null ? (
          <BattleScreen
            state={state}
            stageId={battleStage}
            onEnd={endBattle}
            onBack={goBack}
          />
        ) : null;
      case 'arena':
        return (
          <ArenaScreen
            state={state}
            onStartBattle={handleStartBattle}
            onBack={goBack}
          />
        );
      case 'friends':
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2">Coming Soon</h2>
            <p className="text-zinc-500 text-center">Friends system will be available in a future update.</p>
            <button 
              onClick={goBack}
              className="mt-6 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-lg font-bold"
            >
              Go Back
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const showTopBar = currentScreen !== 'battle' && state;

  return (
    <ViewportWrapper>
      <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100">
        <div className="relative flex flex-col h-full w-full overflow-hidden bg-zinc-950 safe-area">
          {showTopBar && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lv. {state.level}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-400">
                    ⚡ {state.energy}/{state.maxEnergy}
                  </span>
                  {state.energy < state.maxEnergy && (
                    <span className="text-xs text-emerald-500/70 font-mono">
                      {formatTime(timeToNextEnergy)}
                    </span>
                  )}
                </div>
              </div>
              <CurrencyDisplay gems={state.gems} zel={state.zel} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-full h-full animate-fadeIn">
              {renderScreen()}
            </div>
          </div>

          {currentScreen !== 'battle' && (
            <BottomNav currentScreen={currentScreen} setCurrentScreen={navigate} />
          )}

          {showAlert && alertMessage && (
            <div className="fixed top-20 left-4 right-4 bg-red-950/90 backdrop-blur border border-red-800/50 rounded-lg p-3 shadow-lg animate-slideDown z-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-red-100">{alertMessage}</p>
                </div>
                <button onClick={() => setShowAlert?.(false)} className="ml-auto text-red-200 hover:text-red-100">
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {battleRewards && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="max-w-lg w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-amber-400 mb-4">Battle Results</h2>
                <div className="space-y-3 mb-6">
                  <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                    <p className="text-sm text-zinc-400">Zel earned</p>
                    <p className="text-2xl font-bold text-amber-400">+{battleRewards.zel.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                    <p className="text-sm text-zinc-400">EXP gained</p>
                    <p className="text-2xl font-bold text-sky-400">+{battleRewards.exp}</p>
                  </div>
                  {battleRewards.playerLeveledUp && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-emerald-200">
                      Level up! Energy refilled.
                    </div>
                  )}
                  {battleRewards.leveledUpUnits && battleRewards.leveledUpUnits.length > 0 && (
                    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                      <h3 className="text-sm font-bold text-zinc-300 uppercase mb-2">Units Leveled Up</h3>
                      {battleRewards.leveledUpUnits.map((u: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm text-zinc-200 py-1">
                          <span>{u.name}</span>
                          <span className="text-emerald-400">Lv.{u.oldLevel} → Lv.{u.newLevel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={dismissBattleRewards}
                  className="w-full rounded-xl bg-amber-400 py-3 text-zinc-900 font-bold hover:bg-amber-300 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewportWrapper>
  );
}
