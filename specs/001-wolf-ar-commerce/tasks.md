# Implementation Tasks - Wolf AR Commerce System

## Task Dependencies

```
TASK 1: Add new material types to economyTypes.ts
  └─> TASK 7: Add Wolf materials to gameData.ts (parallel)
  └─> TASK 8: Add QR material types to gameData.ts (parallel)

TASK 2: Add Wolf enemy definitions to gameData.ts
  └─> TASK 7: Add Wolf materials to gameData.ts

TASK 3: Implement QR code validation and scanning logic in gameState.ts
  └─> TASK 9: Create QRScanner component

TASK 4: Modernize ShopScreen with new tabs and features
  └─> TASK 10: Add QR Shop tab

TASK 5: Extend CraftScreen with Tier 4 recipes
  └─> TASK 11: Add Tier 4 craftable items

TASK 6: Integrate Wolf enemies into battle spawn system
```

## Task清单

### TASK 1: Add New Material Types to economyTypes.ts
- **File**: `lib/economyTypes.ts`
- **Priority**: P1
- **Status**: Pending
- **Details**:
  - Add `QRMaterialType` enum: `wolfFang`, `wolfPelt`, `moonstone`, `ancientRelic`
  - Extend `MaterialType` union with new types
  - Add `QRCodeRecord` interface for scanned codes
  - Add `ShopListing` types for dynamic pricing
- **Estimated Lines**: 30

### TASK 2: Add Wolf Enemy Definitions
- **File**: `lib/gameData.ts`
- **Priority**: P1
- **Status**: Pending
- **Details**:
  - Add `WOLF_PACK` enemy family (5 variants)
  - Add `ALPHA_WOLF` boss type
  - Add `BLOOD_MOON_WOLF` rare variant
  - Set appropriate stats, drops, and skills
- **Estimated Lines**: 80

### TASK 3: QR Code Scanner System
- **File**: `lib/gameState.ts`
- **Priority**: P1
- **Status**: Pending
- **Details**:
  - Add `scanQRCode(code: string)` function
  - Add validation: BF-{TYPE}-{CODE} pattern
  - Add daily limits tracking
  - Add scan history persistence
  - Add Material rewards logic
- **Estimated Lines**: 60

### TASK 4: Modernized Shop System
- **File**: `lib/economyData.ts` + `components/ShopScreen.tsx`
- **Priority**: P2
- **Status**: Pending
- **Details**:
  - Add `DAILY_DEALS` array with rotating items
  - Add `QR_SHOP_LISTINGS` for exclusive items
  - Add `dailyDealRefresh` timestamp
  - Update ShopScreen UI with new tabs
- **Estimated Lines**: 50

### TASK 5: Advanced Crafting Recipes
- **File**: `lib/economyData.ts`
- **Priority**: P2
- **Status**: Pending
- **Details**:
  - Add Tier 4 recipes using Wolf/QR materials
  - Add lucky craft bonus logic (10%)
  - Add `craftItem` enhancement in gameState.ts
- **Estimated Lines**: 60

### TASK 6: Wolf Battle Integration
- **File**: `lib/battleData.ts` (or spawn logic in hooks)
- **Priority**: P2
- **Status**: Pending
- **Details**:
  - Add wolf spawn patterns by stage
  - Add pack coordination logic
  - Add Alpha buff implementation
  - Add Blood Moon rare spawn
- **Estimated Lines**: 40

### TASK 7: Wolf Material Drops
- **File**: `lib/gameData.ts`
- **Priority**: P2
- **Status**: Pending
- **Details**:
  - Add material drop tables for each wolf type
  - Configure rarity percentages
  - Add to battle rewards calculation
- **Estimated Lines**: 30

### TASK 8: QR Material Rewards Table
- **File**: `lib/gameData.ts`
- **Priority**: P2
- **Status**: Pending
- **Details**:
  - Map QR codes to material rewards
  - Configure daily vs lifetime limits
  - Add event QR types
- **Estimated Lines**: 20

### TASK 9: QR Scanner Component
- **File**: `components/QRScanner.tsx` (NEW)
- **Priority**: P1
- **Status**: Pending
- **Details**:
  - Create camera-based QR scanner using html5-qrcode library
  - Add permission handling
  - Add scan result feedback UI
  - Add scan history view
- **Estimated Lines**: 150

### TASK 10: QR Shop Tab in ShopScreen
- **File**: `components/ShopScreen.tsx`
- **Priority**: P2
- **Status**: Pending
- **Details**:
  - Add "QR Rewards" tab showing scanned materials
  - Add "QR Shop" for exclusive purchases
  - Add visual feedback for QR-exclusive items
- **Estimated Lines**: 40

### TASK 11: Tier 4 Equipment Items
- **File**: `lib/gameData.ts` (equipment definitions)
- **Priority**: P3
- **Status**: Pending
- **Details**:
  - Add `eq_wolf_fang_edge` - Wolf Fang Edge
  - Add `eq_lunar_shroud` - Lunar Shroud
  - Add `eq_ancient_crown` - Ancient Crown
  - Set appropriate stats
- **Estimated Lines**: 40

---

## Implementation Order

1. TASK 1 → TASK 2 → TASK 6 (Core data)
2. TASK 3 → TASK 9 (QR System E2E)
3. TASK 4 → TASK 10 (Shop Enhancement)
4. TASK 5 → TASK 11 (Crafting Enhancement)
5. TASK 7 → TASK 8 (Material Integration)

## Notes

- QR Scanner requires `html5-qrcode` npm package
- Test QR codes for development: `BF-MAT-TEST1`, `BF-RARE-TEST1`
- Wolf sprites: Use existing assets or placeholder
- All new features work offline first, sync when online