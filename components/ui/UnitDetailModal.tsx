'use client';

import { X, Sparkles, Crown, Sword, Zap } from 'lucide-react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, EquipSlot, getExpForLevel, EquipmentTemplate } from '@/lib/gameData';
import { UnitDisplay } from './UnitDisplay';
import { EquipmentGrid } from './EquipmentGrid';

const COLORS = {
  wood: '#3d2914',
  woodLight: '#5c3d1e',
  woodDark: '#2a1a0a',
  gold: '#c9a227',
  goldLight: '#d4af37',
  goldDark: '#8b7235',
  parchment: '#d4c4a4',
  parchmentDark: '#b5a580',
};

interface UnitDetailModalProps {
  unitId: string;
  state: PlayerState;
  isLeader?: boolean;
  onClose: () => void;
  onNavigateToFusion?: (unitId: string) => void;
  onNavigateToEvolution?: (unitId: string) => void;
  onEquipItem?: (unitId: string, slot: EquipSlot, itemId: string | null) => void;
  onUnequipItem?: (unitId: string, slot: EquipSlot) => void;
}

const ELEMENT_ICONS = {
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
    <div 
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ 
        background: `linear-gradient(180deg, ${COLORS.woodDark} 0%, ${COLORS.wood} 50%, ${COLORS.woodDark} 100%)`,
        fontFamily: 'serif'
      }}
    >
      {/* ════════════════════════════════════════════
          🔝 TOP BAR - Game state & resources
      ════════════════════════════════════════════ */}
      <div 
        className="h-14 px-4 flex items-center justify-between shrink-0"
        style={{ 
          background: `linear-gradient(to bottom, ${COLORS.woodLight}, ${COLORS.woodDark})`,
          borderBottom: `3px solid ${COLORS.gold}`
        }}
      >
        {/* Left: Game title & player info */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-amber-300 tracking-wide">
            Braveclon <span className="text-amber-500/60">|</span> Player: Guest <span className="text-amber-500/60">|</span> Lv {state.playerLevel}
          </div>
          <div className="text-[10px] text-amber-500/60">
            Arena: {state.arenaScore} pts
          </div>
        </div>

        {/* Right: Resources icons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded">
            <span className="text-cyan-400 text-sm">💎</span>
            <span className="text-xs text-white font-bold">{state.gems}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded">
            <span className="text-blue-400 text-sm">⚡</span>
            <span className="text-xs text-white font-bold">{unit.bbGauge || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded">
            <span className="text-yellow-400 text-sm">🪙</span>
            <span className="text-xs text-white font-bold">{state.zel.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex gap-2 h-full">
          
          {/* ═══════════════════════════════════════
              LEFT COLUMN - Info panels
          ═══════════════════════════════════════ */}
          <div className="flex-1 flex flex-col gap-2">
            
            {/* 🧾 CHARACTER INFO CARD */}
            <div 
              className="p-3 rounded-lg"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                border: `2px solid ${COLORS.goldDark}`,
                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.5)`
              }}
            >
              {/* Name */}
              <h2 className="text-lg font-bold text-amber-100" style={{ textShadow: '1px 1px 2px black' }}>
                {template.name}
              </h2>
              
              {/* Stars & Type */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: template.rarity }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                  {template.rarity < 5 && Array.from({ length: 5 - template.rarity }).map((_, i) => (
                    <span key={i} className="text-amber-700/50 text-sm">★</span>
                  ))}
                </div>
                <span className="text-xs text-amber-500/70 uppercase">{template.clase}</span>
              </div>

              {/* EXP Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-amber-400/70">
                  <span>Nivel: {unit.level} / {template.maxLevel}</span>
                  <span>EXP: {unit.exp} / {maxExp}</span>
                </div>
                <div 
                  className="h-3 rounded-full overflow-hidden"
                  style={{ 
                    background: COLORS.woodDark,
                    border: `1px solid ${COLORS.goldDark}`
                  }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    style={{ width: unit.level >= template.maxLevel ? '100%' : `${(unit.exp / maxExp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 📊 STATS - 4 buttons */}
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="p-2 rounded-lg text-center cursor-pointer active:scale-95 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                  border: `2px solid #22c55e`,
                  boxShadow: '0 4px 0 #166534'
                }}
              >
                <div className="text-[10px] text-green-400 uppercase font-bold">HP</div>
                <div className="text-lg font-black text-green-400">{stats.hp.toLocaleString()}</div>
                {equipmentBonuses.hp > 0 && (
                  <div className="text-[8px] text-green-400">+{equipmentBonuses.hp}</div>
                )}
              </div>
              
              <div 
                className="p-2 rounded-lg text-center cursor-pointer active:scale-95 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                  border: `2px solid #ef4444`,
                  boxShadow: '0 4px 0 #b91c1c'
                }}
              >
                <div className="text-[10px] text-red-400 uppercase font-bold">ATK</div>
                <div className="text-lg font-black text-red-400">{stats.atk.toLocaleString()}</div>
                {equipmentBonuses.atk > 0 && (
                  <div className="text-[8px] text-red-400">+{equipmentBonuses.atk}</div>
                )}
              </div>
              
              <div 
                className="p-2 rounded-lg text-center cursor-pointer active:scale-95 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                  border: `2px solid #3b82f6`,
                  boxShadow: '0 4px 0 #1d4ed8'
                }}
              >
                <div className="text-[10px] text-blue-400 uppercase font-bold">DEF</div>
                <div className="text-lg font-black text-blue-400">{stats.def.toLocaleString()}</div>
                {equipmentBonuses.def > 0 && (
                  <div className="text-[8px] text-blue-400">+{equipmentBonuses.def}</div>
                )}
              </div>
              
              <div 
                className="p-2 rounded-lg text-center cursor-pointer active:scale-95 transition-transform"
                style={{ 
                  background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                  border: `2px solid #eab308`,
                  boxShadow: '0 4px 0 #a16207'
                }}
              >
                <div className="text-[10px] text-yellow-400 uppercase font-bold">REC</div>
                <div className="text-lg font-black text-yellow-400">{stats.rec.toLocaleString()}</div>
                {equipmentBonuses.rec > 0 && (
                  <div className="text-[8px] text-yellow-400">+{equipmentBonuses.rec}</div>
                )}
              </div>
            </div>

            {/* 🧠 SKILLS */}
            <div className="flex flex-col gap-2">
              {leaderSkill && (
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.parchment}, ${COLORS.parchmentDark})`,
                    border: `2px solid ${COLORS.gold}`
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Crown size={12} className="text-yellow-600" />
                    <span className="text-xs font-bold text-yellow-700 uppercase">Leader Skill</span>
                    {isLeader && <span className="text-[8px] bg-yellow-500/30 text-yellow-700 px-1.5 py-0.5 rounded">ACTIVE</span>}
                  </div>
                  <span className="text-sm font-bold text-amber-900">{leaderSkill.name}</span>
                  <div className="text-[10px] text-amber-800/70 mt-0.5">{leaderSkill.description}</div>
                </div>
              )}
              
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.parchment}, ${COLORS.parchmentDark})`,
                  border: `2px solid ${COLORS.gold}`
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} className="text-purple-600" />
                  <span className="text-xs font-bold text-purple-700 uppercase">Brave Burst</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-amber-900">{template.skill.name}</span>
                  <span className="text-xs text-purple-700">{template.skill.cost} BB</span>
                </div>
                <div className="text-[10px] text-amber-800/70 mt-0.5">{template.skill.description}</div>
              </div>
            </div>

            {/* ⚔️ EQUIPMENT */}
            <div 
              className="p-2 rounded-lg"
              style={{ 
                background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                border: `2px solid ${COLORS.goldDark}`
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Sword size={12} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase">Equipment</span>
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

          {/* ═══════════════════════════════════════
              RIGHT COLUMN - Character Visual
          ═══════════════════════════════════════ */}
          <div className="w-40 flex flex-col items-center justify-center">
            <div 
              className="relative w-full aspect-square rounded-lg overflow-hidden"
              style={{ 
                background: `linear-gradient(180deg, ${COLORS.woodDark}, ${COLORS.wood})`,
                border: `3px solid ${COLORS.gold}`,
                boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`
              }}
            >
              {/* Character sprite */}
              <div className="absolute inset-0 flex items-center justify-center">
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
              
              {/* Element badge */}
              <div 
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{ 
                  backgroundColor: template.element === 'Fire' ? '#ef4444' : 
                             template.element === 'Water' ? '#3b82f6' :
                             template.element === 'Earth' ? '#22c55e' :
                             template.element === 'Thunder' ? '#eab308' :
                             template.element === 'Light' ? '#fef08a' : '#a855f7',
                  borderColor: '#fff'
                }}
              >
                <span className="text-white">{ELEMENT_ICONS[template.element as keyof typeof ELEMENT_ICONS]}</span>
              </div>
              
              {/* Pedestal/glow under character */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full"
                style={{ 
                  background: `radial-gradient(ellipse at center, ${COLORS.gold}44, transparent)`,
                  filter: 'blur(4px)'
                }}
              />
            </div>

            {/* 🎁 LIMITED OFFER banner */}
            <div 
              className="mt-2 w-full p-2 rounded text-center"
              style={{ 
                background: `linear-gradient(90deg, ${COLORS.goldDark}, ${COLORS.gold}, ${COLORS.goldDark})`,
                border: `1px solid ${COLORS.gold}`
              }}
            >
              <div className="text-[10px] text-amber-900 font-bold uppercase">
                ⚡ LIMITED OFFER
              </div>
              <div className="text-xs text-amber-900">
                23h 55m
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════
          ACTION BUTTONS
      ════════════════════════════════════════════ */}
      <div className="p-2 flex gap-2" style={{ borderTop: `2px solid ${COLORS.goldDark}` }}>
        {onNavigateToFusion && (
          <button
            onClick={() => onNavigateToFusion(unitId)}
            className="flex-1 py-2.5 rounded-lg font-bold uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            style={{ 
              background: `linear-gradient(180deg, #3b82f6, #1d4ed8)`,
              border: `2px solid #60a5fa`,
              boxShadow: '0 4px 0 #1e40af'
            }}
          >
            <Zap size={16} /> Fusionar
          </button>
        )}
        {canEvolve && onNavigateToEvolution && (
          <button
            onClick={() => onNavigateToEvolution(unitId)}
            className="flex-1 py-2.5 rounded-lg font-bold uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            style={{ 
              background: `linear-gradient(180deg, #a855f7, #7c3aed)`,
              border: `2px solid #c084fc`,
              boxShadow: '0 4px 0 #6d28d9'
            }}
          >
            <Sparkles size={16} /> Evolucionar
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-1 right-1 p-2 rounded-full active:scale-90 transition-transform"
        style={{ 
          background: COLORS.woodDark,
          border: `2px solid ${COLORS.goldDark}`
        }}
      >
        <X size={20} className="text-amber-400" />
      </button>

    </div>
  );
}