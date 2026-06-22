// Fetches shared app config from Supabase (e.g. the Gemini API key set by admin).
// All authenticated users can read. Only the admin can write (enforced by RLS).
import { useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export const ADMIN_EMAIL = 'amanienock2005@gmail.com';

export async function fetchGeminiKey() {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'gemini_key')
    .single();
  if (error || !data) return null;
  return data.value;
}

export async function saveGeminiKeyToSupabase(apiKey) {
  const { error } = await supabase
    .from('app_config')
    .upsert({ key: 'gemini_key', value: apiKey }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function deleteGeminiKeyFromSupabase() {
  const { error } = await supabase
    .from('app_config')
    .delete()
    .eq('key', 'gemini_key');
  if (error) throw new Error(error.message);
}

// Used in App.jsx on startup — silently syncs the shared key to localStorage
// so ai.js can use it without needing React state threading.
export function useAppConfig(userId) {
  useEffect(() => {
    if (!userId) return;
    fetchGeminiKey().then(key => {
      if (key) localStorage.setItem('wj_gemini_key', key);
      // If no key in DB and nothing saved locally, leave localStorage alone
    }).catch(() => {});
  }, [userId]);
}
