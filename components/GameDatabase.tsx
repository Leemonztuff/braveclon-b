'use client';

import { useState, useMemo } from 'react';
import { UNIT_DATABASE, EQUIPMENT_DATABASE, ELEMENT_ICONS, Element, Stats, EquipmentTemplate, UnitTemplate } from '@/lib/gameData';

type DatabaseTab = 'units' | 'equipment' | 'elements' | 'skills';

const ELEMENTS: Element[] = ['Fire', 'Water', 'Earth', 'Thunder', 'Light', 'Dark'];

const ELEMENT_COLORS: Record<Element, { bg: string; border: string; text: string }> = {
  Fire: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  Water: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  Earth: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
  Thunder: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  Light: { bg: 'bg-amber-100/20', border: 'border-amber-300/50', text: 'text-amber-300' },
  Dark: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
};

const RARITY_COLORS: Record<number, string> = {
  1: 'text-zinc-400',
  2: 'text-zinc-300',
  3: 'text-sky-400',
  4: 'text-amber-400',
  5: 'text-purple-400',
};

const RARITY_STARS: Record<number, string> = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
};

function UnitCard({ unit }: { unit: UnitTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const elementStyle = ELEMENT_COLORS[unit.element];
  
  const maxHp = unit.baseStats.hp + unit.growthRate.hp * (unit.maxLevel - 1);
  const maxAtk = unit.baseStats.atk + unit.growthRate.atk * (unit.maxLevel - 1);
  const maxDef = unit.baseStats.def + unit.growthRate.def * (unit.maxLevel - 1);
  const maxRec = unit.baseStats.rec + unit.growthRate.rec * (unit.maxLevel - 1);

  return (
    <div 
      className={`rounded-2xl border ${elementStyle.border} ${elementStyle.bg} overflow-hidden touch-manipulation`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex gap-3">
        <div className="w-16 h-16 rounded-xl bg-zinc-800/50 flex items-center justify-center text-3xl shrink-0">
          <img 
            src={unit.spriteUrl} 
            alt={unit.name}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{ELEMENT_ICONS[unit.element]}</span>
            <h3 className="font-bold text-white truncate">{unit.name}</h3>
          </div>
          <div className={`text-sm ${RARITY_COLORS[unit.rarity]}`}>
            {RARITY_STARS[unit.rarity]}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Lv.1-{unit.maxLevel} • {unit.element}
          </div>
        </div>
        <div className="flex items-center text-zinc-500">
          {expanded ? '▲' : '▼'}
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StatBar label="HP" value={unit.baseStats.hp} max={maxHp} color="bg-red-500" />
            <StatBar label="ATK" value={unit.baseStats.atk} max={maxAtk} color="bg-orange-500" />
            <StatBar label="DEF" value={unit.baseStats.def} max={maxDef} color="bg-blue-500" />
            <StatBar label="REC" value={unit.baseStats.rec} max={maxRec} color="bg-green-500" />
          </div>
          
          <div className="space-y-2 pt-2 border-t border-zinc-700/50">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚔️ {unit.skill.name}</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                BB: {unit.skill.cost}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{unit.skill.description}</p>
            
            {unit.leaderSkill && (
              <div className="mt-2 p-2 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold text-xs">👑 {unit.leaderSkill.name}</span>
                </div>
                <p className="text-xs text-zinc-400">{unit.leaderSkill.description}</p>
              </div>
            )}
            
            {unit.extraSkill && (
              <div className="mt-2 p-2 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-xs">✨ {unit.extraSkill.name}</span>
                </div>
                <p className="text-xs text-zinc-400">{unit.extraSkill.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EquipmentCard({ equip }: { equip: EquipmentTemplate }) {
  const [expanded, setExpanded] = useState(false);
  
  const typeIcon = equip.type === 'weapon' ? '⚔️' : equip.type === 'armor' ? '🛡️' : '💍';
  const typeColor = equip.type === 'weapon' ? 'text-orange-400' : equip.type === 'armor' ? 'text-blue-400' : 'text-purple-400';
  const typeBg = equip.type === 'weapon' ? 'bg-orange-500/20' : equip.type === 'armor' ? 'bg-blue-500/20' : 'bg-purple-500/20';

  return (
    <div 
      className={`rounded-2xl border border-zinc-700/50 ${typeBg} overflow-hidden touch-manipulation`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center text-3xl shrink-0">
          {equip.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{equip.name}</h3>
          <div className={`text-xs ${typeColor} capitalize`}>{equip.type}</div>
        </div>
        <div className="flex items-center text-zinc-500">
          {expanded ? '▲' : '▼'}
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-zinc-400 mb-3">{equip.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {equip.statsBonus.hp && <StatBadge label="HP" value={equip.statsBonus.hp} color="text-red-400" />}
            {equip.statsBonus.atk && <StatBadge label="ATK" value={equip.statsBonus.atk} color="text-orange-400" />}
            {equip.statsBonus.def && <StatBadge label="DEF" value={equip.statsBonus.def} color="text-blue-400" />}
            {equip.statsBonus.rec && <StatBadge label="REC" value={equip.statsBonus.rec} color="text-green-400" />}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg px-3 py-2">
      <span className="text-zinc-400 text-xs">{label}</span>
      <span className={`font-bold ${color}`}>+{value}</span>
    </div>
  );
}

function ElementCard({ element }: { element: Element }) {
  const [expanded, setExpanded] = useState(false);
  const style = ELEMENT_COLORS[element];
  
  const weaknesses = ELEMENTS.map(def => {
    let multiplier = 1;
    if (element === 'Fire' && def === 'Earth') multiplier = 2;
    if (element === 'Water' && def === 'Fire') multiplier = 2;
    if (element === 'Earth' && def === 'Thunder') multiplier = 2;
    if (element === 'Thunder' && def === 'Water') multiplier = 2;
    if (element === 'Light' && def === 'Dark') multiplier = 2;
    if (element === 'Dark' && def === 'Light') multiplier = 2;
    return { element: def, multiplier };
  });

  return (
    <div 
      className={`rounded-2xl border ${style.border} ${style.bg} overflow-hidden touch-manipulation`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center text-3xl">
          {ELEMENT_ICONS[element]}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${style.text}`}>{element}</h3>
          <p className="text-xs text-zinc-400">
            Strong vs: {weaknesses.filter(w => w.multiplier === 2).map(w => ELEMENT_ICONS[w.element]).join(' ')}
          </p>
        </div>
        <div className="flex items-center text-zinc-500">
          {expanded ? '▲' : '▼'}
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {ELEMENTS.map(def => {
              const m = weaknesses.find(w => w.element === def)?.multiplier || 1;
              return (
                <div key={def} className="flex items-center gap-1 bg-zinc-800/50 rounded-lg px-2 py-1">
                  <span>{ELEMENT_ICONS[def]}</span>
                  <span className={`text-xs font-bold ${m === 2 ? 'text-green-400' : m === 0.5 ? 'text-red-400' : 'text-zinc-400'}`}>
                    x{m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GameDatabase() {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('units');
  const [searchQuery, setSearchQuery] = useState('');
  const [elementFilter, setElementFilter] = useState<Element | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<number | 'all'>('all');

  const filteredUnits = useMemo(() => {
    return Object.values(UNIT_DATABASE)
      .filter(unit => !unit.id.startsWith('e') && !unit.id.startsWith('arena_') && unit.id !== 'mat_fire')
      .filter(unit => {
        if (elementFilter !== 'all' && unit.element !== elementFilter) return false;
        if (rarityFilter !== 'all' && unit.rarity !== rarityFilter) return false;
        if (searchQuery && !unit.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
  }, [elementFilter, rarityFilter, searchQuery]);

  const filteredEquipment = useMemo(() => {
    return Object.values(EQUIPMENT_DATABASE)
      .filter(equip => {
        if (searchQuery && !equip.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });
  }, [searchQuery]);

  const tabs: { id: DatabaseTab; label: string; icon: string }[] = [
    { id: 'units', label: 'Units', icon: '👤' },
    { id: 'equipment', label: 'Equipment', icon: '⚔️' },
    { id: 'elements', label: 'Elements', icon: '✨' },
    { id: 'skills', label: 'Skills', icon: '📖' },
  ];

  const skillTypes = [
    { type: 'damage', icon: '⚔️', name: 'Attack', desc: 'Deal damage to enemies' },
    { type: 'heal', icon: '💚', name: 'Heal', desc: 'Restore ally HP' },
    { type: 'buff', icon: '⬆️', name: 'Buff', desc: 'Enhance ally stats' },
    { type: 'debuff', icon: '⬇️', name: 'Debuff', desc: 'Weaken enemy stats' },
  ];

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-amber-400">📚 GAME DATABASE</h2>
        <p className="text-sm text-zinc-400">Explore units, equipment, and game mechanics</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 touch-pan-x">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all shrink-0 touch-manipulation ${
              activeTab === tab.id 
                ? 'bg-amber-400 text-zinc-950' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'elements' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 touch-manipulation"
          />
        </div>
      )}

      {activeTab === 'units' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 touch-pan-x">
            <button
              onClick={() => setElementFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                elementFilter === 'all' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/50 text-zinc-400'
              }`}
            >
              All Elements
            </button>
            {ELEMENTS.map(el => (
              <button
                key={el}
                onClick={() => setElementFilter(el)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  elementFilter === el ? 'bg-zinc-700 text-white' : 'bg-zinc-800/50 text-zinc-400'
                }`}
              >
                {ELEMENT_ICONS[el]} {el}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 touch-pan-x">
            <button
              onClick={() => setRarityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                rarityFilter === 'all' ? 'bg-zinc-700 text-white' : 'bg-zinc-800/50 text-zinc-400'
              }`}
            >
              All Rarities
            </button>
            {[3, 4, 5].map(r => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  rarityFilter === r ? 'bg-zinc-700 text-white' : 'bg-zinc-800/50 text-zinc-400'
                }`}
              >
                {RARITY_STARS[r]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredUnits.map(unit => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
            {filteredUnits.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                No units found
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredEquipment.map(equip => (
            <EquipmentCard key={equip.id} equip={equip} />
          ))}
          {filteredEquipment.length === 0 && (
            <div className="col-span-full text-center py-8 text-zinc-500">
              No equipment found
            </div>
          )}
        </div>
      )}

      {activeTab === 'elements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ELEMENTS.map(element => (
            <ElementCard key={element} element={element} />
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {skillTypes.map(skill => (
              <div key={skill.type} className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{skill.icon}</span>
                  <h3 className="font-bold text-white">{skill.name}</h3>
                </div>
                <p className="text-sm text-zinc-400">{skill.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4">
            <h3 className="font-bold text-amber-400 mb-3">Skill Mechanics</h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>BB Gauge</span>
                <span className="text-zinc-400">Fills during battle, used for skills</span>
              </div>
              <div className="flex justify-between">
                <span>OD Gauge</span>
                <span className="text-zinc-400">Ultimate gauge, powerful effects</span>
              </div>
              <div className="flex justify-between">
                <span>Damage Formula</span>
                <span className="text-zinc-400">ATK × Power × Element × Weakness</span>
              </div>
              <div className="flex justify-between">
                <span>Leader Skill</span>
                <span className="text-zinc-400">Passive buff when leading team</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
