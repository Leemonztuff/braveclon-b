'use client';
import { motion } from 'motion/react';
import { STAGES } from '@/lib/gameData';
import { StageTemplate } from '@/lib/gameData';

interface MapNode {
  id: number;
  name: string;
  area: string;
  x: number;
  y: number;
  region: string;
  color: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  energy: number;
}

interface WorldMapProps {
  completedStages: number[];
  onSelectStage: (stageId: number) => void;
}

const MAP_NODES: MapNode[] = [
  { id: 1, name: 'Mistral', area: "Adventurer's Prairie", x: 25, y: 70, region: 'Mistral', color: 'from-green-500 to-emerald-600', isUnlocked: true, isCompleted: false, energy: 3 },
  { id: 2, name: 'Mistral', area: 'Cave of Flames', x: 45, y: 55, region: 'Mistral', color: 'from-red-500 to-orange-600', isUnlocked: true, isCompleted: false, energy: 4 },
  { id: 3, name: 'Morgan', area: 'Destroyed Cathedral', x: 70, y: 40, region: 'Morgan', color: 'from-purple-500 to-pink-600', isUnlocked: true, isCompleted: false, energy: 5 },
  { id: 4, name: 'St. Lamia', area: 'Blood Forest', x: 85, y: 65, region: 'St. Lamia', color: 'from-red-700 to-red-900', isUnlocked: false, isCompleted: false, energy: 6 },
];

// Connection paths between nodes
const MAP_PATHS = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
];

// Region backgrounds
const REGIONS = {
  Mistral: { name: 'Mistral Region', gradient: 'from-green-900/30 to-emerald-900/10' },
  Morgan: { name: 'Morgan Region', gradient: 'from-purple-900/30 to-pink-900/10' },
  'St. Lamia': { name: 'St. Lamia Region', gradient: 'from-red-900/30 to-rose-900/10' },
};

export default function WorldMap({ completedStages, onSelectStage }: WorldMapProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900 to-zinc-950" />
      
      {/* Region backgrounds */}
      <div className={`absolute inset-0 bg-gradient-to-br ${REGIONS.Mistral.gradient}`} />
      
      {/* Decorative terrain lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <path d="M0,80 Q50,60 100,80 T200,70" stroke="currentColor" strokeWidth="2" fill="none" className="text-zinc-600" />
        <path d="M0,60 Q30,40 60,50 T120,45" stroke="currentColor" strokeWidth="1" fill="none" className="text-zinc-700" />
      </svg>

      {/* Connection paths */}
      {MAP_PATHS.map((path, i) => {
        const fromNode = MAP_NODES.find(n => n.id === path.from)!;
        const toNode = MAP_NODES.find(n => n.id === path.to)!;
        const isActive = fromNode.isUnlocked || (completedStages.includes(fromNode.id));
        
        return (
          <svg key={`path-${i}`} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`path-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isActive ? '#4ade80' : '#52525b'} stopOpacity="0.5" />
                <stop offset="100%" stopColor={isActive ? '#4ade80' : '#52525b'} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d={`M${fromNode.x} ${fromNode.y} Q${(fromNode.x + toNode.x) / 2} ${(fromNode.y + toNode.y) / 2 - 10} ${toNode.x} ${toNode.y}`}
              stroke={`url(#path-${i})`}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={fromNode.isUnlocked ? '0' : '8,4'}
            />
          </svg>
        );
      })}

      {/* Map Nodes */}
      {MAP_NODES.map((node, idx) => {
        const isUnlocked = node.isUnlocked || completedStages.includes(node.id - 1) || idx === 0;
        const isCompleted = completedStages.includes(node.id);
        const isSelectable = isUnlocked && !isCompleted;
        
        return (
          <motion.div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isSelectable ? 'cursor-pointer group' : 'cursor-default'}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.15, type: 'spring', bounce: 0.4 }}
            whileHover={isSelectable ? { scale: 1.1 } : undefined}
            whileTap={isSelectable ? { scale: 0.95 } : undefined}
            onClick={() => isSelectable && onSelectStage(node.id)}
          >
            {/* Node glow */}
            {isSelectable && (
              <div className={`absolute inset-0 rounded-full ${node.color} opacity-30 blur-xl group-hover:opacity-50 transition-opacity`} />
            )}
            
            {/* Node circle */}
            <div 
              className={`
                relative w-16 h-16 rounded-full flex flex-col items-center justify-center border-4
                ${isCompleted 
                  ? 'border-emerald-500 bg-emerald-900/50' 
                  : isSelectable 
                    ? `border-4 ${node.color.replace('from-', 'border-').split(' ')[0].replace('to-', 'border-')} bg-zinc-800 group-hover:brightness-110`
                    : 'border-zinc-700 bg-zinc-900/80 opacity-50'
                }
                shadow-lg transition-all
              `}
            >
              {/* Inner icon */}
              <div className="text-xl">{isCompleted ? '✓' : isSelectable ? '⚔️' : '🔒'}</div>
              
              {/* Locked overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <span className="text-zinc-500 text-xs">🔒</span>
                </div>
              )}
            </div>
            
            {/* Node label */}
            <div className={`
              absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center
              ${isSelectable ? 'text-white text-xs font-bold' : 'text-zinc-500 text-xs'}
            `}>
              <div className="font-bold">{node.area}</div>
              <div className={`text-[10px] font-mono ${isSelectable ? 'text-emerald-400' : 'text-zinc-500'}`}>
                ⚡ {node.energy}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Compass indicator */}
      <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-zinc-900/80 border-2 border-zinc-700 flex items-center justify-center">
        <div className="text-xs font-bold text-zinc-400">N</div>
      </div>
    </div>
  );
}