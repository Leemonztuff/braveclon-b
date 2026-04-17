'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { Header, Card, Tabs, CurrencyDisplay, EmptyState } from './ui/DesignSystem';

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

  const TABS = [
    { id: 'shop', label: 'Shop', icon: '🏪' },
    { id: 'items', label: 'Items', icon: '🎒' },
    { id: 'craft', label: 'Craft', icon: '🔨' },
    { id: 'merit', label: 'Merit', icon: '⭐' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Randall" 
        icon="🎁"
        onBack={onBack}
        rightContent={<CurrencyDisplay gems={state.gems} zel={state.zel} />}
      />
      
      <div className="px-4 py-3">
        <Tabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(id) => setActiveTab(id as RandallTab)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'shop' && (
          <div className="space-y-2">
            {SHOP_ITEMS.map((item) => (
              <Card 
                key={item.id}
                onClick={() => {
                  if (onPurchase(item.price, item.currency)) {
                    alert(`Purchased ${item.name}!`);
                  } else {
                    alert('Not enough resources!');
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl">
                      {item.currency === 'gems' ? '💎' : '💰'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-xs text-zinc-400">{item.desc}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    item.currency === 'gems' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.price} {item.currency === 'gems' ? '💎' : '💰'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'items' && (
          <EmptyState icon="🎒" title="No items" description="Purchase items from the shop" />
        )}

        {activeTab === 'craft' && (
          <EmptyState icon="🔨" title="Coming soon" description="Crafting will be available soon" />
        )}

        {activeTab === 'merit' && (
          <EmptyState icon="⭐" title="Coming soon" description="Merit shop will be available soon" />
        )}
      </div>
    </div>
  );
}
