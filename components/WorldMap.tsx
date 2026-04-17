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

// Layout coordinates for 16 stages (zigzagging upwards)
const LAYOUT = [
  { x: 15, y: 85 }, { x: 35, y: 80 }, // Prontera
  { x: 55, y: 75 }, // Geffen
  { x: 75, y: 65 }, // Payon
  { x: 80, y: 50 }, { x: 60, y: 45 }, // Glast Heim
  { x: 40, y: 50 }, { x: 25, y: 40 }, { x: 15, y: 25 }, { x: 30, y: 15 }, // Tower
  { x: 50, y: 20 }, { x: 70, y: 25 }, { x: 85, y: 15 }, { x: 80, y: 5 }, { x: 60, y: 8 }, { x: 40, y: 5 } // Niflheim
];

const COLORS: Record<string, string> = {
  'Prontera': 'from-green-500 to-emerald-600',
  'Geffen': 'from-purple-500 to-fuchsia-600',
  'Payon': 'from-lime-500 to-green-600',
  'Glast Heim': 'from-slate-500 to-purple-800',
  'Tower': 'from-amber-500 to-yellow-600',
  'Niflheim': 'from-red-700 to-rose-900',
};

const MAP_NODES: MapNode[] = STAGES.filter(s => s.id <= 16).map((stage, idx) => ({
  id: stage.id,
  name: stage.name,
  area: stage.area,
  x: LAYOUT[idx]?.x || 50,
  y: LAYOUT[idx]?.y || 50,
  region: stage.name,
  color: COLORS[stage.name] || 'from-zinc-500 to-zinc-700',
  isUnlocked: idx === 0,
  isCompleted: false,
  energy: stage.energy
}));

const MAP_PATHS = Array.from({length: 15}, (_, i) => ({ from: i + 1, to: i + 2 }));

// Generic background styles based on region
const REGIONS = {
  'Prontera': { name: 'Prontera Region', gradient: 'from-green-900/30 to-emerald-900/10' },
  'Geffen': { name: 'Geffen Region', gradient: 'from-purple-900/30 to-fuchsia-900/10' },
  'Payon': { name: 'Payon Region', gradient: 'from-lime-900/30 to-green-900/10' },
  'Glast Heim': { name: 'Glast Heim Region', gradient: 'from-slate-900/30 to-purple-900/10' },
  'Tower': { name: 'Tower Region', gradient: 'from-amber-900/30 to-yellow-900/10' },
  'Niflheim': { name: 'Niflheim Region', gradient: 'from-red-900/30 to-rose-900/10' },
};

export default function WorldMap({ completedStages, onSelectStage }: WorldMapProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900 to-zinc-950" />
      
      {/* Region backgrounds */}
      <div className={`absolute inset-0 bg-gradient-to-br ${REGIONS['Prontera'].gradient}`} />
      
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