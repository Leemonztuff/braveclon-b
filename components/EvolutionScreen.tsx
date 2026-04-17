/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { PlayerState } from '@/lib/gameState';
import { UNIT_DATABASE, getEvolutionCost } from '@/lib/gameData';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './ui/DesignSystem';
import { UnitDisplay } from './ui/UnitDisplay';

export default function EvolutionScreen({ 
  state, 
  targetInstanceId, 
  onBack, 
  evolveUnit, 
  onAlert 
}: { 
  state: PlayerState, 
  targetInstanceId: string, 
  onBack: () => void, 
  evolveUnit: (targetId: string, materialIds: string[]) => { success: boolean; message: string; newUnit?: import('@/lib/gameState').UnitInstance },
  onAlert: (msg: string) => void
}) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState<{ success: boolean; message: string; newUnit?: import('@/lib/gameState').UnitInstance } | null>(null);

  const targetUnit = state.inventory.find(u => u.instanceId === targetInstanceId);
  if (!targetUnit) {
    onBack();
    return null;
  }

  const targetTemplate = UNIT_DATABASE[targetUnit.templateId];
  const canEvolve = targetUnit.level >= targetTemplate.maxLevel && targetTemplate.evolutionTarget;
  const evolutionTargetTemplate = targetTemplate.evolutionTarget ? UNIT_DATABASE[targetTemplate.evolutionTarget] : null;
  const requiredMaterials = targetTemplate.evolutionMaterials || [];
  
  const cost = getEvolutionCost(targetTemplate.rarity);

  const handleSelectMaterial = (instanceId: string) => {
    if (selectedMaterials.includes(instanceId)) {
      setSelectedMaterials(prev => prev.filter(id => id !== instanceId));
    } else {
      if (selectedMaterials.length >= requiredMaterials.length) {
        onAlert(`You only need ${requiredMaterials.length} materials.`);
        return;
      }
      setSelectedMaterials(prev => [...prev, instanceId]);
    }
  };

  const handleEvolve = () => {
    if (selectedMaterials.length !== requiredMaterials.length) return;
    if (state.zel < cost) {
      onAlert(`Not enough Zel! You need ${cost} 💰.`);
      return;
    }

    setIsEvolving(true);
    
    // Simulate animation delay
    setTimeout(() => {
      const result = evolveUnit(targetInstanceId, selectedMaterials);
      if (result.success) {
        setEvolutionResult(result);
        setSelectedMaterials([]);
      } else {
        onAlert("Evolution failed. Please check your materials.");
      }
      setIsEvolving(false);
    }, 2000);
  };

  const availableMaterials = state.inventory.filter(u => 
    u.instanceId !== targetInstanceId && 
    !state.team.includes(u.instanceId) &&
    requiredMaterials.includes(u.templateId)
  );

  // Check if selected materials match requirements
  const selectedTemplates = selectedMaterials.map(id => state.inventory.find(u => u.instanceId === id)?.templateId);
  let isReadyToEvolve = selectedMaterials.length === requiredMaterials.length;
  if (isReadyToEvolve) {
    const reqCopy = [...requiredMaterials];
    for (const t of selectedTemplates) {
      const idx = reqCopy.indexOf(t!);
      if (idx !== -1) {
        reqCopy.splice(idx, 1);
      } else {
        isReadyToEvolve = false;
        break;
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 relative">
      <Header title="Evolution" icon="✨" onBack={onBack} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col items-center">
            <UnitDisplay
              spriteUrl={targetTemplate.spriteUrl}
              name={targetTemplate.name}
              rarity={targetTemplate.rarity}
              element={targetTemplate.element}
              size="md"
            />
            <span className="text-xs font-bold mt-2 text-zinc-400">{targetTemplate.name}</span>
          </div>

          <ArrowRight className="text-zinc-600" size={24} />

          <div className="flex flex-col items-center">
            {evolutionTargetTemplate ? (
              <UnitDisplay
                spriteUrl={evolutionTargetTemplate.spriteUrl}
                name={evolutionTargetTemplate.name}
                rarity={evolutionTargetTemplate.rarity}
                element={evolutionTargetTemplate.element}
                size="md"
              />
            ) : (
              <div className="w-20 h-20 bg-zinc-800 rounded-xl border-2 border-zinc-700 opacity-50 flex items-center justify-center">
                <span className="text-zinc-600 font-bold text-2xl">?</span>
              </div>
            )}
            <span className={`text-xs font-bold mt-2 ${canEvolve ? 'text-purple-400' : 'text-zinc-600'}`}>
              {evolutionTargetTemplate ? evolutionTargetTemplate.name : 'Max Evolution'}
            </span>
            {evolutionTargetTemplate && (
              <div className="flex text-yellow-400 text-[10px] mt-1">
                {Array.from({ length: evolutionTargetTemplate.rarity }).map((_, i) => <span key={i}>★</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Material Selection Area */}
        <div className="p-4">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Required Materials</h3>
            <span className="text-xs font-mono text-zinc-400">{selectedMaterials.length} / {requiredMaterials.length}</span>
          </div>

          {!canEvolve ? (
            <div className="text-center p-8 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500 text-sm">Unit cannot be evolved.</p>
              <p className="text-zinc-600 text-xs mt-1">Must be max level and have an evolution path.</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2 mb-6">
              {requiredMaterials.map((reqTemplateId, index) => {
                const reqTemplate = UNIT_DATABASE[reqTemplateId];
                // Find if we have selected a material for this slot
                // Simple logic: just show required templates, and highlight if we have enough selected
                const selectedCount = selectedTemplates.filter(t => t === reqTemplateId).length;
                const requiredCount = requiredMaterials.filter(t => t === reqTemplateId).length;
                const isFulfilled = selectedCount >= requiredCount;

                return (
                  <div key={index} className={`relative aspect-square rounded-lg border-2 overflow-hidden ${isFulfilled ? 'border-emerald-500 opacity-50' : 'border-zinc-700 bg-zinc-900'}`}>
                    <img 
                      src={reqTemplate.spriteUrl} 
                      alt={reqTemplate.name} 
                      className="w-full h-full object-cover scale-[2.5] origin-[50%_20%]" 
                      style={{ imageRendering: 'pixelated' }} 
                    />
                    {isFulfilled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                        <Check className="text-emerald-400 drop-shadow-md" size={24} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {canEvolve && (
            <>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Your Materials</h3>
              {availableMaterials.length === 0 ? (
                <div className="text-center p-8 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                  <p className="text-zinc-500 text-sm">No evolution materials available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {availableMaterials.map(unit => {
                    const template = UNIT_DATABASE[unit.templateId];
                    const isSelected = selectedMaterials.includes(unit.instanceId);
                    
                    return (
                      <button
                        key={unit.instanceId}
                        onClick={() => handleSelectMaterial(unit.instanceId)}
                        className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                          isSelected 
                            ? 'border-purple-500 scale-95 opacity-50' 
                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                        }`}
                      >
                        <img 
                          src={template.spriteUrl} 
                          alt={template.name} 
                          className="w-full h-full object-cover scale-[2.5] origin-[50%_20%]" 
                          style={{ imageRendering: 'pixelated' }} 
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20">
                            <Check className="text-purple-400 drop-shadow-md" size={24} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 z-20">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-zinc-400 uppercase">Evolution Cost</span>
          <span className={`text-sm font-bold font-mono ${state.zel >= cost ? 'text-yellow-400' : 'text-red-400'}`}>
            {canEvolve ? cost.toLocaleString() : 0} 💰
          </span>
        </div>
        <button
          onClick={handleEvolve}
          disabled={!isReadyToEvolve || isEvolving || !canEvolve}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            !isReadyToEvolve || !canEvolve
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-amber-400 text-zinc-900 hover:bg-amber-300 active:scale-95'
          }`}
        >
          {isEvolving ? (
            <span className="animate-pulse">Evolving...</span>
          ) : (
            <>
              <Sparkles size={18} />
              Evolve Unit
            </>
          )}
        </button>
      </div>

      {/* Evolution Animation Overlay */}
      <AnimatePresence>
        {isEvolving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white flex items-center justify-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360, scale: [1, 2, 1] }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 border-8 border-purple-500 rounded-full border-t-transparent border-b-transparent opacity-50"
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 2.5, 1] }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-4 border-8 border-pink-500 rounded-full border-l-transparent border-r-transparent opacity-50"
              />
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center z-10 shadow-[0_0_100px_rgba(236,72,153,1)]">
                <img src={evolutionTargetTemplate?.spriteUrl} alt="Target" className="w-24 h-24 object-contain animate-pulse brightness-200" style={{ imageRendering: 'pixelated' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {evolutionResult && evolutionTargetTemplate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-amber-400 mb-4">Evolution Complete!</h2>
              
              <div className="mb-4">
                <UnitDisplay
                  spriteUrl={evolutionTargetTemplate.spriteUrl}
                  name={evolutionTargetTemplate.name}
                  rarity={evolutionTargetTemplate.rarity}
                  element={evolutionTargetTemplate.element}
                  size="lg"
                />
              </div>

              <div className="flex text-amber-400 text-sm mb-2">
                {Array.from({ length: evolutionTargetTemplate.rarity }).map((_, i) => <span key={i}>★</span>)}
              </div>

              <div className="text-xl font-bold text-white mb-2">{evolutionTargetTemplate.name}</div>
              
              <div className="text-sm font-mono text-amber-400 bg-amber-500/10 px-4 py-2 rounded-lg mb-6">
                New Skill: {evolutionTargetTemplate.skill.name}
              </div>

              <button 
                onClick={() => {
                  setEvolutionResult(null);
                  onBack();
                }}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-900 rounded-lg font-bold"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
