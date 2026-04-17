-- ============================================================================
-- BRAVECLON - COMPLETE SUPABASE DATABASE SCHEMA
-- Data-Driven RPG Game (Brave Frontier Clone)
-- Execute this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE element_type AS ENUM ('Fire', 'Water', 'Earth', 'Thunder', 'Light', 'Dark');
CREATE TYPE equip_slot AS ENUM ('weapon', 'armor', 'accessory');
CREATE TYPE guild_rank AS ENUM ('leader', 'officer', 'member', 'recruit');
CREATE TYPE quest_type AS ENUM ('daily', 'weekly', 'guild', 'event');
CREATE TYPE quest_status AS ENUM ('active', 'completed', 'expired');

-- ============================================================================
-- UNIT TEMPLATES
-- ============================================================================

CREATE TABLE unit_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    element element_type NOT NULL,
    rarity INTEGER NOT NULL CHECK (rarity BETWEEN 1 AND 5),
    base_hp INTEGER NOT NULL,
    base_atk INTEGER NOT NULL,
    base_def INTEGER NOT NULL,
    base_rec INTEGER NOT NULL,
    growth_hp REAL DEFAULT 10,
    growth_atk REAL DEFAULT 5,
    growth_def REAL DEFAULT 3,
    growth_rec REAL DEFAULT 3,
    max_level INTEGER DEFAULT 60,
    evolution_target TEXT REFERENCES unit_templates(id),
    sprite_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert unit templates
INSERT INTO unit_templates (id, name, element, rarity, base_hp, base_atk, base_def, base_rec, growth_hp, growth_atk, growth_def, growth_rec, max_level, sprite_url) VALUES
('u1', 'Elexir', 'Light', 1, 1200, 150, 120, 80, 30, 15, 10, 60, 'https://picsum.photos/seed/u1/64'),
('u2', 'Rashil', 'Dark', 1, 1150, 160, 115, 85, 32, 14, 10, 60, 'https://picsum.photos/seed/u2/64'),
('u3', 'Faylen', 'Water', 1, 1100, 140, 130, 90, 28, 16, 12, 60, 'https://picsum.photos/seed/u3/64'),
('u4', 'Gravos', 'Earth', 1, 1300, 145, 110, 75, 30, 14, 8, 60, 'https://picsum.photos/seed/u4/64'),
('u5', 'Zelea', 'Fire', 1, 1050, 165, 105, 80, 35, 12, 10, 60, 'https://picsum.photos/seed/u5/64'),
('u6', 'Thundax', 'Thunder', 1, 1000, 170, 100, 75, 38, 10, 8, 60, 'https://picsum.photos/seed/u6/64'),
('u7', 'Lumina', 'Light', 2, 2500, 280, 250, 220, 50, 30, 25, 80, 'https://picsum.photos/seed/u7/64'),
('u8', 'Shadow', 'Dark', 2, 2400, 300, 230, 210, 55, 28, 22, 80, 'https://picsum.photos/seed/u8/64'),
('u9', 'Aquaron', 'Water', 2, 2300, 260, 270, 230, 45, 32, 28, 80, 'https://picsum.photos/seed/u9/64'),
('u10', 'Terra', 'Earth', 2, 2800, 250, 200, 200, 48, 25, 20, 18, 80, 'https://picsum.photos/seed/u10/64'),
('u11', 'Inferno', 'Fire', 2, 2200, 320, 190, 190, 60, 22, 18, 80, 'https://picsum.photos/seed/u11/64'),
('u12', 'Voltair', 'Thunder', 2, 2100, 340, 180, 180, 65, 20, 15, 80, 'https://picsum.photos/seed/u12/64'),
('mat_fire', 'Fire Essence', 'Fire', 3, 500, 80, 80, 80, 10, 10, 10, 40, 'https://picsum.photos/seed/matf/32'),
('mat_water', 'Water Essence', 'Water', 3, 500, 80, 80, 80, 10, 10, 10, 40, 'https://picsum.photos/seed/matw/32'),
('mat_earth', 'Earth Essence', 'Earth', 3, 500, 80, 80, 80, 10, 10, 10, 40, 'https://picsum.photos/seed/mate/32'),
('mat_thunder', 'Thunder Essence', 'Thunder', 3, 500, 80, 80, 80, 10, 10, 10, 40, 'https://picsum.photos/seed/matt/32'),
('mat_light', 'Light Essence', 'Light', 3, 500, 80, 80, 80, 10, 10, 10, 40, 'https://picsum.photos/seed/matl/32'),
('mat_dark', 'Dark Essence', 'Dark', 3, 500, 80, 80, 80, 10, 10, 10, 40, 'https://picsum.photos/seed/matd/32');

-- ============================================================================
-- EQUIPMENT TEMPLATES
-- ============================================================================

CREATE TABLE equipment_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type equip_slot NOT NULL,
    rarity INTEGER NOT NULL CHECK (rarity BETWEEN 1 AND 4),
    atk_bonus INTEGER DEFAULT 0,
    def_bonus INTEGER DEFAULT 0,
    hp_bonus INTEGER DEFAULT 0,
    rec_bonus INTEGER DEFAULT 0,
    set_id TEXT,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO equipment_templates (id, name, type, rarity, atk_bonus, def_bonus, hp_bonus, rec_bonus, set_id, description, icon) VALUES
('eq_w1', 'Brave Sword', 'weapon', 1, 50, 0, 0, 0, NULL, 'A basic sword for brave warriors.', '⚔️'),
('eq_w2', 'Flame Blade', 'weapon', 2, 120, 0, 100, 0, NULL, 'A sword imbued with fire.', '🗡️'),
('eq_w3', 'Muramasa', 'weapon', 4, 250, -50, 0, 0, 'set_dragon', 'A cursed blade that grants immense power.', '🗡️'),
('eq_w4', 'Holy Lance', 'weapon', 3, 180, 0, 0, 100, 'set_holy', 'A lance blessed by the gods.', '🔱'),
('eq_a1', 'Leather Armor', 'armor', 1, 0, 50, 200, 0, NULL, 'Basic protection.', '🛡️'),
('eq_a2', 'Knight Shield', 'armor', 2, 0, 150, 500, 0, 'set_holy', 'Heavy shield for knights.', '🛡️'),
('eq_a3', 'Dragon Scale', 'armor', 4, 0, 300, 1000, 0, 'set_dragon', 'Armor made from dragon scales.', '🐉'),
('eq_a4', 'Phantom Cloak', 'armor', 3, 0, 100, 300, 200, 'set_ninja', 'A cloak that makes the wearer hard to hit.', '🧥'),
('eq_ac1', 'Health Ring', 'accessory', 1, 0, 0, 500, 100, NULL, 'Boosts vitality.', '💍'),
('eq_ac2', 'Power Amulet', 'accessory', 2, 100, 50, 0, 0, 'set_ninja', 'Increases overall power.', '📿'),
('eq_ac3', 'Heroic Emblem', 'accessory', 4, 100, 100, 1000, 100, 'set_dragon', 'An emblem given to true heroes.', '🏅'),
('eq_ac4', 'Soul Gem', 'accessory', 3, 0, 0, 0, 500, 'set_holy', 'A gem that vastly improves recovery.', '💎');

-- ============================================================================
-- EQUIPMENT SETS
-- ============================================================================

CREATE TABLE equipment_sets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    pieces_required INTEGER NOT NULL,
    atk_multiplier REAL DEFAULT 1.0,
    def_multiplier REAL DEFAULT 1.0,
    rec_multiplier REAL DEFAULT 1.0,
    hp_multiplier REAL DEFAULT 1.0,
    special_effect TEXT,
    special_value INTEGER DEFAULT 0
);

INSERT INTO equipment_sets (id, name, description, pieces_required, atk_multiplier, def_multiplier, special_effect, special_value) VALUES
('set_dragon', 'Dragon Slayer', '2 pieces: +15% ATK & DEF', 2, 1.15, 1.15, NULL, NULL),
('set_dragon_bonus', 'Dragon Slayer Full', '3 pieces: +30% Fire damage, +20% crit', 3, 1.15, 1.15, 'element_fire', 30),
('set_holy', 'Holy Knight', '2 pieces: +10% HP & DEF', 2, 1.0, 1.10, 1.10, NULL),
('set_holy_bonus', 'Holy Knight Full', '3 pieces: +20% healing', 3, 1.0, 1.10, 1.20, 'healing', 20),
('set_ninja', 'Shadow Ninja', '2 pieces: +15% ATK', 2, 1.15, 1.0, NULL, NULL),
('set_ninja_bonus', 'Shadow Ninja Full', '3 pieces: +30% crit damage', 3, 1.15, 1.10, NULL, 'crit_damage', 30);

-- ============================================================================
-- MATERIALS
-- ============================================================================

CREATE TABLE materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 5),
    description TEXT,
    icon TEXT
);

INSERT INTO materials (id, name, tier, description, icon) VALUES
('ironOre', 'Iron Ore', 1, 'Common crafting material', '🪨'),
('steelIngot', 'Steel Ingot', 2, 'Uncommon crafting material', '🔩'),
('mythril', 'Mythril', 3, 'Rare crafting material', '💎'),
('orichalcum', 'Orichalcum', 4, 'Very rare crafting material', '💠'),
('dragonScale', 'Dragon Scale', 5, 'Legendary material from dragons', '🐉'),
('prism5', '5★ Prism', 5, 'For enhancing 5★ units', '💎'),
('prism4', '4★ Prism', 4, 'For enhancing 4★ units', '💎'),
('prism3', '3★ Prism', 3, 'For enhancing 3★ units', '💎');

-- ============================================================================
-- STAGES / QUESTS
-- ============================================================================

CREATE TABLE stages (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    energy INTEGER NOT NULL,
    exp_reward INTEGER NOT NULL,
    zel_reward INTEGER NOT NULL,
    enemy_ids TEXT[] NOT NULL,
    enemy_counts INTEGER[] NOT NULL,
    hp_multiplier REAL DEFAULT 1.0,
    atk_multiplier REAL DEFAULT 1.0,
    description TEXT
);

INSERT INTO stages (id, name, area, energy, exp_reward, zel_reward, enemy_ids, enemy_counts, hp_multiplier, atk_multiplier, description) VALUES
(1, 'Prontera Fields', 'Prontera', 5, 50, 100, ARRAY['e1'], ARRAY[3], 1.0, 1.0, 'A peaceful meadow.'),
(2, 'Cave of Memory', 'Prontera', 8, 100, 200, ARRAY['e1', 'e2'], ARRAY[2, 2], 1.2, 1.1, 'A dark cave.'),
(3, 'Forest of Silence', 'Lunar', 10, 150, 300, ARRAY['e2', 'e3'], ARRAY[3, 2], 1.5, 1.2, 'A mysterious forest.'),
(4, 'River of Tears', 'Lunar', 12, 200, 400, ARRAY['e3', 'e4'], ARRAY[2, 3], 1.8, 1.3, 'A sorrowful river.'),
(5, 'Ancient Ruins', 'Byalan', 15, 300, 600, ARRAY['e4', 'e5'], ARRAY[3, 3], 2.2, 1.5, 'Crumbling ancient ruins.'),
(6, 'Volcanic Core', 'Byalan', 18, 400, 800, ARRAY['e5', 'e6'], ARRAY[4, 2], 2.6, 1.7, 'Inside the volcano.'),
(7, 'Orc Village', 'Orc', 20, 500, 1000, ARRAY['e6', 'e9'], ARRAY[3, 2], 3.0, 1.9, 'Home of the orcs.'),
(8, 'Dragon Lair', 'Orc', 25, 700, 1500, ARRAY['e8', 'e9'], ARRAY[2, 4], 3.5, 2.2, 'Dangerous dragon territory.'),
(9, 'Temple of Light', 'Temple', 30, 1000, 2000, ARRAY['e7', 'e8'], ARRAY[3, 4], 4.0, 2.5, 'Sacred temple.'),
(10, 'Colosseum', 'Arena', 0, 1500, 3000, ARRAY['e9', 'e10'], ARRAY[4, 2], 4.5, 3.0, 'Final challenge.');

-- ============================================================================
-- ENEMIES
-- ============================================================================

CREATE TABLE enemies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    element element_type NOT NULL,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    def INTEGER NOT NULL,
    exp_value INTEGER NOT NULL,
    zel_value INTEGER NOT NULL,
    drop_material TEXT REFERENCES materials(id),
    drop_chance REAL DEFAULT 0.1,
    sprite_url TEXT
);

INSERT INTO enemies (id, name, element, hp, atk, def, exp_value, zel_value, drop_material, drop_chance, sprite_url) VALUES
('e1', 'Pony', 'Earth', 500, 50, 20, 20, 30, 'ironOre', 0.3, 'https://picsum.photos/seed/e1/48'),
('e2', 'Fabre', 'Earth', 600, 60, 25, 30, 50, 'ironOre', 0.25, 'https://picsum.photos/seed/e2/48'),
('e3', 'Roda Frog', 'Water', 750, 70, 30, 40, 70, 'steelIngot', 0.2, 'https://picsum.photos/seed/e3/48'),
('e4', 'Lunatic', 'Earth', 850, 80, 35, 50, 90, 'ironOre', 0.3, 'https://picsum.photos/seed/e4/48'),
('e5', 'Skeleton', 'Dark', 950, 90, 40, 60, 120, 'steelIngot', 0.25, 'https://picsum.photos/seed/e5/48'),
('e6', 'Picky', 'Earth', 1050, 100, 45, 70, 150, 'steelIngot', 0.2, 'https://picsum.photos/seed/e6/48'),
('e7', 'Poporing', 'Poison', 1500, 120, 50, 100, 250, 'mythril', 0.1, 'https://picsum.photos/seed/e7/48'),
('e8', 'Dustiness', 'Wind', 1850, 150, 60, 150, 400, 'mythril', 0.08, 'https://picsum.photos/seed/e8/48'),
('e9', 'Orc Warrior', 'Fire', 2100, 180, 70, 200, 600, 'orichalcum', 0.05, 'https://picsum.photos/seed/e9/48'),
('e10', 'Drake', 'Fire', 3500, 250, 100, 400, 1200, 'dragonScale', 0.03, 'https://picsum.photos/seed/e10/64');

-- ============================================================================
-- DUNGEONS
-- ============================================================================

CREATE TABLE dungeons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    element element_type NOT NULL,
    recommended_level INTEGER NOT NULL,
    total_floors INTEGER NOT NULL,
    entry_cost INTEGER DEFAULT 10,
    base_hp_multiplier REAL DEFAULT 1.0,
    base_atk_multiplier REAL DEFAULT 1.0,
    zel_per_floor INTEGER NOT NULL,
    exp_per_floor INTEGER NOT NULL
);

INSERT INTO dungeons (id, name, description, element, recommended_level, total_floors, entry_cost, base_hp_multiplier, base_atk_multiplier, zel_per_floor, exp_per_floor) VALUES
('dungeon_abyss', 'Abyss Gate', 'A dark portal leading to endless depths.', 'Dark', 10, 10, 10, 2.0, 1.5, 500, 300),
('dungeon_dragon', "Dragon's Lair", 'A volcanic cave home to ancient dragons.', 'Fire', 30, 15, 20, 3.0, 2.0, 1000, 600),
('dungeon_ruins', 'Ancient Ruins', 'Crumbling ruins filled with mysteries.', 'Earth', 20, 12, 15, 2.5, 1.8, 800, 500),
('dungeon_forest', 'Phantom Forest', 'A twisted forest where spirits dwell.', 'Light', 25, 10, 15, 2.2, 1.6, 1000, 700),
('dungeon_volcano', 'Volcanic Cave', 'Beneath the mountains lies molten danger.', 'Fire', 35, 20, 25, 4.0, 2.5, 2500, 1200);

-- ============================================================================
-- GACHA BANNERS
-- ============================================================================

CREATE TABLE gacha_banners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    banner_type TEXT NOT NULL,
    cost INTEGER NOT NULL,
    pull_count INTEGER DEFAULT 1,
    featured_units TEXT[],
    featured_rate REAL DEFAULT 0.0,
    pity_pulls INTEGER DEFAULT 50,
    pity_rarity INTEGER DEFAULT 5,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO gacha_banners (id, name, banner_type, cost, pull_count, featured_units, featured_rate, pity_pulls, pity_rarity, is_active) VALUES
('standard', 'Standard Summon', 'standard', 5, 1, ARRAY[]::TEXT[], 0.0, 50, 5, true),
('featured', 'Featured Summon', 'featured', 5, 1, ARRAY['u7'], 0.10, 30, 5, true),
('multi', 'Multi Summon', 'multi', 40, 10, ARRAY[]::TEXT[], 0.0, 50, 5, true);

-- ============================================================================
-- GACHA POOL
-- ============================================================================

CREATE TABLE gacha_pool (
    id SERIAL PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES unit_templates(id),
    weight INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true
);

INSERT INTO gacha_pool (unit_id, weight, is_available) VALUES
('u1', 100, true), ('u2', 100, true), ('u3', 100, true), ('u4', 100, true), ('u5', 100, true), ('u6', 100, true),
('u7', 20, true), ('u8', 20, true), ('u9', 20, true), ('u10', 20, true), ('u11', 20, true), ('u12', 20, true),
('mat_fire', 50, true), ('mat_water', 50, true), ('mat_earth', 50, true), ('mat_thunder', 50, true), ('mat_light', 50, true), ('mat_dark', 50, true);

-- ============================================================================
-- CRAFTING RECIPES
-- ============================================================================

CREATE TABLE crafting_recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    output_type TEXT NOT NULL,
    output_id TEXT NOT NULL,
    output_quantity INTEGER DEFAULT 1,
    zel_cost INTEGER NOT NULL,
    required_level INTEGER DEFAULT 1,
    category TEXT NOT NULL,
    materials JSONB NOT NULL
);

INSERT INTO crafting_recipes (id, name, description, output_type, output_id, output_quantity, zel_cost, required_level, category, materials) VALUES
('craft_brave_sword', 'Brave Sword', 'A reliable blade for any warrior.', 'equipment', 'eq_w1', 1, 5000, 1, 'weapon', '{"ironOre": 10}'),
('craft_flame_blade', 'Flame Blade', 'A sword imbued with fire.', 'equipment', 'eq_w2', 1, 12000, 10, 'weapon', '{"ironOre": 15, "steelIngot": 5}'),
('craft_muramasa', 'Muramasa', 'A cursed blade of immense power.', 'equipment', 'eq_w3', 1, 35000, 25, 'weapon', '{"ironOre": 20, "steelIngot": 10, "mythril": 3}'),
('craft_leather_armor', 'Leather Armor', 'Basic protection.', 'equipment', 'eq_a1', 1, 4000, 1, 'armor', '{"ironOre": 8}'),
('craft_knight_shield', 'Knight Shield', 'Heavy protection for knights.', 'equipment', 'eq_a2', 1, 15000, 15, 'armor', '{"ironOre": 15, "steelIngot": 8}'),
('craft_health_ring', 'Health Ring', 'Boosts vitality.', 'equipment', 'eq_ac1', 1, 8000, 5, 'accessory', '{"ironOre": 5, "steelIngot": 3}'),
('craft_power_amulet', 'Power Amulet', 'Increases overall power.', 'equipment', 'eq_ac2', 1, 18000, 15, 'accessory', '{"ironOre": 10, "steelIngot": 5, "mythril": 1}');

-- ============================================================================
-- CONSUMABLE ITEMS
-- ============================================================================

CREATE TABLE consumable_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL,
    value INTEGER NOT NULL,
    duration INTEGER,
    icon TEXT,
    price_gems INTEGER
);

INSERT INTO consumable_items (id, name, description, item_type, value, duration, icon, price_gems) VALUES
('energy_small', 'Energy Crystal', '+5 Energy', 'energy', 5, NULL, '⚡', 50),
('energy_medium', 'Energy Pack', '+15 Energy', 'energy', 15, NULL, '🔋', 120),
('energy_large', 'Energy Tank', '+30 Energy', 'energy', 30, NULL, '🛢️', 250),
('qr_scan_small', 'QR Booster', '+3 QR scans today', 'special', 3, 24, '📱', 20),
('qr_scan_medium', 'QR Prime', '+5 QR scans for 24 hours', 'special', 5, 24, '📲', 40),
('qr_scan_large', 'QR VIP', '+10 QR scans for 7 days', 'special', 10, 168, '👑', 100),
('bb_fill', 'Fujin Pill', 'Fill BB gauge', 'battle', 100, NULL, '💊', 30),
('reviver', 'Phoenix Feather', 'Revive fallen unit', 'battle', 50, NULL, '🪶', 50);

-- ============================================================================
-- PLAYER PROFILES (Existing table expanded)
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS arena_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS arena_medals INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guild_coins INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS honor_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guild_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guild_contribution INTEGER DEFAULT 0;

-- ============================================================================
-- QR STATE (Expanded)
-- ============================================================================

ALTER TABLE qr_state ADD COLUMN IF NOT EXISTS lifetime_scans INTEGER DEFAULT 0;
ALTER TABLE qr_state ADD COLUMN IF NOT EXISTS max_daily_scans INTEGER DEFAULT 5;
ALTER TABLE qr_state ADD COLUMN IF NOT EXISTS temp_bonus_scans INTEGER DEFAULT 0;
ALTER TABLE qr_state ADD COLUMN IF NOT EXISTS temp_bonus_expires_at TIMESTAMPTZ;

-- ============================================================================
-- SUMMON PITY (Expanded)
-- ============================================================================

ALTER TABLE summon_pity ADD COLUMN IF NOT EXISTS star4_pulls INTEGER DEFAULT 0;
ALTER TABLE summon_pity ADD COLUMN IF NOT EXISTS last_star4_pull INTEGER DEFAULT 0;
ALTER TABLE summon_pity ADD COLUMN IF NOT EXISTS total_pulls INTEGER DEFAULT 0;
ALTER TABLE summon_pity ADD COLUMN IF NOT EXISTS banner_pulls JSONB DEFAULT '{}';

-- ============================================================================
-- GUILDS TABLE
-- ============================================================================

CREATE TABLE guilds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    leader_id TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50,
    guild_coins INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guild_members (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL REFERENCES guilds(id),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rank guild_rank DEFAULT 'recruit',
    contribution INTEGER DEFAULT 0,
    weekly_contribution INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- ============================================================================
-- QR REWARD TABLE
-- ============================================================================

CREATE TABLE qr_rewards (
    id SERIAL PRIMARY KEY,
    reward_type TEXT NOT NULL,
    chance INTEGER NOT NULL,
    min_value INTEGER,
    max_value INTEGER,
    material_id TEXT REFERENCES materials(id),
    unit_frag_id TEXT REFERENCES unit_templates(id)
);

INSERT INTO qr_rewards (reward_type, chance, min_value, max_value) VALUES
('zel', 30, 500, 2000),
('energy', 20, 3, 7),
('gems', 10, 1, 3),
('material', 20, NULL, NULL),
('material', 12, NULL, NULL),
('material', 6, NULL, NULL),
('material', 3, NULL, NULL),
('unit_frag', 5, NULL, NULL);

UPDATE qr_rewards SET material_id = 'ironOre' WHERE reward_type = 'material' AND chance = 20;
UPDATE qr_rewards SET material_id = 'steelIngot' WHERE reward_type = 'material' AND chance = 12;
UPDATE qr_rewards SET material_id = 'mythril' WHERE reward_type = 'material' AND chance = 6;
UPDATE qr_rewards SET material_id = 'orichalcum' WHERE reward_type = 'material' AND chance = 3;
UPDATE qr_rewards SET unit_frag_id = 'u1' WHERE reward_type = 'unit_frag' AND chance = 5;

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    requirement INTEGER NOT NULL,
    reward_gems INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0
);

INSERT INTO achievements (id, name, description, category, requirement, reward_gems, reward_coins) VALUES
('achieve_first_unit', 'First Steps', 'Summon your first unit', 'summon', 1, 10, 0),
('achieve_10_units', 'Unit Collector', 'Own 10 units', 'units', 10, 50, 0),
('achieve_50_units', 'Master Collector', 'Own 50 units', 'units', 50, 200, 0),
('achieve_first_5star', 'Lucky Star', 'Summon a 5★ unit', 'summon', 1, 100, 0),
('achieve_arena_10', 'Arena Fighter', 'Win 10 arena battles', 'arena', 10, 30, 0),
('achieve_guild_founder', 'Guild Founder', 'Create a guild', 'guild', 1, 0, 500),
('achieve_max_energy', 'Energy Master', 'Reach max energy (50)', 'energy', 50, 100, 0);

-- ============================================================================
-- PLAYER ACHIEVEMENTS
-- ============================================================================

CREATE TABLE player_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT REFERENCES achievements(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- DAILY QUESTS
-- ============================================================================

CREATE TABLE daily_quests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    quest_type quest_type NOT NULL,
    target INTEGER NOT NULL,
    target_type TEXT NOT NULL,
    zel_reward INTEGER NOT NULL,
    gem_reward INTEGER DEFAULT 0
);

INSERT INTO daily_quests (id, name, description, quest_type, target, target_type, zel_reward, gem_reward) VALUES
('daily_battle_3', 'Battle Quest', 'Win 3 battles', 'daily', 3, 'battle', 500, 0),
('daily_summon_1', 'Summon Quest', 'Perform 1 summon', 'daily', 1, 'summon', 300, 5),
('daily_energy_10', 'Energy Hunter', 'Use 10 energy', 'daily', 10, 'energy', 400, 0),
('daily_qr_3', 'QR Scanner', 'Scan 3 QR codes', 'daily', 3, 'qr_scan', 200, 0);

-- ============================================================================
-- PLAYER DAILY QUESTS
-- ============================================================================

CREATE TABLE player_daily_quests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quest_id TEXT REFERENCES daily_quests(id),
    current_progress INTEGER DEFAULT 0,
    status quest_status DEFAULT 'active',
    reset_at TIMESTAMPTZ,
    UNIQUE(user_id, quest_id, reset_at)
);

-- ============================================================================
-- REWARD CLAIMS (prevent double claiming)
-- ============================================================================

CREATE TABLE reward_claims (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    claim_id TEXT NOT NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, claim_type, claim_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_units_template ON units(template_id);
CREATE INDEX idx_equipment_template ON equipment(template_id);
CREATE INDEX idx_stages_area ON stages(area);
CREATE INDEX idx_enemies_element ON enemies(element);
CREATE INDEX idx_gacha_banners_active ON gacha_banners(is_active) WHERE is_active = true;
CREATE INDEX idx_guild_members ON guild_members(guild_id);
CREATE INDEX idx_guild_members_user ON guild_members(user_id);

-- ============================================================================
-- COMPLETE!
-- ============================================================================

SELECT 'BravoClon Database Schema Complete!' AS status;