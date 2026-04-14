import { Home, Users, Sparkles, Swords } from 'lucide-react';
import { Screen } from '@/hooks/useGameApp';

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
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-14 transition-colors ${
        isActive ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}
