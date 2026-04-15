'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE } from '@/lib/gameData';
import { motion } from 'motion/react';

interface HomeScreenProps {
  state: PlayerState;
  onNavigate: (screen: 'home' | 'quest' | 'units' | 'battle' | 'qrhunt' | 'summon' | 'arena' | 'shop' | 'randall' | 'friends') => void;
  onStartBattle: (stageId: number) => void;
  timeToNextEnergy: number;
}

// BF2 Quick Action Button
interface QuickActionProps {
  id: string;
  label: string;
  icon: string;
  desc?: string;
  onClick: () => void;
  isActive?: boolean;
  variant?: 'default' | 'highlight';
}

function QuickAction({ id, label, icon, desc, onClick, isActive, variant = 'default' }: QuickActionProps) {
  const isHighlight = variant === 'highlight';
  
  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 rounded-xl border-2 transition-all duration-200
        ${isHighlight 
          ? 'bg-gradient-to-b from-[#c9a227]/20 to-[#b89947]/10 border-[#b89947] shadow-lg shadow-[#b89947]/20' 
          : isActive
            ? 'bg-gradient-to-b from-amber-500/20 to-orange-600/20 border-amber-500 shadow-lg shadow-amber-500/20'
            : 'bg-[#1a1a2e] border-[#b89947]/30 hover:bg-[#252a4a] hover:border-[#b89947]/50'
        }
      `}
    >
      <img src={icon} alt={label} className="w-8 h-8 mx-auto mb-1 invert brightness-200" />
      <div className={`text-[10px] font-bold text-center ${isHighlight || isActive ? 'text-[#c9a227]' : 'text-zinc-300'}`}>
        {label}
      </div>
      {desc && <div className="text-[8px] text-zinc-500 text-center">{desc}</div>}
      
      {/* Active indicator */}
      {(isActive || isHighlight) && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c9a227] rounded-full" />
      )}
    </button>
  );
}

// Hero Banner Component
interface HeroBannerProps {
  title: string;
  subtitle: string;
  onClick?: () => void;
}

function HeroBanner({ title, subtitle, onClick }: HeroBannerProps) {
  return (
    <div 
      onClick={onClick}
      className="relative w-full h-32 rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]" />
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #b89947 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} 
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between px-6 h-full">
        <div>
          <h2 className="text-2xl font-black italic text-[#c9a227] uppercase tracking-wider drop-shadow-lg">
            {title}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#b89947]/20 to-transparent border-2 border-[#b89947]/50 flex items-center justify-center">
          <span className="text-3xl">⚔️</span>
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#b89947]/0 to-[#b89947]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// Region Tab for Home
interface RegionTabProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

function RegionTab({ name, isActive, onClick }: RegionTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
        ${isActive 
          ? 'bg-gradient-to-b from-[#c9a227] to-[#b89947] text-zinc-900 shadow-md' 
          : 'bg-[#1a1a2e] text-zinc-400 border border-[#b89947]/30 hover:text-white hover:border-[#b89947]/50'
        }
      `}
    >
      {name}
    </button>
  );
}

const REEL_MENU = [
  { id: 'quest', label: 'QUEST', icon: '/icons/combat/melee.svg', desc: 'Story Mode' },
  { id: 'arena', label: 'ARENA', icon: '/icons/game/combat.svg', desc: 'PvP' },
  { id: 'qrhunt', label: 'QR HUNT', icon: '/icons/entity/potion.svg', desc: 'Special' },
  { id: 'summon', label: 'SUMMON', icon: '/icons/entity/potion.svg', desc: 'Gacha' },
];

const BOTTOM_MENU = [
  { id: 'home', label: 'HOME', icon: '/icons/entity/person.svg' },
  { id: 'units', label: 'UNITS', icon: '/icons/entity/party.svg' },
  { id: 'randall', label: 'RANDALL', icon: '/icons/game/castle.svg' },
  { id: 'shop', label: 'GEMS', icon: '/icons/entity/loot.svg' },
  { id: 'summon', label: 'SUMMON', icon: '/icons/entity/potion.svg' },
  { id: 'arena', label: 'ARENA', icon: '/icons/game/combat.svg' },
];

export default function HomeScreen({ state, onNavigate, onStartBattle, timeToNextEnergy }: HomeScreenProps) {
  const [selectedReel, setSelectedReel] = useState('quest');
  const [activeRegion, setActiveRegion] = useState('Quest');

  const handleReelClick = (id: string) => {
    setSelectedReel(id);
    if (id === 'quest') {
      onNavigate('quest');
    } else if (id === 'arena') {
      onNavigate('arena');
    } else if (id === 'qrhunt') {
      onNavigate('qrhunt');
    } else if (id === 'summon') {
      onNavigate('summon');
    }
  };

  const handleBottomClick = (id: string) => {
    if (id === 'home') return;
    onNavigate(id as any);
  };

  const handleRegionClick = (region: string) => {
    setActiveRegion(region);
    if (region === 'Quest') {
      onNavigate('quest');
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#16213e]">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP BAR - Player Info Panel (BF2 Style) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-b border-[#b89947]/30">
        {/* Left: Player Name & Rank */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a227] to-[#b89947] flex items-center justify-center text-lg font-bold shadow-lg text-zinc-900">
            {state.playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">{state.playerName}</div>
            <div className="text-[10px] text-[#c9a227] font-medium">Rank {state.rank}</div>
          </div>
        </div>

        {/* Center: Title */}
        <div className="text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">BRAVE FRONTIER</div>
        </div>

        {/* Right: Info/Mail/Book Icons */}
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg bg-[#1a1a2e] border border-[#b89947]/30 flex items-center justify-center text-zinc-300 hover:bg-[#252a4a] transition-colors">
            <span className="text-xs">📫</span>
          </button>
          <button className="w-7 h-7 rounded-lg bg-[#1a1a2e] border border-[#b89947]/30 flex items-center justify-center text-zinc-300 hover:bg-[#252a4a] transition-colors">
            <span className="text-xs">📧</span>
          </button>
          <button className="w-7 h-7 rounded-lg bg-[#1a1a2e] border border-[#b89947]/30 flex items-center justify-center text-zinc-300 hover:bg-[#252a4a] transition-colors">
            <span className="text-xs">📖</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RESOURCE BAR - Hearts / Zel / Gems (BF2 Style) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex justify-end px-3 py-2 bg-[#1a1a2e]/50 border-b border-[#b89947]/20">
        <div className="flex items-center gap-3">
          {/* Hearts */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/30">
            <span className="text-red-400 text-sm">❤️</span>
            <span className="text-xs font-bold text-red-300">{state.energy}/{state.maxEnergy}</span>
          </div>
          
          {/* Zel */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-yellow-400 text-sm">💰</span>
            <span className="text-xs font-bold text-yellow-300">{state.zel.toLocaleString()}</span>
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
        
        {/* Hero Banner */}
        <div className="mb-6">
          <HeroBanner 
            title="Grand Quest" 
            subtitle="Chapter 1: The Beginning" 
            onClick={() => onNavigate('quest')}
          />
        </div>

        {/* Region Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Quest', 'Arena', 'Events', 'Special'].map((region) => (
              <RegionTab
                key={region}
                name={region}
                isActive={activeRegion === region}
                onClick={() => handleRegionClick(region)}
              />
            ))}
          </div>
        </div>

        {/* REEL MENU - Quest / Gate / Arena / Summon Lab */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">GATES</div>
          <div className="grid grid-cols-4 gap-2">
            {REEL_MENU.map((item) => (
              <QuickAction
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                desc={item.desc}
                isActive={selectedReel === item.id}
                onClick={() => handleReelClick(item.id)}
              />
            ))}
          </div>
        </div>

        {/* QUICK START BUTTON (BF2 Style) */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('quest')}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-[#b89947]/20 via-[#c9a227]/10 to-[#b89947]/20 border border-[#b89947]/30 hover:border-[#c9a227] hover:bg-gradient-to-r hover:from-[#b89947]/30 hover:via-[#c9a227]/20 hover:to-[#b89947]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-sm font-black italic text-[#c9a227] uppercase tracking-wider">Start Adventure</div>
                <div className="text-[10px] text-zinc-400">Chapter 1: The Beginning</div>
              </div>
              <div className="text-2xl group-hover:translate-x-1 transition-transform">▶️</div>
            </div>
          </button>
        </div>

        {/* RECENT UNITS (BF2 Styled) */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">RECENT UNITS</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {state.inventory.slice(0, 5).map((unit) => {
              const template = UNIT_DATABASE[unit.templateId];
              const rarityColor = template?.rarity === 5 ? 'border-yellow-400 shadow-yellow-400/30' :
                                 template?.rarity === 4 ? 'border-purple-400 shadow-purple-400/30' :
                                 template?.rarity === 3 ? 'border-blue-400 shadow-blue-400/30' :
                                 'border-zinc-600';
              return (
                <div 
                  key={unit.instanceId} 
                  className={`shrink-0 w-16 h-20 rounded-lg bg-[#1a1a2e] border-2 ${rarityColor} flex flex-col items-center justify-center overflow-hidden`}
                >
                  <div className="text-2xl">👤</div>
                  <div className="text-[8px] text-zinc-400 mt-1 text-center leading-tight px-1">
                    {template?.name?.slice(0, 6) || 'Unit'}
                  </div>
                  {template && (
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(template.rarity)].map((_, i) => (
                        <span key={i} className="text-[6px] text-yellow-400">★</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Empty slots */}
            {[...Array(Math.max(0, 5 - state.inventory.length))].map((_, i) => (
              <div key={`empty-${i}`} className="shrink-0 w-16 h-20 rounded-lg bg-[#1a1a2e]/50 border border-zinc-800 border-dashed flex flex-col items-center justify-center">
                <div className="text-zinc-600 text-xl">+</div>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM PREVIEW (BF2 Styled) */}
        <div className="mb-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 px-1">CURRENT PARTY</div>
          <div className="flex justify-center gap-1 p-3 bg-[#1a1a2e]/50 rounded-xl border border-[#b89947]/20">
            {state.team.map((instanceId, idx) => {
              const unit = instanceId ? state.inventory.find(u => u.instanceId === instanceId) : null;
              const template = unit ? UNIT_DATABASE[unit.templateId] : null;
              const isLeader = idx === 0;
              const rarityColor = isLeader 
                ? 'ring-2 ring-[#c9a227] ring-offset-2 ring-offset-[#1a1a2e]' 
                : template 
                  ? 'border-zinc-600' 
                  : 'border-zinc-700 border-dashed';
              
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className={`
                    w-12 h-16 rounded-lg flex flex-col items-center justify-center bg-[#1a1a2e] border-2
                    ${rarityColor}
                  `}
                >
                  <div className="text-xl">{template ? '👤' : '?'}</div>
                  {isLeader && <div className="text-[8px] text-[#c9a227] font-bold">L</div>}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM NAVIGATION - 6 Buttons (BF2 Style) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-6 gap-1 px-2 py-2 bg-[#1a1a2e] border-t border-[#b89947]/30">
        {BOTTOM_MENU.map((item) => (
          <button
            key={item.id}
            onClick={() => handleBottomClick(item.id)}
            className={`
              flex flex-col items-center justify-center p-1 rounded-lg transition-all
              ${item.id === 'home' 
                ? 'bg-gradient-to-t from-[#c9a227]/20 to-transparent' 
                : 'hover:bg-[#252a4a]'
              }
            `}
          >
            <img src={item.icon} alt={item.label} className={`w-5 h-5 ${item.id === 'home' ? 'invert brightness-200' : 'invert brightness-150'}`} />
            <div className={`text-[8px] font-medium ${item.id === 'home' ? 'text-[#c9a227]' : 'text-zinc-500'}`}>
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}