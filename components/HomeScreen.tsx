'use client';

import { useState, useCallback } from 'react';
import { PlayerState, UnitInstance } from '@/lib/gameState';
import { UNIT_DATABASE, STAGES, UnitTemplate } from '@/lib/gameData';
import { GACHA_CONFIG } from '@/lib/economyData';
import { CurrencyDisplay, Card, EmptyState } from './ui/DesignSystem';
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
        <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider flex justify-between items-center">
          <span>Your Party</span>
          <span className="text-amber-400">{state.team.filter(id => id !== null).length}/6</span>
        </div>
        <div className="flex gap-2 justify-center">
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
                  w-14 h-14 rounded-lg border-2 flex items-center justify-center overflow-hidden cursor-pointer transition-all
                  ${template 
                    ? 'border-amber-500/50 bg-zinc-900 hover:border-amber-400 hover:scale-105' 
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-amber-500/30 hover:bg-zinc-900/50'}
                  ${draggedSlot === idx ? 'opacity-50 scale-95' : ''}
                  ${template && template.rarity >= 5 ? 'ring-2 ring-purple-500/50' : ''}
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
                  <span className="text-zinc-600 text-lg">+</span>
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
