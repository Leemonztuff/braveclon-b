# Feature Specification: Wolf AR Commerce System

**Feature Branch**: `001-wolf-ar-commerce`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Modernize wolf enemies, commercial exchanges, and crafting with QR code camera scanner for real-world materials"

## User Scenarios & Testing

### User Story 1 - QR Code Scanner (Priority: P1)

As a player, I want to scan QR codes using my phone's camera to receive exclusive in-game materials, so that I can obtain rare items only available through real-world exploration.

**Why this priority**: This is the core innovation - bridging physical and digital worlds. Creates unique engagement not seen in other mobile RPGs.

**Independent Test**: Can be tested by generating test QR codes and scanning them. Delivers immediate rewards and tracks scan history.

**Acceptance Scenarios**:

1. **Given** the player has camera permission, **When** they open QR Scanner and point at a valid `BF-MAT-XXX` QR code, **Then** they receive a random common material (Wolf Fang, Iron Ore, etc.) and the scan is logged
2. **Given** the player scans a QR code already scanned today, **When** they attempt another scan, **Then** system shows "Already scanned today - come back tomorrow!"
3. **Given** the player scans an invalid QR code, **When** the code doesn't match known patterns, **Then** system shows "Unknown QR code - this code is not recognized"
4. **Given** the player has no camera permission, **When** they try to open scanner, **Then** system prompts for permission

---

### User Story 2 - Wolf Enemy Family (Priority: P2)

As a player, I want to fight unique Wolf enemies with pack mechanics and rare Blood Moon variants, so that I can obtain exclusive materials (Wolf Fang, Wolf Pelt, Moonstone) for crafting powerful Tier 4 equipment.

**Why this priority**: Wolves provide the PVE content backbone for the new crafting tier. Creates meaningful farming content.

**Independent Test**: Can test by encountering wolves in battle, defeating them, and verifying material drops.

**Acceptance Scenarios**:

1. **Given** player enters a stage with wolves, **When** 3-5 wolves spawn as a pack, **Then** they have coordinated positioning and the Alpha buffs nearby wolves
2. **Given** player defeats a Blood Moon wolf, **When** it's a rare spawn (5% chance at night), **Then** they have a chance to receive Moonstone or Ancient Relic
3. **Given** player defeats a wolf, **When** they receive materials, **Then** materials are added to inventory with correct quantities

---

### User Story 3 - Modernized Commerce (Priority: P3)

As a player, I want access to a dynamic marketplace with daily deals, limited stock items, and QR-exclusive merchandise, so that I have more reasons to engage with the economy beyond static shop.

**Why this priority**: Increases engagement loops and creates urgency through limited-time offers.

**Independent Test**: Test by visiting shop, seeing daily rotations, and purchasing limited items.

**Acceptance Scenarios**:

1. **Given** player opens the shop, **When** at peak hours, **Then** they see 3-5 "Daily Deals" with discounted prices
2. **Given** player purchases a limited-stock item, **When** the stock reaches 0, **Then** item shows "Sold Out" and cannot be purchased
3. **Given** player has QR-scanned materials, **When** they visit QR Shop tab, **Then** they can purchase exclusive items using QR-gathered currency

---

### User Story 4 - Advanced Crafting (Priority: P4)

As a player, I want to craft Tier 4 equipment using Wolf materials and QR-exclusive resources, so that I can create the most powerful gear in the game.

**Why this priority**: Provides the long-term goal for grinding QR scans and wolf battles.

**Independent Test**: Test all crafting recipes, verify material consumption, confirm output.

**Acceptance Scenarios**:

1. **Given** player has required materials, **When** they attempt to craft Wolf Fang Edge, **Then** equipment is created and materials are consumed
2. **Given** player lacks required materials, **When** they attempt craft, **Then** system shows missing materials with quantities needed
3. **Given** crafting succeeds, **When** there's a lucky craft roll (10%), **Then** player receives bonus material back

---

### Edge Cases

- What happens when camera is denied permission? → Prompt user to enable in settings
- What happens when QR code is tampered/modified? → Validate checksum, reject invalid codes
- How does offline mode handle QR scanning? → Require connectivity for first scan, cache results
- What happens when Wolf battle is interrupted? → Save state, allow resume
- What happens with duplicate QR scans across devices? → Track by account, not device

## Requirements

### Functional Requirements

- **FR-001**: System MUST activate device camera for QR code scanning
- **FR-002**: System MUST validate QR code format: `BF-{TYPE}-{CODE}` pattern
- **FR-003**: System MUST track QR scan history per account with timestamps
- **FR-004**: System MUST limit material QR scans to once per day per account
- **FR-005**: System MUST limit rare QR scans to 5 total per account lifetime
- **FR-006**: System MUST spawn Wolf enemies in packs of 3-5 units
- **FR-007**: System MUST implement Alpha Wolf buff mechanics (+15% atk to pack)
- **FR-008**: System MUST implement Blood Moon rare spawn (5% night rate)
- **FR-009**: System MUST drop Wolf materials on enemy defeat
- **FR-010**: System MUST rotate daily deals every 24 hours
- **FR-011**: System MUST implement limited stock with sold-out state
- **FR-012**: System MUST allow Tier 4 crafting with special materials
- **FR-013**: System MUST implement 10% lucky craft bonus

### Key Entities

- **QRCode**: { id, type, code, scannedAt, accountId, material, quantity }
- **WolfEnemy**: { id, type, variant, isAlpha, isBloodMoon, packPosition }
- **Material**: { type, quantity, source (QR/Wolf/Battle), obtainedAt }
- **ShopListing**: { id, name, price, stock, isDailyDeal, expiresAt }
- **CraftRecipe**: { id, name, materials, output, luckyChance }

## Success Criteria

### Measurable Outcomes

- **SC-001**: 40% of DAU use QR Scanner at least once per week
- **SC-002**: QR scanner completes scan-to-reward in under 2 seconds
- **SC-003**: 30% of battle sessions include at least one Wolf enemy
- **SC-004**: Tier 4 crafting accounts for 15% of all crafts
- **SC-005**: Daily Deal items have 80% purchase rate within 12 hours

## Assumptions

- Camera access is available on all supported devices (iOS/Android)
- QR codes can be distributed physically and digitally by marketing team
- Wolves fit within existing battle system framework
- Shop modernization doesn't require backend (localStorage sufficient)
- Player base has internet connectivity for QR validation
- Blood Moon only appears in designated "night" stages (in-battle time)