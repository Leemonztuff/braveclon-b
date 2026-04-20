'use client';
import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE } from '@/lib/gameData';
import { CONSUMABLE_ITEMS, SHOP_UNITS, SHOP_EQUIPMENT, SHOP_CONSUMABLES, SHOP_MATERIALS, getDailyDeals, QR_SHOP_LISTINGS } from '@/lib/economyData';
import { Header, Tabs, CurrencyDisplay, Card, EmptyState } from './ui/DesignSystem';
import { MaterialType } from '@/lib/economyTypes';
import { RARITY } from './ui/DesignSystem';
import { motion, AnimatePresence } from 'motion/react';

type ShopTab = 'units' | 'equipment' | 'items' | 'materials' | 'daily' | 'qr';

const TABS = [
  { id: 'units', label: 'Units', icon: '⚔️' },
  { id: 'equipment', label: 'Gear', icon: '🛡️' },
  { id: 'items', label: 'Items', icon: '📦' },
  { id: 'materials', label: 'Materials', icon: '🧱' },
  { id: 'daily', label: 'Daily', icon: '⏰' },
  { id: 'qr', label: 'QR', icon: '📱' },
];

const dailyDeals = getDailyDeals();

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
    
    onAlert(result.message);
    setPurchasing(null);
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Shop" 
        icon="🏪"
        onBack={onBack}
        rightContent={<CurrencyDisplay gems={state.gems} zel={state.zel} />}
      />

      <div className="px-4 py-3">
        <Tabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(id) => setActiveTab(id as ShopTab)} 
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'units' && (
            <motion.div
              key="units"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {SHOP_UNITS.map(listing => {
                const unit = UNIT_DATABASE[listing.templateId];
                if (!unit) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const meetsLevel = state.playerLevel >= listing.requiredLevel;
                const isPurchasing = purchasing === listing.id;
                const rarityStyle = RARITY[unit.rarity as keyof typeof RARITY];
                
                return (
                  <Card 
                    key={listing.id}
                    onClick={() => meetsLevel && affordable && !isPurchasing && handlePurchase('unit', listing.id)}
                    className={`
                      ${!meetsLevel ? 'opacity-50' : ''}
                      ${!affordable ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${rarityStyle.bg} ${rarityStyle.border} border overflow-hidden`}>
                        {unit.spriteUrl && (
                          <img src={unit.spriteUrl} alt={unit.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{unit.name}</span>
                          <span className={`text-xs ${rarityStyle.text}`}>{'★'.repeat(unit.rarity)}</span>
                        </div>
                        <div className="text-xs text-zinc-400">{unit.element} Element</div>
                        {!meetsLevel && (
                          <div className="text-xs text-red-400">Requires Lv.{listing.requiredLevel}</div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${affordable ? 'text-amber-400' : 'text-red-400'}`}>
                          💰 {listing.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'equipment' && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {SHOP_EQUIPMENT.map(listing => {
                const equip = EQUIPMENT_DATABASE[listing.templateId];
                if (!equip) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const inStock = listing.stock > 0;
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <Card 
                    key={listing.id}
                    onClick={() => affordable && inStock && !isPurchasing && handlePurchase('equipment', listing.id)}
                    className={`
                      ${!inStock ? 'opacity-50' : ''}
                      ${!affordable ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl">
                        {equip.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white">{equip.name}</div>
                        <div className="text-xs text-zinc-400 capitalize">{equip.type}</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-1">
                          {Object.entries(equip.statsBonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' ')}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${affordable ? 'text-amber-400' : 'text-red-400'}`}>
                          💰 {listing.price.toLocaleString()}
                        </div>
                        {!inStock && <div className="text-xs text-red-400">Sold out</div>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'items' && (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {SHOP_CONSUMABLES.map(listing => {
                const item = CONSUMABLE_ITEMS[listing.consumableId];
                if (!item) return null;
                
                const affordable = canAfford(listing.price, listing.currency);
                const inStock = listing.stock > 0;
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <Card 
                    key={listing.id}
                    onClick={() => affordable && inStock && !isPurchasing && handlePurchase('consumable', listing.id)}
                    className={`
                      flex flex-col items-center text-center py-4
                      ${!inStock ? 'opacity-50' : ''}
                      ${!affordable ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="font-bold text-white text-sm">{item.name}</div>
                    <div className={`text-xs font-bold mt-2 ${affordable ? 'text-amber-400' : 'text-red-400'}`}>
                      💎 {listing.price}
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'materials' && (
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {SHOP_MATERIALS.map(listing => {
                const mat = { id: listing.materialType, name: listing.materialType.replace('mat_', '').replace('_', ' '), icon: '📦', color: 'bg-zinc-800' };
                
                const affordable = canAfford(listing.price, listing.currency);
                const owned = state.materials[listing.materialType];
                const isPurchasing = purchasing === listing.id;
                
                return (
                  <Card 
                    key={listing.id}
                    onClick={() => affordable && !isPurchasing && handlePurchase('consumable', listing.id)}
                    className={!affordable ? 'opacity-60' : ''}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${mat.color}`}>
                        {mat.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white capitalize">{mat.name}</div>
                        <div className="text-xs text-zinc-400">
                          Owned: <span className="text-amber-400">{owned}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${affordable ? 'text-amber-400' : 'text-red-400'}`}>
                          💰 {listing.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500">+{listing.quantity}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="text-xs text-zinc-400 mb-2">⏰ Daily deals refresh every 24 hours</div>
              {dailyDeals.map(deal => {
                const affordable = state.zel >= deal.originalPrice;
                const isPurchasing = purchasing === deal.id;
                const discount = deal.originalPrice * (1 - deal.discountPercent / 100);
                
                return (
                  <Card 
                    key={deal.id}
                    onClick={() => affordable && deal.stock > 0 && !isPurchasing && handlePurchase('consumable', deal.id)}
                    className={`${!affordable ? 'opacity-60' : ''} ${deal.stock === 0 ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-amber-500/20 border border-amber-500/30">
                        🔥
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white capitalize">Daily Deal: {deal.itemId}</div>
                        <div className="text-xs text-zinc-400">
                          {deal.stock} / {deal.maxStock} left
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-zinc-500 line-through">💰 {deal.originalPrice}</div>
                        <div className="font-bold text-amber-400">💰 {Math.floor(discount)}</div>
                        <div className="text-xs text-green-400">-{deal.discountPercent}%</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="text-xs text-zinc-400 mb-2">📱 QR Scanner Exclusive Shop</div>
              {QR_SHOP_LISTINGS.map(listing => {
                const affordable = state.materials[listing.materialType as MaterialType] >= listing.price;
                
                return (
                  <Card 
                    key={listing.id}
                    onClick={() => affordable && listing.stock > 0 && handlePurchase('consumable', listing.id)}
                    className={`${!affordable ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-green-500/20 border border-green-500/30">
                        💚
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-white capitalize">{listing.materialType}</div>
                        <div className="text-xs text-zinc-400">
                          {listing.stock} / {listing.maxStock} left
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-green-400">✨ {listing.price}</div>
                        <div className="text-xs text-zinc-500">+{listing.quantity}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
