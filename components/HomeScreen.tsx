'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE } from '@/lib/gameData';
import { motion, AnimatePresence } from 'motion/react';

interface HomeScreenProps {
  state: PlayerState;
  onNavigate: (screen: 'home' | 'quest' | 'units' | 'battle' | 'qrhunt' | 'summon' | 'arena' | 'shop' | 'randall' | 'friends') => void;
  onStartBattle: (stageId: number) => void;
  timeToNextEnergy: number;
}

const BASE_URL = 'https://cdn.jsdelivr.net/gh/Leem0nGames/gameassets@main';

export default function HomeScreen({ state, onNavigate, onStartBattle, timeToNextEnergy }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'quest' | 'units' | 'gacha'>('quest');

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
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a14] to-[#1a1a2e]">
      {/* HEADER - Minimal BF2 Style */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d1a]/80 border-b border-[#b89947]/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a227] to-[#8b7235] flex items-center justify-center text-lg font-bold text-zinc-900 shadow-lg">
            {state.playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{state.playerName}</div>
            <div className="text-[10px] text-[#c9a227]">Rank {state.rank} · Lv.{state.playerLevel}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/30">
            <span className="text-red-400">⚡</span>
            <span className="text-xs font-bold text-red-300">{state.energy}/{state.maxEnergy}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-yellow-400">💰</span>
            <span className="text-xs font-bold text-yellow-300">{state.zel.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
            <span className="text-purple-400">💎</span>
            <span className="text-xs font-bold text-purple-300">{state.gems}</span>
          </div>
        </div>
      </div>

      {/* TEAM PREVIEW - muestra tu equipo actual */}
      <div className="px-4 py-3 border-b border-[#b899047]/10">
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
                  ${template ? 'border-[#b89947]/50 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/30'}
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

      {/* MAIN ACTION TABS - Clean BF2 Style */}
      <div className="flex px-4 pt-4 gap-2">
        <button
          onClick={() => { setActiveTab('quest'); onNavigate('quest'); }}
          className={`
            flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
            ${activeTab === 'quest' 
              ? 'bg-gradient-to-b from-[#c9a227] to-[#8b7235] text-zinc-900 shadow-lg shadow-[#c9a227]/20' 
              : 'bg-[#1a1a2e] text-zinc-400 border border-[#b89947]/30 hover:text-white'}
          `}
        >
          ⚔️ Quest
        </button>
        <button
          onClick={() => { setActiveTab('units'); onNavigate('units'); }}
          className={`
            flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
            ${activeTab === 'units' 
              ? 'bg-gradient-to-b from-[#c9a227] to-[#8b7235] text-zinc-900 shadow-lg shadow-[#c9a227]/20' 
              : 'bg-[#1a1a2e] text-zinc-400 border border-[#b89947]/30 hover:text-white'}
          `}
        >
          ⚔️ Units
        </button>
        <button
          onClick={() => { setActiveTab('gacha'); onNavigate('summon'); }}
          className={`
            flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
            ${activeTab === 'gacha' 
              ? 'bg-gradient-to-b from-[#c9a227] to-[#8b7235] text-zinc-900 shadow-lg shadow-[#c9a227]/20' 
              : 'bg-[#1a1a2e] text-zinc-400 border border-[#b89947]/30 hover:text-white'}
          `}
        >
          ✨ Gacha
        </button>
      </div>

      {/* CONTENT AREA - Based on active tab */}
      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'quest' && (
            <motion.div
              key="quest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Select Stage</div>
              
              {/* Stage Cards */}
              {[
                { id: 1, name: 'Mistral Plains', energy: 3, exp: 50, zel: 200, enemies: 3 },
                { id: 2, name: 'Cave of Flames', energy: 4, exp: 80, zel: 350, enemies: 3 },
                { id: 3, name: 'Destroyed Cathedral', energy: 5, exp: 120, zel: 500, enemies: 3 },
                { id: 4, name: 'Blood Forest', energy: 6, exp: 180, zel: 800, enemies: 3 },
              ].map(stage => (
                <button
                  key={stage.id}
                  onClick={() => onStartBattle(stage.id)}
                  className="w-full p-4 rounded-xl bg-[#1a1a2e] border border-[#b89947]/20 hover:border-[#b89947]/50 transition-all group text-left"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white group-hover:text-[#c9a227] transition-colors">
                      {stage.name}
                    </span>
                    <span className="text-xs text-blue-400 font-bold">⚡ {stage.energy}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <span>✨ {stage.exp} EXP</span>
                    <span>💰 {stage.zel}</span>
                    <span>👾 {stage.enemies} enemies</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'units' && (
            <motion.div
              key="units"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Your Units ({state.inventory.length})</div>
              
              <div className="grid grid-cols-3 gap-2">
                {state.inventory.slice(0, 9).map(unit => {
                  const template = UNIT_DATABASE[unit.templateId];
                  return (
                    <button
                      key={unit.instanceId}
                      onClick={() => onNavigate('units')}
                      className="aspect-square rounded-lg bg-zinc-900 border border-[#b89947]/20 overflow-hidden hover:border-[#c9a227] transition-all"
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
              
              {state.inventory.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  <div className="text-4xl mb-2">🎮</div>
                  <p>No units yet!</p>
                  <p className="text-xs">Use Gacha to get your first units</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'gacha' && (
            <motion.div
              key="gacha"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-center py-8"
            >
              <div className="text-6xl mb-4">✨</div>
              <div className="text-xl font-bold text-white">Summon Units</div>
              <div className="text-sm text-zinc-500">Get powerful units from the gacha!</div>
              
              <button
                onClick={() => onNavigate('summon')}
                className="w-full py-4 rounded-xl bg-gradient-to-b from-[#c9a227] to-[#8b7235] text-zinc-900 font-bold text-lg shadow-lg shadow-[#c9a227]/20"
              >
                💎 Summon (50 gems)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM MENU - Always visible actions */}
      <div className="grid grid-cols-4 gap-1 p-3 bg-[#0d0d1a]/80 border-t border-[#b89947]/20">
        <button onClick={() => onNavigate('shop')} className="py-3 rounded-lg bg-[#1a1a2e] text-zinc-400 text-xs font-bold hover:text-white transition-colors">
          🏪 Shop
        </button>
        <button onClick={() => onNavigate('randall')} className="py-3 rounded-lg bg-[#1a1a2e] text-zinc-400 text-xs font-bold hover:text-white transition-colors">
          🎁 Randall
        </button>
        <button onClick={() => onNavigate('arena')} className="py-3 rounded-lg bg-[#1a1a2e] text-zinc-400 text-xs font-bold hover:text-white transition-colors">
          ⚔️ Arena
        </button>
        <button onClick={() => onNavigate('qrhunt')} className="py-3 rounded-lg bg-[#1a1a2e] text-zinc-400 text-xs font-bold hover:text-white transition-colors">
          📱 QR Hunt
        </button>
      </div>
    </div>
  );
}