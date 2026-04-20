'use client';

import { X, Sparkles, Crown, Sword, Shield, Zap, ArrowUpCircle } from 'lucide-react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, EquipSlot, getExpForLevel, ELEMENT_ICONS, Element, EquipmentTemplate } from '@/lib/gameData';
import { UnitDisplay } from './UnitDisplay';
import { EquipmentGrid } from './EquipmentGrid';

const BF_COLORS = {
  gold: '#b89947',
  goldDark: '#8b7235',
  goldBright: '#c9a227',
  bgMid: '#1a1a2e',
  bgDark: '#0a0a14',
  panelBg: '#12121c',
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

const ATLASELEMENTS = {
  Fire: '🔥',
  Water: '💧',
  Earth: '🌍',
  Thunder: '⚡',
  Light: '✨',
  Dark: '🌑',
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
      {/* ATLAS LAYOUT - Full screen RPG style */}
      
      {/* === TOP HEADER === */}
      <div 
        className="h-16 px-4 flex items-center justify-between shrink-0"
        style={{ background: `linear-gradient(to bottom, ${BF_COLORS.goldDark}, #12121c)` }}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white active:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Detalles</h3>
          </div>
        </div>
        
        {isLeader && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">LIDER</span>
          </div>
        )}
      </div>

      {/* === MAIN ATLAS CONTENT === */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative w-full min-h-[700px]" style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #12121c 50%, #0a0a14 100%)' }}>
          
          {/* === CARD (Unit Portrait) - Left Side === */}
          <div className="absolute left-4 top-2 w-32">
            {/* Arch/Frame */}
            <div 
              className="w-32 h-40 relative"
              style={{ 
                background: `linear-gradient(135deg, ${BF_COLORS.gold}22, ${BF_COLORS.goldDark}44)`,
                borderRadius: '16px 16px 0 0'
              }}
            >
              {/* Unit Portrait */}
              <div className="absolute inset-2 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: BF_COLORS.gold }}>
                  <UnitDisplay
                    spriteUrl={template.spriteUrl}
                    name={template.name}
                    rarity={template.rarity}
                    element={template.element}
                    level={unit.level}
                    variant="portrait"
                    size="full"
                    showElement
                    className="w-full h-full"
                  />
                </div>
              </div>
              
              {/* Element Badge */}
              <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center border-2"
                style={{ 
                  backgroundColor: ELEMENT_COLORS[template.element],
                  borderColor: '#fff'
                }}
              >
                <span className="text-white text-lg">{ATLASELEMENTS[template.element as keyof typeof ATLASELEMENTS]}</span>
              </div>
            </div>
            
            {/* Unit Name */}
            <div className="mt-4 text-center">
              {/* Rarity Stars */}
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: template.rarity }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
                {template.rarity < 5 && Array.from({ length: 5 - template.rarity }).map((_, i) => (
                  <span key={i} className="text-zinc-700 text-sm">★</span>
                ))}
              </div>
              <h2 className="text-lg font-black text-white">{template.name}</h2>
              <div className="text-sm text-zinc-400">Lv.{unit.level}/{template.maxLevel}</div>
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
                <div className="text-[10px] text-zinc-500 text-center mt-0.5">
                  {unit.exp}/{maxExp} EXP
                </div>
              )}
            </div>
          </div>

          {/* === PEDESTAL - Right side under arch === */}
          <div className="absolute right-4 top-32 w-32 h-40 flex items-end justify-center">
            <div 
              className="w-32 h-8 rounded-full opacity-30"
              style={{ 
                background: `radial-gradient(ellipse at center, ${BF_COLORS.gold}88, transparent)`,
                filter: 'blur(8px)'
              }}
            />
          </div>

          {/* === STATS - Under Card === */}
          <div className="absolute left-0 right-0 top-52 px-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[#12121c] rounded-lg p-2 text-center border border-[#222]">
                <div className="text-[8px] text-zinc-500 uppercase font-bold">HP</div>
                <div className="text-sm font-black text-green-400">{stats.hp.toLocaleString()}</div>
                {equipmentBonuses.hp > 0 && (
                  <div className="text-[8px] text-green-400">+{equipmentBonuses.hp}</div>
                )}
              </div>
              <div className="bg-[#12121c] rounded-lg p-2 text-center border border-[#222]">
                <div className="text-[8px] text-zinc-500 uppercase font-bold">ATQ</div>
                <div className="text-sm font-black text-red-400">{stats.atk.toLocaleString()}</div>
                {equipmentBonuses.atk > 0 && (
                  <div className="text-[8px] text-green-400">+{equipmentBonuses.atk}</div>
                )}
              </div>
              <div className="bg-[#12121c] rounded-lg p-2 text-center border border-[#222]">
                <div className="text-[8px] text-zinc-500 uppercase font-bold">DEF</div>
                <div className="text-sm font-black text-blue-400">{stats.def.toLocaleString()}</div>
                {equipmentBonuses.def > 0 && (
                  <div className="text-[8px] text-green-400">+{equipmentBonuses.def}</div>
                )}
              </div>
              <div className="bg-[#12121c] rounded-lg p-2 text-center border border-[#222]">
                <div className="text-[8px] text-zinc-500 uppercase font-bold">REC</div>
                <div className="text-sm font-black text-yellow-400">{stats.rec.toLocaleString()}</div>
                {equipmentBonuses.rec > 0 && (
                  <div className="text-[8px] text-green-400">+{equipmentBonuses.rec}</div>
                )}
              </div>
            </div>
          </div>

          {/* === SKILL - Below Stats === */}
          <div className="absolute left-0 right-0 top-96 px-4">
            {/* Brave Burst */}
            <div className="bg-[#12121c] rounded-lg p-3 border border-purple-500/30 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-purple-400 uppercase">Brave Burst</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-bold">{template.skill.name}</span>
                <span className="text-xs text-purple-400">{template.skill.cost} BB</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">{template.skill.description}</div>
            </div>
            
            {/* Leader Skill */}
            {leaderSkill && (
              <div className="bg-[#12121c] rounded-lg p-3 border border-yellow-500/30 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={14} className="text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400 uppercase">Líder</span>
                  {isLeader && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">ACT</span>}
                </div>
                <span className="text-white text-sm font-bold">{leaderSkill.name}</span>
                <div className="text-[10px] text-zinc-400 mt-1">{leaderSkill.description}</div>
              </div>
            )}
          </div>

          {/* === EQUIP - Bottom Full Width === */}
          <div className="absolute left-0 right-0 bottom-0 px-4 pb-4">
            <div className="bg-[#12121c] rounded-t-lg p-3 border-t border-[#333]">
              <div className="flex items-center gap-2 mb-2">
                <Sword size={14} className="text-zinc-400" />
                <span className="text-xs font-bold text-zinc-400 uppercase">Equipo</span>
              </div>
              <EquipmentGrid
                equipment={equipment}
                onEquip={(slot) => {}}
                onUnequip={(slot) => {
                  if (onUnequipItem) onUnequipItem(unitId, slot);
                }}
              />
            </div>
          </div>

          {/* === ACTION BUTTONS - Above Equip === */}
          <div className="absolute left-0 right-0 bottom-36 px-4">
            <div className="flex flex-col gap-2">
              {onNavigateToFusion && (
                <button
                  onClick={() => onNavigateToFusion(unitId)}
                  className="w-full py-2.5 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-sm uppercase flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Zap size={16} /> Fusionar
                </button>
              )}
              {canEvolve && onNavigateToEvolution && (
                <button
                  onClick={() => onNavigateToEvolution(unitId)}
                  className="w-full py-2.5 min-h-[44px] bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm uppercase flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Sparkles size={16} /> Evolucionar
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}