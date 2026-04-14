import { UnitStatusBox } from '../UnitStatusBox';
import { BattleStateData } from './BattleArena';

export function BattleBottomGrid({ battleState }: { battleState: BattleStateData }) {
  const { playerUnits, turnState, selectedItem, handleUnitClick } = battleState;

  return (
    <div className="grid grid-cols-2 gap-1 p-1">
      {Array.from({ length: 6 }).map((_, idx) => {
        const unit = playerUnits[idx];
        return (
          <UnitStatusBox 
            key={idx} 
            unit={unit} 
            onClick={() => unit && handleUnitClick(unit.id)} 
            interactive={turnState === 'player_input'} 
            isItemSelected={!!selectedItem}
          />
        );
      })}
    </div>
  );
}
