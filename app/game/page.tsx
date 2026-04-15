'use client';

import { useState } from 'react';
import { useGameApp, Screen } from '@/hooks/useGameApp';
import { BattleRewards } from '@/components/BattleRewardsModal';
import { X } from 'lucide-react';
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

export default function GameApp() {
  const [user, setUser] = useState<{ id: string; email: string } | null>({ id: 'guest', email: '' });
  
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
    handlePurchase,
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
    evolveUnit
  } = useGameApp(user?.id);

  const state = gameState.state;

  const handleStartBattle = (stageId: number) => {
    startBattle(stageId);
  };

  const handleFusionBack = () => {
    navigate('units');
  };

  const handleEvolutionBack = () => {
    navigate('units');
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="animate-spin mb-4">⚔️</div>
          <p>Loading Game...</p>
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderScreen = () => {
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
              setFusionTargetId(unitId);
              navigate('fusion');
            }}
            onNavigateToEvolution={(unitId) => {
              setEvolutionTargetId(unitId);
              navigate('evolution');
            }}
            onNavigate={navigate}
          />
        );
      case 'summon':
        return (
          <SummonScreen
            state={state}
            addUnit={addUnit}
            spendGems={spendGems}
            rollGacha={rollGacha}
            onAlert={triggerAlert}
          />
        );
      case 'quest':
        return <QuestScreen onStartBattle={handleStartBattle} />;
      case 'shop':
        return (
          <ShopScreen
            state={state}
            onBack={goBack}
            onPurchase={handlePurchase}
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
            onScan={(hash) => processQrScan(hash)}
            onBack={goBack}
          />
        );
      case 'fusion':
        return (
          <FusionScreen
            state={state}
            targetInstanceId={fusionTargetId!}
            fuseUnits={fuseUnits}
            onBack={handleFusionBack}
            onAlert={triggerAlert}
          />
        );
      case 'evolution':
        return (
          <EvolutionScreen
            state={state}
            targetInstanceId={evolutionTargetId!}
            onBack={handleEvolutionBack}
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
          />
        ) : null;
      case 'arena':
        return (
          <ArenaScreen
            onStartBattle={() => {}}
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

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-zinc-950 text-zinc-100">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 safe-area">
        {currentScreen !== 'battle' && (
          <div className="flex items-center justify-between bg-zinc-950/80 backdrop-blur-sm px-4 py-3 border-b border-zinc-800/50 z-40">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Lv. {state.level}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {state.energy}/{state.maxEnergy}
                  </span>
                </div>
                {state.energy < state.maxEnergy && (
                  <span className="text-xs text-emerald-500/70 font-mono">
                    {formatTime(timeToNextEnergy)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-zinc-500 uppercase tracking-wider">💎</div>
                <div className="text-sm font-bold text-yellow-400">{state.gems}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-zinc-500 uppercase tracking-wider">🪙</div>
                <div className="text-sm font-bold text-amber-500">{state.zel}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full h-full animate-fadeIn">
            {renderScreen()}
          </div>
        </div>

        {showAlert && alertMessage && (
          <div className="fixed top-20 left-4 right-4 bg-red-950/90 backdrop-blur border border-red-800/50 rounded-lg p-3 shadow-lg animate-slideDown z-50">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-100">{alertMessage}</p>
              </div>
              <button onClick={() => setShowAlert(false)} className="ml-auto text-red-200 hover:text-red-100">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {battleRewards && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-w-lg w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <h2 className="text-xl font-black text-amber-300 mb-4">Battle Results</h2>
              <div className="space-y-3 mb-6">
                <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4">
                  <p className="text-sm text-zinc-400">Zel earned</p>
                  <p className="text-3xl font-black text-emerald-400">+{battleRewards.zel}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4">
                  <p className="text-sm text-zinc-400">EXP gained</p>
                  <p className="text-3xl font-black text-sky-400">+{battleRewards.exp}</p>
                </div>
                {battleRewards.playerLeveledUp && (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-emerald-200">
                    Player leveled up! Energy refilled.
                  </div>
                )}
                {battleRewards.leveledUpUnits && battleRewards.leveledUpUnits.length > 0 && (
                  <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4">
                    <h3 className="text-sm font-bold text-zinc-300 uppercase mb-3">Units Leveled Up</h3>
                    <div className="space-y-2">
                      {battleRewards.leveledUpUnits.map((u: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm text-zinc-200">
                          <span>{u.name}</span>
                          <span className="text-emerald-400">Lv.{u.oldLevel} → Lv.{u.newLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={dismissBattleRewards}
                className="w-full rounded-2xl bg-amber-400 py-3 text-black font-black hover:bg-amber-300 transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
