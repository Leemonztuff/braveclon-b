# SPEC.md - Wolf AR Commerce System

## Feature Name
**Wolf AR Commerce System** - Revolutionary hybrid real-world gaming experience

## Short Name
wolf-ar-commerce

## Problem Statement

The current game systems are static and isolated:
1. **Combat**: Enemies provide basic drops with no unique identity
2. **Economy**: Shop is a simple static vendor with fixed prices
3. **Crafting**: Limited recipes using only battle-dropped materials
4. **Engagement**: No connection between player's real world and game progression

## Proposed Solution

### 1. WOLF ENEMY SYSTEM
A new enemy family with unique mechanics:
- **Wolf Pack**: Wolves spawn in groups of 3-5, strategic positioning
- **Alpha Wolf**: Leader unit with buff abilities
- **Blood Moon**: Rare night-time variant with enhanced drops
- **Tameable**: After defeat, chance to recruit as companion (cosmetic/status)

Materials from Wolves:
| Material | Source | Rarity | Use |
|----------|-------|--------|-----|
| Wolf Fang | Any Wolf | Common | Basic crafting |
| Wolf Pelt | Wolf | Uncommon | Armor upgrades |
| Moonstone Alpha | Blood Moon | Rare | Premium crafting |
| Ancient Relic | Rare Drop | Epic | Tier 4 recipes |

### 2. QR REALITY SCAVENGER HUNT (QR Scanner System)
**Industry-First Innovation**: Bridge physical world with game via QR code scanning

How it works:
1. Player opens QR Scanner in the game menu
2. Camera activates, scanning for QR codes
3. Each unique QR code can be scanned once per account
4. Player receives materials based on QR code data

QR Code Types:
| QR Type | Contents | Reward | Limit |
|---------|----------|--------|-------|
| Material QR | `BF-MAT-XXX` | Random common material | 1/day |
| Rare QR | `BF-RARE-XXX` | Rare material | 5 total/account |
| Event QR | `BF-EVENT-2024` | Event exclusive | Limited time |
| Gold QR | `BF-GOLD-XXX` | Zel bonus | Daily |

QR Code Generation (for marketing):
- Special QR codes can be distributed in:
  - Physical merchandise (cards, posters)
  - Social media images
  - Event locations
  - Collaboration partners

### 3. MODERNIZED COMMERCE SYSTEM
Dynamic marketplace replacing static shop:

Features:
1. **Dynamic Pricing**: Prices fluctuate based on supply/demand
2. **Player Trading**: Buy/sell with other players (P2P)
3. **Limited-Time Offers**: Flash sales with rare items
4. **Subscription Tiers**: Premium shop access with discounts
5. **Item Marketplace**:列表Items for Zel or Gems

New Shop Sections:
- `Daily Deals`: Rotating discounted items
- `Player Market`: P2P trading hub
- `Limited Stock`: Rare items with limited quantity
- `QR Exclusive`: Items only from QR codes

### 4. ADVANCED CRAFTING SYSTEM
Enhanced crafting with new dimensions:

New Features:
1. **Recipe Discovery**: Find recipes through gameplay
2. **Material Synthesis**: Combine common materials → rare
3. **Lucky Crafts**: Chance for bonus outputs
4. **Recipe Sharing**: Trade recipes with other players
5. **Tier 4 Crafting**: Highest tier with QR/Wolf materials

Tier 4 Equipment (new):
| Item | Materials | Special Effect |
|------|-----------|---------------|
| Wolf Fang Edge | 30 Wolf Fang, 5 Moonstone | 20% Crit damage |
| Lunar Shroud | 20 Wolf Pelt, 10 Moonstone | Night battle boost |
| Ancient Crown | 5 Ancient Relic, 20 Mythril | All stats +10% |

## Technical Implementation

### Files to Modify:
1. `lib/gameData.ts` - Add Wolf enemy definitions
2. `lib/economyTypes.ts` - Add QR/Rare material types
3. `lib/economyData.ts` - Add new shop entries, recipes
4. `lib/gameState.ts` - Add QR scanning, trading functions
5. `components/QRScanner.tsx` - New QR scanner component
6. `components/ShopScreen.tsx` - Modernize shop UI
7. `components/CraftScreen.tsx` - Enhanced crafting

### New Components:
- `QRScanner.tsx` - Camera-based QR scanner
- `Marketplace.tsx` - P2P trading interface
- `WolfBattle.tsx` - Wolf-specific battle arena

## Success Metrics
- Active QR scanner usage: Target 40% of DAU
- Wolf battle engagement: Target 30% of battles
- P2P trades: Target 1000 trades/day
- Recipe discovery: 50 unique recipes found

## User Stories
1. "As a player, I want to scan QR codes in real life to get exclusive materials"
2. "As a player, I want to fight unique wolf enemies for rare drops"
3. "As a player, I want to trade items with other players"
4. "As a player, I want to craft powerful gear from QR and wolf materials"