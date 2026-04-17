import { Home, Users, Swords, Sparkles, Package, Hammer, Castle } from 'lucide-react';
import { Screen } from '@/hooks/useGameApp';
import { useState } from 'react';

const NAV_ITEMS: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'units', label: 'Units', icon: Users },
  { id: 'quest', label: 'Quest', icon: Swords },
  { id: 'summon', label: 'Summon', icon: Sparkles },
  { id: 'guild', label: 'Guild', icon: Castle },
  { id: 'craft', label: 'Craft', icon: Hammer },
];

export function BottomNav({ currentScreen, setCurrentScreen }: { currentScreen: Screen, setCurrentScreen: (s: Screen) => void }) {
  return (
    <nav className="flex justify-around bg-zinc-950 pb-safe pt-2 border-t border-zinc-800 z-10">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`
              flex flex-col items-center justify-center
              px-2 py-2 min-w-[52px] min-h-[52px]
              transition-all duration-100 touch-manipulation select-none rounded-lg
              ${isActive 
                ? 'text-amber-400' 
                : 'text-zinc-500 active:text-zinc-300'
              }
            `}
            aria-label={item.label}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
