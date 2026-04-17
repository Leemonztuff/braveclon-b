'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STAGES, ENEMIES } from '@/lib/gameData';
import { PlayerState } from '@/lib/gameState';
import { Header, Tabs, Card } from './ui/DesignSystem';

type ArenaTab = 'practice' | 'leaderboard';

const ARENA_ENEMIES = [
  { name: 'Shadow Knight', element: 'Dark', rarity: 4, hp: 5000, atk: 800, def: 600, level: 40 },
  { name: 'Flame Warrior', element: 'Fire', rarity: 4, hp: 4500, atk: 900, def: 500, level: 45 },
  { name: 'Ice Mage', element: 'Water', rarity: 4, hp: 3500, atk: 1000, def: 400, level: 50 },
  { name: 'Thunder Lord', element: 'Thunder', rarity: 5, hp: 8000, atk: 1200, def: 700, level: 60 },
  { name: 'Light Guardian', element: 'Light', rarity: 5, hp: 7500, atk: 1100, def: 800, level: 65 },
  { name: 'Dark Emperor', element: 'Dark', rarity: 5, hp: 10000, atk: 1500, def: 900, level: 80 },
];

export default function ArenaScreen({ state, onStartBattle, onBack }: { 
  state?: PlayerState,
  onStartBattle?: (stageId: number) => void, 
  onBack: () => void 
}) {
  const [activeTab, setActiveTab] = useState<ArenaTab>('practice');
  const [selectedEnemy, setSelectedEnemy] = useState<typeof ARENA_ENEMIES[0] | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const arenaStageIds: Record<string, number> = {
    'Shadow Knight': 100,
    'Flame Warrior': 101,
    'Ice Mage': 102,
    'Thunder Lord': 103,
    'Light Guardian': 104,
    'Dark Emperor': 105,
  };

  const handleStartPractice = () => {
    if (selectedEnemy && onStartBattle) {
      const stageId = arenaStageIds[selectedEnemy.name];
      setBattleLog(prev => [`⚔️ Starting battle vs ${selectedEnemy.name}...`, ...prev]);
      onStartBattle(stageId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Arena" icon="⚔️" onBack={onBack} />
      
      <div className="px-4 py-3">
        <Tabs 
          tabs={[
            { id: 'practice', label: 'Practice', icon: '⚔️' },
            { id: 'leaderboard', label: 'Rankings', icon: '🏆' },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as ArenaTab)}
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'practice' ? (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <h3 className="text-lg font-bold text-white mb-2">⚔️ Practice Mode</h3>
                <p className="text-sm text-zinc-400">
                  Test your units against AI opponents. No rewards, just practice!
                </p>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                {ARENA_ENEMIES.map((enemy) => (
                  <Card 
                    key={enemy.name}
                    onClick={() => setSelectedEnemy(enemy)}
                    className={`
                      ${selectedEnemy?.name === enemy.name ? 'border-amber-500 bg-amber-500/5' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-white">{enemy.name}</span>
                      <span className={`text-[10px] font-bold ${
                        enemy.rarity >= 5 ? 'text-amber-400' : 'text-purple-400'
                      }`}>
                        {'★'.repeat(enemy.rarity)}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {enemy.element} · Lv.{enemy.level}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      HP: {enemy.hp.toLocaleString()}
                    </div>
                  </Card>
                ))}
              </div>

              <button
                onClick={handleStartPractice}
                disabled={!selectedEnemy}
                className={`
                  w-full py-4 rounded-xl font-bold text-sm transition-all
                  ${selectedEnemy 
                    ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }
                `}
              >
                {selectedEnemy ? `⚔️ Fight ${selectedEnemy.name}` : 'Select an opponent'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <h3 className="text-lg font-bold text-white mb-2">🏆 Leaderboard</h3>
                <p className="text-sm text-zinc-400">
                  Coming soon! Compete with other players.
                </p>
              </Card>

              <div className="space-y-2">
                {[
                  { rank: 1, name: 'TopPlayer1', score: 99999 },
                  { rank: 2, name: 'BF_Veteran', score: 87500 },
                  { rank: 3, name: 'ArenaMaster', score: 74200 },
                  { rank: 4, name: 'ThunderLord', score: 61000 },
                  { rank: 5, name: 'DarkKnight', score: 55000 },
                ].map((entry) => (
                  <Card key={entry.rank} className={entry.rank <= 3 ? 'border-amber-500/30' : ''}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 font-bold ${
                        entry.rank === 1 ? 'text-amber-400' : 
                        entry.rank === 2 ? 'text-zinc-300' : 
                        entry.rank === 3 ? 'text-amber-600' : 'text-zinc-500'
                      }`}>
                        #{entry.rank}
                      </span>
                      <span className="flex-1 font-bold text-white text-sm">{entry.name}</span>
                      <span className="text-amber-400 font-mono text-sm">{entry.score.toLocaleString()}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center p-4 text-zinc-500 text-sm">
                🔒 Log in to save your score!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}