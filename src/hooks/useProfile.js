import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data || { id: userId, display_name: '', whatsapp_phone: '' });
    setLoading(false);
  }, [userId]);

  const updateProfile = async (updates) => {
    const payload = { id: userId, ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();
    if (!error && data) setProfile(data);
    return !error;
  };

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, updateProfile };
}
