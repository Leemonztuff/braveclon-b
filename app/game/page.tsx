'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGameApp, Screen } from '@/hooks/useGameApp';
import { getCurrentUser, onAuthChange, AuthUser } from '@/lib/auth';
import { initializeGameData, isUsingOfflineMode } from '@/lib/gameData';
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
import GuildScreen from '@/components/GuildScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { BottomNav } from '@/components/BottomNav';
import { CurrencyDisplay, EFFECTS } from '@/components/ui/DesignSystem';
import { User } from 'lucide-react';

export default function GameApp() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [skippedAuth, setSkippedAuth] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser as AuthUser | null);
      setAuthChecked(true);
    };
    checkAuth();

    const authListener = onAuthChange((user) => {
      setUser(user);
    });

    initializeGameData().then(() => {
      if (isUsingOfflineMode()) {
        setShowOfflineToast(true);
      }
    });

    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const effectiveUserId = user ? user.id : (skippedAuth ? 'guest' : undefined);
  
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
  } = useGameApp(effectiveUserId);

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

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="animate-spin mb-4 text-amber-400 text-4xl">⚔️</div>
          <p>Verifying Identity...</p>
        </div>
      </div>
    );
  }

  if (!user && !skippedAuth) {
    return (
      <AuthScreen 
        onLogin={(id) => {
          // Auth listener will handle state update automatically
        }} 
        onSkip={() => setSkippedAuth(true)}
      />
    );
  }

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
            setTeamMember={setTeamMember}
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
      case 'guild':
        return (
          <GuildScreen
            state={state}
            onBack={goBack}
            onAlert={triggerAlert}
            onNavigate={(screen) => navigate(screen as any)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            user={user}
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
            <div className={`flex items-center justify-between px-4 py-2 border-b ${EFFECTS.glass} transition-all duration-300`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform overflow-hidden">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-amber-400">
                    {state.level}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-100 tracking-tight leading-none mb-1">{state.playerName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-tighter">Rank {state.rank}</span>
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-400">⚡ {state.energy}/{state.maxEnergy}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <CurrencyDisplay gems={state.gems} zel={state.zel} />
                {state.energy < state.maxEnergy && (
                  <span className="text-[9px] text-zinc-500 font-mono">
                    Next: {formatTime(timeToNextEnergy)}
                  </span>
                )}
              </div>
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

          {showOfflineToast && (
            <div className="fixed top-20 left-4 right-4 bg-amber-950/90 backdrop-blur border border-amber-800/50 rounded-lg p-3 shadow-lg animate-slideDown z-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-medium text-amber-100">Modo offline</p>
                  <p className="text-xs text-amber-200/70">Datos locales cargados</p>
                </div>
                <button onClick={() => setShowOfflineToast(false)} className="ml-auto text-amber-200 hover:text-amber-100">
                  <X size={18} />
                </button>
              </div>
            </div>
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
