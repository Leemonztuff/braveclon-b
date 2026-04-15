# Braveclon Economy Design Document

## Executive Summary

This document defines the complete economic system for Braveclon, a turn-based tactical RPG. The economy is designed to:
- **Drive engagement** through meaningful daily activities and progression gates
- **Enable monetization** without predatory mechanics
- **Scale infinitely** as content grows
- **Feel rewarding** through variable reward schedules and achievement loops

---

## Part 1: Currency System

### 1.1 Currency Overview

| Currency | Type | Purpose | Acquisition Focus | Sink Focus |
|----------|------|---------|-------------------|------------|
| **Zel** | Standard | Unit fusion, evolution, general purchases | Battle, daily tasks | Fusion, evolution, shop |
| **Gems** | Premium | Gacha, energy refills, premium shop | IAP, rare rewards | Gacha, skip buttons, cosmetics |
| **Energy** | Gate | Battle entry requirement | Time regen, rewards | All battle content |
| **Arena Medals** | Specialty | Arena/Colosseum rewards | PvP content | Arena shop, exclusive units |
| **Guild Coins** | Specialty | Guild activities | Guild battles, donations | Guild upgrades, exclusive items |
| **Honor Points** | Specialty | Achievement-based | Daily achievements, milestones | Achievement rewards, titles |

### 1.2 Detailed Currency Definitions

#### ZEL (Gold)
```
Icon: 💰
Color: Gold/Yellow
Soft Cap: None (infinite accumulation)
Exchange Rate: 1 Gem = ~100-500 Zel (varies by purchase tier)
```

**Purpose**: Primary currency for all unit progression
- Unit fusion (leveling)
- Unit evolution
- Unit skill enhancement
- Shop purchases (common items)

**Acquisition Sources**:
| Source | Amount | Frequency | Method |
|--------|--------|-----------|--------|
| Battle clears | 200-8000 | Per run | Complete stage |
| Daily Quest: "Zel Rush" | 5,000 | Daily | Complete 10 battles |
| Daily Quest: "Boss Hunter" | 2,000 | Daily | Defeat 3 bosses |
| Achievement: First Clear | 500-2000 | One-time | Clear stage first time |
| Fusion refund | 20% | Per fusion | Consume materials |

**Sink Uses**:
| Use | Cost Formula | Priority |
|-----|-------------|----------|
| Fusion (3★ + 3★) | Level × 100 × materials | High |
| Fusion (4★ fed) | Level × 200 × materials | High |
| Evolution (3★→4★) | 30,000 | Medium |
| Evolution (4★→5★) | 100,000 | Medium |
| Skill Enhancement | 10,000 + (skill level × 5,000) | Low |
| Arena Entry | 500 per match | Low |

---

#### GEMS (Premium Currency)
```
Icon: 💎
Color: Cyan/Blue
Soft Cap: None (players hoard)
Exchange Rate: $0.99 = 80 gems (base tier)
```

**Purpose**: Premium purchases, convenience, gacha
- Summons (gacha)
- Energy refills
- Shop premium items
- Skip/d加速 features
- Name changes, cosmetics

**Acquisition Sources** (Free):
| Source | Amount | Frequency | Method |
|--------|--------|-----------|--------|
| First clear reward | 5-50 | One-time | Clear stage first time |
| Daily Quest: "Daily Login" | 5 | Daily | Log in each day |
| Achievement milestones | 10-500 | Progress-based | Level, clears, etc. |
| Arena Season End | 50-500 | Weekly | Final rank rewards |
| Guild Quest Completion | 10-50 | Weekly | Guild boss kills |
| Bug Reports / Feedback | Variable | Irregular | Community reward |

**Sink Uses**:
| Use | Cost | Gem Value |
|-----|------|-----------|
| Single Summon | 50 | ~$0.62 |
| Multi Summon (10x) | 450 | ~$5.62 (12.5% bonus) |
| Energy Refill (full) | 1 per 10 energy | ~$0.10 |
| Arena Skip Ticket | 5 | ~$0.06 |
| Daily Gem Pack | N/A (IAP only) | $0.99+ |

---

#### ENERGY
```
Icon: ⚡
Color: Yellow
Max Capacity: 30
Regen Rate: 1 per 3 minutes (20/hour)
Emergency Cap: 50 (1 extra tier)
```

**Purpose**: Gate battle content, drive session timing

**Acquisition Sources**:
| Source | Amount | Frequency | Method |
|--------|--------|-----------|--------|
| Time regeneration | 1 | 3 min | Passive |
| Daily Quest: "Battle On" | +15 | Daily | Complete 5 battles |
| Daily Quest: "Energy Surge" | Full refill | Daily | Spend 100 energy |
| Achievement reward | 10-30 | Progress-based | Level milestones |
| Gacha bonus | 3-10 | Per summon | Sometimes bonus drop |
| Daily Login streak | +5 per 7 days | Weekly | 7-day login bonus |

**Sink Uses**:
| Content | Energy Cost | Clear Time |
|---------|-------------|------------|
| Standard Stage | 3-15 | 2-5 min |
| Boss Stage | 10-20 | 5-10 min |
| Arena Match | 0 | 3-5 min |
| Raid/Boss | 0 | 5-15 min |
| Tower Floor | 5 | 3-8 min |

---

#### ARENA MEDALS
```
Icon: 🏅
Color: Silver/Bronze gradient
Soft Cap: 10,000 (overflow converts to Zel)
```

**Purpose**: PvP currency for exclusive rewards

**Acquisition Sources**:
| Source | Amount | Frequency |
|--------|--------|-----------|
| Arena Victory | 50 | Per win |
| Arena Defeat | 20 | Per loss |
| Season Ranking Bonus | 100-2000 | Weekly |

**Sink Uses**:
| Item | Cost | Rarity |
|------|------|--------|
| Arena Unit Selector | 5,000 | Exclusive |
| Arena Exclusive Equipment | 2,000-5,000 | Limited |
| Arena Consumables | 100-500 | Stocked |

---

#### GUILD COINS
```
Icon: 🔰
Color: Orange
Soft Cap: 50,000
```

**Purpose**: Guild progression and social engagement

**Acquisition Sources**:
| Source | Amount | Frequency |
|--------|--------|-----------|
| Guild Battle Victory | 200 | Per match |
| Guild Donation | 50% match | Per donation |
| Guild Quest Completion | 100-500 | Per quest |
| Guild Raids | 500-2000 | Per boss |

**Sink Uses**:
| Item | Cost | Purpose |
|------|------|---------|
| Guild Upgrade: Energy Regen | 1,000/level | Faster regen |
| Guild Upgrade: Zel Bonus | 2,000/level | +5% zel per battle |
| Guild Exclusive Units | 10,000-30,000 | Rare units |
| Guild Cosmetics | 5,000 | Banners, effects |

---

#### HONOR POINTS
```
Icon: ⭐
Color: Rainbow/Prismatic
Soft Cap: None (display only)
```

**Purpose**: Achievement tracking, prestige display

**Acquisition Sources**:
| Source | Amount | Method |
|--------|--------|--------|
| Daily Quests | 10-50 | Completion |
| Achievements | 100-1000 | Milestone |
| Boss Defeats | 25 | First clear |
| Unit Level 100 | 500 | Prestige unit |

**Sink Uses**:
- Achievement rewards (automatic)
- Unlock achievement rewards
- Leaderboards
- Seasonal titles

---

## Part 2: Acquisition & Sink Flow

### 2.1 Faucet (Acquisition) Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ACQUISITION SOURCES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │   BATTLE    │     │   DAILY     │     │  ACHIEVE-   │          │
│  │   CONTENT   │     │   QUESTS    │     │   MENTS     │          │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘          │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    PLAYER ACTIONS                            │   │
│  │  • Complete Stages  • Clear Daily  • Reach Milestones     │   │
│  │  • Win Arena         • Guild Events  • First Clears         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐  │
│  │    ZEL    │   GEMS    │  MEDALS   │   COINS   │   HONOR   │  │
│  │  60%/run  │  Rare/    │  Arena    │  Guild    │  Always   │  │
│  │           │  IAP      │  Only     │  Only     │  Granted  │  │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘  │
│                              │                                       │
│                              ▼                                       │
│                    ┌─────────────────┐                             │
│                    │  PLAYER WALLET  │                             │
│                    │  (Accumulation) │                             │
│                    └─────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Sink (Spending) Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SINK OPTIONS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      UNIT PROGRESSION                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │  FUSION  │  │ EVOLVE   │  │  SKILL   │  │  LIMIT   │    │   │
│  │  │ 20K-100K │  │ 30K-100K │  │ 15K-40K  │  │  BREAK   │    │   │
│  │  │   ZEL    │  │   ZEL    │  │   ZEL    │  │   ZEL    │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   EQUIPMENT PROGRESSION                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │  ENHANCE     │  │   CRAFT      │  │   SOCKETS    │      │   │
│  │  │  Ore+Gold    │  │ Materials    │  │  Gems        │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      PREMIUM SPENDS                          │   │
│  │  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐  │   │
│  │  │  GACHA   │  │   SKIP    │  │   NICK-    │  │ COSMETIC│  │   │
│  │  │ 50 Gems  │  │  5 Gems   │  │  NAME 100  │  │  Gems   │  │   │
│  │  └──────────┘  └────────────┘  └────────────┘  └─────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      QUALITY OF LIFE                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │  ENERGY      │  │  STORAGE    │  │  TEAM        │       │   │
│  │  │  REFILLS     │  │  EXPAND     │  │  SLOTS       │       │   │
│  │  │  1-10 Gems   │  │  50 Gems    │  │  200 Gems    │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Daily Engagement Loop

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DAILY ENGAGEMENT LOOP                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     │
│   │  LOGIN  │────▶│ BATTLE  │────▶│  QUEST  │────▶│  ARENA  │     │
│   │  Bonus  │     │Energy   │     │Complete │     │  Match  │     │
│   │ 5 Gems  │     │ Farm    │     │ Daily   │     │ Medals  │     │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘     │
│       │                                  │              │         │
│       │         ┌────────────────────────┴──────────────┘        │
│       │         │                                                │
│       ▼         ▼                                                │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│   │  GACHA  │  │ FUSION  │  │ EVOLVE  │  │  SHOP   │            │
│   │ 50 Gems │  │  Spend  │  │  Spend  │  │  Spend  │            │
│   │ Daily   │  │  Zel    │  │  Zel    │  │  Zel    │            │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                     │
│   DAILY PLAYER GOALS:                                              │
│   1. Log in (5 gems)                                               │
│   2. Complete 5 battles (15 energy bonus)                          │
│   3. Clear 10 stages (5,000 zel bonus)                             │
│   4. Win 3 arena matches (150 medals)                              │
│   5. Use daily energy (full refill bonus)                          │
│                                                                     │
│   DAILY SPENDS:                                                     │
│   • 50 gems → 1 summon                                             │
│   • 20,000-50,000 zel → fusion/evolution                           │
│   • 1-10 gems → energy refill (optional)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Gacha System Design

### 3.1 Summon Structure

| Banner Type | Cost | Pulls | Featured Rate | Pity |
|-------------|------|-------|---------------|------|
| Standard | 50 gems | 1 | N/A | 100 pulls (5★) |
| Multi | 450 gems | 10 | N/A | 10 multi (5★) |
| Featured | 50 gems | 1 | +5% featured | 80 pulls (5★) |
| Step-Up | Escalating | 10 | +featured | 100 pulls total |

### 3.2 Rates Table

| Rarity | Base Rate | Featured Rate | Cumulative (100 pulls) |
|--------|-----------|---------------|------------------------|
| ★5 | 2% | 5% | ~87% |
| ★4 | 12% | 15% | ~97% |
| ★3 | 86% | 80% | 100% |

### 3.3 Pity Protection

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PITY SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   PITY TRACKER:                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ ★5 Pity: [████████████░░░░░░░░░░░░] 60/100 pulls          │   │
│   │                                                             │   │
│   │ ★4 Pity: [████████████████████████] 25/25 (RESET!)        │   │
│   │                                                             │   │
│   │ NEXT GUARANTEE:                                             │   │
│   │ • 40 pulls until ★5 guaranteed                              │   │
│   │ • 0 pulls until ★4 guaranteed                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   PITY RULES:                                                       │
│   • ★4 guaranteed every 25 pulls                                    │
│   • ★5 guaranteed every 100 pulls                                   │
│   • Featured banner: Featured unit rate increases each pull         │
│   • Pity resets on obtaining the rarity                            │
│   • Pity transfers between same banner type                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Duplicate System

| Unit Rarity | When Duplicate Obtained |
|-------------|------------------------|
| ★5 | Convert to **Prism** (100) + Zel (10,000) |
| ★4 | Convert to **Prism** (25) + Zel (3,000) |
| ★3 | Convert to **Prism** (5) + Zel (500) OR Fuse for +5% stats |

---

## Part 4: Daily/Weekly Activities

### 4.1 Daily Quests

| Quest | Requirement | Reward | Zel Value |
|-------|-------------|--------|-----------|
| Battle On | Complete 5 battles | 15 Energy | - |
| Zel Rush | Complete 10 battles | 5,000 Zel | 5,000 |
| First Clear | Clear any new stage | 50-500 Gems | - |
| Arena Fighter | Win 3 arena matches | 150 Arena Medals | 150 medals |
| Fusion Master | Fuse 3 units | 2,000 Zel | 2,000 |
| Daily Login | Log in each day | 5 Gems | - |

### 4.2 Weekly Quests

| Quest | Requirement | Reward |
|-------|-------------|--------|
| Colosseum Champion | Reach Gold rank | 500 Arena Medals |
| Guild Supporter | Donate 10 times | 1,000 Guild Coins |
| Power Level | Reach player level 10 | 50 Gems |
| Elemental Master | Use each element 20 times | 3,000 Zel |

### 4.3 Achievement Milestones

| Category | Milestone | Reward |
|----------|-----------|--------|
| Stages | Clear 10/50/100 stages | 500/2000/5000 Zel |
| Levels | Unit to 50/80/100 | 100/500/1000 Gems |
| Fusion | Fuse 10/50/100 units | 1000/5000/10000 Zel |
| Arena | Win 50/200/500 matches | 100/500/1000 Medals |
| Collection | Collect 10/30/50 units | 50/200/500 Gems |

---

## Part 5: Equipment Economy

### 5.1 Enhancement Materials

| Material | Rarity | Source | Use |
|----------|--------|--------|-----|
| Iron Ore | Common | Stage drops | +1-5 enhance |
| Steel Ingot | Uncommon | Stage drops, craft | +5-15 enhance |
| Mythril | Rare | Boss drops, craft | +15-30 enhance |
| Orichalcum | Epic | Raid drops | +30-50 enhance |
| Dragon Scale | Legendary | End-game content | Max enhance |

### 5.2 Equipment Enhancement Costs

```
Base Formula: Cost = (Equipment Level + 1) × 500 Zel + (Enhance Step × 100 Zel)

Example - Weapon +1 to +2:
- 500 Zel + 100 Zel = 600 Zel
- Success Rate: 100%

Example - Weapon +9 to +10:
- 5000 Zel + 900 Zel = 5,900 Zel
- Success Rate: 70% (use protection crystal)

Example - Weapon +14 to +15:
- 7500 Zel + 1400 Zel = 8,900 Zel
- Success Rate: 40%
```

### 5.3 Enhancement Protection

| Step | Success Rate | Cost (Zel) | Protection |
|------|--------------|-------------|------------|
| +1 to +5 | 100% | 600-2,500 | None needed |
| +6 to +10 | 85-70% | 3,000-5,900 | 10 Gems |
| +11 to +15 | 60-40% | 5,500-8,900 | 25 Gems |
| +16 to +20 | 30-10% | 8,000+ | 50 Gems |

---

## Part 6: Scalability Architecture

### 6.1 Gem Purchase Tiers

| Pack Name | Gems | Price | $/Gem | Bonus |
|-----------|------|-------|-------|-------|
| Starter | 80 | $0.99 | $0.012 | First purchase only |
| Light | 400 | $4.99 | $0.012 | - |
| Medium | 850 | $9.99 | $0.012 | +50 bonus |
| Heavy | 1,800 | $19.99 | $0.011 | +200 bonus |
| Bundle | 4,500 | $49.99 | $0.011 | +500 bonus |
| Whale | 10,000 | $99.99 | $0.010 | +1,500 bonus |

### 6.2 Battle Pass Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BATTLE PASS TIERS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   FREE TIER (Included):                                             │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│   │   Zel      │ │   Gems     │ │   Arena    │ │   Guild    │      │
│   │  50,000    │ │    100     │ │   Medals   │ │   Coins    │      │
│   │  Levels    │ │  2 tiers   │ │   500      │ │   2,000    │      │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                     │
│   PREMIUM TIER ($9.99/season):                                       │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│   │   Gems     │ │  Featured  │ │ Exclusive  │ │   Cosmetics│      │
│   │   500      │ │    Unit    │ │  Equipment │ │    Icon    │      │
│   │  Total     │ │   Select   │ │   Set      │ │   Frame    │      │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                     │
│   SEASON DURATION: 8 weeks                                          │
│   DAILY XP: 100-500 per day                                         │
│   SEASON XP: ~20,000 total                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Subscription Model

| Tier | Price | Weekly Gems | Daily Bonus | Perks |
|------|-------|-------------|-------------|-------|
| Bronze | $4.99/mo | 150 | +5 Energy/day | 10% Zel bonus |
| Silver | $9.99/mo | 350 | +10 Energy/day | 15% all bonuses |
| Gold | $19.99/mo | 800 | +20 Energy/day | 25% all bonuses, exclusive shop |

---

## Part 7: Balance Formulas

### 7.1 Energy Economics

```
REGEN_RATE = 1 energy / 3 minutes
MAX_ENERGY = 30 (base) + Guild_Bonus + VIP_Level
DAILY_REGEN = 20/hour × 24 hours = 480 energy/day
PLAYABLE_ENERGY = MAX_ENERGY + 480 = 510/day average
```

### 7.2 Zel Economy Curve

```
STAGE_ZEL_REWARD = BASE × (1 + AREA_MULTIPLIER × 0.2) × (1 + PLAYER_LEVEL × 0.05)

Stage 1: 200 base × 1.0 × 1.0 = 200
Stage 10: 800 base × 1.4 × 1.5 = 1,680
Stage 50: 3000 base × 2.2 × 3.5 = 23,100

PLAYER_SPEND_ESTIMATE:
- Fusion: 20,000-50,000 per unit to max
- Evolution: 30,000-100,000 per evolution
- Enhancement: 50,000-200,000 per equipment set

ZEL_BALANCE_GOAL: +5% per session (sustainable inflation)
```

### 7.3 Gacha Conversion Rate

```
GEM_VALUE_USD = Price / Gems
GEM_VALUE_ZEL = 100 (fixed exchange from gem shop)
GEM_VALUE_ENERGY = 1 gem = 10 energy (refill rate)

WHALE_PACK ($99.99):
- 10,000 gems
- 11,500 equivalent Zel (if all spent in shop)
- 10,000 energy refills
- ~100 standard summons
```

### 7.4 Progression Pacing

| Player Level | Expected Zel | Expected Units | Content Unlocked |
|--------------|-------------|----------------|------------------|
| 1-10 | 0-50K | 5-10 (mostly 3★) | Stages 1-20 |
| 11-25 | 50K-300K | 10-25 (mix 3-4★) | Stages 21-50, Arena |
| 26-50 | 300K-1M | 25-50 (4★+, few 5★) | Stages 51-100, Guilds |
| 51-75 | 1M-5M | 50-100 (5★ emerging) | End-game, Raids |
| 76-100 | 5M+ | 100+ (5★ team) | Prestige content |

---

## Part 8: Implementation Notes

### 8.1 State Requirements

```typescript
interface PlayerState {
  // Existing
  zel: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  inventory: UnitInstance[];
  summonPity: PityState;
  
  // New Economy State
  arenaMedals: number;
  guildCoins: number;
  honorPoints: number;
  
  // Daily tracking
  dailyQuests: DailyQuestState;
  lastDailyReset: number;
  
  // Equipment
  equipmentInventory: EquipInstance[];
  enhancementMaterials: MaterialInventory;
  
  // Premium
  battlePass: BattlePassState;
  subscription: SubscriptionState;
  
  // Collection/Stats
  stats: PlayerStats;
}

interface DailyQuestState {
  battlesCompleted: number;
  arenaWins: number;
  fusionsDone: number;
  loginStreak: number;
  lastLoginDate: string;
  claimed: {
    daily1: boolean;
    daily2: boolean;
    daily3: boolean;
  };
}
```

### 8.2 Key Functions

```typescript
// Economy Actions
claimDailyQuest(questId: string): QuestReward
refreshEnergy(amount: number): void
spendEnergy(amount: number): boolean
addCurrency(type: CurrencyType, amount: number): void
spendCurrency(type: CurrencyType, amount: number): boolean

// Gacha
rollSummon(bannerId: string, count: number): SummonResult[]
claimPity(): SummonResult | null

// Equipment
enhanceEquipment(instanceId: string): EnhancementResult
craftEquipment(recipeId: string): EquipInstance | null

// Daily/Weekly
checkDailyReset(): void
claimWeeklyRewards(): WeeklyReward

// Battle Pass
addBattlePassXP(amount: number): void
claimBattlePassReward(tier: number): Reward
```

---

## Appendix A: Recommended IAP Pricing

| Item | Price | Notes |
|------|-------|-------|
| 80 Gems | $0.99 | First purchase bonus, gateway drug |
| 400 Gems | $4.99 | One summon + change |
| 850 Gems | $9.99 | Multi-summon value |
| 1,800 Gems | $19.99 | Popular mid-tier |
| 4,500 Gems | $49.99 | Bundle with bonus |
| 10,000 Gems | $99.99 | Whale tier |
| Energy Refill (Full) | 10 Gems | ~$0.12 |
| Battle Pass | $9.99 | Seasonal |
| Subscription Bronze | $4.99/mo | Entry subscription |
| Subscription Gold | $19.99/mo | Full subscription |

---

## Appendix B: Anti-Predation Checks

1. **No loot box display** - Show exact rates publicly
2. **No near-miss mechanics** - No "almost won" psychological tricks
3. **Spending limits** - Optional daily/monthly caps
4. **Duplicate protection** - Guaranteed new unit within X pulls
5. **Pity visible** - Always show pity progress to player
6. **No FOMO** - Featured units return in future banners
7. **No premium power** - Gems never provide gameplay advantage only convenience
