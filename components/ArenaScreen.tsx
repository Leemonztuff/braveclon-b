'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STAGES, ENEMIES } from '@/lib/gameData';
import { PlayerState } from '@/lib/gameState';
import { UI } from '@/lib/design-tokens';

type ArenaTab = 'practice' | 'leaderboard';

interface ArenaPracticeEnemy {
  name: string;
  element: string;
  rarity: number;
  hp: number;
  atk: number;
  def: number;
  level: number;
}

const ARENA_ENEMIES: ArenaPracticeEnemy[] = [
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
  const [selectedEnemy, setSelectedEnemy] = useState<ArenaPracticeEnemy | null>(null);
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
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-400 hover:text-white">←</button>
          <h2 className="text-xl font-black italic text-yellow-400 uppercase tracking-wider">
            ⚔️ Arena
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${
              activeTab === 'practice' ? 'bg-zinc-700 text-yellow-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⚔️ Practice
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${
              activeTab === 'leaderboard' ? 'bg-zinc-700 text-yellow-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🏆 Rankings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'practice' ? (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-lg font-bold text-white mb-2">⚔️ Practice Mode</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Challenge AI-controlled teams to test your units. No rewards, just practice!
                </p>
                <p className="text-xs text-zinc-500">
                  This uses your current team against simulated enemies.
                </p>
              </div>

              {/* Enemy Selection */}
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-md font-bold text-zinc-300 mb-3">Select Opponent</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ARENA_ENEMIES.map((enemy, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedEnemy(enemy)}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${selectedEnemy?.name === enemy.name 
                          ? 'border-yellow-400 bg-yellow-400/10' 
                          : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white">{enemy.name}</span>
                        <span className={`text-[10px] font-bold ${
                          enemy.rarity >= 5 ? 'text-yellow-400' :
                          enemy.rarity >= 4 ? 'text-purple-400' : 'text-blue-400'
                        }`}>
                          {'★'.repeat(enemy.rarity)}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {enemy.element} · Lv.{enemy.level}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        HP: {enemy.hp.toLocaleString()} · ATK: {enemy.atk}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartPractice}
                disabled={!selectedEnemy}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all
                  ${selectedEnemy 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 shadow-lg' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }
                `}
              >
                {selectedEnemy ? `⚔️ FIGHT ${selectedEnemy.name}` : 'Select an opponent'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <h3 className="text-lg font-bold text-white mb-2">🏆 Leaderboard</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Coming soon! Compete with other players.
                </p>
              </div>

              {/* Placeholder rankings */}
              <div className="space-y-2">
                {[
                  { rank: 1, name: 'TopPlayer1', score: 99999 },
                  { rank: 2, name: 'BF_Veteran', score: 87500 },
                  { rank: 3, name: 'ArenaMaster', score: 74200 },
                  { rank: 4, name: 'ThunderLord', score: 61000 },
                  { rank: 5, name: 'DarkKnight', score: 55000 },
                ].map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg
                      ${entry.rank <= 3 ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-900/50'}
                    `}
                  >
                    <span className={`
                      w-8 font-bold text-lg
                      ${entry.rank === 1 ? 'text-yellow-400' : 
                        entry.rank === 2 ? 'text-zinc-300' : 
                        entry.rank === 3 ? 'text-amber-600' : 'text-zinc-500'}
                    `}>
                      #{entry.rank}
                    </span>
                    <span className="flex-1 font-bold text-white">{entry.name}</span>
                    <span className="text-yellow-400 font-mono">{entry.score.toLocaleString()}</span>
                  </div>
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