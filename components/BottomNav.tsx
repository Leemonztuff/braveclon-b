import { Home, Users, Sparkles, Swords } from 'lucide-react';
import { Screen } from '@/hooks/useGameApp';
import { useState } from 'react';

// Minimum touch target for mobile accessibility
const MIN_TOUCH = 44;

export function BottomNav({ currentScreen, setCurrentScreen }: { currentScreen: Screen, setCurrentScreen: (s: Screen) => void }) {
  return (
    <nav className="flex justify-around bg-zinc-950 pb-safe pt-2 border-t border-zinc-800 z-10">
      <NavButton 
        icon={<Home size={24} />} 
        label="Home"
        isActive={currentScreen === 'home'} 
        onClick={() => setCurrentScreen('home')} 
      />
      <NavButton 
        icon={<Users size={24} />} 
        label="Units"
        isActive={currentScreen === 'units'} 
        onClick={() => setCurrentScreen('units')} 
      />
      <NavButton 
        icon={<Swords size={24} />} 
        label="Quest"
        isActive={currentScreen === 'quest'} 
        onClick={() => setCurrentScreen('quest')} 
      />
      <NavButton 
        icon={<Sparkles size={24} />} 
        label="Summon"
        isActive={currentScreen === 'summon'} 
        onClick={() => setCurrentScreen('summon')} 
      />
    </nav>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button 
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      className={`
        flex flex-col items-center justify-center
        min-w-[${MIN_TOUCH}px] min-h-[${MIN_TOUCH}px] px-3 py-2
        transition-all duration-100 touch-manipulation select-none
        ${isPressed ? 'scale-95 brightness-90' : ''}
        ${isActive ? 'text-emerald-400' : 'text-zinc-500 active:text-zinc-300'}
      `}
      aria-label={label}
    >
      <span className={isPressed ? 'scale-95' : 'scale-100 transition-transform'}>
        {icon}
      </span>
      <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}
