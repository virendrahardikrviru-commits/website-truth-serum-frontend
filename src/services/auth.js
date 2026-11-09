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

// Sign In with Google OAuth
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
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
  const { data, error } = await supabase
    .from('scan_reports')
    .insert([
      {
        user_id: userId, // This connects the scan to the logged-in user
        scan_id: crypto.randomUUID(), 
        domain: scanData.domain,
        scanned_url: scanData.scannedUrl || `https://${scanData.domain}`,
        report: scanData 
      }
    ]);
    
  if (error) {
    console.error("Supabase Insert Error:", "message:", error.message, "| details:", error.details, "| hint:", error.hint, "| code:", error.code);
    throw error;
  }
  return data;
};

// ========== GET SCAN HISTORY ========== 👈 Optional: Add this too
export const getScanHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('scan_reports') // Fixed table name
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Fixed column name
      .limit(50);
    return { data, error };
  } catch (error) {
    console.error('Get scan history error:', error);
    return { data: [], error };
  }
};