import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign Up
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://websitetruthserum.com',
      },
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Sign Out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data?.user, error };
  } catch (error) {
    return { user: null, error };
  }
};

// ========== SAVE SCAN HISTORY ========== 👈 ADD THIS
export const saveScanHistory = async (userId, scanData) => {
  try {
    const scanRecord = {
      user_id: userId,
      domain: scanData.domain,
      trust_score: scanData.trust_score,
      category: scanData.category,
      red_flags: scanData.red_flags,
      green_flags: scanData.green_flags,
      summary: scanData.summary,
      scanned_at: new Date().toISOString(),
    };
    if (scanData.ai_probability != null) {
      scanRecord.ai_probability = scanData.ai_probability;
    }
    const { data, error } = await supabase
      .from('scan_history')
      .insert([scanRecord]);
    return { data, error };
  } catch (error) {
    console.error('Save scan history error:', error);
    return { data: null, error };
  }
};

// ========== GET SCAN HISTORY ========== 👈 Optional: Add this too
export const getScanHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false })
      .limit(50);
    return { data, error };
  } catch (error) {
    console.error('Get scan history error:', error);
    return { data: [], error };
  }
};