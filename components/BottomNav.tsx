'use client';

import { useState } from 'react';
import { Home, Users, Swords, ShoppingBag, MoreHorizontal, Sparkles, Hammer, Castle, Settings, X } from 'lucide-react';
import { Screen } from '@/hooks/useGameApp';
import { EFFECTS, Card } from './ui/DesignSystem';
import { motion, AnimatePresence } from 'motion/react';

const MAIN_NAV: { id: Screen | 'more'; label: string; icon: typeof Home; highlight?: boolean }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'quest', label: 'Battle', icon: Swords, highlight: true },
  { id: 'units', label: 'Units', icon: Users },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'more', label: 'Más', icon: MoreHorizontal },
];

const MORE_ITEMS: { id: Screen; label: string; icon: typeof Settings }[] = [
  { id: 'summon', label: 'Summon', icon: Sparkles },
  { id: 'guild', label: 'Guild', icon: Castle },
  { id: 'craft', label: 'Craft', icon: Hammer },
  { id: 'settings', label: 'Ajustes', icon: Settings },
  { id: 'arena', label: 'Arena', icon: Swords },
  { id: 'fusion', label: 'Fusion', icon: Sparkles },
  { id: 'evolution', label: 'Evo', icon: Sparkles },
  { id: 'qrhunt', label: 'QR Hunt', icon: MoreHorizontal },
];

function MoreMenu({ onClose, onSelect }: { onClose: () => void; onSelect: (s: Screen) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center pb-safe"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="gothic-paper-gradient gothic-border-gold w-full max-w-md rounded-t-3xl p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-amber-900/30 pb-3">
          <h2 className="text-lg font-bold text-amber-400 gothic-text">Más Opciones</h2>
          <button 
            onClick={onClose}
            className="p-2 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {MORE_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); onClose(); }}
                className="flex flex-col items-center justify-center p-3 rounded-lg gothic-paper border border-amber-900/30 active:bg-amber-900/20 active:scale-95 transition-all native-tap min-h-[70px]"
              >
                <Icon className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[10px] text-amber-500/70 uppercase font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BottomNav({ currentScreen, setCurrentScreen }: { currentScreen: Screen, setCurrentScreen: (s: Screen) => void }) {
  const [showMore, setShowMore] = useState(false);

  const handleNavClick = (id: Screen | 'more') => {
    if (id === 'more') {
      setShowMore(true);
    } else {
      setCurrentScreen(id);
    }
  };

  return (
    <>
      <nav className="flex justify-around gothic-paper-gradient pb-safe pt-2 border-t-2 border-amber-900/50 z-10 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {MAIN_NAV.map(item => {
          const Icon = item.icon;
          const isActive = item.id !== 'more' && currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                flex flex-col items-center justify-center
                flex-1 py-2 transition-all duration-200 touch-manipulation select-none rounded-xl relative
                min-w-[44px] min-h-[44px]
                ${isActive 
                  ? 'text-amber-400' 
                  : 'text-zinc-500 active:text-zinc-300 active:scale-95'
                }
              `}
              aria-label={item.label}
            >
              {isActive && (
                <div className="absolute inset-0 bg-amber-400/5 blur-xl rounded-full" />
              )}
              <div className={`
                relative z-10 p-1.5 rounded-lg transition-all
                ${isActive ? 'bg-amber-400/10' : ''}
              `}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`
                text-[9px] mt-1 font-bold uppercase tracking-wider leading-none z-10
                ${isActive ? 'opacity-100' : 'opacity-50'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {showMore && (
          <MoreMenu 
            onClose={() => setShowMore(false)} 
            onSelect={setCurrentScreen} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
