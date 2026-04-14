export function BattleTopHud({ zel, gems }: { zel: number, gems: number }) {
  return (
    <div className="relative z-20 h-10 shrink-0 bg-gradient-to-b from-[#4a78a6] to-[#2b4c7e] border-b-2 border-[#b89947] flex items-center px-2 justify-between text-xs font-bold text-white shadow-md">
      <div className="flex gap-4">
        <div className="flex items-center gap-1"><span className="text-yellow-400 text-sm drop-shadow-md">💰</span> <span className="drop-shadow-md">{zel}</span></div>
        <div className="flex items-center gap-1"><span className="text-blue-400 text-sm drop-shadow-md">💎</span> <span className="drop-shadow-md">{gems}</span></div>
      </div>
      <button className="bg-gradient-to-b from-[#2b4c7e] to-[#1a2e4c] border border-[#b89947] px-3 py-1 rounded shadow-inner text-[10px] uppercase tracking-wider drop-shadow-md">MENU</button>
    </div>
  );
}
