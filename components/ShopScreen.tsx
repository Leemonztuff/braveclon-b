'use client';
import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE } from '@/lib/gameData';
import { CONSUMABLE_ITEMS, SHOP_UNITS, SHOP_EQUIPMENT, SHOP_CONSUMABLES, SHOP_MATERIALS } from '@/lib/economyData';
import { MaterialType, MATERIAL_CONFIG } from '@/lib/economyTypes';
import { motion, AnimatePresence } from 'motion/react';

type ShopTab = 'units' | 'equipment' | 'items' | 'materials';

interface ShopScreenProps {
  state: PlayerState;
  onBack: () => void;
  onPurchaseUnit: (listingId: string) => { success: boolean; message: string };
  onPurchaseEquipment: (listingId: string) => { success: boolean; message: string };
  onPurchaseConsumable: (listingId: string) => { success: boolean; message: string };
  onAlert: (msg: string) => void;
}

export default function ShopScreen({ state, onBack, onPurchaseUnit, onPurchaseEquipment, onPurchaseConsumable, onAlert }: ShopScreenProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('units');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const tabs: { key: ShopTab; label: string; icon: string }[] = [
    { key: 'units', label: 'Units', icon: '⚔️' },
    { key: 'equipment', label: 'Gear', icon: '🛡️' },
    { key: 'items', label: 'Items', icon: '📦' },
    { key: 'materials', label: 'Materials', icon: '🧱' },
  ];

  const canAfford = (price: number, currency: string) => {
    const currencyKey = currency as keyof PlayerState;
    return (state[currencyKey] as number) >= price;
  };

  const handlePurchase = async (
    type: 'unit' | 'equipment' | 'consumable',
    listingId: string
  ) => {
    setPurchasing(listingId);
    
    let result;
    switch (type) {
      case 'unit':
        result = onPurchaseUnit(listingId);
        break;
      case 'equipment':
        result = onPurchaseEquipment(listingId);
        break;
      case 'consumable':
        result = onPurchaseConsumable(listingId);
        break;
    }
    
    if (result.success) {
      onAlert(result.message);
    } else {
      onAlert(result.message);
    }
    
    setPurchasing(null);
  };

  const getRarityColor = (rarity: number) => {
    if (rarity >= 5) return { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400' };
    if (rarity >= 4) return { bg: 'bg-blue-900/50', border: 'border-blue-500', text: 'text-blue-400' };
    return { bg: 'bg-zinc-700', border: 'border-zinc-600', text: 'text-zinc-400' };
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
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${
              activeTab === tab.key 
                ? 'bg-zinc-700 text-yellow-400' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Shop Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'units' && (
            <motion.div
              key="units"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="text-sm text-zinc-500 mb-4">
                Purchase units with Zel. Units are added to your inventory.
              </div>
              
              {SHOP_UNITS.map(listing => {
                const unit = UNIT_DATABASE[listing.templateId];
                if (!unit) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const meetsLevel = state.playerLevel >= listing.requiredLevel;
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <motion.button
                    key={listing.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => meetsLevel && affordable && !isPurchasing && handlePurchase('unit', listing.id)}
                    disabled={!meetsLevel || !affordable || isPurchasing}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      !meetsLevel
                        ? 'bg-zinc-900 border-zinc-800 opacity-50'
                        : affordable
                          ? 'bg-zinc-800 border-zinc-600 hover:border-yellow-500'
                          : 'bg-zinc-800/50 border-zinc-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Unit Sprite */}
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${getRarityColor(unit.rarity).bg} ${getRarityColor(unit.rarity).border} border`}>
                        {unit.spriteUrl ? (
                          <img src={unit.spriteUrl} alt={unit.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          '⚔️'
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{unit.name}</span>
                          <span className={getRarityColor(unit.rarity).text}>
                            {'★'.repeat(unit.rarity)}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-400">{unit.element} Element</div>
                        
                        {!meetsLevel && (
                          <div className="text-xs text-red-400 mt-1">
                            Requires Level {listing.requiredLevel}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                          💰 {listing.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500">Zel</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'equipment' && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="text-sm text-zinc-500 mb-4">
                Purchase equipment with Zel. Gear is added to your equipment inventory.
              </div>
              
              {SHOP_EQUIPMENT.map(listing => {
                const equip = EQUIPMENT_DATABASE[listing.templateId];
                if (!equip) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const inStock = listing.stock > 0;
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <motion.button
                    key={listing.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => affordable && inStock && !isPurchasing && handlePurchase('equipment', listing.id)}
                    disabled={!affordable || !inStock || isPurchasing}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      !inStock
                        ? 'bg-zinc-900 border-zinc-800 opacity-50'
                        : affordable
                          ? 'bg-zinc-800 border-zinc-600 hover:border-yellow-500'
                          : 'bg-zinc-800/50 border-zinc-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-zinc-700 flex items-center justify-center text-3xl">
                        {equip.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white">{equip.name}</div>
                        <div className="text-xs text-zinc-400 capitalize">{equip.type}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                          +{equip.statsBonus.atk || 0} ATK, +{equip.statsBonus.def || 0} DEF
                        </div>
                        {!inStock && (
                          <div className="text-xs text-red-400 mt-1">Out of Stock</div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                          💰 {listing.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500">Zel</div>
                        <div className="text-xs text-zinc-600 mt-1">{listing.stock} left</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'items' && (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-3"
            >
              {SHOP_CONSUMABLES.map(listing => {
                const item = CONSUMABLE_ITEMS[listing.consumableId];
                if (!item) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const inStock = listing.stock > 0;
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <motion.button
                    key={listing.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => affordable && inStock && !isPurchasing && handlePurchase('consumable', listing.id)}
                    disabled={!affordable || !inStock || isPurchasing}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      !inStock
                        ? 'bg-zinc-900 border-zinc-800 opacity-50'
                        : affordable
                          ? 'bg-zinc-800 border-zinc-600 hover:border-yellow-500'
                          : 'bg-zinc-800/50 border-zinc-700 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="font-bold text-white text-sm">{item.name}</div>
                    <div className="text-xs text-zinc-400 mb-2">{item.description}</div>
                    <div className={`font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                      💎 {listing.price}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'materials' && (
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="text-sm text-zinc-500 mb-4">
                Purchase crafting materials with Zel. Materials are used for crafting equipment.
              </div>
              
              {SHOP_MATERIALS.map(listing => {
                const mat = MATERIAL_CONFIG[listing.materialType];
                if (!mat) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const owned = state.materials[listing.materialType];
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <motion.button
                    key={listing.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => affordable && !isPurchasing && handlePurchase('consumable', listing.id)}
                    disabled={!affordable || isPurchasing}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      affordable
                        ? 'bg-zinc-800 border-zinc-600 hover:border-yellow-500'
                        : 'bg-zinc-800/50 border-zinc-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${mat.color}`}>
                        {mat.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white">{mat.name}</div>
                        <div className="text-xs text-zinc-400">
                          You own: <span className="text-yellow-400">{owned}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                          💰 {listing.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500">+{listing.quantity}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <p className="text-xs text-zinc-500 text-center">
          💎 Offline ready • ☁️ Cloud save requires account
        </p>
      </div>
    </div>
  );
}
