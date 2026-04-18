import { Home, Users, Swords, Sparkles, Package, Hammer, Castle, Settings } from 'lucide-react';
import { Screen } from '@/hooks/useGameApp';
import { EFFECTS } from './ui/DesignSystem';

const NAV_ITEMS: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'units', label: 'Units', icon: Users },
  { id: 'quest', label: 'Quest', icon: Swords },
  { id: 'summon', label: 'Summon', icon: Sparkles },
  { id: 'guild', label: 'Guild', icon: Castle },
  { id: 'craft', label: 'Craft', icon: Hammer },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export function BottomNav({ currentScreen, setCurrentScreen }: { currentScreen: Screen, setCurrentScreen: (s: Screen) => void }) {
  return (
    <nav className={`grid grid-cols-7 bg-zinc-950 pb-safe pt-2 border-t border-zinc-800/50 z-10 ${EFFECTS.glass} px-2`}>
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`
              flex flex-col items-center justify-center
              py-2 transition-all duration-300 touch-manipulation select-none rounded-xl relative
              ${isActive 
                ? 'text-amber-400 scale-110' 
                : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
              }
            `}
            aria-label={item.label}
          >
            {isActive && (
              <div className="absolute inset-0 bg-amber-400/5 blur-xl rounded-full" />
            )}
            <div className={`
              relative z-10 p-1.5 rounded-lg transition-all
              ${isActive ? 'bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : ''}
            `}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`
              text-[9px] mt-1 font-black uppercase tracking-widest leading-none z-10
              ${isActive ? 'opacity-100' : 'opacity-60'}
            `}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full animate-pulse-glow" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
