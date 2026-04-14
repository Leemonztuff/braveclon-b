'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE } from '@/lib/gameData';

interface HomeScreenProps {
  state: PlayerState;
  onNavigate: (screen: 'home' | 'quest' | 'units' | 'battle' | 'qrhunt' | 'summon' | 'arena' | 'shop' | 'randall' | 'friends') => void;
  onStartBattle: (stageId: number) => void;
  timeToNextEnergy: number;
}

const REEL_MENU = [
  { id: 'quest', label: 'QUEST', icon: '/icons/combat/melee.svg', desc: 'Story Mode' },
  { id: 'gate', label: 'GATE', icon: '/icons/entity/loot.svg', desc: 'Special' },
  { id: 'arena', label: 'ARENA', icon: '/icons/game/combat.svg', desc: 'PvP' },
  { id: 'summon_lab', label: 'SUMMON LAB', icon: '/icons/entity/potion.svg', desc: 'Special' },
];

const BOTTOM_MENU = [
  { id: 'home', label: 'HOME', icon: '/icons/entity/person.svg' },
  { id: 'units', label: 'UNITS', icon: '/icons/entity/party.svg' },
  { id: 'randall', label: 'RANDALL', icon: '/icons/game/castle.svg' },
  { id: 'shop', label: 'GEMS', icon: '/icons/entity/loot.svg' },
  { id: 'summon', label: 'SUMMON', icon: '/icons/entity/potion.svg' },
  { id: 'friends', label: 'FRIENDS', icon: '/icons/game/party.svg' },
];

export default function HomeScreen({ state, onNavigate, onStartBattle, timeToNextEnergy }: HomeScreenProps) {
  const [selectedReel, setSelectedReel] = useState('quest');

  const handleReelClick = (id: string) => {
    setSelectedReel(id);
    if (id === 'quest') {
      onNavigate('quest');
    } else if (id === 'arena') {
      onNavigate('arena');
    } else if (id === 'gate') {
      onNavigate('quest'); 
    }
  };

  const handleBottomClick = (id: string) => {
    if (id === 'home') return;
    if (id === 'shop') {
      onNavigate('shop');
    } else {
      onNavigate(id as any);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP BAR - Player Info Panel (BF2 Style: Left side) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700/50">
        {/* Left: Player Name & Rank */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-bold shadow-lg">
            {state.playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">{state.playerName}</div>
            <div className="text-[10px] text-amber-400 font-medium">Rank {state.rank}</div>
          </div>
        </div>

        {/* Center: Title */}
        <div className="text-center">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">BRAVE FRONTIER</div>
        </div>

        {/* Right: Info/Mail/Book Icons */}
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
            <span className="text-xs">📫</span>
          </button>
          <button className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
            <span className="text-xs">📧</span>
          </button>
          <button className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
            <span className="text-xs">📖</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RESOURCE BAR - Hearts / Zel / Gems (BF2 Style: Right side panel) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex justify-end px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          {/* Hearts */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/30">
            <span className="text-red-400 text-sm">❤️</span>
            <span className="text-xs font-bold text-red-300">{state.energy}/{state.maxEnergy}</span>
          </div>
          
          {/* Zel */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
            <span className="text-green-400 text-sm">💰</span>
            <span className="text-xs font-bold text-green-300">{state.zel.toLocaleString()}</span>
          </div>
          
          {/* Gems */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <span className="text-purple-400 text-sm">💎</span>
            <span className="text-xs font-bold text-purple-300">{state.gems}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* REEL MENU - Quest / Gate / Arena / Summon Lab */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">REEL MENU</div>
          <div className="grid grid-cols-4 gap-2">
            {REEL_MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => handleReelClick(item.id)}
                className={`
                  relative p-3 rounded-xl border-2 transition-all duration-200
                  ${selectedReel === item.id 
                    ? 'bg-gradient-to-b from-amber-500/20 to-orange-600/20 border-amber-500 shadow-lg shadow-amber-500/20' 
                    : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50'}
                `}
              >
                <img src={item.icon} alt={item.label} className="w-8 h-8 mx-auto mb-1 invert brightness-200" />
                <div className={`text-[10px] font-bold text-center ${selectedReel === item.id ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {item.label}
                </div>
                <div className="text-[8px] text-zinc-500 text-center">{item.desc}</div>
                
                {/* Active indicator */}
                {selectedReel === item.id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* QUICK ACTION BUTTONS (Grid below Reel) */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">QUEST</div>
          <button
            onClick={() => onNavigate('quest')}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-sm font-bold text-blue-300">Start Adventure</div>
                <div className="text-[10px] text-zinc-400">Chapter 1: The Beginning</div>
              </div>
              <div className="text-2xl">▶️</div>
            </div>
          </button>
        </div>

        {/* RECENT UNITS */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">RECENT UNITS</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {state.inventory.slice(0, 5).map((unit, idx) => {
              const template = UNIT_DATABASE[unit.templateId];
              return (
                <div 
                  key={unit.instanceId} 
                  className="shrink-0 w-16 h-20 rounded-lg bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center overflow-hidden"
                >
                  <div className="text-2xl">👤</div>
                  <div className="text-[8px] text-zinc-400 mt-1">{template?.name?.slice(0, 6) || 'Unit'}</div>
                </div>
              );
            })}
            {/* Empty slots */}
            {[...Array(Math.max(0, 5 - state.inventory.length))].map((_, i) => (
              <div key={`empty-${i}`} className="shrink-0 w-16 h-20 rounded-lg bg-zinc-900/50 border border-zinc-800 border-dashed flex flex-col items-center justify-center">
                <div className="text-zinc-600 text-xl">+</div>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM PREVIEW */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">CURRENT PARTY</div>
          <div className="flex justify-center gap-1 p-3 bg-zinc-800/30 rounded-xl">
            {state.team.map((instanceId, idx) => {
              const unit = instanceId ? state.inventory.find(u => u.instanceId === instanceId) : null;
              const template = unit ? UNIT_DATABASE[unit.templateId] : null;
              return (
                <div 
                  key={idx}
                  className={`
                    w-12 h-16 rounded-lg flex flex-col items-center justify-center
                    ${idx === 0 ? 'ring-2 ring-amber-500' : ''}
                    ${unit ? 'bg-zinc-700' : 'bg-zinc-800/50 border border-zinc-700 border-dashed'}
                  `}
                >
                  <div className="text-xl">{template ? '👤' : '?'}</div>
                  {idx === 0 && <div className="text-[8px] text-amber-400 font-bold">L</div>}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM NAVIGATION - 6 Buttons (BF2 Style) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-6 gap-1 px-2 py-2 bg-zinc-900 border-t border-zinc-800">
        {BOTTOM_MENU.map((item) => (
          <button
            key={item.id}
            onClick={() => handleBottomClick(item.id)}
            className={`
              flex flex-col items-center justify-center p-1 rounded-lg transition-all
              ${item.id === 'home' 
                ? 'bg-gradient-to-t from-amber-500/20 to-transparent' 
                : 'hover:bg-zinc-800'}
            `}
          >
            <img src={item.icon} alt={item.label} className={`w-5 h-5 ${item.id === 'home' ? 'invert brightness-200' : 'invert brightness-150'}`} />
            <div className={`text-[8px] font-medium ${item.id === 'home' ? 'text-amber-400' : 'text-zinc-500'}`}>
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}