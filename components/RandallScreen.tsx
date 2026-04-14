'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';

interface RandallScreenProps {
  state: PlayerState;
  onBack: () => void;
  onPurchase: (price: number, currency: 'zel' | 'gems') => boolean;
}

type RandallTab = 'shop' | 'items' | 'craft' | 'merit';

const SHOP_ITEMS = [
  { id: 'energy_pack', name: 'Energy Pack', price: 100, currency: 'gems' as const, desc: '+5 Energy' },
  { id: 'gem_pack_small', name: 'Gem Pack (10)', price: 100, currency: 'gems' as const, desc: '10 Gems' },
  { id: 'zel_pack_small', name: 'Zel Pack', price: 50, currency: 'gems' as const, desc: '1000 Zel' },
  { id: 'burst_cookie', name: 'Burst Cookie', price: 500, currency: 'zel' as const, desc: '+1 BB Level' },
  { id: 'evolution_orb', name: 'Evo Orb', price: 1000, currency: 'zel' as const, desc: 'Evolution material' },
  { id: 'metal_king', name: 'Metal God', price: 5000, currency: 'zel' as const, desc: 'MAX EXP fodder' },
];

export default function RandallScreen({ state, onBack, onPurchase }: RandallScreenProps) {
  const [activeTab, setActiveTab] = useState<RandallTab>('shop');

  const tabs: { id: RandallTab; label: string; icon: string }[] = [
    { id: 'shop', label: 'SHOP', icon: '🏪' },
    { id: 'items', label: 'ITEMS', icon: '🎒' },
    { id: 'craft', label: 'CRAFT', icon: '🔨' },
    { id: 'merit', label: 'MERIT', icon: '⭐' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700/50">
        <button onClick={onBack} className="text-amber-400 font-bold text-sm">
          ← BACK
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-400">RANDALL</div>
          <div className="text-[10px] text-zinc-400 uppercase">Imperial City</div>
        </div>
        <div className="w-16" />
      </div>

      {/* Resource Bar */}
      <div className="flex justify-center gap-4 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
          <span className="text-green-400 text-sm">💰</span>
          <span className="text-xs font-bold text-green-300">{state.zel.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-xs font-bold text-purple-300">{state.gems}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 px-2 py-2 bg-zinc-900 border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/20 border border-amber-500/50'
                : 'hover:bg-zinc-800'
            }`}
          >
            <div className={`text-lg ${activeTab === tab.id ? 'text-amber-400' : 'text-zinc-400'}`}>
              {tab.icon}
            </div>
            <div className={`text-[8px] font-medium ${activeTab === tab.id ? 'text-amber-400' : 'text-zinc-500'}`}>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'shop' && (
          <div className="space-y-2">
            {SHOP_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (onPurchase(item.price, item.currency)) {
                    alert(`Purchased ${item.name}!`);
                  } else {
                    alert('Not enough resources!');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center text-2xl">
                    {item.currency === 'gems' ? '💎' : '💰'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-zinc-400">{item.desc}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  item.currency === 'gems' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {item.price} {item.currency === 'gems' ? '💎' : '💰'}
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="text-center py-8 text-zinc-500">
            <div className="text-4xl mb-4">🎒</div>
            <p className="text-sm">No items yet</p>
          </div>
        )}

        {activeTab === 'craft' && (
          <div className="text-center py-8 text-zinc-500">
            <div className="text-4xl mb-4">🔨</div>
            <p className="text-sm">Crafting coming soon</p>
          </div>
        )}

        {activeTab === 'merit' && (
          <div className="text-center py-8 text-zinc-500">
            <div className="text-4xl mb-4">⭐</div>
            <p className="text-sm">Merit shop coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}