// Handles Supabase CRUD operations for entries and returns app state.
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useEntries(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setEntries([]);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const addEntry = async (entry) => {
    setLoading(true);
    setError(null);
    const payload = {
      ...entry,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    const { data, error: insertError } = await supabase.from('entries').insert(payload).select();
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return null;
    }

    const created = data?.[0];
    if (created) {
      setEntries((prev) => [created, ...prev]);
    }
    setLoading(false);
    return created;
  };

  const updateEntry = async (entry) => {
    setLoading(true);
    setError(null);
    const payload = { title: entry.title, body: entry.body, type: entry.type, location: entry.location, excited: entry.excited };
    if (entry.photo !== undefined) payload.photo = entry.photo;
    const { data, error: updateError } = await supabase
      .from('entries')
      .update(payload)
      .eq('id', entry.id)
      .eq('user_id', userId)
      .select();

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return null;
    }

    const updated = data?.[0];
    if (updated) {
      setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
    setLoading(false);
    return updated;
  };

  const deleteEntry = async (id) => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from('entries').delete().eq('id', id).eq('user_id', userId);
    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return false;
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setLoading(false);
    return true;
  };

  const deleteAllEntries = async () => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from('entries').delete().eq('user_id', userId);
    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return false;
    }
    setEntries([]);
    setLoading(false);
    return true;
  };

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    fetchEntries();
  }, [userId]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    deleteAllEntries,
  };
}
