'use client';
import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE } from '@/lib/gameData';
import { CRAFT_RECIPES } from '@/lib/economyData';
import { MaterialType, CraftRecipe, MATERIAL_CONFIG } from '@/lib/economyTypes';
import { motion, AnimatePresence } from 'motion/react';
import { Header, Card, Tabs, CurrencyDisplay } from './ui/DesignSystem';

type CraftCategory = 'all' | 'weapon' | 'armor' | 'accessory' | 'enhancement' | 'consumable';

interface Props {
  state: PlayerState;
  onCraft: (recipeId: string) => { success: boolean; message: string };
  onBack: () => void;
  onAlert: (msg: string) => void;
}

export default function CraftScreen({ state, onCraft, onBack, onAlert }: Props) {
  const [activeCategory, setActiveCategory] = useState<CraftCategory>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<CraftRecipe | null>(null);
  const [crafting, setCrafting] = useState(false);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '📜' },
    { id: 'weapon', label: 'Weapons', icon: '⚔️' },
    { id: 'armor', label: 'Armor', icon: '🛡️' },
    { id: 'accessory', label: 'Accessories', icon: '💍' },
    { id: 'enhancement', label: 'Materials', icon: '🧱' },
  ];

  const filteredRecipes = activeCategory === 'all' 
    ? CRAFT_RECIPES 
    : CRAFT_RECIPES.filter(r => r.category === activeCategory);

  const canCraft = (recipe: CraftRecipe) => {
    if (state.playerLevel < recipe.requiredLevel) return false;
    if (state.zel < recipe.zelCost) return false;
    
    for (const [material, amount] of Object.entries(recipe.materials)) {
      if (amount > 0 && state.materials[material as MaterialType] < amount) {
        return false;
      }
    }
    return true;
  };

  const handleCraft = async (recipe: CraftRecipe) => {
    if (!canCraft(recipe)) {
      onAlert('Cannot craft: missing requirements');
      return;
    }
    
    setCrafting(true);
    const result = onCraft(recipe.id);
    
    if (result.success) {
      onAlert(result.message);
      setSelectedRecipe(null);
    } else {
      onAlert(result.message);
    }
    
    setCrafting(false);
  };

  const getOutputIcon = (recipe: CraftRecipe) => {
    if (recipe.outputType === 'equipment') {
      const equip = EQUIPMENT_DATABASE[recipe.outputId];
      return equip?.icon || '❓';
    }
    if (recipe.outputType === 'material') {
      const mat = MATERIAL_CONFIG[recipe.outputId as MaterialType];
      return mat?.icon || '❓';
    }
    return '📦';
  };

  const getOutputName = (recipe: CraftRecipe) => {
    if (recipe.outputType === 'equipment') {
      return EQUIPMENT_DATABASE[recipe.outputId]?.name || recipe.name;
    }
    if (recipe.outputType === 'material') {
      return MATERIAL_CONFIG[recipe.outputId as MaterialType]?.name || recipe.name;
    }
    return recipe.name;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <Header 
        title="Craft" 
        icon="🔨"
        onBack={onBack}
        rightContent={<CurrencyDisplay zel={state.zel} />}
      />

      <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Your Level: <span className="text-amber-400 font-bold">{state.playerLevel}</span></span>
          <span className="text-zinc-500">Crafting Level 1+</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <Tabs 
          tabs={categories} 
          activeTab={activeCategory} 
          onTabChange={(id) => setActiveCategory(id as CraftCategory)}
        />
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="wait">
            {filteredRecipes.map((recipe) => {
              const craftable = canCraft(recipe);
              const meetsLevel = state.playerLevel >= recipe.requiredLevel;
              
              return (
                <motion.button
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    craftable
                      ? 'bg-zinc-900 border-amber-500/50 hover:border-amber-400'
                      : meetsLevel
                        ? 'bg-zinc-900/50 border-zinc-700 opacity-70'
                        : 'bg-zinc-900/30 border-zinc-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl">
                      {getOutputIcon(recipe)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{getOutputName(recipe)}</div>
                      <div className="text-xs text-zinc-400">{recipe.description}</div>
                    </div>
                    {craftable && (
                      <div className="bg-emerald-500/20 px-2 py-1 rounded text-xs font-bold text-emerald-400 border border-emerald-500/50">
                        ✓ Ready
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(recipe.materials).map(([mat, amt]) => {
                      if (!amt) return null;
                      const config = MATERIAL_CONFIG[mat as MaterialType];
                      const have = state.materials[mat as MaterialType];
                      const sufficient = have >= amt;
                      return (
                        <div
                          key={mat}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            sufficient ? 'bg-zinc-800' : 'bg-red-900/50'
                          }`}
                        >
                          <span>{config?.icon}</span>
                          <span className={sufficient ? 'text-zinc-300' : 'text-red-400'}>
                            {have}/{amt}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-amber-400">
                      <span>💰</span>
                      <span className={state.zel >= recipe.zelCost ? '' : 'text-red-400'}>
                        {recipe.zelCost.toLocaleString()}
                      </span>
                    </div>
                    <div className={`text-xs ${meetsLevel ? 'text-zinc-500' : 'text-red-400'}`}>
                      Lv.{recipe.requiredLevel}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-700"
            >
              <h3 className="text-lg font-bold text-amber-400 mb-4 text-center">
                🔨 Craft {selectedRecipe.name}
              </h3>

              <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-800 rounded-xl">
                <div className="w-14 h-14 rounded-lg bg-zinc-700 flex items-center justify-center text-2xl border border-amber-500/30">
                  {getOutputIcon(selectedRecipe)}
                </div>
                <div>
                  <div className="text-white font-bold">{getOutputName(selectedRecipe)}</div>
                  <div className="text-sm text-zinc-400">{selectedRecipe.description}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-zinc-400 mb-2">Materials Required:</div>
                <div className="space-y-2">
                  {Object.entries(selectedRecipe.materials).map(([mat, amt]) => {
                    if (!amt) return null;
                    const config = MATERIAL_CONFIG[mat as MaterialType];
                    const have = state.materials[mat as MaterialType];
                    const sufficient = have >= amt;
                    return (
                      <div
                        key={mat}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          sufficient ? 'bg-zinc-800' : 'bg-red-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config?.icon}</span>
                          <span className="text-white">{config?.name}</span>
                        </div>
                        <div className={`font-bold ${sufficient ? 'text-emerald-400' : 'text-red-400'}`}>
                          {have} / {amt}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg mb-6">
                <span className="text-zinc-400">Zel Cost:</span>
                <span className={`font-bold text-lg ${state.zel >= selectedRecipe.zelCost ? 'text-amber-400' : 'text-red-400'}`}>
                  💰 {selectedRecipe.zelCost.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex-1 py-3 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCraft(selectedRecipe)}
                  disabled={!canCraft(selectedRecipe) || crafting}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    canCraft(selectedRecipe) && !crafting
                      ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {crafting ? 'Crafting...' : 'Craft'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
