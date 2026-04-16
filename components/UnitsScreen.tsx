/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { PlayerState, calculateStats } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, EquipSlot, getExpForLevel, ELEMENT_ICONS, Element } from '@/lib/gameData';
import { Shield, Sword, Gem, X, Zap, Scale, Search, Filter } from 'lucide-react';
import { UnitFrame } from './UnitFrame';
import { UnitDisplay } from './ui/UnitDisplay';
import { UnitDetailModal } from './ui/UnitDetailModal';
import { UnitInstance, EquipInstance } from '@/lib/gameTypes';

type Tab = 'inventory' | 'equipment' | 'team';

export default function UnitsScreen({ 
  state, 
  setTeamMember,
  equipItem,
  unequipItem,
  onNavigateToFusion,
  onNavigateToEvolution,
  onNavigate,
  onBack
}: { 
  state: PlayerState, 
  setTeamMember: (index: number, id: string | null) => void,
  equipItem: (unitId: string, slot: EquipSlot, itemId: string | null) => void,
  unequipItem: (unitId: string, slot: EquipSlot) => void,
  onNavigateToFusion?: (unitId: string) => void,
  onNavigateToEvolution?: (unitId: string) => void,
  onNavigate?: (screen: any) => void,
  onBack?: () => void
}) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [inspectUnitId, setInspectUnitId] = useState<string | null>(null);
  const [equipModalSlot, setEquipModalSlot] = useState<EquipSlot | null>(null);
  const [compareUnitId, setCompareUnitId] = useState<string | null>(null);
  const [isSelectingCompare, setIsSelectingCompare] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [elementFilter, setElementFilter] = useState<Element | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ unitId: string; x: number; y: number } | null>(null);

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, unitId: string) => {
    e.preventDefault();
    setContextMenu({ unitId, x: e.clientX, y: e.clientY });
  };

  const handleLongPress = (unitId: string) => {
    setContextMenu({ unitId, x: 0, y: 0 });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Long press detection for mobile
  const longPressTimerRef = { current: null as NodeJS.Timeout | null };
  const handleTouchStart = (unitId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(unitId);
    }, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSelectUnit = (instanceId: string) => {
    if (selectedSlot !== null) {
      const existingIndex = state.team.indexOf(instanceId);
      if (existingIndex !== -1) {
        setTeamMember(existingIndex, null);
      }
      setTeamMember(selectedSlot, instanceId);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4" onClick={closeContextMenu}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack} 
              className="text-zinc-400 hover:text-white p-1 bg-zinc-800 rounded-full active:scale-95 transition-transform"
            >
              <X size={20} />
            </button>
          )}
          <h2 className="text-xl font-black italic text-zinc-100 uppercase tracking-wider">Manage Squad</h2>
        </div>
        
        <div className="flex gap-1">
          {(['inventory', 'equipment', 'team'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === tab 
                  ? 'bg-yellow-500 text-zinc-900' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'inventory' && (
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search units..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <select
            value={elementFilter}
            onChange={e => setElementFilter(e.target.value as Element | 'all')}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Elements</option>
            {(['Fire', 'Water', 'Earth', 'Thunder', 'Light', 'Dark'] as Element[]).map(el => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
          <select
            value={rarityFilter}
            onChange={e => setRarityFilter(Number(e.target.value) as number | 'all')}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Rarities</option>
            {[1,2,3,4,5].map(r => (
              <option key={r} value={r}>{'★'.repeat(r)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Team Display */}
      {activeTab === 'team' && (
        <div className="mb-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Your Squad</h3>
            <span className="text-xs text-zinc-500">{state.team.filter(Boolean).length}/7 Units</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, idx) => {
              const unitId = state.team[idx];
              const unit = unitId ? state.inventory.find(u => u.instanceId === unitId) : null;
              const template = unit ? UNIT_DATABASE[unit.templateId] : null;
              
              return (
                <div key={idx} className="shrink-0">
                  <UnitFrame
                    unit={template}
                    size="sm"
                    isLeader={idx === 0}
                    onClick={() => unit ? handleSelectUnit(unit.instanceId) : setSelectedSlot(idx)}
                  />
                  <div className="text-center text-[10px] text-zinc-500 mt-1">{idx + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'inventory' && (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {state.inventory
                .filter(u => {
                  const template = UNIT_DATABASE[u.templateId];
                  if (elementFilter !== 'all' && template.element !== elementFilter) return false;
                  if (rarityFilter !== 'all' && template.rarity !== rarityFilter) return false;
                  if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                })
                .map(unit => {
                  const template = UNIT_DATABASE[unit.templateId];
                  return (
                    <UnitDisplay
                      key={unit.instanceId}
                      spriteUrl={template.spriteUrl}
                      name={template.name}
                      rarity={template.rarity}
                      element={template.element}
                      level={unit.level}
                      size="md"
                      variant="frame"
                      interactive
                      onClick={() => setInspectUnitId(unit.instanceId)}
                      onContextMenu={(e) => handleContextMenu(e, unit.instanceId)}
                      onTouchStart={() => handleTouchStart(unit.instanceId)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      className="w-full"
                    />
                  );
                })}
            </div>
            {state.inventory.length === 0 && (
              <div className="text-center text-zinc-500 mt-10">No units in inventory. Summon some first!</div>
            )}
          </>
        )}

        {activeTab === 'equipment' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {state.equipmentInventory.map(eq => {
              const template = EQUIPMENT_DATABASE[eq.templateId];
              return (
                <div key={eq.instanceId} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-700 rounded-xl">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{template.name}</div>
                    <div className="text-[10px] text-zinc-400">{template.description}</div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      {Object.entries(template.statsBonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' ')}
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">{template.type}</div>
                </div>
              );
            })}
            {state.equipmentInventory.length === 0 && (
              <div className="text-center text-zinc-500 mt-10 col-span-2">No equipment found.</div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="text-center text-zinc-500 mt-10">Select a slot in Your Squad above to add units.</div>
        )}
      </div>

      {/* Unit Details Modal - New 3-Column Layout */}
      {inspectUnitId && (
        <UnitDetailModal
          unitId={inspectUnitId}
          state={state}
          onClose={() => { setInspectUnitId(null); setCompareUnitId(null); setIsSelectingCompare(false); }}
          onNavigateToFusion={onNavigateToFusion ? (id) => { setInspectUnitId(null); onNavigateToFusion(id); } : undefined}
          onNavigateToEvolution={onNavigateToEvolution ? (id) => { setInspectUnitId(null); onNavigateToEvolution(id); } : undefined}
          setCompareUnitId={setCompareUnitId}
          onUnequipItem={unequipItem}
        />
      )}

      {/* Select Item Modal (for equipment) */}
      {equipModalSlot && inspectUnitId && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl h-[80%]">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="font-bold text-lg text-zinc-100 capitalize">Select {equipModalSlot}</h3>
              <button onClick={() => setEquipModalSlot(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {state.equipmentInventory
                .filter(eq => EQUIPMENT_DATABASE[eq.templateId].type === equipModalSlot)
                .map(eq => {
                  const template = EQUIPMENT_DATABASE[eq.templateId];
                  const equippedBy = state.inventory.find(u => 
                    u.equipment.weapon === eq.instanceId || 
                    u.equipment.armor === eq.instanceId || 
                    u.equipment.accessory === eq.instanceId
                  );

                  return (
                    <button
                      key={eq.instanceId}
                      onClick={() => {
                        equipItem(inspectUnitId, equipModalSlot!, eq.instanceId);
                        setEquipModalSlot(null);
                      }}
                      className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-yellow-400 text-left transition-colors"
                    >
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-white">{template.name}</div>
                        <div className="text-[10px] text-zinc-400">{template.description}</div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-1">
                          {Object.entries(template.statsBonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' ')}
                        </div>
                      </div>
                      {equippedBy && (
                        <div className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                          E: {UNIT_DATABASE[equippedBy.templateId].name}
                        </div>
                      )}
                    </button>
                  );
                })}
              {state.equipmentInventory.filter(eq => EQUIPMENT_DATABASE[eq.templateId].type === equipModalSlot).length === 0 && (
                <div className="text-center text-zinc-500 text-sm mt-10">No {equipModalSlot}s found in inventory.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Select Unit to Compare Modal */}
      {isSelectingCompare && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl h-[80%]">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="font-bold text-lg text-zinc-100 uppercase">Select Unit to Compare</h3>
              <button onClick={() => setIsSelectingCompare(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {state.inventory.filter(u => u.instanceId !== inspectUnitId).map(u => {
                const template = UNIT_DATABASE[u.templateId];
                return (
                  <button
                    key={u.instanceId}
                    onClick={() => {
                      setCompareUnitId(u.instanceId);
                      setIsSelectingCompare(false);
                    }}
                    className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-yellow-400 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-zinc-900 overflow-hidden relative border border-zinc-700">
                      <img src={template.spriteUrl} alt={template.name} className="w-full h-full object-cover scale-[2.5] origin-[50%_20%]" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-white flex items-center gap-1">
                        <span>{ELEMENT_ICONS[template.element]}</span>
                        {template.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">Lv. {u.level}</div>
                    </div>
                  </button>
                );
              })}
              {state.inventory.filter(u => u.instanceId !== inspectUnitId).length === 0 && (
                <div className="text-center text-zinc-500 text-sm mt-10">No other units in inventory.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu for Quick Actions */}
      {contextMenu && (() => {
        const unit = state.inventory.find(u => u.instanceId === contextMenu.unitId);
        if (!unit) return null;
        const template = UNIT_DATABASE[unit.templateId];
        const canFuse = !state.team.includes(unit.instanceId) && unit.level < template.maxLevel;
        const canEvolve = unit.level >= template.maxLevel && !!template.evolutionTarget;

        return (
          <div
            className="fixed z-[100] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: contextMenu.y > window.innerHeight - 200 ? contextMenu.y - 150 : contextMenu.y,
              left: contextMenu.x > window.innerWidth - 180 ? contextMenu.x - 160 : contextMenu.x,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="font-bold text-sm text-white">{template.name}</div>
              <div className="text-[10px] text-zinc-500">Lv. {unit.level} · {ELEMENT_ICONS[template.element]}</div>
            </div>
            <button
              onClick={() => {
                setInspectUnitId(contextMenu.unitId);
                closeContextMenu();
              }}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
            >
              <span>🔍</span> View Details
            </button>
            {canFuse && onNavigateToFusion && (
              <button
                onClick={() => {
                  onNavigateToFusion(contextMenu.unitId);
                  closeContextMenu();
                }}
                className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-zinc-800 hover:text-blue-300 flex items-center gap-2"
              >
                <span>⚡</span> Fuse Unit
              </button>
            )}
            {canEvolve && onNavigateToEvolution && (
              <button
                onClick={() => {
                  onNavigateToEvolution(contextMenu.unitId);
                  closeContextMenu();
                }}
                className="w-full px-3 py-2 text-left text-sm text-purple-400 hover:bg-zinc-800 hover:text-purple-300 flex items-center gap-2"
              >
                <span>✨</span> Evolve Unit
              </button>
            )}
            {!canFuse && !canEvolve && (
              <div className="px-3 py-2 text-xs text-zinc-600 italic">
                No actions available
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}