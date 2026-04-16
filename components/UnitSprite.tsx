import { motion, AnimatePresence } from 'motion/react';
import { BattleUnit } from '@/lib/battleTypes';
import { ElementalParticles } from './ElementalParticles';

export function UnitSprite({ unit, onClick, interactive, hitEffectElement, hideStats, isItemSelected, scale = 1 }: { unit: BattleUnit, onClick?: () => void, interactive?: boolean, hitEffectElement?: string | null, hideStats?: boolean, isItemSelected?: boolean, scale?: number }) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;
  const bbPercent = (unit.bbGauge / unit.maxBb) * 100;
  const isBbReady = unit.bbGauge >= unit.maxBb;

  // Side-scroller: Players on LEFT attack RIGHT (+x), Enemies on RIGHT attack LEFT (-x)
  // Attack: move toward enemy, strike, return to original position (x: 0)
  const attackDirection = unit.isPlayer ? 1 : -1;
  
  const variants: any = {
    idle: { 
      x: 0, 
      y: [0, -4, 0], 
      scale: 1,
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
    },
    attacking: { 
      x: [0, 50 * attackDirection, 50 * attackDirection, 0],
      scale: [1, 1.1, 1.1, 1],
      transition: { duration: 0.4, times: [0, 0.3, 0.7, 1] }
    },
    skill: { 
      x: [0, 30 * attackDirection, 80 * attackDirection, 80 * attackDirection, 0],
      scale: [1, 1.2, 1.5, 1.4, 1], 
      rotate: [0, 0, attackDirection * 10, attackDirection * 5, 0],
      filter: ["brightness(1)", "brightness(1.5)", "brightness(2) drop-shadow(0 0 25px rgba(250,204,21,1))", "brightness(1.5)", "brightness(1)"], 
      transition: { duration: 0.6, times: [0, 0.2, 0.5, 0.8, 1] } 
    },
    hurt: { 
      x: [0, -8, 8, -8, 8, 0], 
      filter: "brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)", 
      transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    },
    bb_hurt: { 
      x: [0, -15, 15, -15, 15, -10, 10, 0], 
      y: [0, -10, 10, -10, 10, 0, 0, 0],
      scale: [1, 1.3, 0.8, 1.1, 0.9, 1.05, 0.95, 1],
      filter: ["brightness(1)", "brightness(2) invert(1) hue-rotate(90deg)", "brightness(0.5)", "brightness(2) invert(1)", "brightness(1) invert(0)"], 
      transition: { duration: 0.5, times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95, 1] }
    },
    dead: { 
      opacity: 0.3, 
      x: 0,
      y: 0,
      filter: "grayscale(100%)", 
      scale: 0.9, 
      transition: { duration: 0.5 } 
    }
  };

  return (
    <motion.div 
      className={`relative flex flex-col items-center ${interactive && isBbReady ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
      variants={variants}
      initial="idle"
      animate={unit.isDead ? "dead" : unit.actionState}
    >
      {/* Status Bars */}
      {!hideStats && (
        <div className="w-16 mb-2 flex flex-col gap-[2px] z-10">
          <div className="h-1.5 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800/50">
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${hpPercent}%` }} />
          </div>
          {unit.isPlayer && (
            <div className="h-1.5 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800/50">
              <div className={`h-full transition-all duration-300 ${isBbReady ? 'bg-yellow-400 animate-pulse' : 'bg-blue-500'}`} style={{ width: `${bbPercent}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Sprite */}
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center ${unit.queuedBb ? 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}`}
        style={{ transform: `scale(${scale})` }}
      >
        <img 
          src={unit.template.spriteUrl} 
          alt={unit.template.name} 
          className={`w-full h-full object-contain drop-shadow-lg ${!unit.isPlayer ? '-scale-x-100' : ''}`}
          style={{ imageRendering: 'pixelated' }} 
        />
        {unit.queuedBb && (
          <div className="absolute -top-4 flex items-center justify-center pointer-events-none animate-bounce">
            <span className="text-yellow-400 font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">BB READY</span>
          </div>
        )}
        {/* BB Hit Overlay Effect */}
        <AnimatePresence>
          {unit.actionState === 'bb_hurt' && (
            <motion.div 
              initial={{ scale: 0, opacity: 1, rotate: -45 }}
              animate={{ scale: 2.5, opacity: 0, rotate: 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="w-full h-2 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
            </motion.div>
          )}
          {hitEffectElement && <ElementalParticles element={hitEffectElement} />}
          {unit.isWeaknessHit && (
            <motion.div
              initial={{ y: 0, opacity: 0, scale: 0.5 }}
              animate={{ y: -30, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <span 
                className="text-red-500 font-black text-xl italic"
                style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000' }}
              >
                WEAK!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Element Indicator */}
      {!hideStats && (
        <div className="absolute -bottom-3 bg-zinc-900/80 border border-zinc-700 text-[9px] font-bold px-1.5 py-0.5 rounded text-zinc-300 backdrop-blur-sm">
          {unit.template.element}
        </div>
      )}
    </motion.div>
  );
}
