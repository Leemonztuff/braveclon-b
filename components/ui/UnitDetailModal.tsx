import { X, Zap, Scale, Sword, Shield } from 'lucide-react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, EquipSlot, getExpForLevel, ELEMENT_ICONS, Element, EquipmentTemplate } from '@/lib/gameData';
import { UnitDisplay } from './UnitDisplay';
import { StatPanel } from './StatPanel';
import { SkillCard, LeaderSkillDisplay } from './SkillCard';
import { EquipmentGrid } from './EquipmentGrid';

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
  
  return (
    <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900 shadow-md shrink-0">
        <h3 className="font-black italic text-lg text-zinc-100 uppercase tracking-wider">Unit Details</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 bg-zinc-800 rounded-full">
          <X size={20} />
        </button>
      </div>
      
      {/* Content - 3 Column Layout */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column: Full Body Sprite */}
          <div className="lg:w-1/3 shrink-0">
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <UnitDisplay
                spriteUrl={template.spriteUrl}
                name={template.name}
                rarity={template.rarity}
                element={template.element}
                level={unit.level}
                variant="fullbody"
                size="3xl"
                showElement
                className="w-full aspect-[3/4]"
              />
              
              {/* Name & Rarity below sprite */}
              <div className="mt-4 text-center">
                <div className="flex justify-center gap-1 mb-1">
                  {Array.from({ length: template.rarity }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <h2 className="text-lg font-black text-white tracking-wide flex items-center justify-center gap-2">
                  <span className="text-lg">{ELEMENT_ICONS[template.element as Element]}</span>
                  {template.name}
                </h2>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex flex-col gap-2">
                {onNavigateToFusion && (
                  <button
                    onClick={() => onNavigateToFusion(unitId)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Zap size={16} /> Fuse
                  </button>
                )}
                {unit.level >= template.maxLevel && template.evolutionTarget && onNavigateToEvolution && (
                  <button
                    onClick={() => onNavigateToEvolution(unitId)}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">✨</span> Evolve
                  </button>
                )}
                {setCompareUnitId && (
                  <button
                    onClick={() => setCompareUnitId(null)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Scale size={16} /> Compare
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Middle Column: Stats */}
          <div className="lg:w-1/3 shrink-0">
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 h-full">
              <StatPanel
                stats={baseStats}
                equipmentBonuses={equipmentBonuses}
                level={unit.level}
                maxLevel={template.maxLevel}
                exp={unit.exp}
                maxExp={unit.level >= template.maxLevel ? 0 : maxExp}
                element={template.element}
                rarity={template.rarity}
              />
            </div>
          </div>
          
          {/* Right Column: Skills & Equipment */}
          <div className="lg:w-1/3 shrink-0 flex flex-col gap-4">
            {/* Skills Section */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-col gap-2">
                <SkillCard skill={template.skill} type="brave" isActive />
                {leaderSkill && (
                  <LeaderSkillDisplay skill={leaderSkill} isActive={isLeader} />
                )}
                {template.extraSkill && (
                  <SkillCard skill={template.extraSkill} type="extra" />
                )}
              </div>
            </div>
            
            {/* Equipment Section */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Equipment</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}