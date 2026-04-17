'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, STAGES } from '@/lib/gameData';
import { GACHA_CONFIG } from '@/lib/economyData';
import { CurrencyDisplay, Card, EmptyState } from './ui/DesignSystem';

interface HomeScreenProps {
  state: PlayerState;
  onNavigate: (screen: 'home' | 'quest' | 'units' | 'battle' | 'qrhunt' | 'summon' | 'arena' | 'shop' | 'craft' | 'randall' | 'friends') => void;
  onStartBattle: (stageId: number) => void;
  timeToNextEnergy: number;
}

export default function HomeScreen({ state, onNavigate, onStartBattle, timeToNextEnergy }: HomeScreenProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const teamUnits = state.team.filter(id => id !== null).map(id => {
    const inst = state.inventory.find(u => u.instanceId === id);
    return inst ? UNIT_DATABASE[inst.templateId] : null;
  }).filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg font-bold text-zinc-900 shadow-lg">
            {state.playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{state.playerName}</div>
            <div className="text-[10px] text-amber-400">Rank {state.rank} · Lv.{state.playerLevel}</div>
          </div>
        </div>
        
        <CurrencyDisplay 
          gems={state.gems}
          zel={state.zel}
          energy={{ current: state.energy, max: state.maxEnergy }}
        />
      </div>

      {/* TEAM PREVIEW */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Your Party</div>
        <div className="flex gap-2 justify-center">
          {[0,1,2,3,4,5].map(idx => {
            const unitId = state.team[idx];
            const unit = unitId ? state.inventory.find(u => u.instanceId === unitId) : null;
            const template = unit ? UNIT_DATABASE[unit.templateId] : null;
            
            return (
              <div 
                key={idx}
                className={`
                  w-14 h-14 rounded-lg border-2 flex items-center justify-center overflow-hidden
                  ${template ? 'border-amber-500/50 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/30'}
                `}
              >
                {template ? (
                  <img 
                    src={template.spriteUrl} 
                    alt={template.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="text-zinc-700 text-lg">+</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Quick Battle */}
        <section>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">⚔️ Quick Battle</h2>
          <div className="space-y-2">
            {STAGES.slice(0, 4).map(stage => (
              <Card 
                key={stage.id}
                onClick={() => onStartBattle(stage.id)}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">{stage.area}</div>
                  <div className="text-xs text-zinc-500">{stage.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-400 font-bold">⚡{stage.energy}</div>
                  <div className="text-[10px] text-zinc-500">EXP {stage.expReward}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">📋 Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Card onClick={() => onNavigate('summon')} className="flex flex-col items-center justify-center py-4">
              <span className="text-2xl mb-1">✨</span>
              <span className="text-xs font-bold text-white">Summon</span>
              <span className="text-[10px] text-zinc-500">{GACHA_CONFIG.BANNERS.standard.cost}💎</span>
            </Card>
            <Card onClick={() => onNavigate('arena')} className="flex flex-col items-center justify-center py-4">
              <span className="text-2xl mb-1">⚔️</span>
              <span className="text-xs font-bold text-white">Arena</span>
              <span className="text-[10px] text-zinc-500">Practice</span>
            </Card>
          </div>
        </section>

        {/* Recent Units */}
        <section>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">👤 Your Units ({state.inventory.length})</h2>
          
          {state.inventory.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {state.inventory.slice(0, 8).map(unit => {
                const template = UNIT_DATABASE[unit.templateId];
                return (
                  <button
                    key={unit.instanceId}
                    onClick={() => onNavigate('units')}
                    className="aspect-square rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden hover:border-amber-500/50 transition-all"
                  >
                    <img 
                      src={template.spriteUrl}
                      alt={template.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              icon="🎮"
              title="No units yet"
              description="Use Summon to get your first units"
            />
          )}
        </section>
      </div>
    </div>
  );
}
