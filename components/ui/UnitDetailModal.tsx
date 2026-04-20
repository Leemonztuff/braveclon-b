'use client';

import { X, Sparkles, Crown, Sword, Zap, ChevronUp, ChevronDown, Shield, Swords } from 'lucide-react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, EquipSlot, getExpForLevel, EquipmentTemplate } from '@/lib/gameData';
import { UnitDisplay } from './UnitDisplay';
import { EquipmentGrid } from './EquipmentGrid';

const COLORS = {
  wood: '#2d1f0f',
  woodLight: '#4a3220',
  woodDark: '#1a1208',
  woodPanel: '#3d2914',
  gold: '#d4a520',
  goldLight: '#f0c850',
  goldDark: '#8b6914',
  goldGlow: '#ffd700',
  parchment: '#e8dcc4',
  parchmentDark: '#c9b896',
  parchmentLight: '#f5efe3',
};

const ELEMENT_COLORS = {
  Fire: { bg: '#dc2626', light: '#fca5a5' },
  Water: { bg: '#2563eb', light: '#93c5fd' },
  Earth: { bg: '#16a34a', light: '#86efac' },
  Thunder: { bg: '#ca8a04', light: '#fde047' },
  Light: { bg: '#eab308', light: '#fef08a' },
  Dark: { bg: '#7c3aed', light: '#c4b5fd' },
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
  const elementColor = ELEMENT_COLORS[template.element as keyof typeof ELEMENT_COLORS];

  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ 
        background: `linear-gradient(180deg, ${COLORS.woodDark} 0%, ${COLORS.wood} 40%, ${COLORS.woodDark} 100%)`,
        fontFamily: 'serif'
      }}
    >
      {/* ════════════════════════════════════════════
          🔝 TOP BAR - Decorative header with resources
      ════════════════════════════════════════════ */}
      <div 
        className="relative h-16 px-3 flex items-center justify-between shrink-0"
        style={{ 
          background: `linear-gradient(180deg, ${COLORS.woodLight} 0%, ${COLORS.woodDark} 100%)`,
          borderBottom: `3px solid ${COLORS.goldDark}`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 ${COLORS.gold}40`
        }}
      >
        {/* Decorative corner flourishes */}
        <div className="absolute top-0 left-2 text-amber-500/30 text-lg">❧</div>
        <div className="absolute top-0 right-2 text-amber-500/30 text-lg">❧</div>
        
        {/* Game title */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-amber-300 tracking-wider" style={{ textShadow: '1px 1px 2px #000' }}>
            Braveclon
          </div>
          <div className="text-[10px] text-amber-500/60">
            Player: Guest • Lv {state.playerLevel}
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: '#00000040', border: '1px solid #ffffff20' }}>
            <span className="text-cyan-400 text-sm">💎</span>
            <span className="text-xs text-white font-bold">{state.gems}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: '#00000040', border: '1px solid #ffffff20' }}>
            <span className="text-yellow-400 text-sm">🪙</span>
            <span className="text-xs text-white font-bold">{state.zel.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MAIN CONTENT - Mobile optimized layout
      ════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        {/* ═══ Character Visual Hero Section ═══ */}
        <div className="relative p-4 pb-2">
          {/* Main card container */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{ 
              background: `linear-gradient(180deg, ${COLORS.woodPanel} 0%, ${COLORS.woodDark} 100%)`,
              border: `2px solid ${COLORS.goldDark}`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 ${COLORS.gold}30`
            }}
          >
            {/* Character portrait area */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {/* Background pattern */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 80%, ${COLORS.gold}40 0%, transparent 50%)`,
                }}
              />
              
              {/* Character sprite */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <UnitDisplay
                  spriteUrl={template.spriteUrl}
                  name={template.name}
                  rarity={template.rarity}
                  element={template.element}
                  level={unit.level}
                  variant="portrait"
                  size="3xl"
                  showElement
                  className="w-full h-full drop-shadow-2xl"
                />
              </div>
              
              {/* Element badge - large and visible */}
              <div 
                className="absolute top-3 left-3 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ 
                  backgroundColor: elementColor.bg,
                  border: `2px solid ${elementColor.light}`,
                  boxShadow: `0 2px 8px ${elementColor.bg}80`
                }}
              >
                <span className="text-white text-sm">{ELEMENT_ICONS[template.element as keyof typeof ELEMENT_ICONS]}</span>
                <span className="text-white text-xs font-bold uppercase">{template.element}</span>
              </div>
              
              {/* Leader indicator */}
              {isLeader && (
                <div 
                  className="absolute top-3 right-3 px-2 py-1 rounded-md flex items-center gap-1"
                  style={{ 
                    backgroundColor: COLORS.gold,
                    border: `2px solid ${COLORS.goldLight}`,
                    boxShadow: `0 0 12px ${COLORS.goldGlow}80`
                  }}
                >
                  <Crown size={12} className="text-amber-900" />
                  <span className="text-[10px] font-bold text-amber-900 uppercase">Leader</span>
                </div>
              )}
              
              {/* Pedestal glow */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 rounded-full"
                style={{ 
                  background: `radial-gradient(ellipse at center, ${COLORS.gold}60, transparent 70%)`,
                  filter: 'blur(6px)'
                }}
              />
            </div>
            
            {/* Unit info bar */}
            <div className="p-3" style={{ backgroundColor: '#00000030' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-amber-100" style={{ textShadow: '1px 1px 2px #000' }}>
                    {template.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: template.rarity }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm" style={{ textShadow: '0 0 4px #fbbf24' }}>★</span>
                      ))}
                      {template.rarity < 5 && Array.from({ length: 5 - template.rarity }).map((_, i) => (
                        <span key={i} className="text-amber-700/50 text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-xs text-amber-400/70 uppercase">{template.element}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-400/70">Nivel</div>
                  <div className="text-xl font-black text-amber-100">{unit.level}<span className="text-sm text-amber-500/50">/{template.maxLevel}</span></div>
                </div>
              </div>
              
              {/* EXP Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-amber-400/60 mb-1">
                  <span>EXP</span>
                  <span>{unit.exp} / {maxExp}</span>
                </div>
                <div 
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{ 
                    background: '#1a1208',
                    border: `1px solid ${COLORS.goldDark}`
                  }}
                >
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: unit.level >= template.maxLevel ? '100%' : `${(unit.exp / maxExp) * 100}%`,
                      background: `linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa)`,
                      boxShadow: '0 0 8px #3b82f680'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Stats Section ═══ */}
        <div className="px-4 pb-2">
          <div className="grid grid-cols-4 gap-2">
            {/* HP */}
            <div 
              className="relative p-2.5 rounded-lg text-center"
              style={{ 
                background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                border: `2px solid #22c55e`,
                boxShadow: `0 4px 0 #166534, 0 2px 8px rgba(0,0,0,0.3) inset`
              }}
            >
              <div className="text-[9px] text-green-300 uppercase font-bold tracking-wide">HP</div>
              <div className="text-base font-black text-green-400" style={{ textShadow: '0 0 8px #22c55e80' }}>
                {stats.hp.toLocaleString()}
              </div>
              {equipmentBonuses.hp > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-green-900" style={{ backgroundColor: '#4ade80' }}>
                  +{equipmentBonuses.hp}
                </div>
              )}
            </div>
            
            {/* ATK */}
            <div 
              className="relative p-2.5 rounded-lg text-center"
              style={{ 
                background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                border: `2px solid #ef4444`,
                boxShadow: `0 4px 0 #b91c1c, 0 2px 8px rgba(0,0,0,0.3) inset`
              }}
            >
              <div className="text-[9px] text-red-300 uppercase font-bold tracking-wide">ATK</div>
              <div className="text-base font-black text-red-400" style={{ textShadow: '0 0 8px #ef444480' }}>
                {stats.atk.toLocaleString()}
              </div>
              {equipmentBonuses.atk > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-red-900" style={{ backgroundColor: '#f87171' }}>
                  +{equipmentBonuses.atk}
                </div>
              )}
            </div>
            
            {/* DEF */}
            <div 
              className="relative p-2.5 rounded-lg text-center"
              style={{ 
                background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                border: `2px solid #3b82f6`,
                boxShadow: `0 4px 0 #1d4ed8, 0 2px 8px rgba(0,0,0,0.3) inset`
              }}
            >
              <div className="text-[9px] text-blue-300 uppercase font-bold tracking-wide">DEF</div>
              <div className="text-base font-black text-blue-400" style={{ textShadow: '0 0 8px #3b82f680' }}>
                {stats.def.toLocaleString()}
              </div>
              {equipmentBonuses.def > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-900" style={{ backgroundColor: '#60a5fa' }}>
                  +{equipmentBonuses.def}
                </div>
              )}
            </div>
            
            {/* REC */}
            <div 
              className="relative p-2.5 rounded-lg text-center"
              style={{ 
                background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
                border: `2px solid #eab308`,
                boxShadow: `0 4px 0 #a16207, 0 2px 8px rgba(0,0,0,0.3) inset`
              }}
            >
              <div className="text-[9px] text-yellow-300 uppercase font-bold tracking-wide">REC</div>
              <div className="text-base font-black text-yellow-400" style={{ textShadow: '0 0 8px #eab30880' }}>
                {stats.rec.toLocaleString()}
              </div>
              {equipmentBonuses.rec > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-yellow-900" style={{ backgroundColor: '#facc15' }}>
                  +{equipmentBonuses.rec}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Skills Section ═══ */}
        <div className="px-4 pb-2 flex flex-col gap-2">
          {/* Leader Skill */}
          {leaderSkill && (
            <div 
              className="p-3 rounded-lg"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.parchmentLight}, ${COLORS.parchment})`,
                border: `2px solid ${COLORS.gold}`,
                boxShadow: `0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 #ffffff50`
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div 
                  className="p-1 rounded"
                  style={{ backgroundColor: COLORS.goldDark }}
                >
                  <Crown size={12} className="text-amber-100" />
                </div>
                <span className="text-xs font-bold text-amber-900 uppercase">Leader Skill</span>
                {isLeader && (
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded font-bold text-amber-900"
                    style={{ backgroundColor: COLORS.gold, boxShadow: `0 0 8px ${COLORS.goldGlow}` }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-amber-900">{leaderSkill.name}</span>
              <div className="text-xs text-amber-800/70 mt-1 leading-relaxed">{leaderSkill.description}</div>
            </div>
          )}
          
          {/* Brave Burst */}
          <div 
            className="p-3 rounded-lg"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.parchmentLight}, ${COLORS.parchment})`,
              border: `2px solid ${COLORS.gold}`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 #ffffff50`
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div 
                  className="p-1 rounded"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  <Sparkles size={12} className="text-purple-100" />
                </div>
                <span className="text-xs font-bold text-purple-800 uppercase">Brave Burst</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: '#7c3aed20' }}>
                <span className="text-xs text-purple-700 font-bold">{template.skill.cost}</span>
                <span className="text-[10px] text-purple-600">BB</span>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-900">{template.skill.name}</span>
            <div className="text-xs text-amber-800/70 mt-1 leading-relaxed">{template.skill.description}</div>
          </div>
        </div>

        {/* ═══ Equipment Section ═══ */}
        <div className="px-4 pb-2">
          <div 
            className="p-3 rounded-lg"
            style={{ 
              background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
              border: `2px solid ${COLORS.goldDark}`,
              boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 ${COLORS.gold}20`
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sword size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Equipment</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${COLORS.goldDark}, transparent)` }} />
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

        {/* ═══ Limited Offer Banner ═══ */}
        <div className="px-4 pb-4">
          <div 
            className="p-3 rounded-lg text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(90deg, ${COLORS.goldDark}, ${COLORS.gold}, ${COLORS.goldDark})`,
              border: `2px solid ${COLORS.goldLight}`,
              boxShadow: `0 0 20px ${COLORS.goldGlow}40`
            }}
          >
            {/* Shine animation effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent, ${COLORS.goldLight}, transparent)`,
                animation: 'shimmer 2s infinite'
              }}
            />
            <div className="relative">
              <div className="text-[10px] text-amber-900 font-bold uppercase tracking-widest">
                ⚡ Limited Time Offer
              </div>
              <div className="text-sm text-amber-900 font-black mt-0.5">
                23h 55m remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          ACTION BUTTONS - Fixed bottom
      ════════════════════════════════════════════ */}
      <div 
        className="p-3 flex gap-2"
        style={{ 
          background: `linear-gradient(180deg, ${COLORS.woodDark}, ${COLORS.woodPanel})`,
          borderTop: `3px solid ${COLORS.goldDark}`,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.4)'
        }}
      >
        {onNavigateToFusion && (
          <button
            onClick={() => onNavigateToFusion(unitId)}
            className="flex-1 h-12 rounded-lg font-bold uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            style={{ 
              background: `linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)`,
              border: `2px solid #93c5fd`,
              boxShadow: `0 4px 0 #1d4ed8, 0 2px 8px rgba(59,130,246,0.4), inset 0 1px 0 #93c5fd50`,
              textShadow: '0 1px 2px #00000080'
            }}
          >
            <Zap size={18} />
            <span>Fusionar</span>
          </button>
        )}
        {canEvolve && onNavigateToEvolution && (
          <button
            onClick={() => onNavigateToEvolution(unitId)}
            className="flex-1 h-12 rounded-lg font-bold uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            style={{ 
              background: `linear-gradient(180deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)`,
              border: `2px solid #d8b4fe`,
              boxShadow: `0 4px 0 #6d28d9, 0 2px 8px rgba(168,85,247,0.4), inset 0 1px 0 #d8b4fe50`,
              textShadow: '0 1px 2px #00000080'
            }}
          >
            <Sparkles size={18} />
            <span>Evolucionar</span>
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-18 right-2 p-2.5 rounded-lg active:scale-90 transition-transform z-10"
        style={{ 
          background: `linear-gradient(180deg, ${COLORS.woodLight}, ${COLORS.woodDark})`,
          border: `2px solid ${COLORS.goldDark}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}
      >
        <X size={20} className="text-amber-400" />
      </button>

    </div>
  );
}
