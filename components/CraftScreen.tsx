'use client';
import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, EQUIPMENT_DATABASE } from '@/lib/gameData';
import { CRAFT_RECIPES } from '@/lib/economyData';
import { MaterialType, CraftRecipe, MATERIAL_CONFIG } from '@/lib/economyTypes';
import { motion, AnimatePresence } from 'motion/react';

type CraftCategory = 'all' | 'weapon' | 'armor' | 'accessory' | 'enhancement' | 'consumable';

interface CraftScreenProps {
  state: PlayerState;
  onCraft: (recipeId: string) => { success: boolean; message: string };
  onBack: () => void;
  onAlert: (msg: string) => void;
}

export default function CraftScreen({ state, onCraft, onBack, onAlert }: CraftScreenProps) {
  const [activeCategory, setActiveCategory] = useState<CraftCategory>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<CraftRecipe | null>(null);
  const [crafting, setCrafting] = useState(false);

  const categories: { key: CraftCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '📜' },
    { key: 'weapon', label: 'Weapons', icon: '⚔️' },
    { key: 'armor', label: 'Armor', icon: '🛡️' },
    { key: 'accessory', label: 'Accessories', icon: '💍' },
    { key: 'enhancement', label: 'Materials', icon: '🧱' },
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
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-400 hover:text-white text-xl">←</button>
          <h2 className="text-xl font-black italic text-yellow-400 uppercase tracking-wider">
            🔨 Craft
          </h2>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-lg">
          <span className="text-yellow-400">💰</span>
          <span className="font-bold text-white">{state.zel.toLocaleString()}</span>
        </div>
      </div>

      {/* Player Level */}
      <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Your Level: <span className="text-yellow-400 font-bold">{state.playerLevel}</span></span>
          <span className="text-zinc-500">Crafting Level 1+</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-2 bg-zinc-800/50 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
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
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    craftable
                      ? 'bg-zinc-800 border-yellow-500/50 hover:border-yellow-400'
                      : meetsLevel
                        ? 'bg-zinc-800/50 border-zinc-700 opacity-70'
                        : 'bg-zinc-900 border-zinc-800 opacity-50'
                  }`}
                >
                  {/* Output */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg bg-zinc-700 flex items-center justify-center text-2xl border border-zinc-600">
                      {getOutputIcon(recipe)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{getOutputName(recipe)}</div>
                      <div className="text-xs text-zinc-400">{recipe.description}</div>
                    </div>
                    {craftable && (
                      <div className="bg-green-500/20 px-2 py-1 rounded text-xs font-bold text-green-400 border border-green-500/50">
                        ✓ Ready
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
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
                            sufficient ? 'bg-zinc-700' : 'bg-red-900/50'
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

                  {/* Cost */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
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

      {/* Craft Modal */}
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
              className="bg-zinc-800 rounded-2xl p-6 max-w-md w-full border border-zinc-700"
            >
              <h3 className="text-xl font-black text-yellow-400 mb-4 text-center">
                🔨 Craft {selectedRecipe.name}
              </h3>

              {/* Output Preview */}
              <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-zinc-700/50 rounded-xl">
                <div className="w-16 h-16 rounded-lg bg-zinc-600 flex items-center justify-center text-3xl border-2 border-yellow-500/50">
                  {getOutputIcon(selectedRecipe)}
                </div>
                <div>
                  <div className="text-white font-bold">{getOutputName(selectedRecipe)}</div>
                  <div className="text-sm text-zinc-400">{selectedRecipe.description}</div>
                </div>
              </div>

              {/* Materials */}
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
                          sufficient ? 'bg-zinc-700' : 'bg-red-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config?.icon}</span>
                          <span className="text-white">{config?.name}</span>
                        </div>
                        <div className={`font-bold ${sufficient ? 'text-green-400' : 'text-red-400'}`}>
                          {have} / {amt}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Zel Cost */}
              <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg mb-6">
                <span className="text-zinc-400">Zel Cost:</span>
                <span className={`font-bold text-xl ${state.zel >= selectedRecipe.zelCost ? 'text-yellow-400' : 'text-red-400'}`}>
                  💰 {selectedRecipe.zelCost.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-700 text-white font-bold hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCraft(selectedRecipe)}
                  disabled={!canCraft(selectedRecipe) || crafting}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    canCraft(selectedRecipe) && !crafting
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:scale-105'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
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
