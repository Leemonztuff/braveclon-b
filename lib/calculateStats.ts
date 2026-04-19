import { UnitTemplate, Stats, EQUIPMENT_DATABASE, getActiveSetBonuses } from './gameData';
import { EquipInstance } from './economyTypes';

export function calculateStats(
  template: UnitTemplate, 
  level: number, 
  equipment?: UnitInstance['equipment'], 
  equipInventory?: EquipInstance[]
): Stats {
  const base = {
    hp: template.baseStats.hp + template.growthRate.hp * (level - 1),
    atk: template.baseStats.atk + template.growthRate.atk * (level - 1),
    def: template.baseStats.def + template.growthRate.def * (level - 1),
    rec: template.baseStats.rec + template.growthRate.rec * (level - 1),
  };

  if (equipment && equipInventory) {
    const equipIds = [equipment.weapon, equipment.armor, equipment.accessory].filter(Boolean);
    const equippedItems: { templateId: string }[] = [];
    
    equipIds.forEach(eqInstId => {
      const eqInst = equipInventory.find(e => e.instanceId === eqInstId);
      if (eqInst) {
        const eqTemplate = EQUIPMENT_DATABASE[eqInst.templateId];
        if (eqTemplate && eqTemplate.statsBonus) {
          const enhancementMultiplier = 1 + (eqInst.enhancementLevel * 0.05);
          base.hp += Math.floor((eqTemplate.statsBonus.hp || 0) * enhancementMultiplier);
          base.atk += Math.floor((eqTemplate.statsBonus.atk || 0) * enhancementMultiplier);
          base.def += Math.floor((eqTemplate.statsBonus.def || 0) * enhancementMultiplier);
          base.rec += Math.floor((eqTemplate.statsBonus.rec || 0) * enhancementMultiplier);
        }
        equippedItems.push({ templateId: eqInst.templateId });
      }
    });

    const setBonuses = getActiveSetBonuses(equippedItems);
    for (const bonus of setBonuses) {
      if (bonus.statBonuses) {
        base.hp = Math.floor(base.hp * (1 + (bonus.statBonuses.hp || 0)));
        base.atk = Math.floor(base.atk * (1 + (bonus.statBonuses.atk || 0)));
        base.def = Math.floor(base.def * (1 + (bonus.statBonuses.def || 0)));
        base.rec = Math.floor(base.rec * (1 + (bonus.statBonuses.rec || 0)));
      }
    }
  }
  return base;
}