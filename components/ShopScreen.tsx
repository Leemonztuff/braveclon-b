'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UI } from '@/lib/design-tokens';

type ShopTab = 'units' | 'equipment' | 'items';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'zel' | 'gems';
  type: 'unit' | 'equipment' | 'item';
  rarity?: number;
}

const SHOP_ITEMS: Record<ShopTab, ShopItem[]> = {
  units: [
    { id: 'u7', name: 'Lava Golem', description: 'Fire elemental unit', price: 50000, currency: 'zel', type: 'unit', rarity: 3 },
    { id: 'u8', name: 'Frost Wolf', description: 'Water elemental unit', price: 50000, currency: 'zel', type: 'unit', rarity: 3 },
    { id: 'u9', name: 'Stone Giant', description: 'Earth elemental unit', price: 50000, currency: 'zel', type: 'unit', rarity: 3 },
    { id: 'u10', name: 'Storm Spirit', description: 'Thunder elemental unit', price: 75000, currency: 'zel', type: 'unit', rarity: 4 },
    { id: 'u11', name: 'Radiant Angel', description: 'Light elemental unit', price: 100000, currency: 'zel', type: 'unit', rarity: 4 },
    { id: 'u12', name: 'Shadow Demon', description: 'Dark elemental unit', price: 100000, currency: 'zel', type: 'unit', rarity: 4 },
  ],
  equipment: [
    { id: 'shop_eq1', name: 'Power Elixir', description: 'Restore 50 energy', price: 100, currency: 'gems', type: 'item' },
    { id: 'shop_eq2', name: 'EXP Boost', description: 'Double EXP for next battle', price: 50, currency: 'gems', type: 'item' },
    { id: 'shop_eq3', name: 'Burst Fountain', description: 'Fill BB gauge', price: 30, currency: 'gems', type: 'item' },
    { id: 'shop_eq4', name: 'Revive Stone', description: 'Revive fallen unit', price: 20, currency: 'gems', type: 'item' },
    { id: 'shop_eq5', name: 'Gem Pack Small', description: '50 gems', price: 99, currency: 'zel', type: 'item' },
    { id: 'shop_eq6', name: 'Gem Pack Large', description: '500 gems', price: 999, currency: 'zel', type: 'item' },
  ],
  items: [
    { id: 'item_energy3', name: 'Energy Refill', description: '+3 Energy', price: 50, currency: 'gems', type: 'item' },
    { id: 'item_energy10', name: 'Energy Pack', description: '+10 Energy', price: 150, currency: 'gems', type: 'item' },
    { id: 'item_summon', name: 'Summon Ticket', description: 'Free summon once', price: 200, currency: 'zel', type: 'item' },
  ],
};

interface ShopScreenProps {
  state: {
    zel: number;
    gems: number;
  };
  onBack: () => void;
  onPurchase: (price: number, currency: 'zel' | 'gems') => boolean;
}

export default function ShopScreen({ state, onBack, onPurchase }: ShopScreenProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('units');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  const handleBuy = (item: ShopItem) => {
    const success = onPurchase(item.price, item.currency);
    if (success) {
      setPurchasedItems(prev => [...prev, item.id]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-400 hover:text-white">←</button>
          <h2 className="text-xl font-black italic text-yellow-400 uppercase tracking-wider">
            🏪 Shop
          </h2>
        </div>
        
        {/* Currency Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-zinc-800 px-3 py-1 rounded-lg">
            <span className="text-yellow-400">💰</span>
            <span className="font-bold text-white">{state.zel.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-800 px-3 py-1 rounded-lg">
            <span className="text-blue-400">💎</span>
            <span className="font-bold text-white">{state.gems}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-800 p-1">
        {(['units', 'equipment', 'items'] as ShopTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${
              activeTab === tab 
                ? 'bg-zinc-700 text-yellow-400' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab === 'units' && '⚔️ Units'}
            {tab === 'equipment' && '⚔️ Gear'}
            {tab === 'items' && '📦 Items'}
          </button>
        ))}
      </div>

      {/* Shop Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-3"
          >
            {SHOP_ITEMS[activeTab].map((item) => {
              const canAfford = item.currency === 'zel' ? state.zel >= item.price : state.gems >= item.price;
              const wasPurchased = purchasedItems.includes(item.id);
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => canAfford && handleBuy(item)}
                  disabled={!canAfford || wasPurchased}
                  className={`
                    relative p-3 rounded-xl border-2 text-left transition-all
                    ${wasPurchased 
                      ? 'border-emerald-500/50 bg-emerald-900/20 opacity-50' 
                      : canAfford 
                        ? 'border-zinc-600 bg-zinc-800 hover:border-yellow-500' 
                        : 'border-zinc-700 bg-zinc-900 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {wasPurchased && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      ✓
                    </div>
                  )}
                  
                  {/* Item Icon */}
                  <div className={`
                    w-12 h-12 rounded-lg mb-2 flex items-center justify-center text-2xl
                    ${item.rarity === 4 ? 'bg-purple-900/50 border border-purple-500' : 
                      item.rarity === 3 ? 'bg-blue-900/50 border border-blue-500' :
                      'bg-zinc-700 border border-zinc-600'}
                  `}>
                    {item.type === 'unit' ? '⚔️' : 
                     item.type === 'equipment' ? '🛡️' : '📦'}
                  </div>
                  
                  <div className="font-bold text-sm text-white truncate">{item.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{item.description}</div>
                  
                  {/* Price */}
                  <div className={`
                    mt-2 text-sm font-bold
                    ${canAfford ? 'text-yellow-400' : 'text-red-400'}
                  `}>
                    {item.currency === 'zel' ? '💰' : '💎'} {item.price.toLocaleString()}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <p className="text-xs text-zinc-500 text-center">
          💎 Todas las compras funcionan offline • ☁️ Cloud save requiere cuenta
        </p>
      </div>
    </div>
  );
}