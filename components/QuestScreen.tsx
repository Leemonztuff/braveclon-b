import { STAGES, StageTemplate } from '@/lib/gameData';
import WorldMap from './WorldMap';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ViewMode = 'map' | 'list';

// BF2 Style Stage Card Component
interface StageCardProps {
  stage: StageTemplate;
  isUnlocked: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}

function StageCard({ stage, isUnlocked, isCompleted, onSelect }: StageCardProps) {
  // Calculate difficulty based on energy cost (1-5 stars)
  const difficulty = Math.min(Math.floor(stage.energy / 5) + 1, 5);
  
  // Get enemy icons (using first 3 or placeholder)
  const enemyIcons = stage.enemies.slice(0, 3);
  
  return (
    <div className={`
      relative p-4 rounded-xl border-2 transition-all duration-200
      ${isCompleted 
        ? 'border-emerald-500/50 bg-emerald-900/10' 
        : isUnlocked 
          ? 'border-[#b89947]/30 bg-[#1a1a2e]/80 hover:border-[#b89947] hover:bg-[#1a1a2e]' 
          : 'border-zinc-800 bg-zinc-900/50 opacity-60'
      }
    `}>
      {/* Difficulty Stars */}
      <div className="flex gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={i < difficulty ? 'text-yellow-400 text-sm' : 'text-zinc-700 text-sm'}
          >
            ★
          </span>
        ))}
      </div>
      
      {/* Stage Name & Energy Badge */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-black uppercase text-zinc-100 tracking-wider text-sm">
            {stage.name}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">{stage.area}</p>
        </div>
        <div className={`
          px-2 py-1 rounded text-xs font-bold
          ${isCompleted 
            ? 'bg-emerald-900/50 border border-emerald-500/30 text-emerald-400' 
            : 'bg-blue-900/50 border border-blue-500/30 text-blue-400'
          }
        `}>
          ⚡ {stage.energy}
        </div>
      </div>
      
      {/* Enemy Preview Icons */}
      <div className="flex gap-2 mb-3">
        {enemyIcons.length > 0 ? (
          enemyIcons.map((enemy, i) => (
            <div 
              key={i} 
              className="w-10 h-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-lg border border-zinc-700/50"
            >
              👾
            </div>
          ))
        ) : (
          [...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="w-10 h-10 bg-zinc-900/50 rounded-lg flex items-center justify-center text-zinc-600 border border-zinc-800"
            >
              ?
            </div>
          ))
        )}
        {stage.enemies.length > 3 && (
          <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center text-xs text-zinc-500">
            +{stage.enemies.length - 3}
          </div>
        )}
      </div>
      
      {/* Rewards Row */}
      <div className="flex gap-4 text-xs mb-4">
        <span className="text-yellow-400/80">💰 {stage.zelReward.toLocaleString()}</span>
        <span className="text-blue-400/80">✨ {stage.expReward} EXP</span>
      </div>
      
      {/* Action Button */}
      <button 
        disabled={!isUnlocked}
        onClick={onSelect}
        className={`
          w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200
          ${isCompleted 
            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' 
            : isUnlocked 
              ? 'bg-gradient-to-r from-[#c9a227] to-[#b89947] text-zinc-900 hover:from-[#d4af37] hover:to-[#c9a227] shadow-md hover:shadow-lg'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
          }
        `}
      >
        {isCompleted ? '✓ CLEARED' : isUnlocked ? 'START' : '🔒 LOCKED'}
      </button>
    </div>
  );
}

// Region Tabs Component
interface RegionTabsProps {
  regions: string[];
  activeRegion: string;
  onSelect: (region: string) => void;
}

function RegionTabs({ regions, activeRegion, onSelect }: RegionTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-[#16213e] rounded-lg overflow-x-auto">
      {regions.map((region) => (
        <button
          key={region}
          onClick={() => onSelect(region)}
          className={`
            px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
            ${activeRegion === region 
              ? 'bg-gradient-to-b from-[#c9a227] to-[#b89947] text-zinc-900 shadow-md' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }
          `}
        >
          {region}
        </button>
      ))}
    </div>
  );
}

export default function QuestScreen({ onStartBattle, onBack }: { onStartBattle: (stageId: number) => void, onBack?: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeRegion, setActiveRegion] = useState('All');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  
  // Extract unique regions from stages
  const regions = ['All', ...Array.from(new Set(STAGES.map(s => s.area.split(' ')[0])))];
  
  const filteredStages = activeRegion === 'All' 
    ? STAGES 
    : STAGES.filter(s => s.area.startsWith(activeRegion));
  
  const handleSelectStage = (stageId: number) => {
    onStartBattle(stageId);
  };

  const handleCompleteStage = (stageId: number) => {
    if (!completedStages.includes(stageId)) {
      setCompletedStages(prev => [...prev, stageId]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#16213e]">
      {/* Header with toggle */}
      <div className="flex justify-between items-center p-4 border-b border-[#b89947]/30 bg-[#1a1a2e]">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-zinc-400 hover:text-white p-1 bg-zinc-800 rounded-full active:scale-95 transition-transform">
              ←
            </button>
          )}
          <h2 className="text-xl font-black italic text-[#b89947] uppercase tracking-wider">World Map</h2>
        </div>
        
        {/* View toggle */}
        <div className="flex bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              viewMode === 'map' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <WorldMap 
                completedStages={completedStages} 
                onSelectStage={handleSelectStage} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4 h-full"
            >
              {/* Region Tabs */}
              <RegionTabs 
                regions={regions} 
                activeRegion={activeRegion}
                onSelect={setActiveRegion}
              />
              
              {/* Stage Cards Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredStages.map(stage => {
                    const isUnlocked = stage.id === 1 || completedStages.includes(stage.id - 1);
                    const isCompleted = completedStages.includes(stage.id);
                    
                    return (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        isUnlocked={isUnlocked}
                        isCompleted={isCompleted}
                        onSelect={() => handleSelectStage(stage.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}