'use client';

import { useState, useCallback } from 'react';
import { PlayerState, UnitInstance } from '@/lib/gameState';
import { UNIT_DATABASE, STAGES, UnitTemplate } from '@/lib/gameData';
import { GACHA_CONFIG } from '@/lib/economyData';
import { CurrencyDisplay, Card, EmptyState, formatTime } from './ui/DesignSystem';
import { motion, AnimatePresence } from 'motion/react';

interface HomeScreenProps {
  state: PlayerState;
  onNavigate: (screen: 'home' | 'quest' | 'units' | 'battle' | 'qrhunt' | 'summon' | 'arena' | 'shop' | 'craft' | 'randall' | 'friends') => void;
  onStartBattle: (stageId: number) => void;
  setTeamMember: (slot: number, unitId: string | null) => void;
  timeToNextEnergy: number;
}

export default function HomeScreen({ state, onNavigate, onStartBattle, setTeamMember, timeToNextEnergy }: HomeScreenProps) {
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showUnitDetails, setShowUnitDetails] = useState<UnitInstance | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);

  const teamUnits = state.team.filter(id => id !== null).map(id => {
    const inst = state.inventory.find(u => u.instanceId === id);
    return inst ? UNIT_DATABASE[inst.templateId] : null;
  }).filter(Boolean);

  const handleSlotClick = (idx: number) => {
    const unitId = state.team[idx];
    if (unitId) {
      const unit = state.inventory.find(u => u.instanceId === unitId);
      if (unit) setShowUnitDetails(unit);
    } else {
      setSelectedSlot(idx);
      setShowUnitPicker(true);
    }
  };

  const handleAddToTeam = (unitId: string) => {
    if (selectedSlot !== null) {
      setTeamMember(selectedSlot, unitId);
    }
    setShowUnitPicker(false);
    setSelectedSlot(null);
  };

  const handleRemoveFromTeam = (slot: number) => {
    setTeamMember(slot, null);
    setShowUnitDetails(null);
  };

  const handleDragStart = (idx: number) => {
    setDraggedSlot(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedSlot !== null && draggedSlot !== idx) {
      const draggedUnitId = state.team[draggedSlot];
      const targetUnitId = state.team[idx];
      setTeamMember(draggedSlot, targetUnitId);
      setTeamMember(idx, draggedUnitId);
      setDraggedSlot(idx);
    }
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
  };

  const availableUnits = state.inventory.filter(unit => {
    const inTeam = state.team.includes(unit.instanceId);
    return !inTeam;
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* HERO BANNER / WELCOME */}
      <div className="relative px-4 pt-6 pb-2 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="relative">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            Brave <span className="text-amber-400">Frontier</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Grand Gaia Chronicles</p>
        </div>
      </div>

      {/* TEAM PREVIEW */}
      <div className="p-4 mx-4 mt-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm">
        <div className="text-[10px] text-zinc-500 mb-3 uppercase font-bold tracking-[0.15em] flex justify-between items-center px-1">
          <span>Current Party</span>
          <span className="bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">{state.team.filter(id => id !== null).length} / 6</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {[0,1,2,3,4,5].map(idx => {
            const unitId = state.team[idx];
            const unit = unitId ? state.inventory.find(u => u.instanceId === unitId) : null;
            const template = unit ? UNIT_DATABASE[unit.templateId] : null;
            
            return (
              <div 
                key={idx}
                draggable={!!template}
                onDragStart={() => template && handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => handleSlotClick(idx)}
                className={`
                  aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 relative group
                  ${template 
                    ? 'border-amber-500/30 bg-zinc-800/80 hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] border-dashed hover:border-amber-500/20'}
                  ${draggedSlot === idx ? 'opacity-50 scale-95 blur-[1px]' : ''}
                `}
              >
                {template ? (
                  <>
                    <img 
                      src={template.spriteUrl} 
                      alt={template.name}
                      className="w-10 h-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </>
                ) : (
                  <span className="text-zinc-700 text-lg font-light">+</span>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">⚔️ Active Campaign</h2>
            <button onClick={() => onNavigate('quest')} className="text-[10px] text-amber-400 font-bold uppercase hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {STAGES.slice(0, 3).map(stage => (
              <Card 
                key={stage.id}
                onClick={() => onStartBattle(stage.id)}
                className="group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-400/[0.03] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">
                      💀
                    </div>
                    <div>
                      <div className="font-black text-white italic uppercase tracking-tight">{stage.area}</div>
                      <div className="text-xs text-zinc-500 font-medium">Stage {stage.id}: {stage.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20 mb-1">
                      <span className="text-xs font-black text-amber-400 leading-none">⚡ {stage.energy}</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-600 tabular-nums">+{stage.expReward} EXP</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">📋 Quick Actions</h2>
          <div className="grid grid-cols-3 gap-2">
            <Card onClick={() => onNavigate('summon')} className="flex flex-col items-center justify-center py-4">
              <span className="text-2xl mb-1">✨</span>
              <span className="text-xs font-bold text-white">Summon</span>
              <span className="text-[10px] text-zinc-500">{GACHA_CONFIG.BANNERS.standard.cost}💎</span>
            </Card>
            <Card onClick={() => onNavigate('qrhunt')} className="flex flex-col items-center justify-center py-4">
              <span className="text-2xl mb-1">📱</span>
              <span className="text-xs font-bold text-white">QR Hunt</span>
              <span className="text-[10px] text-zinc-500">{5 - (state.qrState?.scansToday || 0)} left</span>
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

      {/* Unit Picker Modal */}
      <AnimatePresence>
        {showUnitPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUnitPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-md max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
                <h3 className="font-bold text-white">Select Unit</h3>
                <button onClick={() => setShowUnitPicker(false)} className="text-zinc-400 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {availableUnits.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableUnits.map(unit => {
                      const template = UNIT_DATABASE[unit.templateId];
                      return (
                        <button
                          key={unit.instanceId}
                          onClick={() => handleAddToTeam(unit.instanceId)}
                          className="aspect-square rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden hover:border-amber-500 transition-all relative"
                        >
                          <img src={template.spriteUrl} alt={template.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-center py-0.5 text-amber-400">
                            ★{template.rarity}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 py-8">
                    <p>No available units</p>
                    <p className="text-sm mt-2">All units are in your party or you have no units!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unit Details Modal */}
      <AnimatePresence>
        {showUnitDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUnitDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const template = UNIT_DATABASE[showUnitDetails.templateId];
                const teamSlot = state.team.indexOf(showUnitDetails.instanceId);
                return (
                  <>
                    <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
                      <h3 className="font-bold text-white">{template.name}</h3>
                      <button onClick={() => setShowUnitDetails(null)} className="text-zinc-400 hover:text-white">✕</button>
                    </div>
                    <div className="p-4">
                      <div className="flex gap-4 mb-4">
                        <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden">
                          <img src={template.spriteUrl} alt={template.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                        </div>
                        <div className="flex-1 space-y-1 text-sm">
                          <div className="flex justify-between"><span className="text-zinc-500">Rarity</span><span className="text-amber-400">★{template.rarity}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Element</span><span className="text-white">{template.element}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Level</span><span className="text-white">{showUnitDetails.level}/{template.maxLevel}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Team Slot</span><span className="text-white">{teamSlot >= 0 ? `#${teamSlot + 1}` : 'Not in team'}</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                        <div className="bg-zinc-800 rounded p-2"><div className="text-red-400 font-bold">{template.baseStats.hp}</div><div className="text-zinc-500">HP</div></div>
                        <div className="bg-zinc-800 rounded p-2"><div className="text-blue-400 font-bold">{template.baseStats.atk}</div><div className="text-zinc-500">ATK</div></div>
                        <div className="bg-zinc-800 rounded p-2"><div className="text-green-400 font-bold">{template.baseStats.def}</div><div className="text-zinc-500">DEF</div></div>
                        <div className="bg-zinc-800 rounded p-2"><div className="text-yellow-400 font-bold">{template.baseStats.rec}</div><div className="text-zinc-500">REC</div></div>
                      </div>
                      {teamSlot >= 0 && (
                        <button
                          onClick={() => handleRemoveFromTeam(teamSlot)}
                          className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
                        >
                          Remove from Party
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
