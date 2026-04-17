import { STAGES, StageTemplate } from '@/lib/gameData';
import WorldMap from './WorldMap';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, Card, Tabs } from './ui/DesignSystem';

type ViewMode = 'map' | 'list';

function StageCard({ stage, isUnlocked, isCompleted, onSelect }: {
  stage: StageTemplate;
  isUnlocked: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  const difficulty = Math.min(Math.floor(stage.energy / 5) + 1, 5);
  const enemyIcons = stage.enemies.slice(0, 3);
  
  return (
    <Card 
      onClick={isUnlocked ? onSelect : undefined}
      className={`
        ${!isUnlocked ? 'opacity-50' : ''}
        ${isCompleted ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white text-sm uppercase tracking-wide">{stage.area}</h3>
          <p className="text-xs text-zinc-500">{stage.name}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-300'}`}>
          ⚡ {stage.energy}
        </div>
      </div>

      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < difficulty ? 'text-amber-400 text-xs' : 'text-zinc-700 text-xs'}>★</span>
        ))}
      </div>

      <div className="flex gap-2 mb-3">
        {enemyIcons.map((enemy, i) => (
          <div key={i} className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-lg border border-zinc-700">
            👾
          </div>
        ))}
        {stage.enemies.length > 3 && (
          <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center text-xs text-zinc-500">
            +{stage.enemies.length - 3}
          </div>
        )}
      </div>

      <div className="flex gap-4 text-xs mb-3">
        <span className="text-amber-400">💰 {stage.zelReward.toLocaleString()}</span>
        <span className="text-sky-400">✨ {stage.expReward} EXP</span>
      </div>

      <button 
        disabled={!isUnlocked}
        className={`
          w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
          ${isCompleted 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : isUnlocked 
              ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }
        `}
      >
        {isCompleted ? '✓ Cleared' : isUnlocked ? 'Start' : '🔒 Locked'}
      </button>
    </Card>
  );
}

function RegionTabs({ regions, activeRegion, onSelect }: {
  regions: string[];
  activeRegion: string;
  onSelect: (region: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg overflow-x-auto">
      {regions.map((region) => (
        <button
          key={region}
          onClick={() => onSelect(region)}
          className={`
            px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
            ${activeRegion === region 
              ? 'bg-amber-400 text-zinc-900' 
              : 'text-zinc-400 hover:text-white'
            }
          `}
        >
          {region}
        </button>
      ))}
    </div>
  );
}

export default function QuestScreen({ onStartBattle, onBack }: { 
  onStartBattle: (stageId: number) => void, 
  onBack?: () => void 
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeRegion, setActiveRegion] = useState('All');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  
  const regions = ['All', ...Array.from(new Set(STAGES.map(s => s.area.split(' ')[0])))];
  
  const filteredStages = activeRegion === 'All' 
    ? STAGES 
    : STAGES.filter(s => s.area.startsWith(activeRegion));
  
  const handleSelectStage = (stageId: number) => {
    onStartBattle(stageId);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <Header title="Quests" icon="🗺️" onBack={onBack} />
      
      <div className="px-4 py-3">
        <Tabs 
          tabs={[
            { id: 'list', label: 'List', icon: '📋' },
            { id: 'map', label: 'Map', icon: '🗺️' },
          ]}
          activeTab={viewMode}
          onTabChange={(id) => setViewMode(id as ViewMode)}
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <RegionTabs 
                regions={regions} 
                activeRegion={activeRegion}
                onSelect={setActiveRegion}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
