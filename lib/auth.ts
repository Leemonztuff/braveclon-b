import { supabase } from './supabase';
import { PlayerState, INITIAL_STATE } from './gameTypes';
import { UnitInstance, EquipInstance, QRState } from './gameTypes';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export async function signUp(email: string, password: string, username: string) {
  if (!supabase) return { error: 'Offline mode - signup not available', user: null };
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
  
  if (error) return { error: error.message, user: null };
  
  if (data.user) {
    await createProfile(data.user.id, username);
  }
  
  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { user: null, error: 'Offline mode - login not available' };
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) return { user: null, error: error.message };
  
  return { user: data.user, error: null };
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthChange(callback: (user: any) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

async function createProfile(userId: string, username: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username,
      rank: 1,
      level: 1,
      exp: 0,
      energy: 10,
      max_energy: 10,
      last_energy_update: new Date().toISOString(),
      gems: 50,
      zel: 1000
    });
  
  if (error) console.error('Error creating profile:', error);
}

export async function saveGameState(userId: string, state: PlayerState): Promise<boolean> {
  if (!supabase) return false;
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      username: state.playerName,
      rank: state.rank,
      level: state.playerLevel,
      exp: state.exp,
      arena_score: state.arenaScore || 0,
      energy: state.energy,
      max_energy: state.maxEnergy,
      last_energy_update: new Date(state.lastEnergyUpdateTime).toISOString(),
      gems: state.gems,
      zel: state.zel,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    await saveInventory(userId, state.inventory);
    await saveEquipment(userId, state.equipmentInventory);
    await saveTeam(userId, state.team);
    await saveQrState(userId, state.qrState);
    await saveSummonPity(userId, state.summonPity);

    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
}

async function saveInventory(userId: string, inventory: UnitInstance[]) {
  if (!supabase) return;
  await supabase.from('units').delete().eq('profile_id', userId);
  
  if (inventory.length > 0) {
    const unitsToInsert = inventory.map(unit => ({
      profile_id: userId,
      instance_id: unit.instanceId,
      template_id: unit.templateId,
      level: unit.level,
      exp: unit.exp,
      equipment: unit.equipment
    }));
    
    await supabase.from('units').insert(unitsToInsert);
  }
}

async function saveEquipment(userId: string, equipment: EquipInstance[]) {
  if (!supabase) return;
  await supabase.from('equipment').delete().eq('profile_id', userId);
  
  if (equipment.length > 0) {
    const equipToInsert = equipment.map(eq => ({
      profile_id: userId,
      instance_id: eq.instanceId,
      template_id: eq.templateId
    }));
    
    await supabase.from('equipment').insert(equipToInsert);
  }
}

async function saveTeam(userId: string, team: (string | null)[]) {
  if (!supabase) return;
  await supabase.from('team').delete().eq('profile_id', userId);
  
  const teamToInsert = team.map((unitId, index) => ({
    profile_id: userId,
    slot_position: index,
    unit_instance_id: unitId
  }));
  
  await supabase.from('team').insert(teamToInsert);
}

async function saveQrState(userId: string, qrState: QRState) {
  if (!supabase) return;
  const { data: existing } = await supabase
    .from('qr_state')
    .select('id')
    .eq('profile_id', userId)
    .single();

  if (existing) {
    await supabase.from('qr_state').update({
      scans_today: qrState.scansToday,
      last_scan_date: qrState.lastScanDate,
      scanned_hashes: qrState.scannedHashes
    }).eq('profile_id', userId);
  } else {
    await supabase.from('qr_state').insert({
      profile_id: userId,
      scans_today: qrState.scansToday,
      last_scan_date: qrState.lastScanDate,
      scanned_hashes: qrState.scannedHashes
    });
  }
}

async function saveSummonPity(userId: string, pity: { star5Pulls: number; star4Pulls: number; lastStar5Pull: number }) {
  if (!supabase) return;
  const { data: existing } = await supabase
    .from('summon_pity')
    .select('id')
    .eq('profile_id', userId)
    .single();

  if (existing) {
    await supabase.from('summon_pity').update({
      star5_pulls: pity.star5Pulls,
      star4_pulls: pity.star4Pulls,
      last_star5_pull: pity.lastStar5Pull
    }).eq('profile_id', userId);
  } else {
    await supabase.from('summon_pity').insert({
      profile_id: userId,
      star5_pulls: pity.star5Pulls,
      star4_pulls: pity.star4Pulls,
      last_star5_pull: pity.lastStar5Pull
    });
  }
}

export async function loadGameState(userId: string): Promise<PlayerState | null> {
  if (!supabase) return null;
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) return null;

    const { data: units } = await supabase
      .from('units')
      .select('*')
      .eq('profile_id', userId);

    const { data: equipment } = await supabase
      .from('equipment')
      .select('*')
      .eq('profile_id', userId);

    const { data: teamData } = await supabase
      .from('team')
      .select('*')
      .eq('profile_id', userId)
      .order('slot_position');

    const { data: qrState } = await supabase
      .from('qr_state')
      .select('*')
      .eq('profile_id', userId)
      .single();

    const { data: pity } = await supabase
      .from('summon_pity')
      .select('*')
      .eq('profile_id', userId)
      .single();

    const inventory: UnitInstance[] = (units || []).map(u => ({
      instanceId: u.instance_id,
      templateId: u.template_id,
      level: u.level,
      exp: u.exp,
      equipment: u.equipment || { weapon: null, armor: null, accessory: null }
    }));

    const equipmentInventory: EquipInstance[] = (equipment || []).map(e => ({
      instanceId: e.instance_id,
      templateId: e.template_id
    }));

    const team: (string | null)[] = Array(7).fill(null);
    (teamData || []).forEach(t => {
      team[t.slot_position] = t.unit_instance_id;
    });

    return {
      playerName: profile.username,
      rank: profile.rank,
      playerLevel: profile.level,
      exp: profile.exp,
      arenaScore: profile.arena_score || 0,
      energy: profile.energy,
      maxEnergy: profile.max_energy,
      lastEnergyUpdateTime: new Date(profile.last_energy_update).getTime(),
      gems: profile.gems,
      zel: profile.zel,
      inventory,
      equipmentInventory,
      team,
      qrState: qrState ? {
        scansToday: qrState.scans_today,
        lastScanDate: qrState.last_scan_date,
        scannedHashes: qrState.scanned_hashes || []
      } : INITIAL_STATE.qrState,
      summonPity: pity ? {
        star5Pulls: pity.star5_pulls,
        star4Pulls: pity.star4_pulls,
        lastStar5Pull: pity.last_star5_pull
      } : INITIAL_STATE.summonPity
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

export async function getArenaLeaderboard(limit: number = 50) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, level, arena_score')
      .order('arena_score', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching arena leaderboard:', error);
      return [];
    }
    
    return data.map((profile, idx) => ({
      rank: idx + 1,
      id: profile.id,
      name: profile.username,
      level: profile.level,
      score: profile.arena_score || 0
    }));
  } catch (err) {
    console.error('Failed to get arena leaderboard:', err);
    return [];
  }
}