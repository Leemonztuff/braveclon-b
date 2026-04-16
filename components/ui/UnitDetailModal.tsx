'use client';

import { X, Zap, Sword, Shield, Crown, Sparkles, ArrowUpCircle } from 'lucide-react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, EquipSlot, getExpForLevel, ELEMENT_ICONS, Element, EquipmentTemplate } from '@/lib/gameData';
import { UnitDisplay } from './UnitDisplay';
import { StatPanel } from './StatPanel';
import { SkillCard, LeaderSkillDisplay } from './SkillCard';
import { EquipmentGrid } from './EquipmentGrid';

const BF_COLORS = {
  gold: '#b89947',
  goldDark: '#8b7235',
  goldBright: '#c9a227',
  bgMid: '#1a1a2e',
  bgDark: '#0a0a14',
};

interface UnitDetailModalProps {
  unitId: string;
  state: PlayerState;
  isLeader?: boolean;
  onClose: () => void;
  onNavigateToFusion?: (unitId: string) => void;
  onNavigateToEvolution?: (unitId: string) => void;
  setCompareUnitId?: (id: string | null) => void;
  onEquipItem?: (unitId: string, slot: EquipSlot, itemId: string | null) => void;
  onUnequipItem?: (unitId: string, slot: EquipSlot) => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  Water: '#3b82f6',
  Earth: '#22c55e',
  Thunder: '#eab308',
  Light: '#fef08a',
  Dark: '#a855f7',
};

export function UnitDetailModal({
  unitId,
  state,
  isLeader,
  onClose,
  onNavigateToFusion,
  onNavigateToEvolution,
  setCompareUnitId,
  onEquipItem,
  onUnequipItem
}: UnitDetailModalProps) {
  const unit = state.inventory.find(u => u.instanceId === unitId)!;
  const template = UNIT_DATABASE[unit.templateId];
  const leaderSkill = template.leaderSkill;
  
  const stats = calculateStats(template, unit.level, unit.equipment, state.equipmentInventory);
  const baseStats = calculateStats(template, unit.level, { weapon: null, armor: null, accessory: null }, []);
  const equipmentBonuses = {
    hp: stats.hp - baseStats.hp,
    atk: stats.atk - baseStats.atk,
    def: stats.def - baseStats.def,
    rec: stats.rec - baseStats.rec,
  };

  const getEquipTemplate = (instanceId: string | null): EquipmentTemplate | null => {
    if (!instanceId) return null;
    const equipInstance = state.equipmentInventory.find(e => e.instanceId === instanceId);
    if (!equipInstance) return null;
    return EQUIPMENT_DATABASE[equipInstance.templateId] || null;
  };

  const equipment = {
    weapon: getEquipTemplate(unit.equipment.weapon),
    armor: getEquipTemplate(unit.equipment.armor),
    accessory: getEquipTemplate(unit.equipment.accessory),
  };

  const maxExp = getExpForLevel(unit.level);
  const canEvolve = unit.level >= template.maxLevel && template.evolutionTarget;

  return (
    <div className="absolute inset-0 z-50 bg-[#0a0a14] flex flex-col overflow-hidden">
      {/* Header - Brave Frontier Style */}
      <div 
        className="h-14 px-4 flex items-center justify-between shrink-0"
        style={{ background: `linear-gradient(to bottom, ${BF_COLORS.goldDark}, #1a1a2e)` }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/80 hover:text-white active:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-90 transition-transform">
            <X size={24} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Unit Details</h3>
          </div>
        </div>
        
        {isLeader && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">LEADER</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          
          {/* Unit Portrait & Basic Info */}
          <div 
            className="p-6 flex items-center gap-4"
            style={{ background: `linear-gradient(to bottom, ${BF_COLORS.bgMid}, #0a0a14)` }}
          >
            {/* Unit Sprite Large */}
            <div className="relative">
              <div 
                className="w-28 h-28 rounded-full overflow-hidden border-2"
                style={{ borderColor: BF_COLORS.gold }}
              >
                <UnitDisplay
                  spriteUrl={template.spriteUrl}
                  name={template.name}
                  rarity={template.rarity}
                  element={template.element}
                  level={unit.level}
                  variant="portrait"
                  size="3xl"
                  showElement
                  className="w-full h-full"
                />
              </div>
              {/* Element Indicator */}
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{ 
                  backgroundColor: ELEMENT_COLORS[template.element],
                  borderColor: '#fff'
                }}
              >
                <span className="text-white text-xs">{ELEMENT_ICONS[template.element as Element]}</span>
              </div>
            </div>

            {/* Unit Info */}
            <div className="flex-1">
              {/* Rarity Stars */}
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: template.rarity }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
                {template.rarity < 5 && Array.from({ length: 5 - template.rarity }).map((_, i) => (
                  <span key={i} className="text-zinc-700 text-sm">★</span>
                ))}
              </div>
              
              {/* Name */}
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span style={{ color: ELEMENT_COLORS[template.element] }}>
                  {ELEMENT_ICONS[template.element as Element]}
                </span>
                {template.name}
              </h2>

              {/* Level */}
              <div className="text-sm text-zinc-400 mt-1">
                LV.{unit.level} / {template.maxLevel}
              </div>

              {/* EXP Bar */}
              <div className="mt-2">
                <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden border border-[#333]">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: unit.level >= template.maxLevel ? '100%' : `${(unit.exp / maxExp) * 100}%` }}
                  />
                </div>
                {unit.level < template.maxLevel && (
                  <div className="text-[10px] text-zinc-500 text-right mt-0.5">
                    {unit.exp} / {maxExp} EXP
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section - BF Style */}
          <div className="p-4 bg-[#0f0f1a]">
            <div className="grid grid-cols-4 gap-2">
              {/* HP */}
              <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">HP</div>
                <div className="text-lg font-black text-green-400">{stats.hp.toLocaleString()}</div>
                {equipmentBonuses.hp > 0 && (
                  <div className="text-[10px] text-green-400">+{equipmentBonuses.hp}</div>
                )}
              </div>
              {/* ATK */}
              <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">ATK</div>
                <div className="text-lg font-black text-red-400">{stats.atk.toLocaleString()}</div>
                {equipmentBonuses.atk > 0 && (
                  <div className="text-[10px] text-green-400">+{equipmentBonuses.atk}</div>
                )}
              </div>
              {/* DEF */}
              <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">DEF</div>
                <div className="text-lg font-black text-blue-400">{stats.def.toLocaleString()}</div>
                {equipmentBonuses.def > 0 && (
                  <div className="text-[10px] text-green-400">+{equipmentBonuses.def}</div>
                )}
              </div>
              {/* REC */}
              <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">REC</div>
                <div className="text-lg font-black text-yellow-400">{stats.rec.toLocaleString()}</div>
                {equipmentBonuses.rec > 0 && (
                  <div className="text-[10px] text-green-400">+{equipmentBonuses.rec}</div>
                )}
              </div>
            </div>
          </div>

          {/* Brave Burst Skill */}
          <div className="p-4 bg-[#0f0f1a] border-t border-[#333]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-sm font-bold text-purple-400 uppercase">Brave Burst</span>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3 border border-purple-500/30">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">{template.skill.name}</span>
                <span className="text-xs text-purple-400">Cost: {template.skill.cost}</span>
              </div>
              <div className="text-xs text-zinc-400 mt-1">{template.skill.description}</div>
            </div>
          </div>

          {/* Leader Skill */}
          {leaderSkill && (
            <div className="p-4 bg-[#0f0f1a] border-t border-[#333]">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} className="text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400 uppercase">Leader Skill</span>
                {isLeader && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">ACTIVE</span>}
              </div>
              <div className="bg-[#1a1a2e] rounded-lg p-3 border border-yellow-500/30">
                <span className="text-white font-bold">{leaderSkill.name}</span>
                <div className="text-xs text-zinc-400 mt-1">{leaderSkill.description}</div>
              </div>
            </div>
          )}

          {/* Equipment */}
          <div className="p-4 bg-[#0f0f1a] border-t border-[#333]">
            <div className="flex items-center gap-2 mb-2">
              <Sword size={16} className="text-zinc-400" />
              <span className="text-sm font-bold text-zinc-400 uppercase">Equipment</span>
            </div>
            <EquipmentGrid
              equipment={equipment}
              onEquip={(slot) => {
                // TODO: Open equipment selection modal
              }}
              onUnequip={(slot) => {
                if (onUnequipItem) onUnequipItem(unitId, slot);
              }}
            />
          </div>

          {/* Action Buttons - Touch-friendly with 44px minimum */}
          <div className="p-4 flex flex-col gap-3 bg-[#0f0f1a] border-t border-[#333]">
            {onNavigateToFusion && (
              <button
                onClick={() => onNavigateToFusion(unitId)}
                className="w-full py-3.5 min-h-[52px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold uppercase flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform"
              >
                <Zap size={20} /> Fuse Unit
              </button>
            )}
            {canEvolve && onNavigateToEvolution && (
              <button
                onClick={() => onNavigateToEvolution(unitId)}
                className="w-full py-3.5 min-h-[52px] bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold uppercase flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform"
              >
                <Sparkles size={20} /> Evolve to {UNIT_DATABASE[template.evolutionTarget!].name}
              </button>
            )}
            {setCompareUnitId && (
              <button
                onClick={() => setCompareUnitId(null)}
                className="w-full py-3.5 min-h-[52px] bg-zinc-800 text-white rounded-lg font-bold uppercase flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform"
              >
                <ArrowUpCircle size={20} /> Compare
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}