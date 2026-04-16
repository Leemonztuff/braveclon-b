import { useState, useEffect } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, UnitTemplate } from '@/lib/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { UnitFrame } from './UnitFrame';

type SummonPhase = 'idle' | 'gate' | 'reveal';

interface SummonResult {
  templateId: string;
  rarity: number;
  isNew: boolean;
  duplicate: boolean;
  prismValue: number;
  zelValue: number;
}

const Particles = ({ rarity }: { rarity: number }) => {
  const [particles] = useState(() => {
    const colors = rarity >= 5 ? ['#fbbf24', '#f472b6', '#60a5fa', '#a78bfa', '#ffffff'] : ['#fbbf24', '#fcd34d', '#ffffff'];
    return Array.from({ length: rarity >= 5 ? 80 : 40 }).map(() => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 400 + 100;
      return {
        color,
        size,
        angle,
        distance,
        scale: Math.random() * 2 + 0.5,
        rotate: Math.random() * 360,
        duration: Math.random() * 1.5 + 0.8,
        delay: Math.random() * 0.2
      };
    });
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: 0, y: 0, 
            scale: 0, opacity: 1 
          }}
          animate={{ 
            x: Math.cos(p.angle) * p.distance, 
            y: Math.sin(p.angle) * p.distance, 
            scale: p.scale,
            opacity: 0,
            rotate: p.rotate
          }}
          transition={{ 
            duration: p.duration, 
            ease: "easeOut",
            delay: p.delay
          }}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{ 
            width: p.size, height: p.size, 
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            marginLeft: -p.size/2,
            marginTop: -p.size/2
          }}
        />
      ))}
    </div>
  );
};

export default function SummonScreen({ state, spendGems, addUnit, rollGacha, onAlert, onBack }: {
  state: PlayerState,
  spendGems: (amount: number) => boolean,
  addUnit: (id: string) => void,
  rollGacha: (bannerId: string, count?: number) => SummonResult[],
  onAlert: (msg: string) => void,
  onBack?: () => void
}) {
  const [summonResult, setSummonResult] = useState<UnitTemplate | null>(null);
  const [phase, setPhase] = useState<SummonPhase>('idle');
  const [isShaking, setIsShaking] = useState(false);

const handleSummon = () => {
    if (phase !== 'idle') return;
    
    const summonCost = 5;
    
    if (state.gems >= summonCost) {
      spendGems(summonCost);
      const results = rollGacha('standard', 1);
      const randomId = results[0].templateId;
      const rarity = results[0].rarity;
      const unit = UNIT_DATABASE[randomId];
      setSummonResult(unit);
      
      setPhase('gate');
      
      // Start shaking after the door appears
      setTimeout(() => setIsShaking(true), 800);
      
      // High rarity gets a longer, more dramatic buildup
      const gateDuration = rarity >= 5 ? 4000 : 2500;
      
      setTimeout(() => {
        setIsShaking(false);
        setPhase('reveal');
        addUnit(randomId);
      }, gateDuration);
    } else {
      onAlert(`Not enough gems! You need ${summonCost} 💎 to summon.`);
    }
  };

  const getGateColor = (rarity: number) => {
    if (rarity >= 5) return 'from-purple-500 via-pink-500 to-red-500 shadow-[0_0_100px_rgba(236,72,153,1)]';
    if (rarity === 4) return 'from-red-500 to-red-700 shadow-[0_0_80px_rgba(239,68,68,0.9)]';
    return 'from-yellow-400 to-yellow-600 shadow-[0_0_60px_rgba(250,204,21,0.8)]';
  };

  const getDoorColor = (rarity: number) => {
    if (rarity >= 5) return 'bg-gradient-to-br from-purple-900 to-zinc-900 border-pink-500';
    if (rarity === 4) return 'bg-gradient-to-br from-red-900 to-zinc-900 border-red-500';
    return 'bg-gradient-to-br from-yellow-900 to-zinc-900 border-yellow-500';
  };

  return (
    <div className={`flex flex-col h-full items-center justify-center p-6 relative overflow-hidden ${isShaking ? 'animate-[shake_0.1s_ease-in-out_infinite]' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5px, 5px) rotate(1deg); }
          50% { transform: translate(0, -5px) rotate(-1deg); }
          75% { transform: translate(-5px, 5px) rotate(0deg); }
        }
      `}</style>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-50 text-zinc-400 hover:text-white p-2 bg-zinc-800/80 rounded-full backdrop-blur-sm transition-all hover:bg-zinc-700"
        >
          ←
        </button>
      )}
      
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-800/80 px-3 py-1 rounded-full text-sm font-bold text-pink-400 border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
            💎 {state.gems}
          </div>
          <div className="bg-zinc-900/80 px-2 py-1 rounded-full text-xs font-bold text-zinc-400 border border-zinc-700">
            5 💎
          </div>
        </div>
        {/* Pity Counter */}
        <div className="flex items-center gap-2">
          <div className="bg-yellow-900/30 px-2 py-1 rounded-full text-xs font-bold text-yellow-400 border border-yellow-500/30">
            ★5: {state.summonPity?.star5Pulls || 0}/50
          </div>
          <div className="bg-purple-900/30 px-2 py-1 rounded-full text-xs font-bold text-purple-400 border border-purple-500/30">
            ★4: {state.summonPity?.star4Pulls || 0}/20
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              className="flex flex-col items-center"
            >
              <div className="w-48 h-48 bg-zinc-800/50 rounded-full flex items-center justify-center mb-8 border-4 border-zinc-700/50 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/gate/200/200')] opacity-20 bg-cover" />
                <span className="text-zinc-400 font-black tracking-widest z-10 text-xl drop-shadow-md">RARE SUMMON</span>
              </div>
              <button 
                onClick={handleSummon}
                className="relative overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-transform active:scale-95 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2 text-lg">
                  SUMMON (5 💎)
                </span>
              </button>
            </motion.div>
          )}

          {phase === 'gate' && summonResult && (
            <motion.div
              key="gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 3, filter: 'brightness(10) blur(30px)' }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center absolute inset-0"
            >
              {/* Glowing Aura behind the door */}
              <motion.div 
                animate={{ 
                  scale: isShaking ? [1, 1.5, 1] : [1, 1.2, 1],
                  opacity: isShaking ? [0.8, 1, 0.8] : [0.5, 1, 0.5]
                }}
                transition={{ duration: isShaking ? 0.2 : 1, repeat: Infinity }}
                className={`absolute w-64 h-80 rounded-full bg-gradient-to-t blur-3xl opacity-50 ${getGateColor(summonResult.rarity)}`}
              />
              
              {/* The Summoning Door */}
              <motion.div
                initial={{ y: 50 }}
                animate={{ 
                  y: [50, -10, 0],
                }}
                transition={{ 
                  y: { duration: 0.5, ease: "easeOut" },
                }}
                className={`relative w-48 h-72 border-4 rounded-t-full flex items-center justify-center overflow-hidden z-10 ${getDoorColor(summonResult.rarity)} ${isShaking && summonResult.rarity >= 5 ? 'animate-pulse' : ''}`}
              >
                <div className="absolute inset-0 bg-black/40" />
                <motion.div 
                  animate={{ opacity: isShaking ? [0.5, 1, 0.5] : [0.2, 0.8, 0.2], scale: isShaking ? [1, 2, 1] : 1 }}
                  transition={{ duration: isShaking ? 0.2 : 0.8, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-white blur-xl"
                />
              </motion.div>
            </motion.div>
          )}

          {phase === 'reveal' && summonResult && (
            <motion.div 
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center absolute inset-0 justify-center bg-zinc-950/90 backdrop-blur-md z-40"
            >
              {/* Blinding Flash Transition */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-white z-50 pointer-events-none"
              />
              
              <Particles rarity={summonResult.rarity} />
              
              <motion.h2 
                initial={{ opacity: 0, y: -50, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                className={`text-4xl font-black mb-6 uppercase tracking-widest z-40 ${
                  summonResult.rarity >= 5 
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_0_20px_rgba(236,72,153,1)]" 
                    : summonResult.rarity === 4
                    ? "text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                    : "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                }`}
              >
                {summonResult.rarity >= 5 ? "MEGA RARE!" : summonResult.rarity === 4 ? "SUPER RARE!" : "RARE!"}
              </motion.h2>

              <div className="mb-6 z-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: summonResult.rarity >= 5 ? 4 : 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-64 h-64 bg-[url('https://cdn.jsdelivr.net/gh/Leem0nGames/gameassets@main/RO/magic_circle.png')] bg-contain bg-center bg-no-repeat opacity-20"
                  style={{ filter: summonResult.rarity >= 5 ? 'hue-rotate(90deg) saturate(2)' : 'none' }}
                />
                <UnitFrame
                  spriteUrl={summonResult.spriteUrl}
                  rarity={summonResult.rarity}
                  element={summonResult.element}
                  level={1}
                  size="lg"
                />
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center z-40 bg-zinc-900/90 px-8 py-4 rounded-2xl border border-zinc-700 shadow-2xl backdrop-blur-sm"
              >
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: summonResult.rarity }).map((_, i) => (
                    <motion.span 
                      key={i} 
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 1 + (i * 0.15), type: "spring", bounce: 0.6 }}
                      className="text-yellow-400 text-3xl drop-shadow-[0_0_8px_rgba(250,204,21,1)]"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <div className="text-3xl font-black text-white drop-shadow-md mb-1">{summonResult.name}</div>
                <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{summonResult.element} Element</div>
              </motion.div>

              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={() => {
                  setPhase('idle');
                  setSummonResult(null);
                }}
                className="mt-8 px-10 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-600 transition-colors z-40 shadow-lg hover:shadow-xl"
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
