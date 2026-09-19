// Supabase Client and Database Operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
);

let supabaseClient = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client. Check your VITE_SUPABASE_URL.", err);
  }
}
export const supabase = supabaseClient;

/**
 * Sign Up using Custom PC ID
 */
export async function signUpWithPCID(pcId, password) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: { message: 'Supabase credentials not configured yet.' }
    };
  }

  // Append dummy domain to satisfy email requirements
  const dummyEmail = `${pcId.toLowerCase()}@titanos.com`;
  
  const { data, error } = await supabase.auth.signUp({
    email: dummyEmail,
    password: password,
    options: {
      data: {
        full_name: pcId,
      }
    }
  });

  return { data, error };
}

/**
 * Sign In using Custom PC ID
 */
export async function signInWithPCID(pcId, password) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: { message: 'Supabase credentials not configured yet.' }
    };
  }

  const dummyEmail = `${pcId.toLowerCase()}@titanos.com`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password: password,
  });

  return { data, error };
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (!isSupabaseConfigured || !supabase) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Fetch all saved builds for currently logged in user
 */
export async function fetchUserCloudBuilds() {
  if (!isSupabaseConfigured || !supabase) return { data: [], error: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('saved_builds')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Save or update a build in the cloud
 */
export async function saveBuildToCloud({ name, components, totalPrice, isPublic = false }) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: { message: 'Supabase credentials not configured. Build saved locally in your browser.' }
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'Please sign in with Google to save builds to the cloud.' } };
  }

  const { data, error } = await supabase
    .from('saved_builds')
    .insert({
      user_id: user.id,
      user_email: user.email,
      name,
      components,
      total_price: totalPrice,
      is_public: isPublic,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a build from the cloud
 */
export async function deleteCloudBuild(id) {
  if (!isSupabaseConfigured || !supabase) return { error: null };

  return await supabase
    .from('saved_builds')
    .delete()
    .eq('id', id);
}

/**
 * Save Tycoon Game State to Cloud
 */
export async function saveTycoonGameToCloud(saveData) {
  if (!isSupabaseConfigured || !supabase) return { error: { message: 'Supabase not configured' } };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not signed in' } };

  const { data, error } = await supabase
    .from('tycoon_saves')
    .upsert({
      user_id: user.id,
      save_data: saveData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Load Tycoon Game State from Cloud
 */
export async function fetchUserTycoonGame() {
  if (!isSupabaseConfigured || !supabase) return { data: null, error: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: null };

  const { data, error } = await supabase
    .from('tycoon_saves')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { data: data?.save_data || null, error };
}

/**
 * ================================
 * TITAN NETWORK / MULTIPLAYER API
 * ================================
 */

export async function fetchGlobalLeaderboard() {
  if (!isSupabaseConfigured || !supabase) return { data: [], error: { message: 'Not configured' } };
  return await supabase
    .from('global_leaderboard')
    .select('*')
    .order('cash', { ascending: false })
    .limit(50);
}

export async function searchUsers(query) {
  if (!isSupabaseConfigured || !supabase) return { data: [], error: { message: 'Not configured' } };
  if (!query) return { data: [], error: null };
  return await supabase
    .from('profiles')
    .select('user_id, username')
    .ilike('username', `%${query}%`)
    .limit(10);
}

export async function fetchFriends() {
  if (!isSupabaseConfigured || !supabase) return { data: [], error: { message: 'Not configured' } };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: { message: 'Not signed in' } };

  // Fetch all friendships involving the user
  const { data, error } = await supabase
    .from('friends')
    .select(`
      id, status, sender_id, receiver_id,
      sender:profiles!friends_sender_id_fkey(username),
      receiver:profiles!friends_receiver_id_fkey(username)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    
  return { data, error };
}

export async function sendFriendRequest(receiverId) {
  if (!isSupabaseConfigured || !supabase) return { error: { message: 'Not configured' } };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not signed in' } };

  return await supabase
    .from('friends')
    .insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' });
}

export async function respondToFriendRequest(requestId, newStatus) {
  if (!isSupabaseConfigured || !supabase) return { error: { message: 'Not configured' } };
  return await supabase
    .from('friends')
    .update({ status: newStatus })
    .eq('id', requestId);
}

export async function removeFriend(requestId) {
  if (!isSupabaseConfigured || !supabase) return { error: { message: 'Not configured' } };
  return await supabase
    .from('friends')
    .delete()
    .eq('id', requestId);
}
