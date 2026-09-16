// Supabase Client and Database Operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign in using Google OAuth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: { message: 'Supabase credentials not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local' }
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
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
